// Popup script para el plugin de Thunderbird

document.addEventListener('DOMContentLoaded', async () => {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const translateBtn = document.getElementById('translateBtn');
  const statusDiv = document.getElementById('status');
  const resultDiv = document.getElementById('result');
  const configLink = document.getElementById('configLink');
  const emailPreviewDiv = document.getElementById('emailPreview');

  // Abrir página de configuración
  configLink.addEventListener('click', (e) => {
    e.preventDefault();
    browser.runtime.openOptionsPage();
  });

  // Función para mostrar estado
  function showStatus(message, type) {
    statusDiv.innerHTML = message;
    statusDiv.className = type;
    statusDiv.style.display = 'block';
  }

  // Función para mostrar resultado (con opción de streaming)
  function showResult(text, append = false) {
    if (append) {
      resultDiv.textContent += text;
    } else {
      resultDiv.textContent = text;
    }
    resultDiv.style.display = 'block';

    // Auto-scroll al final cuando se añade contenido
    if (append) {
      resultDiv.scrollTop = resultDiv.scrollHeight;
    }
  }

  // Función para ocultar resultado
  function hideResult() {
    resultDiv.style.display = 'none';
    resultDiv.textContent = '';
  }

  // Función para mostrar preview del email RAW
  function showEmailPreview(rawEmail) {
    const maxLength = 500;
    const truncated = rawEmail.length > maxLength
      ? rawEmail.substring(0, maxLength) + '\n\n[... contenido truncado, total: ' + rawEmail.length + ' caracteres ...]'
      : rawEmail;

    emailPreviewDiv.innerHTML = `<div class="preview-label">📧 Email en formato RAW:</div>${truncated}`;
    emailPreviewDiv.className = 'visible';
  }

  // Función para analizar con ChatGPT usando streaming desde background
  async function analyzeWithChatGPT(messageId) {

    return new Promise((resolve, reject) => {
      // Crear puerto de comunicación con background
      const port = browser.runtime.connect({ name: 'streaming' });

      hideResult();
      showResult(''); // Iniciar el área de resultado

      // Listener para mensajes del background
      port.onMessage.addListener((msg) => {

        if (msg.type === 'chunk') {
          // Mostrar chunk en tiempo real
          showResult(msg.content, true);
        } else if (msg.type === 'done') {
          port.disconnect();
          resolve();
        } else if (msg.type === 'error') {
          port.disconnect();
          reject(new Error(msg.error));
        }
      });

      // Iniciar el análisis
      port.postMessage({
        action: 'startAnalysis',
        messageId: messageId
      });
    });
  }

  // Función para abrir ventana de resultados con una acción específica
  async function openResultWindow(action) {
    try {
      analyzeBtn.disabled = true;
      translateBtn.disabled = true;
      showStatus('<span class="spinner"></span> Obteniendo email...', 'loading');

      // Obtener el mensaje actual
      const tabs = await browser.mailTabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0) {
        throw new Error('No se encontró una pestaña de correo activa');
      }

      const messageList = await browser.mailTabs.getSelectedMessages(tabs[0].id);
      if (!messageList || !messageList.messages || messageList.messages.length === 0) {
        throw new Error('No hay ningún email seleccionado');
      }

      const message = messageList.messages[0];

      // Abrir la página de resultados en una nueva ventana con la acción
      const resultUrl = browser.runtime.getURL(`result.html?messageId=${message.id}&action=${action}`);

      await browser.windows.create({
        url: resultUrl,
        type: 'popup',
        width: 900,
        height: 700
      });

      // Cerrar el popup actual
      window.close();

    } catch (error) {
      showStatus(`❌ Error: ${error.message}`, 'error');
      analyzeBtn.disabled = false;
      translateBtn.disabled = false;
    }
  }

  // Analizar email
  analyzeBtn.addEventListener('click', () => openResultWindow('analyze'));

  // Traducir email
  translateBtn.addEventListener('click', () => openResultWindow('translate'));

  // Verificar configuración al cargar
  const config = await browser.storage.local.get('apiKey');
  if (!config.apiKey) {
    showStatus('⚠️ Configura tu API key de OpenAI primero', 'error');
    analyzeBtn.disabled = true;
    translateBtn.disabled = true;
  }
});
