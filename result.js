// result.js - Maneja la visualización de resultados del análisis

let analysisText = '';
let currentAction = 'analyze';

// Configurar marked.js cuando esté disponible
if (typeof marked !== 'undefined') {
  marked.setOptions({
    breaks: true,        // Convertir saltos de línea a <br>
    gfm: true,          // GitHub Flavored Markdown
    headerIds: false,   // No generar IDs en headers
    mangle: false       // No ofuscar emails
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // Obtener parámetros de la URL
  const params = new URLSearchParams(window.location.search);
  const messageId = params.get('messageId');
  currentAction = params.get('action') || 'analyze';

  // Actualizar títulos según la acción
  const isTranslate = currentAction === 'translate';
  document.getElementById('pageTitle').textContent = isTranslate ? 'Traducción del Email' : 'Resultado del Análisis';
  document.getElementById('headerIcon').textContent = isTranslate ? '🌐' : '🛡️';
  document.getElementById('resultSectionTitle').textContent = isTranslate ? '🌐 Traducción de ChatGPT' : '🤖 Análisis de ChatGPT';
  document.getElementById('loadingText').textContent = isTranslate ? 'Traduciendo email con ChatGPT...' : 'Analizando email con ChatGPT...';
  document.title = isTranslate ? 'Traducción del Email - Email Spam Checker' : 'Resultado del Análisis - Email Spam Checker';

  // Ocultar preview del email en modo traducción
  if (isTranslate) {
    document.getElementById('previewSection').style.display = 'none';
  }

  if (!messageId) {
    showError('No se especificó un mensaje para ' + (isTranslate ? 'traducir' : 'analizar'));
    return;
  }

  try {
    // Obtener configuración
    const configResponse = await browser.runtime.sendMessage({
      action: 'getConfig'
    });

    if (!configResponse.success) {
      throw new Error('Error obteniendo configuración');
    }

    const config = configResponse.config;

    // Obtener email (RAW para análisis, body para traducción)
    let emailContent;
    if (isTranslate) {
      const bodyResponse = await browser.runtime.sendMessage({
        action: 'getEmailBody',
        messageId: parseInt(messageId)
      });
      if (!bodyResponse.success) {
        throw new Error('Error obteniendo email: ' + bodyResponse.error);
      }
      emailContent = bodyResponse.body;
    } else {
      const emailResponse = await browser.runtime.sendMessage({
        action: 'getEmailRaw',
        messageId: parseInt(messageId)
      });
      if (!emailResponse.success) {
        throw new Error('Error obteniendo email: ' + emailResponse.error);
      }
      emailContent = emailResponse.rawEmail;
    }

    // Mostrar metadata
    document.getElementById('emailSize').textContent = formatBytes(emailContent.length);
    document.getElementById('modelUsed').textContent = isTranslate ? config.translateModel : config.model;
    document.getElementById('analysisDate').textContent = new Date().toLocaleString('es-ES');

    // Mostrar preview del email
    showEmailPreview(emailContent);

    // Iniciar análisis/traducción con streaming
    await analyzeWithStreaming(parseInt(messageId));

  } catch (error) {
    showError(error.message);
  }
});

function showEmailPreview(rawEmail) {
  // No truncar, mostrar todo el email (el scroll se encarga del overflow)
  document.getElementById('emailPreview').textContent = rawEmail;
}

function showError(message) {
  const loadingIndicator = document.getElementById('loadingIndicator');
  const errorIndicator = document.getElementById('errorIndicator');
  const analysisResult = document.getElementById('analysisResult');

  loadingIndicator.style.display = 'none';
  analysisResult.style.display = 'none';
  errorIndicator.style.display = 'block';
  errorIndicator.textContent = '❌ Error: ' + message;
}

function showAnalysisChunk(chunk) {
  const loadingIndicator = document.getElementById('loadingIndicator');
  const analysisResult = document.getElementById('analysisResult');

  loadingIndicator.style.display = 'none';
  analysisResult.style.display = 'block';

  analysisText += chunk;

  // Renderizar markdown en tiempo real
  try {
    const htmlContent = marked.parse(analysisText);
    analysisResult.innerHTML = htmlContent;
  } catch (error) {
    // Si hay error parseando markdown, mostrar como texto plano
    analysisResult.textContent = analysisText;
  }
}

function finishAnalysis() {
  const analysisResult = document.getElementById('analysisResult');
  analysisResult.classList.remove('streaming');

  // Renderizar el markdown final una vez más para asegurar
  try {
    const htmlContent = marked.parse(analysisText);
    analysisResult.innerHTML = htmlContent;
  } catch (error) {
  }

}

async function analyzeWithStreaming(messageId) {

  return new Promise((resolve, reject) => {
    // Crear puerto de comunicación con background
    const port = browser.runtime.connect({ name: 'streaming' });

    // Listener para mensajes del background
    port.onMessage.addListener((msg) => {

      if (msg.type === 'chunk') {
        // Mostrar chunk en tiempo real
        showAnalysisChunk(msg.content);
      } else if (msg.type === 'done') {
        finishAnalysis();
        port.disconnect();
        resolve();
      } else if (msg.type === 'error') {
        showError(msg.error);
        port.disconnect();
        reject(new Error(msg.error));
      }
    });

    // Iniciar el análisis/traducción
    port.postMessage({
      action: 'startAnalysis',
      messageId: messageId,
      analysisType: currentAction
    });
  });
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function copyToClipboard() {
  if (!analysisText) {
    alert('No hay contenido para copiar');
    return;
  }

  navigator.clipboard.writeText(analysisText).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✅ Copiado';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }).catch(err => {
    alert('Error al copiar al portapapeles');
  });
}
