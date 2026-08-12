// Popup script para el plugin de Thunderbird

document.addEventListener('DOMContentLoaded', async () => {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const translateBtn = document.getElementById('translateBtn');
  const statusDiv = document.getElementById('status');
  const configLink = document.getElementById('configLink');

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

  // Detecta composición, mensaje mostrado en pestaña/ventana o selección
  // del panel principal, en ese orden.
  async function getCurrentContext() {
    const activeTabs = await browser.tabs.query({ active: true, currentWindow: true });

    for (const tab of activeTabs) {
      try {
        await browser.compose.getComposeDetails(tab.id);
        return { composeTabId: tab.id };
      } catch (error) {
        // La pestaña no es una ventana de composición.
      }

      try {
        const displayedMessage = await browser.messageDisplay.getDisplayedMessage(tab.id);
        if (displayedMessage) {
          return { messageId: displayedMessage.id };
        }
      } catch (error) {
        // No todas las pestañas activas son pestañas de visualización de mensajes.
      }
    }

    const mailTabs = await browser.mailTabs.query({ active: true, currentWindow: true });
    for (const mailTab of mailTabs) {
      const messageList = await browser.mailTabs.getSelectedMessages(mailTab.id);
      if (messageList?.messages?.length) {
        return { messageId: messageList.messages[0].id };
      }
    }

    throw new Error('No hay ningún email abierto o seleccionado');
  }

  // Función para abrir ventana de resultados con una acción específica
  async function openResultWindow(action) {
    try {
      analyzeBtn.disabled = true;
      translateBtn.disabled = true;
      showStatus('<span class="spinner"></span> Obteniendo email...', 'loading');

      const context = await getCurrentContext();
      const contextParameter = context.composeTabId !== undefined
        ? `composeTabId=${context.composeTabId}`
        : `messageId=${context.messageId}`;
      const resultUrl = browser.runtime.getURL(`result.html?${contextParameter}&action=${action}`);

      // Abrir la página de resultados en una nueva ventana con la acción
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
