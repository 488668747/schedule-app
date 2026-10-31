# 节奏 · 需求排期

一个面向前端开发者的个人需求排期桌面应用。当前版本支持：

- 按项目查看需求，查看本月排期时间轴
- 新增、编辑、删除需求
- 设置开始日期、结束日期、状态、优先级和备注
- 按项目、状态和关键词筛选
- 数据自动保存在当前设备的 localStorage 中
- Electron 桌面壳层，可用于 Mac 和 Windows

## 本地运行

建议使用 Node.js 20（项目提供 `.nvmrc`）。

```bash
npm install
npm run dev
```

`npm run web` 可只启动浏览器版，`npm run build` 构建前端，`npm run desktop` 使用构建后的文件启动 Electron。

后续如果要生成安装包，可以继续接入 `electron-builder`，分别构建 `.dmg` 和 Windows 安装程序。
