// Background script para el plugin de Thunderbird

// Función para obtener la configuración guardada
async function getConfig() {
  const result = await browser.storage.local.get({
    apiKey: '',
    model: 'gpt-4o-mini',
    prompt: `Eres un analista senior de ciberseguridad especializado en detección de phishing y fraude por email. Analiza el email RAW completo que te proporciono.

**ANÁLISIS REQUERIDO:**

1. **Cabeceras (forense)**: From, Reply-To, Return-Path, Message-ID, Date, Received, SPF/DKIM/DMARC
2. **MIME/HTML**: multipart, base64, quoted-printable, trucos CSS, imágenes de tracking
3. **Enlaces**: Extrae TODOS los URLs, normaliza, detecta acortadores, typosquatting, punycode (xn--), redirecciones
4. **Homoglyphs**: O/0, l/I, rn/m, caracteres Unicode similares, punycode
5. **Ingeniería social**: urgencia, amenazas, petición de credenciales/pagos
6. **Búsqueda en internet**: Busca información sobre el dominio remitente en internet en busca de fraudes o quejas

**FORMATO DE RESPUESTA (obligatorio):**

**Veredicto:** (Legítimo probable / Dudoso / Phishing probable / Phishing casi seguro)

**Riesgo (0-100):** [número] - (Bajo/Medio/Alto/Crítico)

**Hallazgos clave** (máx. 10 bullets):
- Solo lo más determinante

**Cabeceras:**
- From / Reply-To / Return-Path
- SPF/DKIM/DMARC (si aparece)
- Received (anomalías)
- Message-ID

**Enlaces detectados:**
- texto visible → URL real → dominio → banderas (acortador/punycode/typosquat/redirect)

**Homoglyphs/caracteres sospechosos:**
- Ejemplos concretos (si aplica)

**Información del dominio remitente:**
- Resultados de búsquedas sobre fraudes o quejas relacionadas con este dominio

**Qué haría yo ahora:**
1. Acción concreta 1
2. Acción concreta 2
3. Acción concreta 3

**IMPORTANTE:** No inventes datos. Si falta algo, dilo explícitamente ("no se ve DKIM", etc.).`
  });
  return result;
}

// Función para obtener el email en formato raw
async function getRawEmail(messageId) {
  try {
    const rawContent = await browser.messages.getRaw(messageId);
    return rawContent;
  } catch (error) {
    throw error;
  }
}

// Función para analizar con streaming desde background
async function analyzeEmailWithStreaming(rawEmail, config, port) {
  if (!config.apiKey) {
    throw new Error('No se ha configurado la API key de OpenAI');
  }

  const requestBody = {
    model: config.model,
    messages: [
      {
        role: 'system',
        content: 'Eres un analista senior de ciberseguridad especializado en detección de phishing y fraude por email. Tienes capacidad de búsqueda en internet para verificar dominios y reportes de fraude. Debes analizar emails en formato RAW completo (cabeceras + MIME + contenido) y proporcionar análisis forense detallado.'
      },
      {
        role: 'user',
        content: `${config.prompt}\n\nEmail a analizar (formato RAW):\n\n${rawEmail}`
      }
    ],
    stream: true
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error?.message || response.statusText;
    } catch {
      errorMessage = errorText || response.statusText;
    }
    throw new Error(`Error de API: ${errorMessage}`);
  }

  // Leer el stream
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let totalContent = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      if (totalContent.length === 0) {
        port.postMessage({
          type: 'chunk',
          content: '❌ Error: OpenAI no generó ninguna respuesta. Esto puede deberse a un problema con el modelo o la configuración.'
        });
      }
      port.postMessage({ type: 'done' });
      break;
    }

    const chunk = decoder.decode(value, { stream: true });
    buffer += chunk;

    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine === '' || trimmedLine === 'data: [DONE]') continue;

      if (trimmedLine.startsWith('data: ')) {
        try {
          const jsonStr = trimmedLine.substring(6);
          const data = JSON.parse(jsonStr);
          const content = data.choices[0]?.delta?.content;

          if (content) {
            totalContent += content;
            port.postMessage({ type: 'chunk', content });
          }
        } catch (error) {
          // Ignorar errores de parsing de chunks individuales
        }
      }
    }
  }
}

// Función para obtener la lista de modelos disponibles
async function getAvailableModels(apiKey) {
  if (!apiKey) {
    throw new Error('No se ha configurado la API key de OpenAI');
  }

  const response = await fetch('https://api.openai.com/v1/models', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`Error obteniendo modelos: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data
    .filter(model => model.id.includes('gpt'))
    .map(model => model.id)
    .sort();
}

// Listener para mensajes desde el popup
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'getEmailRaw') {
    try {
      const rawEmail = await getRawEmail(message.messageId);
      return Promise.resolve({ success: true, rawEmail });
    } catch (error) {
      return Promise.resolve({ success: false, error: error.message });
    }
  } else if (message.action === 'getConfig') {
    try {
      const config = await getConfig();
      return Promise.resolve({ success: true, config });
    } catch (error) {
      return Promise.resolve({ success: false, error: error.message });
    }
  } else if (message.action === 'getModels') {
    try {
      const config = await getConfig();
      const models = await getAvailableModels(config.apiKey);
      return Promise.resolve({ success: true, models });
    } catch (error) {
      return Promise.resolve({ success: false, error: error.message });
    }
  }
});

// Listener para conexiones de port (para streaming)
browser.runtime.onConnect.addListener((port) => {
  if (port.name === 'streaming') {
    port.onMessage.addListener(async (msg) => {
      if (msg.action === 'startAnalysis') {
        try {
          const config = await getConfig();
          const rawEmail = await getRawEmail(msg.messageId);
          await analyzeEmailWithStreaming(rawEmail, config, port);
        } catch (error) {
          port.postMessage({ type: 'error', error: error.message });
        }
      }
    });
  }
});
