# Inicio Rápido - Email Spam Checker

## Instalación en 3 pasos

### 1. Instalar el plugin en Thunderbird

**Opción A: Instalación temporal (recomendada para pruebas)**

1. **Abre Thunderbird**

2. **Accede a Complementos y temas** (elige uno de estos métodos):
   - Haz clic en el menú hamburguesa (☰) → **Complementos y temas**
   - O ve a **Herramientas** → **Complementos y temas**
   - O escribe en la barra de direcciones: `about:addons` y presiona Enter

3. **Abre la consola de depuración**:
   - Haz clic en el icono de **engranaje ⚙️** (arriba a la derecha)
   - Selecciona **"Depurar complementos"** o **"Debug Add-ons"**

4. **Carga el plugin**:
   - Haz clic en **"Cargar complemento temporal"** o **"Load Temporary Add-on"**
   - Navega hasta este directorio del plugin
   - Selecciona el archivo `manifest.json`
   - Haz clic en **Abrir**

**Opción B: Instalación permanente**

1. **Empaqueta el plugin**:
   ```bash
   # Desde este directorio, ejecuta:
   ./package.sh
   ```

2. **Instala en Thunderbird**:
   - Abre el menú **hamburguesa (☰)** → **Complementos y temas**
   - Haz clic en el icono de **engranaje ⚙️**
   - Selecciona **"Instalar complemento desde archivo"**
   - Selecciona el archivo `email-spam-checker.xpi`
   - Confirma la instalación

### 2. Obtener tu API Key de OpenAI

1. Ve a https://platform.openai.com/api-keys
2. Inicia sesión o crea una cuenta
3. Haz clic en "Create new secret key"
4. Copia la clave (comienza con `sk-`)
5. **IMPORTANTE**: Añade crédito a tu cuenta en https://platform.openai.com/settings/organization/billing

### 3. Configurar el plugin

1. En Thunderbird, haz clic en el icono del plugin
2. Haz clic en "Configuración"
3. Pega tu API key de OpenAI
4. Selecciona el modelo (recomendado: GPT-4o Mini)
5. Haz clic en "Guardar configuración"

## Primer uso

1. Abre cualquier email en Thunderbird
2. Haz clic en el icono del plugin (escudo azul)
3. Haz clic en "Analizar este email"
4. ¡Espera el resultado!

## Ejemplo de respuesta

```
Este email NO es spam.

Análisis:
- Remitente: Dirección legítima de una empresa conocida
- Contenido: Mensaje coherente sin señales de alarma
- Enlaces: Apuntan al dominio oficial de la empresa
- Formato: Profesional y bien estructurado

Recomendación: Email seguro para abrir
```

## Personalización del prompt

Para personalizar el análisis, ve a Configuración y modifica el prompt:

**Para análisis técnico:**
```
Analiza este email desde una perspectiva técnica de seguridad.
Examina headers, identifica spoofing, analiza enlaces y adjuntos.
Proporciona evaluación de riesgo: BAJO/MEDIO/ALTO/CRÍTICO.
```

**Para análisis simple:**
```
¿Es spam? Responde: SÍ/NO y explica en 2 líneas.
```

## Solución rápida de problemas

| Problema | Solución |
|----------|----------|
| "No se ha configurado la API key" | Ve a Configuración e introduce tu API key |
| "Error de API" | Verifica que tu cuenta de OpenAI tenga crédito |
| El plugin no aparece | Verifica que Thunderbird sea versión 102+ |
| "No hay email seleccionado" | Abre un email antes de analizar |

## Costes aproximados

- GPT-4o Mini: ~$0.00015 por email (recomendado)
- GPT-4o: ~$0.0025 por email
- GPT-4 Turbo: ~$0.01 por email

Con $5 USD de crédito y GPT-4o Mini puedes analizar aproximadamente 33,000 emails.

## Privacidad

- ✓ La API key se guarda solo localmente en tu dispositivo
- ✓ Los emails se envían directamente a OpenAI (sin intermediarios)
- ✗ No se guarda historial de análisis
- ℹ️ Revisa la política de privacidad de OpenAI: https://openai.com/policies/privacy-policy

## Soporte

Para más información, consulta el archivo README.md completo.

---

**¡Listo para usar! Protege tu bandeja de entrada con IA.**
