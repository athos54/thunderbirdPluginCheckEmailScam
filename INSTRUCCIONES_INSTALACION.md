# Instrucciones de Instalación - Email Spam Checker

## 📦 Archivo para compartir

El archivo **`email-spam-checker.xpi`** es el plugin listo para instalar en Thunderbird.

**Tamaño**: ~40 KB
**Compatible con**: Thunderbird 102 o superior

---

## 🚀 Instalación paso a paso

### 1. Obtener el archivo
- Descarga el archivo `email-spam-checker.xpi`
- O recíbelo por email/USB/nube

### 2. Abrir Thunderbird
- Ejecuta Thunderbird en tu ordenador

### 3. Acceder a Complementos
**Opción A** (recomendada):
- Haz clic en el menú **☰ (hamburguesa)** → **Complementos y temas**

**Opción B**:
- Ve a **Herramientas** → **Complementos y temas**

**Opción C**:
- Escribe `about:addons` en la barra de direcciones y presiona Enter

### 4. Instalar el complemento
1. En la página de complementos, haz clic en el icono de **engranaje ⚙️** (arriba a la derecha)
2. Selecciona **"Instalar complemento desde archivo"**
3. Navega hasta donde guardaste `email-spam-checker.xpi`
4. Selecciona el archivo y haz clic en **Abrir**
5. Confirma la instalación cuando Thunderbird lo pida

### 5. Verificar instalación
- El plugin debería aparecer en la lista de complementos instalados
- Busca "Email Spam Checker" en la lista
- Debería aparecer como activo ✓

---

## ⚙️ Configuración inicial

### 1. Obtener API Key de OpenAI

**IMPORTANTE**: Necesitas una cuenta de OpenAI con crédito disponible.

1. Ve a **https://platform.openai.com/api-keys**
2. Inicia sesión o crea una cuenta
3. Haz clic en **"Create new secret key"**
4. Dale un nombre (ej: "Thunderbird Plugin")
5. **Copia la clave** (empieza con `sk-...`)
   - ⚠️ Solo se muestra una vez, guárdala en lugar seguro
6. **IMPORTANTE**: Añade crédito a tu cuenta:
   - Ve a https://platform.openai.com/settings/organization/billing
   - Añade mínimo $5 USD de crédito

### 2. Configurar el plugin

1. Abre un email cualquiera en Thunderbird
2. Busca el icono del plugin (escudo azul 🛡️) en la barra de herramientas
3. Haz clic en el icono
4. Haz clic en **"⚙️ Configuración"**
5. En la página de configuración:
   - **API Key**: Pega tu clave de OpenAI (la que empieza con `sk-...`)
   - **Modelo**: Deja **GPT-4o Mini** (recomendado, económico y rápido)
     - O elige **GPT-4o** para análisis más profundos (más caro)
   - **Prompt**: El texto por defecto está optimizado, no hace falta cambiarlo
6. Haz clic en **"Guardar configuración"**

---

## 🎯 Cómo usar el plugin

### Analizar un email

1. **Abre un email** que quieras analizar
2. **Haz clic** en el icono del plugin (🛡️)
3. **Haz clic** en "🔍 Analizar este email"
4. Se abrirá una **ventana nueva** (900x700px) con:
   - Preview del email en formato RAW
   - Análisis de ChatGPT en tiempo real (streaming)
   - Resultado con formato Markdown

### Qué analiza el plugin

El análisis forense profesional incluye:

✅ **Cabeceras técnicas**
- SPF, DKIM, DMARC (autenticación)
- Cadena de servidores (Received)
- From, Reply-To, Return-Path
- Message-ID

✅ **Contenido**
- MIME, HTML, base64, quoted-printable
- CSS tricks, imágenes de tracking
- Formularios ocultos

✅ **Enlaces**
- Todos los URLs del email
- Acortadores (bit.ly, etc.)
- Typosquatting (paypa1.com, micros0ft.com)
- Punycode (xn--...)
- Redirecciones

✅ **Homoglyphs**
- Caracteres confusos: O/0, l/I, rn/m
- Unicode similares (cirílico vs latino)

✅ **Ingeniería social**
- Urgencia artificial
- Amenazas
- Petición de credenciales/datos

✅ **Búsqueda en internet**
- Reportes de fraude del dominio
- Quejas online

### Resultado del análisis

El plugin muestra:

```
Veredicto: Phishing casi seguro / Dudoso / Legítimo probable

Riesgo (0-100): 85 - Crítico

Hallazgos clave:
- Lista de señales más importantes

Cabeceras:
- Detalles técnicos

Enlaces detectados:
- URLs con banderas de riesgo

Homoglyphs:
- Caracteres sospechosos encontrados

Información del dominio:
- Resultados de búsquedas en internet

Qué haría yo ahora:
1. Acción recomendada 1
2. Acción recomendada 2
3. Acción recomendada 3
```

---

## 💰 Costes de uso

El plugin usa la API de OpenAI, que tiene coste por uso:

| Modelo | Coste por email | Recomendación |
|--------|----------------|---------------|
| GPT-4o Mini | ~$0.00015 | ⭐ Recomendado - Económico y preciso |
| GPT-4o | ~$0.0025 | Para análisis profundos |
| GPT-4 Turbo | ~$0.01 | Muy detallado (más caro) |

**Ejemplo**: Con $5 USD y GPT-4o Mini puedes analizar ~33,000 emails.

**Precios actualizados**: https://openai.com/pricing

---

## 🔧 Opciones avanzadas

### Personalizar el prompt

Si quieres ajustar el análisis:

1. Ve a **Configuración**
2. Edita el campo **"Prompt personalizado"**
3. El prompt por defecto ya está optimizado para detección de phishing
4. Guarda los cambios

### Restaurar valores por defecto

1. Ve a **Configuración**
2. Haz clic en **"Restaurar valores por defecto"**
3. Guarda

### Actualizar lista de modelos

1. Ve a **Configuración**
2. Haz clic en **"Actualizar lista de modelos"**
3. Verás todos los modelos GPT disponibles en tu cuenta

---

## ❓ Solución de problemas

### "No se ha configurado la API key"
- Ve a Configuración e introduce tu API key de OpenAI

### "Error de API: Incorrect API key"
- Verifica que la API key sea correcta (empieza con `sk-`)
- Asegúrate de tener crédito en tu cuenta de OpenAI

### "Error de API: Unsupported parameter"
- Recarga el plugin en Thunderbird
- Ve a `about:addons` → Busca el plugin → Click en "Recargar"

### El icono del plugin no aparece
- Verifica que Thunderbird sea versión 102 o superior
- Reinstala el plugin

### El análisis se queda colgado
- Abre la consola (`Ctrl+Shift+J`) para ver errores
- Verifica tu conexión a internet
- Verifica que tengas crédito en OpenAI

### "No hay email seleccionado"
- Asegúrate de tener un email abierto antes de analizar

---

## 🔒 Privacidad y seguridad

- ✅ Tu API key se guarda **solo localmente** en Thunderbird
- ✅ Los emails se envían directamente a OpenAI (sin intermediarios)
- ✅ No se guarda ningún historial de análisis
- ⚠️ El contenido de tus emails se envía a OpenAI para análisis
- ⚠️ Revisa la política de privacidad de OpenAI antes de usar

**Política de privacidad de OpenAI**: https://openai.com/policies/privacy-policy

**Recomendación**: No analices emails con información extremadamente sensible o confidencial.

---

## 📧 Soporte

Si tienes problemas:

1. Lee primero la sección "Solución de problemas"
2. Verifica que tienes la última versión del plugin
3. Comprueba que tu versión de Thunderbird es 102+
4. Revisa que tu API key de OpenAI funciona y tiene crédito

---

## 🆕 Actualizar el plugin

Para actualizar a una versión nueva:

1. Recibe el nuevo archivo `.xpi`
2. Ve a `about:addons`
3. Busca "Email Spam Checker"
4. Click en el menú **⋮** → **Eliminar**
5. Instala el nuevo `.xpi` siguiendo los pasos de arriba
6. Tu configuración (API key) se mantendrá guardada

---

**¡Listo! Ya puedes detectar phishing y spam con inteligencia artificial.**
