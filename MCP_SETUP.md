# MCP Mobile Server - Configuração Claude Desktop

## Configuração Rápida

### 1. Build do Servidor MCP
```bash
npm run build
```

### 2. Configuração do Claude Desktop

Adicione a seguinte configuração ao arquivo de configuração do Claude Desktop:

**Localização do arquivo:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### 3. Configuração MCP

```json
{
  "mcpServers": {
    "mobile-dev": {
      "command": "node",
      "args": ["./dist/server.js"],
      "cwd": "/Users/cristianocosta/workspace/clientes/bancomaster/workspace/bm-dev-tools/mcp-mobile-server",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**IMPORTANTE:** Substitua o caminho `cwd` pelo caminho absoluto correto do seu servidor MCP.

### 4. Reiniciar Claude Desktop

Após salvar a configuração, reinicie o Claude Desktop para ativar o servidor MCP.

## Validação da Configuração

### 1. Validar configuração MCP
```bash
npm run mcp:validate
```

### 2. Testar conexão
```bash
npm start
```

## Tools Disponíveis

### Android (12 tools)
- `android_sdk_list_packages` - Listar pacotes SDK Android
- `android_sdk_install_packages` - Instalar pacotes SDK Android
- `android_list_avds` - Listar AVDs Android
- `android_create_avd` - Criar novo AVD
- `android_delete_avd` - Deletar AVD
- `android_list_emulators` - Listar emuladores disponíveis
- `android_start_emulator` - Iniciar emulador Android
- `android_stop_emulator` - Parar emulador Android
- `android_list_devices` - Listar dispositivos ADB
- `android_install_apk` - Instalar APK
- `android_uninstall_package` - Desinstalar pacote
- `android_shell_command` - Executar comando shell via ADB
- `android_logcat` - Capturar logcat Android

### iOS (9 tools)
- `ios_list_simulators` - Listar simuladores iOS
- `ios_boot_simulator` - Inicializar simulador iOS
- `ios_shutdown_simulator` - Desligar simulador iOS
- `ios_erase_simulator` - Apagar dados do simulador
- `ios_open_url` - Abrir URL no simulador
- `ios_take_screenshot` - Capturar screenshot do simulador
- `ios_record_video` - Gravar vídeo do simulador
- `ios_list_schemes` - Listar schemes do Xcode
- `ios_build_project` - Build projeto Xcode
- `ios_run_tests` - Executar testes iOS

### Flutter (12 tools)
- `flutter_doctor` - Diagnóstico Flutter
- `flutter_version` - Informações de versão Flutter
- `flutter_list_devices` - Listar dispositivos Flutter
- `flutter_list_emulators` - Listar emuladores Flutter
- `flutter_launch_emulator` - Lançar emulador Flutter
- `flutter_run` - Executar app Flutter (hot reload)
- `flutter_stop_session` - Parar sessão Flutter
- `flutter_list_sessions` - Listar sessões ativas Flutter
- `flutter_build` - Build app Flutter
- `flutter_test` - Executar testes Flutter
- `flutter_clean` - Limpar cache Flutter
- `flutter_pub_get` - Instalar dependências Flutter
- `flutter_screenshot` - Capturar screenshot Flutter

### Geral (1 tool)
- `health_check` - Verificar saúde do servidor MCP

## Exemplo de Uso no Claude

```
Use o tool health_check para verificar se tudo está funcionando corretamente.
```

```
Liste todos os dispositivos Android conectados usando android_list_devices.
```

```
Execute flutter doctor para verificar a instalação do Flutter.
```

## Troubleshooting

### Problema: Servidor MCP não conecta
- Verifique se o caminho `cwd` está correto
- Certifique-se que `npm run build` foi executado
- Reinicie o Claude Desktop

### Problema: Tools não aparecem
- Verifique se o servidor está rodando: `npm run mcp:validate`
- Confirme que a configuração JSON está válida
- Verifique os logs do Claude Desktop

### Problema: Comandos falham
- Certifique-se que as ferramentas necessárias estão instaladas:
  - Android SDK (sdkmanager, avdmanager, emulator, adb)
  - Xcode Command Line Tools (apenas macOS)
  - Flutter SDK

## Requisitos do Sistema

### Android Development
- Android SDK
- Java 8+ 
- Android Studio (recomendado)

### iOS Development (macOS apenas)
- Xcode
- Xcode Command Line Tools
- iOS Simulator

### Flutter Development
- Flutter SDK
- Dart SDK
- Android SDK
- Xcode (macOS apenas)

## Segurança

Este servidor MCP implementa:
- Validação rigorosa de entrada
- Proteção contra path traversal
- Bloqueio de comandos perigosos
- Validação de formatos de arquivo
- Timeouts para operações longas
- Rastreamento de processos em background