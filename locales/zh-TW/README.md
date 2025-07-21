<div align="center">
<sub>

[English](../../README.md) • [Català](../ca/README.md) • [Deutsch](../de/README.md) • [Español](../es/README.md) • [Français](../fr/README.md) • [हिन्दी](../hi/README.md) • [Bahasa Indonesia](../id/README.md) • [Italiano](../it/README.md) • [日本語](../ja/README.md)

</sub>
<sub>

[한국어](../ko/README.md) • [Nederlands](../nl/README.md) • [Polski](../pl/README.md) • [Português (BR)](../pt-BR/README.md) • [Русский](../ru/README.md) • [Türkçe](../tr/README.md) • [Tiếng Việt](../vi/README.md) • [简体中文](../zh-CN/README.md) • <b>繁體中文</b>

</sub>
</div>
<br>

<div align="center">
  <h2>加入 Syntx 社群</h2>
  <p>與開發者連結，貢獻想法，並了解最新的 AI 驅動的程式設計工具。</p>
  
  <a href="https://discord.gg/FzndMpbhDd" target="_blank"><img src="https://img.shields.io/badge/加入%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="加入 Discord"></a>
  
</div>
<br>
<br>

<div align="center">
<h1>Syntx（前身為 Lagrange）</h1>
<p align="center">
<img src="https://media.githubusercontent.com/media/OrangeCat-Technologies/SyntX/main/src/assets/docs/demo.gif" width="100%" />
</p>

<a href="https://marketplace.visualstudio.com/items?itemName=RooVeterinaryInc.roo-cline" target="_blank"><img src="https://img.shields.io/badge/從%20VS%20Marketplace%20下載-blue?style=for-the-badge&logo=visualstudiocode&logoColor=white" alt="從 VS Marketplace 下載"></a>
<a href="https://github.com/OrangeCat-Technologies/SyntX/discussions/categories/feature-requests?discussions_q=is%3Aopen+category%3A%22Feature+Requests%22+sort%3Atop" target="_blank"><img src="https://img.shields.io/badge/功能請求-yellow?style=for-the-badge" alt="功能請求"></a>
<a href="https://marketplace.visualstudio.com/items?itemName=RooVeterinaryInc.roo-cline&ssr=false#review-details" target="_blank"><img src="https://img.shields.io/badge/評分%20%26%20評論-green?style=for-the-badge" alt="評分 & 評論"></a>
<a href="https://docs.roocode.com" target="_blank"><img src="https://img.shields.io/badge/文件-6B46C1?style=for-the-badge&logo=readthedocs&logoColor=white" alt="文件"></a>

</div>

**Syntx** 是一個存在於您編輯器中的 AI 驅動**自主程式開發助手**。它能夠：

- 使用自然語言與您溝通
- 直接讀寫您工作區中的檔案
- 執行終端機命令
- 自動化瀏覽器操作
- 整合任何與 OpenAI 相容或自訂的 API/模型
- 透過**自訂模式**調整其「個性」與功能

無論您需要的是一位靈活的程式設計夥伴、系統架構師，或是 QA 工程師、產品經理等特定角色，Syntx 都能協助您更有效率地開發軟體。

請檢視 [CHANGELOG](../../CHANGELOG.md) 了解詳細的更新與修正內容。

---

## 🎉 Syntx 3.23 已發布

Syntx 3.23 帶來強大的新功能和重大改進，以提升您的開發工作流程！

- **程式碼庫索引從實驗階段畢業** - 完整的程式碼庫索引現已穩定，可用於生產環境，具有改進的搜尋和上下文理解能力。
- **新的待辦事項清單功能** - 透過整合的任務管理保持任務進度，幫助您保持組織性並專注於開發目標。

---

## Syntx 可以做什麼？

- 🚀 從自然語言描述**產生程式碼**
- 🔧 **重構與除錯**現有程式碼
- 📝 **撰寫與更新**文件
- 🤔 **回答**關於您的程式碼的問題
- 🔄 **自動化**重複性工作
- 🏗️ **建立**新檔案與專案

## 快速開始

1. [安裝 Syntx](https://docs.roocode.com/getting-started/installing)
2. [連接您的 AI 提供者](https://docs.roocode.com/getting-started/connecting-api-provider)
3. [嘗試您的第一個任務](https://docs.roocode.com/getting-started/your-first-task)

## 主要特點

### 多種模式

Syntx 提供專業化的[模式](https://docs.roocode.com/basic-usage/using-modes)，能滿足您的各種需求：

- **程式碼模式：** 處理一般程式設計工作
- **架構師模式：** 規劃架構與技術領導
- **詢問模式：** 回答問題與提供資訊
- **除錯模式：** 系統化地診斷問題
- **[客製化模式](https://docs.roocode.com/advanced-usage/custom-modes)：** 建立無限個專業角色，進行安全性審核、效能最佳化、文件撰寫或其他任何任務

### 智慧工具

Syntx 內建強大的[工具](https://docs.roocode.com/basic-usage/how-tools-work)，能夠：

- 讀寫您專案中的檔案
- 在您的 VS Code 終端機中執行命令
- 控制網頁瀏覽器
- 透過 [MCP (Model Context Protocol)](https://docs.roocode.com/advanced-usage/mcp) 使用外部工具

透過 MCP，您可以無限制地新增自訂工具，進一步擴充 Syntx 的功能。無論是整合外部 API、連接資料庫，或建立專屬的開發工具，MCP 都提供完整的框架，讓您依據自身需求靈活擴充 Syntx。

### 客製化

Syntx 可以配合您的需求進行調整：

- [自訂指令](https://docs.roocode.com/advanced-usage/custom-instructions)：個人化 Syntx 的行為
- [自訂模式](https://docs.roocode.com/advanced-usage/custom-modes)：處理特定專業任務
- [本機模型](https://docs.roocode.com/advanced-usage/local-models)：支援離線使用
- [自動核准設定](https://docs.roocode.com/advanced-usage/auto-approving-actions)：加快工作流程

## 資源

### 文件

- [基本使用指南](https://docs.roocode.com/basic-usage/the-chat-interface)
- [進階功能](https://docs.roocode.com/advanced-usage/auto-approving-actions)
- [常見問題](https://docs.roocode.com/faq)

### 社群

- **Discord：** [加入我們的 Discord 伺服器](https://discord.gg/FzndMpbhDd)取得即時幫助和討論
- **GitHub：** [報告問題](https://github.com/OrangeCat-Technologies/SyntX/issues)或[請求功能](https://github.com/OrangeCat-Technologies/SyntX/discussions/categories/feature-requests?discussions_q=is%3Aopen+category%3A%22Feature+Requests%22+sort%3Atop)

---

## 開發環境設定

1. **複製**儲存庫：

```sh
git clone https://github.com/OrangeCat-Technologies/SyntX.git
```

2. **安裝相依套件**：

```sh
npm run install:all
```

3. **啟動網頁檢視（Vite/React 應用程式，支援 HMR）**：

```sh
npm run dev
```

4. **除錯**：
   在 VSCode 中按下 `F5`（或選擇**執行** → **開始除錯**）以開啟載入 Syntx 的新工作階段。

網頁檢視的變更會立即顯示。核心擴充功能的變更則需要重新啟動擴充主機。

或者，您也可以建置 .vsix 檔案並直接在 VSCode 中安裝：

```sh
npm run build
```

建置完成後，`.vsix` 檔案會出現在 `bin/` 目錄中，可使用以下指令安裝：

```sh
code --install-extension bin/roo-cline-<version>.vsix
```

我們使用 [changesets](https://github.com/changesets/changesets) 進行版本控制和發布。檢視我們的 `CHANGELOG.md` 取得發布說明。

---

## 免責聲明

**請注意**，Syntx, Inc. **不**對與 Syntx 相關的任何程式碼、模型或其他工具、任何相關的第三方工具，或任何產生的輸出提供任何陳述或保證。您使用這些工具或輸出時，需自行承擔**所有相關風險**；這些工具係以**「現況」**及**「現有」**基礎提供。上述風險包括但不限於智慧財產權侵害、網路安全漏洞或攻擊、偏見、不準確性、錯誤、缺陷、病毒、停機時間、財產損失或損害，以及／或人身傷害。您須自行負責使用這些工具或輸出所產生的任何結果（包括但不限於其合法性、適當性及後果）。

---

## 貢獻

我們喜歡社群貢獻！透過閱讀我們的 [CONTRIBUTING.md](CONTRIBUTING.md) 開始。

---

## 貢獻者

感謝所有幫助改進 Syntx 的貢獻者！

<!-- START CONTRIBUTORS SECTION - AUTO-GENERATED, DO NOT EDIT MANUALLY -->

<!-- END CONTRIBUTORS SECTION -->

## 授權

[Apache 2.0 © 2025 Syntx, Inc.](../LICENSE)

---

**享受 Syntx！** 無論您是將它拴在短繩上還是讓它自主漫遊，我們迫不及待地想看看您會建構什麼。如果您有問題或功能想法，請造訪我們的 [Discord](https://discord.gg/FzndMpbhDd)。祝您開發愉快！
