# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Thunderbird extension (WebExtension API) that analyzes emails using OpenAI's ChatGPT API to detect spam, phishing, and security threats. Uses streaming responses for real-time analysis display.

## Build and Package Commands

```bash
# Package the extension as XPI for distribution
./package.sh

# Manual packaging (alternative)
zip -r email-spam-checker.xpi manifest.json background.js popup.html popup.js options.html options.js result.html result.js marked.min.js icons/ -x "*.git*" "README.md"
```

## Development Setup

1. Load as temporary extension in Thunderbird:
   - Menu → Add-ons and Themes → Debug Add-ons → Load Temporary Add-on
   - Select `manifest.json`

2. Debug console: `Ctrl+Shift+J` in Thunderbird

## Architecture

### Extension Components (manifest.json)

- **manifest_version**: 2 (Thunderbird WebExtension format)
- **message_display_action**: Button appears in message toolbar when viewing emails
- **background.js**: Persistent background script
- **options_ui**: Settings page opens in new tab

### Communication Flow

```
popup.js → (opens) → result.html?messageId=X
                          ↓
                    result.js
                          ↓ (port connection: 'streaming')
                    background.js
                          ↓ (streaming)
                    OpenAI API
```

### Key Files

- **background.js**: Core logic - handles OpenAI API streaming, message retrieval via `browser.messages.getRaw()`, and port-based communication
- **popup.js**: Initial popup UI, validates API key exists, launches result window
- **result.js**: Analysis display with real-time markdown rendering using marked.js
- **options.js**: Settings management (API key, model selection, custom prompts)

### Streaming Implementation

Uses `browser.runtime.connect()` with port name `'streaming'` for real-time chunk delivery:
- Background receives `startAnalysis` message with messageId
- Sends `chunk` messages with content pieces
- Sends `done` when complete or `error` on failure

### Storage Keys (browser.storage.local)

- `apiKey`: OpenAI API key (must start with `sk-`)
- `model`: Model ID (default: `gpt-4o-mini`)
- `prompt`: System prompt for analysis

## Thunderbird APIs Used

- `browser.messages.getRaw(messageId)`: Get raw email content
- `browser.mailTabs.query()`: Get active mail tab
- `browser.mailTabs.getSelectedMessages()`: Get selected message
- `browser.storage.local`: Persistent settings storage
- `browser.runtime.connect()`: Port-based messaging for streaming
