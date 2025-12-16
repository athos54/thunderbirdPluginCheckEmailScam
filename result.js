// result.js - Maneja la visualización de resultados del análisis

let analysisText = '';

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

  if (!messageId) {
    showError('No se especificó un mensaje para analizar');
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

    // Obtener email RAW
    const emailResponse = await browser.runtime.sendMessage({
      action: 'getEmailRaw',
      messageId: parseInt(messageId)
    });

    if (!emailResponse.success) {
      throw new Error('Error obteniendo email: ' + emailResponse.error);
    }

    const rawEmail = emailResponse.rawEmail;

    // Mostrar metadata
    document.getElementById('emailSize').textContent = formatBytes(rawEmail.length);
    document.getElementById('modelUsed').textContent = config.model;
    document.getElementById('analysisDate').textContent = new Date().toLocaleString('es-ES');

    // Mostrar preview del email
    showEmailPreview(rawEmail);

    // Iniciar análisis con streaming
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

  // Auto-scroll al final
  analysisResult.scrollTop = analysisResult.scrollHeight;
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

    // Iniciar el análisis
    port.postMessage({
      action: 'startAnalysis',
      messageId: messageId
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
