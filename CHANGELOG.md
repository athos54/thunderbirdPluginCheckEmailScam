# Historial de cambios

## 1.3.0 - 2026-08-12

### Corregido

- Detección del mensaje abierto en pestañas y ventanas independientes de Thunderbird.
- Selección persistente de modelos y filtrado de modelos incompatibles con Chat Completions.
- Traducción de emails MIME y HTML sin perder partes, formato ni destinos de enlaces.
- Recuperación de configuraciones antiguas que contenían selectores de modelo vacíos.
- Cancelación de peticiones cuando se cierra la ventana de resultados.
- Procesamiento seguro de respuestas Markdown mediante una lista blanca de HTML.

### Mejorado

- Compatibilidad conjunta con mensajes seleccionados, mensajes abiertos y ventanas de composición.
- Tratamiento controlado de emails grandes y previews extensas.
- Separación explícita del contenido no confiable para reducir la inyección de instrucciones.
- Análisis limitado a evidencias reales del email, sin afirmar consultas externas inexistentes.

## 1.2.0 - 2025-12-19

- Soporte para analizar y traducir emails desde la ventana de composición.

## 1.1.0 - 2025-12-18

- Traducción de emails y selección independiente de modelos por acción.

## 1.0.1 - 2025-12-16

- Eliminación del límite de tokens de finalización.

## 1.0.0 - 2025-12-16

- Primera versión estable.
