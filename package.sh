#!/bin/bash
# Script para empaquetar el plugin en formato XPI

# Nombre del archivo de salida
VERSION=$(sed -n 's/.*"version": "\([^"]*\)".*/\1/p' manifest.json)
OUTPUT="email-spam-checker-v${VERSION}.xpi"

if [ -z "$VERSION" ]; then
    echo "✗ No se pudo obtener la versión de manifest.json"
    exit 1
fi

# Eliminar el archivo anterior si existe
if [ -f "$OUTPUT" ]; then
    rm "$OUTPUT"
    echo "Archivo anterior eliminado"
fi

# Crear el archivo XPI (es básicamente un archivo ZIP)
zip -r "$OUTPUT" \
    manifest.json \
    background.js \
    popup.html \
    popup.js \
    options.html \
    options.js \
    result.html \
    result.js \
    marked.min.js \
    icons/ \
    -x "*.git*" "*.DS_Store" "README.md" "LICENSE" ".gitignore" "package.sh"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Plugin empaquetado exitosamente: $OUTPUT"
    echo ""
    echo "Para instalar:"
    echo "1. Abre Thunderbird"
    echo "2. Ve a Menú → Complementos y temas"
    echo "3. Haz clic en el icono de engranaje ⚙️"
    echo "4. Selecciona 'Instalar complemento desde archivo'"
    echo "5. Selecciona el archivo $OUTPUT"
else
    echo "✗ Error al empaquetar el plugin"
    exit 1
fi
