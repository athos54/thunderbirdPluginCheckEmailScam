# Email Spam Checker para Thunderbird

Plugin de Thunderbird que utiliza ChatGPT para analizar emails y detectar spam, phishing y amenazas de seguridad.

## Características

- 🛡️ **Análisis forense profesional**: Analiza cabeceras SPF/DKIM/DMARC, cadenas Received, y autenticación
- 🔗 **Auditoría de enlaces**: Detecta acortadores, typosquatting, punycode, redirecciones y homoglyphs
- 🌐 **Búsqueda en internet**: Verifica dominios contra reportes de fraude y quejas online
- 🎯 **Detección de ingeniería social**: Identifica urgencia artificial, amenazas y peticiones sospechosas
- 📊 **Formato estructurado**: Veredicto, riesgo (0-100), hallazgos clave y recomendaciones
- 🔧 **Personalizable**: Configura el prompt y el modelo según tus necesidades
- 🔑 **Seguro**: Tu API key se almacena localmente en tu dispositivo
- ⚡ **Streaming en tiempo real**: Ve el análisis aparecer palabra por palabra
- 📊 **Múltiples modelos**: Soporta GPT-4o, GPT-4o Mini, GPT-4 Turbo y más

## Requisitos

- Thunderbird 102 o superior
- Una API key de OpenAI (obtén una en [platform.openai.com](https://platform.openai.com/api-keys))

## Instalación

### Opción 1: Instalación temporal (para desarrollo y pruebas)

1. **Abre Thunderbird**

2. **Accede a Complementos y temas** (usa uno de estos métodos):
   - Haz clic en el menú **hamburguesa (☰)** → **Complementos y temas**
   - O ve a **Herramientas** → **Complementos y temas**
   - O escribe `about:addons` en la barra de direcciones

3. **Abre la consola de depuración**:
   - Haz clic en el icono de **engranaje ⚙️** (arriba a la derecha)
   - Selecciona **"Depurar complementos"** o **"Debug Add-ons"**

4. **Carga el plugin**:
   - Haz clic en **"Cargar complemento temporal"**
   - Navega hasta el directorio del plugin
   - Selecciona el archivo `manifest.json`
   - Haz clic en **Abrir**

### Opción 2: Instalación permanente (archivo XPI)

1. **Empaqueta el plugin**:
   ```bash
   ./package.sh
   ```
   O manualmente:
   ```bash
   zip -r email-spam-checker.xpi * -x "*.git*" "README.md"
   ```

2. **Instala en Thunderbird**:
   - Abre el menú **hamburguesa (☰)** → **Complementos y temas**
   - Haz clic en el icono de **engranaje ⚙️**
   - Selecciona **"Instalar complemento desde archivo"**
   - Selecciona el archivo `email-spam-checker.xpi`
   - Confirma la instalación

## Configuración

1. Después de instalar el plugin, haz clic en el icono del plugin o ve a **Configuración** desde el popup
2. Introduce tu **API key de OpenAI** (comienza con `sk-`)
3. Selecciona el **modelo** que deseas usar:
   - **GPT-4o**: Recomendado para análisis forense completo con búsqueda en internet
   - **GPT-4o Mini**: Más rápido y económico para análisis básicos
   - **GPT-4 Turbo**: Análisis profundos
   - **GPT-3.5 Turbo**: Opción más económica (menos preciso)

4. El **prompt por defecto** incluye análisis profesional de:
   - Cabeceras forenses (SPF/DKIM/DMARC, Received, From/Reply-To)
   - MIME/HTML (base64, quoted-printable, CSS tricks)
   - Auditoría completa de enlaces (acortadores, typosquatting, punycode)
   - Detección de homoglyphs (O/0, l/I, caracteres Unicode)
   - Patrones de ingeniería social
   - Búsqueda en internet sobre el dominio remitente

   Puedes personalizarlo según tus necesidades en la configuración.

5. Haz clic en **Guardar configuración**

## Uso

1. Abre un email en Thunderbird
2. Haz clic en el icono del plugin en la barra de herramientas del mensaje
3. Haz clic en **Analizar este email**
4. Espera unos segundos mientras ChatGPT analiza el mensaje
5. Lee el análisis y la recomendación

## Ejemplos de uso

### Detección de Phishing
El plugin puede identificar:
- Direcciones de correo sospechosas
- Enlaces maliciosos o enmascarados
- Solicitudes urgentes de información personal
- Suplantación de identidad de empresas conocidas

### Análisis de Spam
Detecta:
- Correo comercial no solicitado
- Patrones típicos de spam
- Contenido engañoso o fraudulento
- Ofertas demasiado buenas para ser verdad

## Personalización del Prompt

Puedes personalizar el prompt para casos de uso específicos:

### Ejemplo 1: Análisis técnico detallado
```
Analiza este email desde una perspectiva técnica de seguridad.
Examina los headers, identifica posibles técnicas de spoofing,
analiza los enlaces y adjuntos, y proporciona una evaluación
de riesgo detallada.
```

### Ejemplo 2: Análisis para empresas
```
Evalúa este email desde la perspectiva de seguridad corporativa.
Identifica si contiene intentos de BEC (Business Email Compromise),
phishing dirigido, o solicitudes fraudulentas. Clasifica el nivel
de amenaza: BAJO, MEDIO, ALTO, CRÍTICO.
```

### Ejemplo 3: Análisis simple
```
¿Es este email seguro o peligroso? Responde con una palabra
(SEGURO/SPAM/PHISHING) y una breve explicación.
```

## Estructura del Proyecto

```
thunderbirdPluginCheckEmailScam/
├── manifest.json          # Configuración del plugin
├── background.js          # Lógica principal y API
├── popup.html            # Interfaz del popup
├── popup.js              # Lógica del popup
├── options.html          # Página de configuración
├── options.js            # Lógica de configuración
├── icons/                # Iconos del plugin
│   ├── icon-48.png
│   └── icon-96.png
└── README.md             # Este archivo
```

## Permisos Utilizados

- `messagesRead`: Para leer el contenido de los emails
- `accountsRead`: Para acceder a las cuentas de correo
- `storage`: Para guardar la configuración localmente

## Privacidad y Seguridad

- Tu API key se almacena **solo localmente** en Thunderbird
- Los emails se envían directamente a la API de OpenAI (no pasan por servidores intermediarios)
- No se guarda ningún historial de emails analizados
- Revisa la [política de privacidad de OpenAI](https://openai.com/policies/privacy-policy) para entender cómo se procesan tus datos

## Costes

Este plugin utiliza la API de OpenAI, que tiene coste por uso:

- **GPT-4o Mini**: ~$0.00015 por email (económico)
- **GPT-4o**: ~$0.0025 por email
- **GPT-4 Turbo**: ~$0.01 por email

Los costes exactos dependen del tamaño del email. Consulta los [precios actuales de OpenAI](https://openai.com/pricing).

## Solución de Problemas

### "No se ha configurado la API key de OpenAI"
- Ve a la configuración del plugin e introduce tu API key

### "Error de API: Incorrect API key provided"
- Verifica que tu API key sea correcta y comience con `sk-`
- Asegúrate de que tu cuenta de OpenAI tenga crédito disponible

### "No hay ningún email seleccionado"
- Abre un email antes de hacer clic en analizar

### El plugin no aparece
- Verifica que Thunderbird sea versión 102 o superior
- Reinstala el plugin siguiendo las instrucciones de instalación

### La extensión temporal desaparece al cerrar Thunderbird
Este es el comportamiento normal - las extensiones temporales se eliminan automáticamente al cerrar Thunderbird. Tienes varias opciones:

**Opción A: Recargar manualmente (desarrollo rápido)**
- Cada vez que abras Thunderbird: Menu → Complementos → Depurar complementos → Cargar complemento temporal

**Opción B: Instalar permanentemente sin firma (recomendado para desarrollo)**
1. Abre `about:config` en Thunderbird (Menu → Settings → Config Editor)
2. Busca y modifica estas preferencias:
   - `xpinstall.signatures.required` → `false`
   - `extensions.experiments.enabled` → `true`
3. Empaqueta la extensión: `./package.sh`
4. Instala el XPI: Menu → Complementos → Instalar complemento desde archivo
5. Ahora persistirá entre reinicios (solo reinstala cuando hagas cambios)

**Opción C: Usar web-ext (desarrollo avanzado)**
```bash
npm install -g web-ext
web-ext run --target=thunderbird-desktop --start-url about:debugging
```
Recarga automáticamente la extensión cuando detecta cambios

## Desarrollo

### Requisitos para desarrollo
- Node.js (opcional, para herramientas de desarrollo)
- Git (opcional)

### Pruebas locales
1. Carga el plugin como complemento temporal
2. Abre la consola de desarrollo: `Ctrl+Shift+J`
3. Revisa los logs en la consola

### Contribuir
Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Haz commit de tus cambios
4. Envía un pull request

## Licencia

[MIT License](LICENSE)

## Autor

Tu nombre

## Soporte

Si encuentras algún problema o tienes sugerencias:
- Abre un issue en GitHub
- Contacta al autor

## Roadmap

Funcionalidades planeadas para futuras versiones:

- [ ] Análisis automático de emails entrantes
- [ ] Lista blanca/negra de remitentes
- [ ] Integración con otros servicios de IA
- [ ] Estadísticas de análisis
- [ ] Exportar reportes de análisis
- [ ] Modo batch para analizar múltiples emails
- [ ] Configuración de reglas personalizadas

---

**Nota**: Este plugin envía el contenido de tus emails a OpenAI para su análisis. Usa este plugin bajo tu propia responsabilidad y asegúrate de cumplir con las políticas de privacidad de tu organización.
