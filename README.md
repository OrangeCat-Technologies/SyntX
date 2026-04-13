# ⚠️ Product Status: Discontinued

This extension has been **discontinued by Orangecat Technologies Pvt Ltd** and is now maintained as a **public archive**.

- No further updates, fixes, or features will be added  
- Issues and pull requests may not be reviewed  
- The project is kept available for reference and community exploration only  

---
<br>

<div align="center">
<sub>

<b>English</b> • [Català](locales/ca/README.md) • [Deutsch](locales/de/README.md) • [Español](locales/es/README.md) • [Français](locales/fr/README.md) • [हिंदी](locales/hi/README.md) • [Bahasa Indonesia](locales/id/README.md) • [Italiano](locales/it/README.md) • [日本語](locales/ja/README.md)

</sub>
<sub>

[한국어](locales/ko/README.md) • [Nederlands](locales/nl/README.md) • [Polski](locales/pl/README.md) • [Português (BR)](locales/pt-BR/README.md) • [Русский](locales/ru/README.md) • [Türkçe](locales/tr/README.md) • [Tiếng Việt](locales/vi/README.md) • [简体中文](locales/zh-CN/README.md) • [繁體中文](locales/zh-TW/README.md)

</sub>
</div>
<br>
<div align="center">
  <h1>Syntx</h1>
  <p align="center">
  <img src="https://raw.githubusercontent.com/Prith870/ASSETS/refs/heads/main/syntx.png" width="10%" />
  </p>
  <p>Connect with developers, contribute ideas, and stay ahead with the latest AI-powered coding tools.</p>
  
  
</div>
<hr>
<br>
<div align="center">

<a href="https://marketplace.visualstudio.com/items?itemName=OrangecatTechPvtLtd.syntx" target="_blank"><img src="https://img.shields.io/badge/Download%20on%20VS%20Marketplace-blue?style=for-the-badge&logo=visualstudiocode&logoColor=white" alt="Download on VS Marketplace"></a>
<a href="https://marketplace.visualstudio.com/items?itemName=OrangeCat-Technologies.syntx&ssr=false#review-details" target="_blank"><img src="https://img.shields.io/badge/Rate%20%26%20Review-green?style=for-the-badge" alt="Rate & Review"></a>

</div>

**Syntx** is an AI-powered **autonomous coding agent** that lives in your editor. It can:

- Communicate in natural language
- Read and write files directly in your workspace
- Run terminal commands
- Automate browser actions
- Integrate with any OpenAI-compatible or custom API/model
- Adapt its “personality” and capabilities through **Custom Modes**

Whether you’re seeking a flexible coding partner, a system architect, or specialized roles like a QA engineer or product manager, Syntx can help you build software more efficiently.

Check out the [CHANGELOG](CHANGELOG.md) for detailed updates and fixes.

## What Can Syntx Do?

- 🚀 **Generate Code** from natural language descriptions
- 🔧 **Refactor & Debug** existing code
- 📝 **Write & Update** documentation
- 🤔 **Answer Questions** about your codebase
- 🔄 **Automate** repetitive tasks
- 🏗️ **Create** new files and projects

## Quick Start

1. Install Syntx
2. Connect Your AI Provider
3. Try Your First Task

## Key Features

### Multiple Modes

Syntx adapts to your needs with specialized modes:

- **Code Mode:** For general-purpose coding tasks
- **Planner Mode:** For planning and technical leadership
- **Chat Mode:** For answering questions and providing information
- **Debug Mode:** For systematic problem diagnosis
- **Custom Modes:** Create unlimited specialized personas for security auditing, performance optimization, documentation, or any other task

### Smart Tools

Syntx comes with powerful tools that can:

- Read and write files in your project
- Execute commands in your VS Code terminal
- Control a web browser
- Use external tools via MCP (Model Context Protocol)

MCP extends Syntx's capabilities by allowing you to add unlimited custom tools. Integrate with external APIs, connect to databases, or create specialized development tools - MCP provides the framework to expand Syntx's functionality to meet your specific needs.

## Local Setup & Development

1. **Clone** the repo:

```sh
git clone https://github.com/OrangeCat-Technologies/SyntX.git
```

2. **Install dependencies**:

```sh
pnpm install
```

3. **Run the extension**:

There are several ways to run the Syntx extension:

### Development Mode (F5)

For active development, use VSCode's built-in debugging:

Press `F5` (or go to **Run** → **Start Debugging**) in VSCode. This will open a new VSCode window with the Syntx extension running.

- Changes to the webview will appear immediately.
- Changes to the core extension will also hot reload automatically.

### Automated VSIX Installation

To build and install the extension as a VSIX package directly into VSCode:

```sh
pnpm install:vsix [-y] [--editor=<command>]
```

This command will:

- Ask which editor command to use (code/cursor/code-insiders) - defaults to 'code'
- Uninstall any existing version of the extension.
- Build the latest VSIX package.
- Install the newly built VSIX.
- Prompt you to restart VS Code for changes to take effect.

Options:

- `-y`: Skip all confirmation prompts and use defaults
- `--editor=<command>`: Specify the editor command (e.g., `--editor=cursor` or `--editor=code-insiders`)

### Manual VSIX Installation

If you prefer to install the VSIX package manually:

1.  First, build the VSIX package:
    ```sh
    pnpm vsix
    ```
2.  A `.vsix` file will be generated in the `bin/` directory (e.g., `bin/syntx-<version>.vsix`).
3.  Install it manually using the VSCode CLI:
    ```sh
    code --install-extension bin/syntx-<version>.vsix
    ```

## Disclaimer


**Please note** that Orangecat Technologies Pvt Ltd does **not** make any representations or warranties regarding any code, models, or other tools provided or made available in connection with Syntx, any associated third-party tools, or any resulting outputs. You assume **all risks** associated with the use of any such tools or outputs; such tools are provided on an **"AS IS"** and **"AS AVAILABLE"** basis. Such risks may include, without limitation, intellectual property infringement, cyber vulnerabilities or attacks, bias, inaccuracies, errors, defects, viruses, downtime, property loss or damage, and/or personal injury. You are solely responsible for your use of any such tools or outputs (including, without limitation, the legality, appropriateness, and results thereof).

---

## Contributing

We love community contributions! Get started by reading our [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[Apache 2.0 © 2025 OrangeCat Technologies Pvt Ltd.](./LICENSE)

---

**Enjoy Syntx!** Whether you keep it on a short leash or let it roam autonomously, we can’t wait to see what you build. Happy coding!
