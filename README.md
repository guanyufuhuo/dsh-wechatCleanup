# 微信文件清理 · dsh-wechat-file-cleaner

[![Test](https://github.com/guanyufuhuo/dsh-wechatCleanup/actions/workflows/ci.yml/badge.svg)](https://github.com/guanyufuhuo/dsh-wechatCleanup/actions/workflows/ci.yml)

一个用于 DeepSeek Harness 的本地微信存储清理插件。按微信账号检查重复和版本相似的文件，逐项确认后移入可恢复的清理回收站。

A local WeChat storage cleaner for DeepSeek Harness. Review duplicate and version-similar files per account, then move only approved files into a restorable quarantine.

Repository: <https://github.com/guanyufuhuo/dsh-wechatCleanup>

## 功能

- **按账号区分**：识别 `xwechat_files` / `WeChat Files` 下的账号目录，每个 `wxid_*` 账号独立统计和筛选。
- **完全重复**：按大小分桶后计算 SHA-256，内容相同的文件归为一组。
- **版本相似**：同一账号、同一扩展名内，按规范化文件名（去掉 `(1)`、`- 副本`、前导序号等）和受限大小比例归组。
- **整组清理**：默认每组保留一个建议项，也可以整组全部勾选后一起清理。
- **强制确认**：扫描只读；清理前生成 5 分钟有效的确认计划，必须勾选同意并再次点击才会移动文件。
- **可恢复**：文件移动到账号目录下的 `.dsh-wechat-cleaner/trash/<批次>/`，并记录清单；设置页内可按批次恢复。
- **本地处理**：扫描、哈希和移动都在本机完成，插件不上传文件内容或路径。
- **中英双语**：界面、插件元数据和图标均已本地化。

## 安装

需要 DeepSeek Harness Web/Desktop 版本 `0.2.2-rc.1` 或同系列 `0.2.x`。

1. 在 DSH 的插件管理器或插件市场中安装 `dsh-wechat-file-cleaner`。
2. 如果 DSH 提示需要重启，请完全退出应用后重新打开。
3. 打开 **设置 → 微信文件清理**。

也可以直接安装 npm 包：

```bash
npm install dsh-wechat-file-cleaner
```

插件没有构建步骤，安装后由 DSH 的 bundle 入口加载 Host 与 Client 两半。

## 使用

1. 打开设置页，插件会自动扫描一次。
2. 用账号筛选器查看分组；默认勾选每组除建议保留项以外的文件。
3. 需要整组清理时，直接勾选建议保留项即可。
4. 点击底部的 **清理选中文件**，在确认窗口核对文件名、账号和大小，勾选同意后确认。
5. 需要撤销时打开 **回收站**，恢复对应批次。原位置已有文件时会跳过，不覆盖。
6. 自动发现不到目录时，在页面底部手动指定 `xwechat_files` 根目录、单个账号目录或旧版 `WeChat Files` 目录。

## 安全设计

- 扫描阶段不创建、不修改、不删除文件。
- 删除请求只接受服务端扫描快照中的文件 ID，客户端不能提交任意路径。
- 清理前重新校验文件仍存在且大小未变；任一文件变化会中止整批操作。
- 移动是整批事务式的：中途失败会回滚已经移动的文件。
- 插件不注册 Agent 工具，删除不能由模型代替用户确认。
- 回收站清单保存在用户主目录的 `.dsh-wechat-cleaner/index.json`，文件本体保存在对应微信账号目录内。

## 扫描范围与限制

- 默认扫描 `msg/file`、`msg/video`，以及旧版 `FileStorage` 的 File/Video/Image。
- 跳过 `_thumb`、`_raw` 等微信派生文件，以及 32 KB 以下的小文件，避免破坏播放或预览。
- 暂不扫描加密的 `msg/attach` 缩略图。
- “版本相似”依据文件名和大小，不做文档正文或图片感知哈希；误判项需要用户自行取消勾选。
- Windows 会自动读取微信 4 的存储配置；macOS 会尝试常见容器路径；其他位置请手动指定。
- 建议先退出微信再清理，避免正在使用的文件被占用。

## 开发

```bash
npm test       # Node 内置测试：扫描、HTTP 路由、确认/清理/恢复、清单和 Client 注册
npm pack       # 生成发布用 tarball
```

运行环境：Node.js >= 20。

目录结构：

| 文件 | 作用 |
|---|---|
| `index.js` | Host 入口、同源 JSON API、扫描/确认/清理状态 |
| `scanner.js` | 账号发现、文件枚举、哈希和相似分组 |
| `trash.js` | 可恢复回收站、批次清单和恢复 |
| `client.js` | 设置页 React 界面和确认流程 |
| `cordis.patch.yml` | DSH bundle 行 |
| `test/` | 发布前测试 |

发布到 npm 前请确认 `package.json` 中的名称、版本、`engines.dsh` 和 `publishConfig`，并运行 `npm test` 与 `npm pack` 检查包内容。详见 [RELEASE.md](RELEASE.md)。

## English

### What it does

- Groups files per WeChat account.
- Finds exact duplicates with SHA-256 and version-similar files with normalized names plus a bounded size ratio.
- Lets you review every group, including cleaning an entire group.
- Requires an explicit, server-generated confirmation plan before moving any file.
- Moves approved files into a restorable per-account quarantine; every batch can be restored.
- Processes everything locally and registers no Agent deletion tool.

### Install and use

Install `dsh-wechat-file-cleaner` from the DSH plugin manager or marketplace, restart DSH if requested, then open **Settings → WeChat file cleanup**. If no folder is discovered, enter the `xwechat_files`, account, or legacy `WeChat Files` directory manually.

### Safety

Scanning is read-only. Deletion uses file IDs from the server-side scan snapshot; paths cannot be injected by the browser. Each plan is re-checked against file size and existence, moves are rolled back on partial failure, and no file is permanently deleted.

### Limitations

- Similarity is filename/size based; there is no document-text or perceptual-image comparison.
- `_thumb`, `_raw`, files under 32 KB, and encrypted `msg/attach` thumbnails are skipped.
- Windows auto-discovery is primary; macOS common container paths are probed, and other locations can be selected manually.

## License

MIT. See [LICENSE](LICENSE).
