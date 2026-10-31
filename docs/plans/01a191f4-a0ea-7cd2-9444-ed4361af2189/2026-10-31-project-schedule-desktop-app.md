# 项目排期桌面应用 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个可在 Mac 和 Windows 运行的个人项目需求排期桌面应用，让前端开发者可以维护需求、查看日期安排和跟踪进度。

**Architecture:** 使用 React + Vite 构建桌面端界面，Electron 作为跨平台壳层；第一版数据保存在浏览器 localStorage 中，保证无需后端即可使用。主界面采用左侧项目导航、顶部日期与操作区、统计卡片和按月排期视图，需求通过弹窗新增/编辑，任务列表支持状态与项目筛选。

**Tech Stack:** React 18, Vite, Electron, plain CSS, SVG icons, localStorage.

---

### Task 1: 初始化 React + Electron 工程

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/electron.cjs`
- Create: `src/preload.cjs`
- Create: `vite.config.js`
- Create: `.gitignore`

**Step 1:** 配置 Vite 开发与构建脚本，并添加 Electron 入口。

**Step 2:** 运行 `npm install` 安装依赖，确认工程可启动。

**Step 3:** 运行 `npm run build`，确认前端产物可以生成。

### Task 2: 建立排期数据模型与本地持久化

**Files:**
- Create: `src/data.js`
- Create: `src/utils/date.js`
- Modify: `src/main.jsx`

**Step 1:** 定义项目、任务、状态、优先级和日期字段，提供适合首屏演示的初始数据。

**Step 2:** 实现 localStorage 读取、保存，以及任务新增、编辑、删除和状态更新。

**Step 3:** 实现按项目、状态、关键词过滤和统计数据计算。

### Task 3: 实现桌面工作台 UI

**Files:**
- Create: `src/App.jsx`
- Create: `src/styles.css`
- Create: `src/components/Icon.jsx`
- Create: `src/components/Sidebar.jsx`
- Create: `src/components/Stats.jsx`
- Create: `src/components/Timeline.jsx`
- Create: `src/components/TaskModal.jsx`

**Step 1:** 创建应用骨架、侧边栏、顶部栏和响应式内容区。

**Step 2:** 添加统计卡片、月度排期时间轴、项目色彩标记和任务详情列表。

**Step 3:** 添加新增/编辑需求弹窗，包含标题、项目、日期、状态、优先级和备注字段。

**Step 4:** 添加空状态、筛选状态、删除确认和轻量动效，保证键盘焦点和可读性。

### Task 4: 接入 Electron 与开发/生产运行方式

**Files:**
- Modify: `src/electron.cjs`
- Modify: `package.json`
- Create: `README.md`

**Step 1:** 配置 Electron 启动 Vite 开发服务器，并在生产环境加载 `dist/index.html`。

**Step 2:** 添加 `npm run dev`、`npm run web`、`npm run build` 和 `npm run desktop` 脚本。

**Step 3:** 在 README 中说明 Mac/Windows 的开发和打包入口。

### Task 5: 验证与交付

**Files:**
- Modify: files from previous tasks only as needed

**Step 1:** 运行 `npm run build`，确认构建成功。

**Step 2:** 运行 `npm run web`，验证界面可加载并完成新增、编辑、筛选、删除操作。

**Step 3:** 检查 `git diff`，确认只包含本功能相关文件，并保留可提交到 GitHub 的工程结构。
