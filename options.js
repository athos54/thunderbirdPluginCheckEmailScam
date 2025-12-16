// Options script para la configuración del plugin

// Valores por defecto
const DEFAULT_CONFIG = {
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
};

// Elementos del DOM
const form = document.getElementById('settingsForm');
const apiKeyInput = document.getElementById('apiKey');
const modelSelect = document.getElementById('model');
const promptTextarea = document.getElementById('prompt');
const statusMessage = document.getElementById('statusMessage');
const resetBtn = document.getElementById('resetBtn');
const refreshModelsBtn = document.getElementById('refreshModels');
const toggleApiKeyBtn = document.getElementById('toggleApiKey');

// Función para mostrar mensaje de estado
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;

  // Ocultar después de 5 segundos si es success
  if (type === 'success') {
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 5000);
  }
}

// Función para cargar la configuración guardada
async function loadSettings() {
  try {
    const config = await browser.storage.local.get(DEFAULT_CONFIG);
    apiKeyInput.value = config.apiKey || '';
    modelSelect.value = config.model || DEFAULT_CONFIG.model;
    promptTextarea.value = config.prompt || DEFAULT_CONFIG.prompt;
  } catch (error) {
    showStatus('Error al cargar la configuración', 'error');
  }
}

// Función para guardar la configuración
async function saveSettings(e) {
  e.preventDefault();

  try {
    const config = {
      apiKey: apiKeyInput.value.trim(),
      model: modelSelect.value,
      prompt: promptTextarea.value.trim()
    };

    // Validar que la API key tenga el formato correcto
    if (config.apiKey && !config.apiKey.startsWith('sk-')) {
      showStatus('La API key debe comenzar con "sk-"', 'error');
      return;
    }

    await browser.storage.local.set(config);
    showStatus('Configuración guardada correctamente', 'success');
  } catch (error) {
    showStatus(`Error al guardar: ${error.message}`, 'error');
  }
}

// Función para restaurar valores por defecto
async function resetToDefaults() {
  if (!confirm('¿Estás seguro de que quieres restaurar los valores por defecto?')) {
    return;
  }

  try {
    await browser.storage.local.set(DEFAULT_CONFIG);
    await loadSettings();
    showStatus('Configuración restaurada a valores por defecto', 'success');
  } catch (error) {
    showStatus('Error al restaurar la configuración', 'error');
  }
}

// Función para actualizar la lista de modelos
async function refreshModels() {
  try {
    refreshModelsBtn.disabled = true;
    refreshModelsBtn.textContent = 'Cargando...';

    const response = await browser.runtime.sendMessage({
      action: 'getModels'
    });

    if (response.success && response.models && response.models.length > 0) {
      // Guardar el modelo seleccionado actual
      const currentModel = modelSelect.value;

      // Limpiar opciones actuales
      modelSelect.innerHTML = '';

      // Agregar nuevas opciones
      response.models.forEach(modelId => {
        const option = document.createElement('option');
        option.value = modelId;
        option.textContent = modelId;
        modelSelect.appendChild(option);
      });

      // Restaurar la selección si el modelo aún existe
      if (response.models.includes(currentModel)) {
        modelSelect.value = currentModel;
      }

      showStatus(`${response.models.length} modelos cargados correctamente`, 'success');
    } else {
      showStatus(`Error: ${response.error || 'No se pudieron cargar los modelos'}`, 'error');
    }
  } catch (error) {
    showStatus('Error al actualizar los modelos', 'error');
  } finally {
    refreshModelsBtn.disabled = false;
    refreshModelsBtn.textContent = 'Actualizar lista de modelos';
  }
}

// Toggle para mostrar/ocultar API key
toggleApiKeyBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (apiKeyInput.type === 'password') {
    apiKeyInput.type = 'text';
    toggleApiKeyBtn.textContent = '🙈 Ocultar';
  } else {
    apiKeyInput.type = 'password';
    toggleApiKeyBtn.textContent = '👁️ Mostrar';
  }
});

// Event listeners
form.addEventListener('submit', saveSettings);
resetBtn.addEventListener('click', resetToDefaults);
refreshModelsBtn.addEventListener('click', refreshModels);

// Cargar configuración al iniciar
document.addEventListener('DOMContentLoaded', loadSettings);
