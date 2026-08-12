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
  const composeTabId = params.get('composeTabId');
  currentAction = params.get('action') || 'analyze';

  // Actualizar títulos según la acción
  const isTranslate = currentAction === 'translate';
  const isCompose = composeTabId !== null;

  document.getElementById('pageTitle').textContent = isTranslate ? 'Traducción del Email' : 'Resultado del Análisis';
  document.getElementById('headerIcon').textContent = isTranslate ? '🌐' : '🛡️';
  document.getElementById('resultSectionTitle').textContent = isTranslate ? '🌐 Traducción de ChatGPT' : '🤖 Análisis de ChatGPT';
  document.getElementById('loadingText').textContent = isTranslate ? 'Traduciendo email con ChatGPT...' : 'Analizando email con ChatGPT...';
  document.title = isTranslate ? 'Traducción del Email - Email Spam Checker' : 'Resultado del Análisis - Email Spam Checker';

  // Ocultar preview del email en modo traducción
  if (isTranslate) {
    document.getElementById('previewSection').style.display = 'none';
  }

  if (!messageId && !composeTabId) {
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
    if (isCompose) {
      // Estamos analizando un email en composición
      if (isTranslate) {
        const bodyResponse = await browser.runtime.sendMessage({
          action: 'getComposeBody',
          composeTabId: parseInt(composeTabId)
        });
        if (!bodyResponse.success) {
          throw new Error('Error obteniendo email: ' + bodyResponse.error);
        }
        emailContent = bodyResponse.body;
      } else {
        const emailResponse = await browser.runtime.sendMessage({
          action: 'getComposeRaw',
          composeTabId: parseInt(composeTabId)
        });
        if (!emailResponse.success) {
          throw new Error('Error obteniendo email: ' + emailResponse.error);
        }
        emailContent = emailResponse.rawEmail;
      }
    } else {
      // Estamos analizando un email recibido
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
    }

    // Mostrar metadata
    document.getElementById('emailSize').textContent = formatBytes(new TextEncoder().encode(emailContent).length);
    document.getElementById('modelUsed').textContent = isTranslate ? config.translateModel : config.model;
    document.getElementById('analysisDate').textContent = new Date().toLocaleString('es-ES');

    // Mostrar preview del email
    if (!isTranslate) {
      showEmailPreview(emailContent);
    }

    // Iniciar análisis/traducción con streaming
    if (isCompose) {
      await analyzeWithStreaming(null, parseInt(composeTabId));
    } else {
      await analyzeWithStreaming(parseInt(messageId), null);
    }

  } catch (error) {
    showError(error.message);
  }
});

function showEmailPreview(rawEmail) {
  const maxPreviewChars = 200000;
  document.getElementById('emailPreview').textContent = rawEmail.length > maxPreviewChars
    ? `${rawEmail.slice(0, maxPreviewChars)}\n\n[... preview truncada por tamaño ...]`
    : rawEmail;
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

function renderSafeMarkdown(markdown) {
  const template = document.createElement('template');
  template.innerHTML = marked.parse(markdown);
  const allowedTags = new Set([
    'P', 'BR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'STRONG', 'EM',
    'UL', 'OL', 'LI', 'CODE', 'PRE', 'BLOCKQUOTE', 'A', 'HR', 'DEL',
    'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD'
  ]);

  template.content.querySelectorAll('script, style, iframe, object, embed, form, input, button, meta, link, base, img').forEach(element => {
    element.remove();
  });

  template.content.querySelectorAll('*').forEach(element => {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(document.createTextNode(element.textContent || ''));
      return;
    }

    for (const attribute of Array.from(element.attributes)) {
      if (element.tagName !== 'A' || !['href', 'title'].includes(attribute.name.toLowerCase())) {
        element.removeAttribute(attribute.name);
      }
    }

    if (element.tagName === 'A') {
      const href = element.getAttribute('href') || '';
      if (!/^(https?:|mailto:)/i.test(href)) {
        element.removeAttribute('href');
      } else {
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  return template.content.cloneNode(true);
}

function updateRenderedResult() {
  const analysisResult = document.getElementById('analysisResult');
  try {
    analysisResult.replaceChildren(renderSafeMarkdown(analysisText));
  } catch (error) {
    analysisResult.textContent = analysisText;
  }
}

function showAnalysisChunk(chunk) {
  const loadingIndicator = document.getElementById('loadingIndicator');
  const analysisResult = document.getElementById('analysisResult');

  loadingIndicator.style.display = 'none';
  analysisResult.style.display = 'block';

  analysisText += chunk;

  // Renderizar markdown en tiempo real
  updateRenderedResult();
}

function finishAnalysis() {
  const analysisResult = document.getElementById('analysisResult');
  analysisResult.classList.remove('streaming');

  // Renderizar el markdown final una vez más para asegurar
  updateRenderedResult();

}

async function analyzeWithStreaming(messageId, composeTabId) {

  return new Promise((resolve, reject) => {
    // Crear puerto de comunicación con background
    const port = browser.runtime.connect({ name: 'streaming' });

    // Listener para mensajes del background
    let settled = false;

    port.onMessage.addListener((msg) => {

      if (msg.type === 'chunk') {
        // Mostrar chunk en tiempo real
        showAnalysisChunk(msg.content);
      } else if (msg.type === 'done') {
        finishAnalysis();
        settled = true;
        port.disconnect();
        resolve();
      } else if (msg.type === 'error') {
        showError(msg.error);
        settled = true;
        port.disconnect();
        reject(new Error(msg.error));
      }
    });

    port.onDisconnect.addListener(() => {
      if (!settled) {
        settled = true;
        const message = browser.runtime.lastError?.message || 'La conexión con el proceso de análisis se cerró inesperadamente';
        showError(message);
        reject(new Error(message));
      }
    });

    // Iniciar el análisis/traducción
    const message = {
      action: 'startAnalysis',
      analysisType: currentAction
    };

    // Añadir el parámetro correcto según el contexto
    if (composeTabId !== null) {
      message.composeTabId = composeTabId;
    } else {
      message.messageId = messageId;
    }

    port.postMessage(message);
  });
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function copyToClipboard(event) {
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
