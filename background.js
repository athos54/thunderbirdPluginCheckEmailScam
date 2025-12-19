// Background script para el plugin de Thunderbird

// Función para obtener la configuración guardada
async function getConfig() {
  const result = await browser.storage.local.get({
    apiKey: '',
    model: 'gpt-4o',
    translateModel: 'gpt-4o-mini',
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

**IMPORTANTE:** No inventes datos. Si falta algo, dilo explícitamente ("no se ve DKIM", etc.).`,
    translatePrompt: `Traduce el siguiente email al español.

**INSTRUCCIONES:**
- Traduce TODO el contenido del email (asunto, cuerpo, firmas, etc.)
- Mantén el formato original del email (párrafos, listas, saltos de línea, etc.)
- Usa formato Markdown en tu respuesta: **negritas**, *cursivas*, listas, etc.
- Si hay partes técnicas (como cabeceras o código), déjalas sin traducir
- Preserva los enlaces originales
- Si el email ya está en español, indícalo y muestra el contenido original

**FORMATO DE RESPUESTA:**

**Idioma original detectado:** [idioma]

---

**Asunto traducido:** [asunto]

**Cuerpo:**

[contenido traducido con formato Markdown]`
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

// Función para extraer el body del email (texto plano o HTML)
function extractBody(part) {
  let textBody = '';
  let htmlBody = '';

  if (part.body) {
    const contentType = part.contentType || '';
    if (contentType.includes('text/plain')) {
      textBody = part.body;
    } else if (contentType.includes('text/html')) {
      htmlBody = part.body;
    }
  }

  if (part.parts && part.parts.length > 0) {
    for (const subPart of part.parts) {
      const extracted = extractBody(subPart);
      if (extracted.textBody) textBody = extracted.textBody;
      if (extracted.htmlBody) htmlBody = extracted.htmlBody;
    }
  }

  return { textBody, htmlBody };
}

// Función para obtener el subject y body del email
async function getEmailBody(messageId) {
  try {
    // Obtener el header del mensaje para el subject
    const messageHeader = await browser.messages.get(messageId);
    const subject = messageHeader.subject || '';

    // Obtener el body
    const fullMessage = await browser.messages.getFull(messageId);
    const { textBody, htmlBody } = extractBody(fullMessage);

    let body = '';
    // Preferir texto plano, sino usar HTML
    if (textBody) {
      body = textBody;
    } else if (htmlBody) {
      // Limpiar HTML básico para obtener solo texto
      body = htmlBody
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Combinar subject y body
    return `Asunto: ${subject}\n\n${body}`;
  } catch (error) {
    throw error;
  }
}

// Función para obtener el contenido de un email en composición
async function getComposeContent(tabId) {
  try {
    const details = await browser.compose.getComposeDetails(tabId);

    let content = '';

    // Añadir destinatarios
    if (details.to && details.to.length > 0) {
      content += `Para: ${details.to.join(', ')}\n`;
    }
    if (details.cc && details.cc.length > 0) {
      content += `CC: ${details.cc.join(', ')}\n`;
    }
    if (details.bcc && details.bcc.length > 0) {
      content += `BCC: ${details.bcc.join(', ')}\n`;
    }

    // Añadir asunto
    content += `Asunto: ${details.subject || '(sin asunto)'}\n\n`;

    // Añadir cuerpo (preferir texto plano, luego HTML)
    if (details.plainTextBody) {
      content += details.plainTextBody;
    } else if (details.body) {
      // Si solo hay HTML, limpiar las etiquetas
      const cleanBody = details.body
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
      content += cleanBody;
    }

    return content;
  } catch (error) {
    throw error;
  }
}

// Función para obtener el email en formato "RAW" desde compose
// (simulado, ya que compose no tiene formato RAW real)
async function getComposeAsRaw(tabId) {
  try {
    const details = await browser.compose.getComposeDetails(tabId);

    let raw = '';

    // Simular cabeceras básicas
    if (details.to && details.to.length > 0) {
      raw += `To: ${details.to.join(', ')}\n`;
    }
    if (details.cc && details.cc.length > 0) {
      raw += `Cc: ${details.cc.join(', ')}\n`;
    }
    if (details.bcc && details.bcc.length > 0) {
      raw += `Bcc: ${details.bcc.join(', ')}\n`;
    }
    raw += `Subject: ${details.subject || '(sin asunto)'}\n`;
    raw += `Content-Type: text/plain; charset=UTF-8\n\n`;

    // Añadir cuerpo
    if (details.plainTextBody) {
      raw += details.plainTextBody;
    } else if (details.body) {
      raw += details.body;
    }

    return raw;
  } catch (error) {
    throw error;
  }
}

// Función para analizar con streaming desde background
async function analyzeEmailWithStreaming(rawEmail, config, port, action = 'analyze') {
  if (!config.apiKey) {
    throw new Error('No se ha configurado la API key de OpenAI');
  }

  // Seleccionar modelo, prompt y mensaje de sistema según la acción
  const isTranslate = action === 'translate';
  const model = isTranslate ? config.translateModel : config.model;
  const prompt = isTranslate ? config.translatePrompt : config.prompt;
  const systemMessage = isTranslate
    ? 'Eres un traductor profesional experto en múltiples idiomas. Tu tarea es traducir emails manteniendo el formato y el contexto original.'
    : 'Eres un analista senior de ciberseguridad especializado en detección de phishing y fraude por email. Tienes capacidad de búsqueda en internet para verificar dominios y reportes de fraude. Debes analizar emails en formato RAW completo (cabeceras + MIME + contenido) y proporcionar análisis forense detallado.';
  const userContent = isTranslate
    ? `${prompt}\n\nEmail a traducir:\n\n${rawEmail}`
    : `${prompt}\n\nEmail a analizar (formato RAW):\n\n${rawEmail}`;

  const requestBody = {
    model: model,
    messages: [
      {
        role: 'system',
        content: systemMessage
      },
      {
        role: 'user',
        content: userContent
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
  } else if (message.action === 'getEmailBody') {
    try {
      const body = await getEmailBody(message.messageId);
      return Promise.resolve({ success: true, body });
    } catch (error) {
      return Promise.resolve({ success: false, error: error.message });
    }
  } else if (message.action === 'getComposeRaw') {
    try {
      const rawEmail = await getComposeAsRaw(message.composeTabId);
      return Promise.resolve({ success: true, rawEmail });
    } catch (error) {
      return Promise.resolve({ success: false, error: error.message });
    }
  } else if (message.action === 'getComposeBody') {
    try {
      const body = await getComposeContent(message.composeTabId);
      return Promise.resolve({ success: true, body });
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
          const analysisType = msg.analysisType || 'analyze';

          // Determinar si estamos trabajando con un mensaje o con un compose
          const isCompose = msg.composeTabId !== undefined;

          // Para traducción usar solo el body, para análisis usar el email RAW completo
          let emailContent;
          if (isCompose) {
            // Estamos analizando un email en composición
            if (analysisType === 'translate') {
              emailContent = await getComposeContent(msg.composeTabId);
              if (!emailContent) {
                throw new Error('No se pudo extraer el contenido del email en composición');
              }
            } else {
              emailContent = await getComposeAsRaw(msg.composeTabId);
            }
          } else {
            // Estamos analizando un mensaje existente
            if (analysisType === 'translate') {
              emailContent = await getEmailBody(msg.messageId);
              if (!emailContent) {
                throw new Error('No se pudo extraer el contenido del email');
              }
            } else {
              emailContent = await getRawEmail(msg.messageId);
            }
          }

          await analyzeEmailWithStreaming(emailContent, config, port, analysisType);
        } catch (error) {
          port.postMessage({ type: 'error', error: error.message });
        }
      }
    });
  }
});
