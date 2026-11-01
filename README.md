# 节奏 · 需求排期

一个面向前端开发者的个人需求排期桌面应用。当前版本支持：

- 按项目查看需求，查看本月排期时间轴
- 新增、编辑、删除需求
- 设置开始日期、结束日期、状态、优先级和备注
- 按项目、状态和关键词筛选
- 数据自动保存在当前设备的 localStorage 中
- Electron 桌面壳层，可用于 Mac 和 Windows

## 数据保存位置

当前版本不连接服务器，需求和项目保存在本地浏览器存储中：

- 需求数据键：`rhythm-schedule-tasks-v1`
- 项目数据键：`rhythm-schedule-projects-v1`
- 浏览器版：保存在当前浏览器的 `http://127.0.0.1:5173` 站点数据中
- Electron 版：保存在 Electron 的本地用户数据目录中，Mac 通常位于 `~/Library/Application Support/xu-qiu-pai-qi-app/Local Storage/leveldb`，Windows 通常位于 `%APPDATA%/xu-qiu-pai-qi-app/Local Storage/leveldb`

这些文件是浏览器内部数据库格式，不建议直接编辑；目前卸载应用或清理站点数据可能会删除数据。后续可以补充数据导出、导入和云端同步。

## 本地运行

建议使用 Node.js 20（项目提供 `.nvmrc`）。

```bash
npm install
npm run dev
```

`npm run web` 可只启动浏览器版，`npm run build` 构建前端，`npm run desktop` 使用构建后的文件启动 Electron。

后续如果要生成安装包，可以继续接入 `electron-builder`，分别构建 `.dmg` 和 Windows 安装程序。
