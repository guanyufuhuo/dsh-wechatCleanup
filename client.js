window.__ModuleLoader__.load({
  id: 'dsh-wechat-file-cleaner',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'wechatFileCleaner'
    const API = '/wechat-file-cleaner/api'

    const zh = {
      'nav.title': '微信文件清理',
      'page.eyebrow': '存储维护',
      'page.title': '微信文件清理',
      'page.desc': '按微信账号检查重复和版本相似的文件，逐项确认后移入可恢复的清理回收站。',
      'action.scan': '扫描',
      'action.rescan': '重新扫描',
      'action.scanning': '扫描中…',
      'action.cleanup': '清理选中文件',
      'action.preparing': '正在生成确认…',
      'action.cancel': '取消',
      'action.confirm': '移入回收站',
      'action.deleting': '正在清理…',
      'action.trash': '回收站',
      'action.restore': '恢复',
      'action.refresh': '刷新',
      'action.scanHere': '扫描此目录',
      'tab.duplicates': '重复 / 相似',
      'tab.large': '大文件',
      'large.title': '大文件扫描',
      'large.desc': '按大小阈值找出微信账号中的大文件，可再按后缀名筛选。',
      'large.threshold': '最小大小',
      'large.unitMB': 'MB',
      'large.extensions': '后缀名筛选',
      'large.extensionsPlaceholder': '例如 mp4, zip, psd；留空表示全部',
      'large.extensionsHint': '多个后缀用逗号或空格分隔，不需要写点。',
      'large.scan': '扫描大文件',
      'large.rescan': '重新扫描',
      'large.scanning': '正在扫描大文件…',
      'large.scanningDesc': '按阈值遍历微信文件目录，只读，不会修改文件。',
      'large.thresholdError': '请输入大于 0 的 MB 阈值',
      'large.errorTitle': '大文件扫描没有完成',
      'large.noFiles': '没有超过阈值的大文件',
      'large.noFilesDesc': '尝试降低阈值、清除后缀筛选，或换一个微信目录。',
      'large.summaryFiles': '大文件数',
      'large.summarySize': '总大小',
      'large.summaryMax': '最大文件',
      'large.meta': '阈值 {size} · 后缀：{ext} · 用时 {ms} 毫秒',
      'large.allExtensions': '全部',
      'large.selectAll': '全选',
      'large.clear': '清空',
      'large.badge': '大文件',
      'large.selectedCount': '已选 {count}',
      'large.skippedFilter': '已按后缀过滤 {count} 个文件。',
      'status.scanning': '正在扫描微信文件…',
      'status.scanningDesc': '正在统计文件并计算重复内容，文件不会离开原位置。',
      'summary.accounts': '微信账号',
      'summary.files': '已扫描文件',
      'summary.groups': '重复或相似组',
      'summary.reclaimable': '预计可释放',
      'meta.duration': '用时 {ms} 毫秒',
      'meta.scanned': '共扫描 {count} 个文件，{size}',
      'meta.roots': '扫描位置',
      'meta.method': '完全重复按文件内容识别；版本相似按文件名和大小识别。',
      'meta.truncated': '文件数量达到上限，结果可能不完整。',
      'filter.all': '全部账号',
      'badge.exact': '完全重复',
      'badge.similar': '版本相似',
      'group.files': '{count} 个文件',
      'group.reclaim': '可释放 {size}',
      'group.selected': '已选 {count}',
      'group.reset': '恢复建议',
      'group.suggestKeep': '建议保留',
      'file.selected': '将清理',
      'empty.noRoots.title': '没有找到微信文件目录',
      'empty.noRoots.desc': '请确认微信已登录并接收过文件。也可以手动指定微信文件存储目录。',
      'empty.noFiles.title': '没有发现重复或相似文件',
      'empty.noFiles.desc': '当前账号的文件中没有可清理的重复项。新的聊天文件保存后可以重新扫描。',
      'custom.summary': '扫描其他目录',
      'custom.label': '微信文件目录',
      'custom.placeholder': '例如：D:\\weixin Storage\\xwechat_files',
      'custom.hint': '支持 xwechat_files 存储根目录、单个账号目录，或旧版 WeChat Files 目录。',
      'custom.open': '手动指定目录',
      'notice.cleanFailed': '清理失败',
      'notice.prepareFailed': '无法生成清理确认',
      'notice.scanFailed': '扫描失败',
      'notice.restoreFailed': '恢复失败',
      'notice.cleaned': '已将 {count} 个文件移入清理回收站，可随时恢复。',
      'notice.restored': '已恢复 {count} 个文件。',
      'notice.prepared': '请在确认窗口中核对文件，确认后才会移动。',
      'confirm.title': '确认清理这些文件',
      'confirm.desc': '以下文件将从微信目录移动到插件的清理回收站，不会永久删除。',
      'confirm.summary': '共 {count} 个文件，预计释放 {size}',
      'confirm.ack': '我已核对以上文件，同意将它们移入清理回收站',
      'confirm.warning': '清理后可在“回收站”中恢复。整组勾选时不会保留副本；请先退出微信或确认这些文件没有被正在使用的聊天占用。',
      'confirm.action': '确认移入（{count}）',
      'trash.title': '清理回收站',
      'trash.desc': '每次清理都会保留一份可恢复的记录。',
      'trash.empty': '回收站是空的。',
      'trash.loading': '正在读取回收站…',
      'trash.batch': '{time} · {count} 个文件 · {size}',
      'trash.accounts': '账号：{names}',
      'trash.firstFiles': '包含：{names}',
      'trash.restoreHint': '恢复时会跳过原位置已存在的文件。',
      'error.title': '扫描没有完成',
      'error.retry': '重试',
      'error.groupsTruncated': '重复组较多，这里只展示可释放空间最大的 300 组。',
      'error.warnings': '{count} 个目录无法读取，结果可能不完整。',
      'roots.none': '未检测到微信目录',
      'status.ready': '扫描完成',
      'status.selected': '已选择 {count} 个文件，可释放 {size}',
      'status.noneSelected': '勾选要清理的文件；默认保留每组的一个建议项。',
      'status.scanTime': '{time} 完成',
    }

    const en = {
      'nav.title': 'WeChat file cleanup',
      'page.eyebrow': 'Storage maintenance',
      'page.title': 'WeChat file cleanup',
      'page.desc': 'Review duplicate and version-similar files per WeChat account, then move only approved files into a restorable quarantine.',
      'action.scan': 'Scan',
      'action.rescan': 'Scan again',
      'action.scanning': 'Scanning…',
      'action.cleanup': 'Clean selected',
      'action.preparing': 'Preparing confirmation…',
      'action.cancel': 'Cancel',
      'action.confirm': 'Move to quarantine',
      'action.deleting': 'Cleaning…',
      'action.trash': 'Quarantine',
      'action.restore': 'Restore',
      'action.refresh': 'Refresh',
      'action.scanHere': 'Scan this folder',
      'tab.duplicates': 'Duplicates / similar',
      'tab.large': 'Large files',
      'large.title': 'Large-file scan',
      'large.desc': 'Find files above a size threshold, optionally limited to selected extensions.',
      'large.threshold': 'Minimum size',
      'large.unitMB': 'MB',
      'large.extensions': 'Extension filter',
      'large.extensionsPlaceholder': 'e.g. mp4, zip, psd; leave empty for all',
      'large.extensionsHint': 'Separate extensions with commas or spaces; no leading dot needed.',
      'large.scan': 'Scan large files',
      'large.rescan': 'Scan again',
      'large.scanning': 'Scanning large files…',
      'large.scanningDesc': 'Walking the WeChat folders by the size threshold. Read-only; nothing is changed.',
      'large.thresholdError': 'Enter a size threshold greater than 0 MB',
      'large.errorTitle': 'Large-file scan did not finish',
      'large.noFiles': 'No files above this threshold',
      'large.noFilesDesc': 'Try a lower threshold, clear the extension filter, or choose another WeChat folder.',
      'large.summaryFiles': 'Large files',
      'large.summarySize': 'Total size',
      'large.summaryMax': 'Largest file',
      'large.meta': 'Threshold {size} · Extensions: {ext} · Took {ms} ms',
      'large.allExtensions': 'all',
      'large.selectAll': 'Select all',
      'large.clear': 'Clear',
      'large.badge': 'Large file',
      'large.selectedCount': '{count} selected',
      'large.skippedFilter': '{count} files filtered by extension.',
      'status.scanning': 'Scanning WeChat files…',
      'status.scanningDesc': 'Counting files and hashing duplicates. Nothing leaves its current location.',
      'summary.accounts': 'WeChat accounts',
      'summary.files': 'Files scanned',
      'summary.groups': 'Duplicate groups',
      'summary.reclaimable': 'Reclaimable',
      'meta.duration': 'Took {ms} ms',
      'meta.scanned': '{count} files scanned, {size}',
      'meta.roots': 'Scan locations',
      'meta.method': 'Exact duplicates use file content; similar versions use file name and size.',
      'meta.truncated': 'The file limit was reached; results may be incomplete.',
      'filter.all': 'All accounts',
      'badge.exact': 'Exact duplicate',
      'badge.similar': 'Similar version',
      'group.files': '{count} files',
      'group.reclaim': 'Reclaim {size}',
      'group.selected': '{count} selected',
      'group.reset': 'Reset suggestion',
      'group.suggestKeep': 'Keep suggested',
      'file.selected': 'Will clean',
      'empty.noRoots.title': 'No WeChat file folder found',
      'empty.noRoots.desc': 'Make sure WeChat is signed in and has received files, or point the plugin at the WeChat storage folder.',
      'empty.noFiles.title': 'No duplicates or similar files',
      'empty.noFiles.desc': 'Nothing worth cleaning was found in these accounts. Scan again after new chat files are saved.',
      'custom.summary': 'Scan another folder',
      'custom.label': 'WeChat file folder',
      'custom.placeholder': 'e.g. D:\\WeChat Files',
      'custom.hint': 'Accepts the xwechat_files root, one account folder, or a legacy WeChat Files folder.',
      'custom.open': 'Choose a folder',
      'notice.cleanFailed': 'Cleanup failed',
      'notice.prepareFailed': 'Could not prepare the confirmation',
      'notice.scanFailed': 'Scan failed',
      'notice.restoreFailed': 'Restore failed',
      'notice.cleaned': 'Moved {count} files to quarantine. You can restore them at any time.',
      'notice.restored': 'Restored {count} files.',
      'notice.prepared': 'Review the files in the confirmation window; nothing moves until you confirm.',
      'confirm.title': 'Confirm cleanup',
      'confirm.desc': 'These files will be moved from the WeChat folders into the plugin quarantine, not permanently deleted.',
      'confirm.summary': '{count} files, about {size}',
      'confirm.ack': 'I reviewed these files and agree to move them into quarantine',
      'confirm.warning': 'Files can be restored from Quarantine. Selecting a whole group keeps no copy; quit WeChat first, or make sure these files are not in active use.',
      'confirm.action': 'Confirm move ({count})',
      'trash.title': 'Cleanup quarantine',
      'trash.desc': 'Every cleanup keeps a restorable record.',
      'trash.empty': 'The quarantine is empty.',
      'trash.loading': 'Reading quarantine…',
      'trash.batch': '{time} · {count} files · {size}',
      'trash.accounts': 'Accounts: {names}',
      'trash.firstFiles': 'Includes: {names}',
      'trash.restoreHint': 'Restore skips files whose original path already exists.',
      'error.title': 'Scan did not finish',
      'error.retry': 'Retry',
      'error.groupsTruncated': 'Many duplicate groups were found; only the 300 groups with the most reclaimable space are shown.',
      'error.warnings': '{count} folders could not be read; results may be incomplete.',
      'roots.none': 'No WeChat folder detected',
      'status.ready': 'Scan complete',
      'status.selected': '{count} files selected, {size} reclaimable',
      'status.noneSelected': 'Check the files to clean; one suggested keep per group is preselected.',
      'status.scanTime': 'Finished {time}',
    }

    const CSS = `
      .wfc-root { display:flex; flex-direction:column; gap:16px; max-width:980px; margin:0 auto; padding:20px 20px 40px; color:var(--dsw-alias-label-primary); font-size:13px; }
      .wfc-hero { display:flex; align-items:flex-start; gap:14px; }
      .wfc-mark { width:44px; height:44px; flex:0 0 44px; display:grid; place-items:center; border-radius:13px; color:var(--dsw-alias-brand-primary); background:color-mix(in srgb, var(--dsw-alias-brand-primary) 13%, transparent); border:1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 22%, transparent); }
      .wfc-hero-main { flex:1; min-width:0; }
      .wfc-eyebrow { font-size:10.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--dsw-alias-label-secondary); margin-bottom:2px; }
      .wfc-title { margin:0; font-size:20px; line-height:1.25; font-weight:600; letter-spacing:-.01em; }
      .wfc-desc { margin:5px 0 0; color:var(--dsw-alias-label-secondary); line-height:1.55; max-width:680px; }
      .wfc-actions { display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
      .wfc-btn { appearance:none; display:inline-flex; align-items:center; justify-content:center; gap:6px; border:1px solid var(--dsw-alias-border-l1); background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); border-radius:8px; padding:6px 11px; font:inherit; font-size:12.5px; line-height:1.4; cursor:pointer; white-space:nowrap; }
      .wfc-btn:hover:not(:disabled) { background:var(--dsw-alias-bg-layer-2); border-color:var(--dsw-alias-border-l2); }
      .wfc-btn:focus-visible { outline:2px solid var(--dsw-alias-brand-primary); outline-offset:1px; }
      .wfc-btn:disabled { opacity:.5; cursor:not-allowed; }
      .wfc-btn.primary { background:var(--dsw-alias-brand-primary); border-color:transparent; color:var(--dsw-alias-bg-base); font-weight:600; }
      .wfc-btn.primary:hover:not(:disabled) { background:var(--dsw-alias-brand-primary); border-color:transparent; filter:brightness(1.04); }
      .wfc-btn.danger { color:var(--dsw-alias-state-error-primary); border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 48%, var(--dsw-alias-border-l1)); }
      .wfc-btn.danger:hover:not(:disabled) { background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 9%, var(--dsw-alias-bg-layer-1)); }
      .wfc-btn.small { padding:4px 8px; font-size:11.5px; border-radius:7px; }
      .wfc-link { appearance:none; border:0; background:none; color:var(--dsw-alias-brand-primary); padding:2px 0; font:inherit; font-size:11.5px; cursor:pointer; }
      .wfc-link:hover { text-decoration:underline; }
      .wfc-summary { display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:10px; }
      .wfc-stat { border:1px solid var(--dsw-alias-border-l1); background:var(--dsw-alias-bg-layer-1); border-radius:11px; padding:11px 13px; min-width:0; }
      .wfc-stat-label { color:var(--dsw-alias-label-secondary); font-size:11.5px; }
      .wfc-stat-value { margin-top:3px; font-size:19px; line-height:1.2; font-weight:600; font-variant-numeric:tabular-nums; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .wfc-meta { display:flex; align-items:center; gap:10px; flex-wrap:wrap; color:var(--dsw-alias-label-secondary); font-size:11.5px; }
      .wfc-dot { width:3px; height:3px; border-radius:50%; background:var(--dsw-alias-state-idle-primary); }
      .wfc-chips { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
      .wfc-chip { appearance:none; display:inline-flex; align-items:center; gap:6px; border:1px solid var(--dsw-alias-border-l1); background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-secondary); border-radius:999px; padding:4px 9px; font:inherit; font-size:11.5px; cursor:pointer; }
      .wfc-chip:hover { border-color:var(--dsw-alias-border-l2); color:var(--dsw-alias-label-primary); }
      .wfc-chip.active { color:var(--dsw-alias-brand-primary); border-color:color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, var(--dsw-alias-border-l1)); background:color-mix(in srgb, var(--dsw-alias-brand-primary) 9%, var(--dsw-alias-bg-layer-1)); }
      .wfc-chip-count { font-variant-numeric:tabular-nums; opacity:.72; }
      .wfc-notice { display:flex; align-items:flex-start; gap:8px; border-radius:9px; padding:9px 12px; line-height:1.5; border:1px solid var(--dsw-alias-border-l1); background:var(--dsw-alias-bg-layer-1); }
      .wfc-notice.success { border-color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 40%, var(--dsw-alias-border-l1)); color:var(--dsw-alias-state-success-primary); }
      .wfc-notice.error { border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 40%, var(--dsw-alias-border-l1)); color:var(--dsw-alias-state-error-primary); }
      .wfc-notice.warn { border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 40%, var(--dsw-alias-border-l1)); color:var(--dsw-alias-state-warn-primary); }
      .wfc-groups { display:flex; flex-direction:column; gap:10px; }
      .wfc-group { border:1px solid var(--dsw-alias-border-l1); background:var(--dsw-alias-bg-layer-1); border-radius:12px; overflow:hidden; }
      .wfc-group-head { display:flex; align-items:flex-start; gap:12px; justify-content:space-between; padding:11px 13px; background:var(--dsw-alias-bg-layer-2); border-bottom:1px solid var(--dsw-alias-border-l1); }
      .wfc-group-main { min-width:0; }
      .wfc-group-titlerow { display:flex; align-items:center; gap:7px; min-width:0; }
      .wfc-group-title { font-weight:600; font-size:13px; line-height:1.45; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .wfc-badge { flex:0 0 auto; border:1px solid var(--dsw-alias-border-l1); border-radius:999px; padding:1px 6px; font-size:10px; line-height:1.55; letter-spacing:.01em; }
      .wfc-badge.exact { color:var(--dsw-alias-state-success-primary); border-color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 40%, var(--dsw-alias-border-l1)); background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 8%, transparent); }
      .wfc-badge.similar { color:var(--dsw-alias-state-warn-primary); border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 40%, var(--dsw-alias-border-l1)); background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 8%, transparent); }
      .wfc-badge.large { color:var(--dsw-alias-brand-primary); border-color:color-mix(in srgb, var(--dsw-alias-brand-primary) 40%, var(--dsw-alias-border-l1)); background:color-mix(in srgb, var(--dsw-alias-brand-primary) 8%, transparent); }
      .wfc-tabs { display:flex; gap:4px; border-bottom:1px solid var(--dsw-alias-border-l1); }
      .wfc-tab { appearance:none; border:0; border-bottom:2px solid transparent; background:none; color:var(--dsw-alias-label-secondary); padding:7px 10px 8px; font:inherit; font-size:12.5px; cursor:pointer; }
      .wfc-tab:hover { color:var(--dsw-alias-label-primary); }
      .wfc-tab.active { color:var(--dsw-alias-brand-primary); border-bottom-color:var(--dsw-alias-brand-primary); }
      .wfc-large-form { display:flex; align-items:flex-end; gap:10px; flex-wrap:wrap; border:1px solid var(--dsw-alias-border-l1); border-radius:11px; background:var(--dsw-alias-bg-layer-1); padding:12px 13px; }
      .wfc-large-copy { flex:1 1 230px; min-width:180px; }
      .wfc-large-title { font-size:13px; font-weight:600; }
      .wfc-large-desc { margin-top:3px; color:var(--dsw-alias-label-secondary); font-size:11.5px; line-height:1.5; }
      .wfc-field { display:flex; flex-direction:column; gap:4px; min-width:130px; }
      .wfc-field-label { color:var(--dsw-alias-label-secondary); font-size:11px; }
      .wfc-field-row { display:flex; align-items:center; gap:5px; }
      .wfc-field-unit { color:var(--dsw-alias-label-secondary); font-size:11px; }
      .wfc-input.compact { width:92px; flex:0 0 auto; }
      .wfc-field.grow { flex:1 1 220px; }
      .wfc-field.grow .wfc-input { width:100%; }
      .wfc-large-form .wfc-btn { flex:0 0 auto; margin-bottom:1px; }
      .wfc-large-form-hint { flex-basis:100%; color:var(--dsw-alias-label-secondary); font-size:10.5px; line-height:1.5; margin-top:-2px; }
      .wfc-large-tools { display:flex; align-items:center; gap:10px; }
      .wfc-group-meta { margin-top:3px; color:var(--dsw-alias-label-secondary); font-size:11.5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .wfc-group-tools { display:flex; align-items:center; gap:10px; flex:0 0 auto; padding-top:1px; }
      .wfc-selected-count { color:var(--dsw-alias-label-secondary); font-size:11.5px; font-variant-numeric:tabular-nums; }
      .wfc-file { display:grid; grid-template-columns:18px minmax(0,1fr) auto; gap:9px; align-items:start; padding:9px 13px; border-top:1px solid var(--dsw-alias-border-l1); cursor:pointer; }
      .wfc-file:first-of-type { border-top:0; }
      .wfc-file:hover { background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 70%, transparent); }
      .wfc-file.checked { background:color-mix(in srgb, var(--dsw-alias-brand-primary) 5%, transparent); }
      .wfc-check { width:14px; height:14px; margin:2px 0 0; accent-color:var(--dsw-alias-brand-primary); }
      .wfc-file-main { min-width:0; }
      .wfc-file-name { display:flex; align-items:center; gap:6px; min-width:0; font-size:12.5px; line-height:1.45; }
      .wfc-file-name-text { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .wfc-keep { flex:0 0 auto; color:var(--dsw-alias-label-secondary); border:1px solid var(--dsw-alias-border-l1); border-radius:4px; padding:0 4px; font-size:9.5px; line-height:1.5; }
      .wfc-file-path { margin-top:2px; color:var(--dsw-alias-label-secondary); font-family:ui-monospace, SFMono-Regular, Consolas, monospace; font-size:10.5px; line-height:1.4; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .wfc-file-side { text-align:right; color:var(--dsw-alias-label-secondary); font-size:11px; line-height:1.5; white-space:nowrap; font-variant-numeric:tabular-nums; }
      .wfc-empty { display:flex; flex-direction:column; align-items:center; text-align:center; gap:8px; border:1px dashed var(--dsw-alias-border-l2); border-radius:13px; padding:34px 22px; background:var(--dsw-alias-bg-layer-1); }
      .wfc-empty-title { font-size:15px; font-weight:600; }
      .wfc-empty-desc { max-width:560px; color:var(--dsw-alias-label-secondary); line-height:1.6; }
      .wfc-empty .wfc-actions { justify-content:center; margin-top:4px; }
      .wfc-scanning { display:flex; align-items:center; gap:14px; border:1px solid var(--dsw-alias-border-l1); border-radius:12px; background:var(--dsw-alias-bg-layer-1); padding:22px; }
      .wfc-spinner { width:24px; height:24px; flex:0 0 24px; border-radius:50%; border:2px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 22%, transparent); border-top-color:var(--dsw-alias-brand-primary); animation:wfc-spin .8s linear infinite; }
      @keyframes wfc-spin { to { transform:rotate(360deg); } }
      .wfc-custom { border:1px solid var(--dsw-alias-border-l1); border-radius:10px; background:var(--dsw-alias-bg-layer-1); padding:10px 12px; }
      .wfc-custom summary { cursor:pointer; color:var(--dsw-alias-label-secondary); font-size:12px; }
      .wfc-custom-form { display:flex; gap:8px; margin-top:10px; flex-wrap:wrap; }
      .wfc-input { flex:1 1 300px; min-width:0; border:1px solid var(--dsw-alias-border-l1); background:var(--dsw-alias-bg-base); color:var(--dsw-alias-label-primary); border-radius:7px; padding:7px 9px; font:inherit; font-size:12px; }
      .wfc-input:focus { outline:2px solid var(--dsw-alias-brand-primary); outline-offset:-1px; border-color:transparent; }
      .wfc-hint { color:var(--dsw-alias-label-secondary); font-size:11px; line-height:1.5; margin:7px 0 0; }
      .wfc-roots { color:var(--dsw-alias-label-secondary); font-size:11.5px; }
      .wfc-roots summary { cursor:pointer; }
      .wfc-root-line { display:block; margin-top:4px; font-family:ui-monospace, SFMono-Regular, Consolas, monospace; font-size:10.5px; overflow-wrap:anywhere; }
      .wfc-footer { position:sticky; bottom:0; z-index:2; display:flex; align-items:center; justify-content:space-between; gap:14px; padding:10px 12px; border:1px solid var(--dsw-alias-border-l1); border-radius:11px; background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 94%, transparent); backdrop-filter:blur(8px); }
      .wfc-footer-info { color:var(--dsw-alias-label-secondary); font-size:12px; line-height:1.45; }
      .wfc-footer-info strong { color:var(--dsw-alias-label-primary); font-weight:600; font-variant-numeric:tabular-nums; }
      .wfc-alert { border:1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 38%, var(--dsw-alias-border-l1)); background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 6%, var(--dsw-alias-bg-layer-1)); color:var(--dsw-alias-label-primary); border-radius:10px; padding:12px 14px; }
      .wfc-alert-title { color:var(--dsw-alias-state-error-primary); font-weight:600; margin-bottom:4px; }
      .wfc-dialog { width:min(640px, calc(100vw - 28px)); max-height:84vh; border:1px solid var(--dsw-alias-border-l2); border-radius:14px; padding:0; background:var(--dsw-alias-bg-overlay); color:var(--dsw-alias-label-primary); box-shadow:0 18px 60px color-mix(in srgb, var(--dsw-alias-label-primary) 22%, transparent); overflow:hidden; }
      .wfc-dialog::backdrop { background:color-mix(in srgb, var(--dsw-alias-label-primary) 42%, transparent); }
      .wfc-dialog-shell { display:flex; flex-direction:column; max-height:84vh; }
      .wfc-dialog-head { padding:14px 16px 10px; border-bottom:1px solid var(--dsw-alias-border-l1); }
      .wfc-dialog-title { font-size:15px; font-weight:600; }
      .wfc-dialog-desc { margin-top:4px; color:var(--dsw-alias-label-secondary); font-size:12px; line-height:1.55; }
      .wfc-dialog-body { padding:12px 16px; overflow:auto; }
      .wfc-dialog-foot { display:flex; justify-content:flex-end; gap:8px; padding:11px 16px; border-top:1px solid var(--dsw-alias-border-l1); background:var(--dsw-alias-bg-layer-1); }
      .wfc-confirm-summary { font-size:12.5px; font-weight:600; margin-bottom:8px; }
      .wfc-confirm-list { display:flex; flex-direction:column; gap:6px; max-height:220px; overflow:auto; border:1px solid var(--dsw-alias-border-l1); border-radius:8px; padding:7px; background:var(--dsw-alias-bg-base); }
      .wfc-confirm-row { display:flex; align-items:center; gap:8px; justify-content:space-between; font-size:11.5px; padding:4px 3px; }
      .wfc-confirm-name { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .wfc-confirm-meta { flex:0 0 auto; color:var(--dsw-alias-label-secondary); font-variant-numeric:tabular-nums; }
      .wfc-warning { margin:10px 0 0; color:var(--dsw-alias-state-warn-primary); font-size:11.5px; line-height:1.55; }
      .wfc-checkline { display:flex; align-items:flex-start; gap:8px; margin-top:12px; padding:9px 10px; border:1px solid var(--dsw-alias-border-l1); border-radius:8px; background:var(--dsw-alias-bg-layer-1); line-height:1.5; cursor:pointer; font-size:12px; }
      .wfc-checkline input { margin-top:2px; accent-color:var(--dsw-alias-brand-primary); }
      .wfc-dialog-error { margin-top:9px; color:var(--dsw-alias-state-error-primary); font-size:11.5px; line-height:1.5; }
      .wfc-batches { display:flex; flex-direction:column; gap:9px; }
      .wfc-batch { border:1px solid var(--dsw-alias-border-l1); border-radius:9px; background:var(--dsw-alias-bg-layer-1); padding:10px 11px; }
      .wfc-batch-head { display:flex; align-items:center; justify-content:space-between; gap:10px; }
      .wfc-batch-title { font-size:12px; font-weight:600; }
      .wfc-batch-meta { margin-top:3px; color:var(--dsw-alias-label-secondary); font-size:11px; line-height:1.5; }
      .wfc-batch-files { margin-top:5px; color:var(--dsw-alias-label-secondary); font-size:10.5px; line-height:1.5; overflow-wrap:anywhere; }
      .wfc-empty-inline { color:var(--dsw-alias-label-secondary); text-align:center; padding:24px 8px; }
      .wfc-sr { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
      @media (max-width: 760px) {
        .wfc-hero { flex-wrap:wrap; }
        .wfc-actions { width:100%; justify-content:flex-start; }
        .wfc-summary { grid-template-columns:repeat(2, minmax(0,1fr)); }
        .wfc-file { grid-template-columns:18px minmax(0,1fr); }
        .wfc-file-side { grid-column:2; text-align:left; }
        .wfc-footer { align-items:flex-start; flex-direction:column; }
        .wfc-footer .wfc-btn { width:100%; }
      }
    `

    function formatBytes(bytes) {
      if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let value = bytes
      let index = 0
      while (value >= 1024 && index < units.length - 1) {
        value /= 1024
        index += 1
      }
      return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`
    }

    function formatTime(ms) {
      const date = new Date(ms)
      const pad = (value) => String(value).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    }

    function makeT(locale) {
      return function t(key, params) {
        let dict = en
        try {
          const active = String(locale?.getSnapshot?.().active || 'en').toLowerCase()
          if (active.startsWith('zh')) dict = zh
        } catch {
          dict = en
        }
        let text = dict[key]
        if (text === undefined) text = en[key]
        if (text === undefined) text = zh[key]
        if (text === undefined) text = key
        if (params) {
          for (const [name, value] of Object.entries(params)) text = text.replaceAll(`{${name}}`, String(value))
        }
        return text
      }
    }

    async function callApi(action, payload = {}) {
      const response = await fetch(API, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-wechat-cleaner': '1',
        },
        body: JSON.stringify({ action, ...payload }),
      })
      let body
      try {
        body = await response.json()
      } catch {
        throw new Error(`HTTP ${response.status}`)
      }
      if (!response.ok || !body || body.ok !== true) {
        throw new Error(body?.error || `HTTP ${response.status}`)
      }
      return body
    }

    function Icon({ size = 20 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        'aria-hidden': true,
        style: { display: 'block' },
      },
      h('path', {
        d: 'M12 3.1c-5.15 0-9.3 3.44-9.3 7.7 0 2.42 1.37 4.62 3.57 6.04l-.74 3.55 3.83-1.9c.84.18 1.72.28 2.64.28 5.15 0 9.3-3.44 9.3-7.7S17.15 3.1 12 3.1Z',
        stroke: 'currentColor',
        strokeWidth: 1.55,
        strokeLinejoin: 'round',
      }),
      h('path', { d: 'M8.1 9.1h7.8M8.1 12.2h5.2', stroke: 'currentColor', strokeWidth: 1.55, strokeLinecap: 'round' }),
      h('path', { d: 'M18.7 4.3v3.2M17.1 5.9h3.2', stroke: 'currentColor', strokeWidth: 1.35, strokeLinecap: 'round' }))
    }

    function Dialog({ open, title, description, onClose, children, footer }) {
      const ref = React.useRef(null)
      React.useEffect(() => {
        const dialog = ref.current
        if (!dialog) return
        if (open && !dialog.open) {
          try { dialog.showModal() } catch { /* ignore */ }
        } else if (!open && dialog.open) {
          dialog.close()
        }
      }, [open])
      return h('dialog', {
        ref,
        className: 'wfc-dialog',
        onCancel: (event) => { event.preventDefault(); onClose() },
        onClick: (event) => { if (event.target === ref.current) onClose() },
      }, h('div', { className: 'wfc-dialog-shell' },
        h('div', { className: 'wfc-dialog-head' },
          h('div', { className: 'wfc-dialog-title' }, title),
          description ? h('div', { className: 'wfc-dialog-desc' }, description) : null),
        h('div', { className: 'wfc-dialog-body' }, children),
        h('div', { className: 'wfc-dialog-foot' }, footer)))
    }

    function GroupCard({ group, t, selected, onToggle, onReset }) {
      const selectedCount = group.files.filter((file) => selected.has(file.id)).length
      return h('section', { className: 'wfc-group' },
        h('div', { className: 'wfc-group-head' },
          h('div', { className: 'wfc-group-main' },
            h('div', { className: 'wfc-group-titlerow' },
              h('span', { className: `wfc-badge ${group.kind}` }, t(group.kind === 'exact' ? 'badge.exact' : 'badge.similar')),
              h('span', { className: 'wfc-group-title', title: group.title }, group.title)),
            h('div', { className: 'wfc-group-meta' },
              `${group.accountName} · ${t('group.files', { count: group.fileCount })} · ${t('group.reclaim', { size: formatBytes(group.potentialBytes) })}`)),
          h('div', { className: 'wfc-group-tools' },
            h('span', { className: 'wfc-selected-count' }, t('group.selected', { count: selectedCount })),
            h('button', { type: 'button', className: 'wfc-link', onClick: () => onReset(group) }, t('group.reset')))),
        group.files.map((file) => {
          const checked = selected.has(file.id)
          return h('label', { key: file.id, className: `wfc-file${checked ? ' checked' : ''}` },
            h('input', {
              type: 'checkbox',
              className: 'wfc-check',
              checked,
              onChange: () => onToggle(file),
            }),
            h('div', { className: 'wfc-file-main' },
              h('div', { className: 'wfc-file-name' },
                h('span', { className: 'wfc-file-name-text', title: file.name }, file.name),
                !file.suggestedDelete && !checked ? h('span', { className: 'wfc-keep' }, t('group.suggestKeep')) : null),
              h('div', { className: 'wfc-file-path', title: file.path }, file.relativePath || file.path)),
            h('div', { className: 'wfc-file-side' },
              h('div', null, formatBytes(file.size)),
              h('div', null, formatTime(file.mtimeMs))))
        }))
    }

    function LargeGroupCard({ group, t, selected, onToggle, onSelectAll, onClear }) {
      const selectedCount = group.files.filter((file) => selected.has(file.id)).length
      return h('section', { className: 'wfc-group wfc-large-group' },
        h('div', { className: 'wfc-group-head' },
          h('div', { className: 'wfc-group-main' },
            h('div', { className: 'wfc-group-titlerow' },
              h('span', { className: 'wfc-badge large' }, t('large.badge')),
              h('span', { className: 'wfc-group-title' }, group.accountName)),
            h('div', { className: 'wfc-group-meta' },
              `${t('group.files', { count: group.fileCount })} · ${formatBytes(group.potentialBytes)}`)),
          h('div', { className: 'wfc-large-tools' },
            h('span', { className: 'wfc-selected-count' }, t('large.selectedCount', { count: selectedCount })),
            h('button', { type: 'button', className: 'wfc-link', onClick: () => onSelectAll(group) }, t('large.selectAll')),
            h('button', { type: 'button', className: 'wfc-link', onClick: () => onClear(group) }, t('large.clear')))),
        group.files.map((file) => {
          const checked = selected.has(file.id)
          return h('label', { key: file.id, className: `wfc-file${checked ? ' checked' : ''}` },
            h('input', {
              type: 'checkbox',
              className: 'wfc-check',
              checked,
              onChange: () => onToggle(file),
            }),
            h('div', { className: 'wfc-file-main' },
              h('div', { className: 'wfc-file-name' },
                h('span', { className: 'wfc-file-name-text', title: file.name }, file.name)),
              h('div', { className: 'wfc-file-path', title: file.path }, file.relativePath || file.path)),
            h('div', { className: 'wfc-file-side' },
              h('div', null, formatBytes(file.size)),
              h('div', null, formatTime(file.mtimeMs))))
        }))
    }

    function CustomForm({ t, value, onChange, onSubmit, scanning }) {
      return h('form', {
        className: 'wfc-custom-form',
        onSubmit: (event) => { event.preventDefault(); onSubmit() },
      },
      h('input', {
        className: 'wfc-input',
        value,
        onChange: (event) => onChange(event.target.value),
        placeholder: t('custom.placeholder'),
        'aria-label': t('custom.label'),
        spellCheck: false,
      }),
      h('button', { type: 'submit', className: 'wfc-btn', disabled: scanning }, t('action.scanHere')))
    }

    function TrashDialog({ open, onClose, t, trash, loading, restoring, onRestore, onRefresh }) {
      return h(Dialog, {
        open,
        title: t('trash.title'),
        description: t('trash.desc'),
        onClose,
        footer: [
          h('button', { key: 'refresh', type: 'button', className: 'wfc-btn', onClick: onRefresh, disabled: loading }, t('action.refresh')),
          h('button', { key: 'close', type: 'button', className: 'wfc-btn', onClick: onClose }, t('action.cancel')),
        ],
      },
      loading ? h('div', { className: 'wfc-empty-inline' }, t('trash.loading'))
        : !trash || trash.length === 0 ? h('div', { className: 'wfc-empty-inline' }, t('trash.empty'))
          : h('div', { className: 'wfc-batches' }, trash.map((batch) => h('div', { key: batch.id, className: 'wfc-batch' },
            h('div', { className: 'wfc-batch-head' },
              h('div', null,
                h('div', { className: 'wfc-batch-title' }, t('trash.batch', {
                  time: formatTime(batch.createdAt),
                  count: batch.fileCount,
                  size: formatBytes(batch.bytes),
                })),
                h('div', { className: 'wfc-batch-meta' }, t('trash.accounts', {
                  names: (batch.accounts || []).map((account) => account.accountName).join(', '),
                }))),
              h('button', {
                type: 'button',
                className: 'wfc-btn small',
                disabled: restoring === batch.id,
                onClick: () => onRestore(batch.id),
              }, restoring === batch.id ? t('action.deleting') : t('action.restore'))),
            batch.files && batch.files.length > 0
              ? h('div', { className: 'wfc-batch-files' }, t('trash.firstFiles', {
                names: batch.files.slice(0, 4).map((file) => file.name).join(', ') + (batch.files.length > 4 ? '…' : ''),
              }))
              : null))))
    }

    function WechatCleanerPage({ t, locale }) {
      const [, setRevision] = React.useState(0)
      const [scan, setScan] = React.useState(null)
      const [scanning, setScanning] = React.useState(false)
      const [scanError, setScanError] = React.useState('')
      const [scanRoot, setScanRoot] = React.useState('')
      const [customRoot, setCustomRoot] = React.useState('')
      const [selected, setSelected] = React.useState(() => new Set())
      const [mode, setMode] = React.useState('duplicates')
      const [largeScan, setLargeScan] = React.useState(null)
      const [largeScanning, setLargeScanning] = React.useState(false)
      const [largeError, setLargeError] = React.useState('')
      const [thresholdMB, setThresholdMB] = React.useState('100')
      const [extensions, setExtensions] = React.useState('')
      const [largeSelected, setLargeSelected] = React.useState(() => new Set())
      const [accountFilter, setAccountFilter] = React.useState('all')
      const [preparing, setPreparing] = React.useState(false)
      const [plan, setPlan] = React.useState(null)
      const [confirmOpen, setConfirmOpen] = React.useState(false)
      const [acknowledged, setAcknowledged] = React.useState(false)
      const [deleting, setDeleting] = React.useState(false)
      const [dialogError, setDialogError] = React.useState('')
      const [notice, setNotice] = React.useState(null)
      const [trashOpen, setTrashOpen] = React.useState(false)
      const [trash, setTrash] = React.useState(null)
      const [trashLoading, setTrashLoading] = React.useState(false)
      const [restoring, setRestoring] = React.useState('')
      const autoStarted = React.useRef(false)

      React.useEffect(() => {
        if (!locale) return undefined
        return locale.subscribe(() => setRevision((value) => value + 1))
      }, [locale])

      React.useEffect(() => {
        if (!notice) return undefined
        const timer = window.setTimeout(() => setNotice(null), 6500)
        return () => window.clearTimeout(timer)
      }, [notice])

      const runScan = React.useCallback(async (root) => {
        const requested = typeof root === 'string' ? root.trim() : ''
        setScanning(true)
        setScanError('')
        setScan(null)
        setSelected(new Set())
        setAccountFilter('all')
        setScanRoot(requested)
        try {
          const body = await callApi('scan', requested ? { root: requested } : {})
          setScan(body.scan)
          const next = new Set()
          for (const group of body.scan.groups) {
            for (const file of group.files) {
              if (file.suggestedDelete) next.add(file.id)
            }
          }
          setSelected(next)
        } catch (error) {
          setScanError(error instanceof Error ? error.message : String(error))
        } finally {
          setScanning(false)
        }
      }, [])

      React.useEffect(() => {
        if (autoStarted.current) return
        autoStarted.current = true
        void runScan('')
      }, [runScan])

      const runLargeScan = React.useCallback(async (root) => {
        const mb = Number.parseFloat(thresholdMB)
        if (!Number.isFinite(mb) || mb <= 0) {
          setLargeError(t('large.thresholdError'))
          return
        }
        const requested = typeof root === 'string'
          ? root.trim()
          : (scanRoot || customRoot.trim())
        setMode('large')
        setLargeScanning(true)
        setLargeError('')
        setLargeScan(null)
        setLargeSelected(new Set())
        setAccountFilter('all')
        setScanRoot(requested)
        try {
          const body = await callApi('scan', {
            mode: 'large',
            minBytes: Math.round(mb * 1024 * 1024),
            extensions,
            ...(requested ? { root: requested } : {}),
          })
          setLargeScan(body.scan)
        } catch (error) {
          setLargeError(error instanceof Error ? error.message : String(error))
        } finally {
          setLargeScanning(false)
        }
      }, [thresholdMB, extensions, scanRoot, customRoot, t])

      const activeScan = mode === 'large' ? largeScan : scan
      const activeSelected = mode === 'large' ? largeSelected : selected
      const activeScanning = mode === 'large' ? largeScanning : scanning

      const selectedStat = React.useMemo(() => {
        let count = 0
        let bytes = 0
        if (activeScan) {
          for (const group of activeScan.groups) {
            for (const file of group.files) {
              if (activeSelected.has(file.id)) {
                count += 1
                bytes += file.size
              }
            }
          }
        }
        return { count, bytes }
      }, [activeScan, activeSelected])

      const visibleGroups = React.useMemo(() => {
        if (!scan) return []
        if (accountFilter === 'all') return scan.groups
        return scan.groups.filter((group) => group.accountId === accountFilter)
      }, [scan, accountFilter])

      const visibleLargeGroups = React.useMemo(() => {
        if (!largeScan) return []
        if (accountFilter === 'all') return largeScan.groups
        return largeScan.groups.filter((group) => group.accountId === accountFilter)
      }, [largeScan, accountFilter])

      const toggleFile = (file) => {
        const next = new Set(selected)
        if (next.has(file.id)) next.delete(file.id)
        else next.add(file.id)
        setSelected(next)
      }

      const toggleLargeFile = (file) => {
        const next = new Set(largeSelected)
        if (next.has(file.id)) next.delete(file.id)
        else next.add(file.id)
        setLargeSelected(next)
      }

      const selectAllLarge = (group) => {
        const next = new Set(largeSelected)
        for (const file of group.files) next.add(file.id)
        setLargeSelected(next)
      }

      const clearLargeGroup = (group) => {
        const next = new Set(largeSelected)
        for (const file of group.files) next.delete(file.id)
        setLargeSelected(next)
      }

      const resetGroup = (group) => {
        const next = new Set(selected)
        for (const file of group.files) {
          if (file.suggestedDelete) next.add(file.id)
          else next.delete(file.id)
        }
        setSelected(next)
      }

      const startCleanup = async () => {
        if (!activeScan || selectedStat.count === 0) return
        setPreparing(true)
        setNotice(null)
        try {
          const body = await callApi('prepare', { scanId: activeScan.scanId, fileIds: [...activeSelected] })
          setPlan(body.plan)
          setAcknowledged(false)
          setDialogError('')
          setConfirmOpen(true)
        } catch (error) {
          setNotice({ kind: 'error', text: `${t('notice.prepareFailed')}: ${error instanceof Error ? error.message : String(error)}` })
        } finally {
          setPreparing(false)
        }
      }

      const confirmCleanup = async () => {
        if (!plan || !acknowledged) return
        setDeleting(true)
        setDialogError('')
        try {
          const body = await callApi('delete', { planId: plan.planId, acknowledged: true })
          setConfirmOpen(false)
          setPlan(null)
          setAcknowledged(false)
          if (mode === 'large') await runLargeScan(scanRoot)
          else await runScan(scanRoot)
          setNotice({ kind: 'success', text: t('notice.cleaned', { count: body.batch?.fileCount ?? 0 }) })
        } catch (error) {
          setDialogError(error instanceof Error ? error.message : String(error))
        } finally {
          setDeleting(false)
        }
      }

      const loadTrash = async () => {
        setTrashLoading(true)
        try {
          const body = await callApi('trash/list')
          setTrash(body.batches || [])
        } catch (error) {
          setNotice({ kind: 'error', text: `${t('notice.restoreFailed')}: ${error instanceof Error ? error.message : String(error)}` })
        } finally {
          setTrashLoading(false)
        }
      }

      const openTrash = () => {
        setTrashOpen(true)
        void loadTrash()
      }

      const restore = async (batchId) => {
        setRestoring(batchId)
        try {
          const body = await callApi('trash/restore', { batchId })
          setNotice({ kind: 'success', text: t('notice.restored', { count: body.result?.restored ?? 0 }) })
          await loadTrash()
          if (mode === 'large') await runLargeScan(scanRoot)
          else await runScan(scanRoot)
        } catch (error) {
          setNotice({ kind: 'error', text: `${t('notice.restoreFailed')}: ${error instanceof Error ? error.message : String(error)}` })
        } finally {
          setRestoring('')
        }
      }

      const header = h('div', { className: 'wfc-hero' },
        h('div', { className: 'wfc-mark' }, h(Icon, { size: 24 })),
        h('div', { className: 'wfc-hero-main' },
          h('div', { className: 'wfc-eyebrow' }, t('page.eyebrow')),
          h('h2', { className: 'wfc-title' }, t('page.title')),
          h('p', { className: 'wfc-desc' }, t('page.desc'))),
        h('div', { className: 'wfc-actions' },
          h('button', { type: 'button', className: 'wfc-btn', onClick: openTrash }, t('action.trash')),
          h('button', {
            type: 'button',
            className: 'wfc-btn primary',
            onClick: () => (mode === 'large' ? runLargeScan() : runScan(scanRoot)),
            disabled: activeScanning,
          }, activeScanning ? t('action.scanning') : (activeScan ? t('action.rescan') : t('action.scan')))))

      const noticeView = notice ? h('div', { className: `wfc-notice ${notice.kind}`, role: 'status' }, notice.text) : null

      const tabs = h('div', { className: 'wfc-tabs', role: 'tablist' },
        h('button', {
          type: 'button',
          role: 'tab',
          'aria-selected': mode === 'duplicates',
          className: `wfc-tab${mode === 'duplicates' ? ' active' : ''}`,
          onClick: () => setMode('duplicates'),
        }, t('tab.duplicates')),
        h('button', {
          type: 'button',
          role: 'tab',
          'aria-selected': mode === 'large',
          className: `wfc-tab${mode === 'large' ? ' active' : ''}`,
          onClick: () => setMode('large'),
        }, t('tab.large')))

      const largeForm = h('form', {
        className: 'wfc-large-form',
        onSubmit: (event) => { event.preventDefault(); void runLargeScan() },
      },
      h('div', { className: 'wfc-large-copy' },
        h('div', { className: 'wfc-large-title' }, t('large.title')),
        h('div', { className: 'wfc-large-desc' }, t('large.desc'))),
      h('label', { className: 'wfc-field' },
        h('span', { className: 'wfc-field-label' }, t('large.threshold')),
        h('span', { className: 'wfc-field-row' },
          h('input', {
            type: 'number',
            min: '1',
            step: 'any',
            className: 'wfc-input compact',
            value: thresholdMB,
            onChange: (event) => setThresholdMB(event.target.value),
            'aria-label': t('large.threshold'),
          }),
          h('span', { className: 'wfc-field-unit' }, t('large.unitMB')))),
      h('label', { className: 'wfc-field grow' },
        h('span', { className: 'wfc-field-label' }, t('large.extensions')),
        h('input', {
          className: 'wfc-input',
          value: extensions,
          onChange: (event) => setExtensions(event.target.value),
          placeholder: t('large.extensionsPlaceholder'),
          'aria-label': t('large.extensions'),
          spellCheck: false,
        })),
      h('button', {
        type: 'submit',
        className: 'wfc-btn primary',
        disabled: largeScanning,
      }, largeScanning ? t('large.scanning') : (largeScan ? t('large.rescan') : t('large.scan'))),
      h('div', { className: 'wfc-large-form-hint' }, t('large.extensionsHint')))

      const largeScanningView = h('div', { className: 'wfc-scanning' },
        h('div', { className: 'wfc-spinner', 'aria-hidden': true }),
        h('div', null,
          h('div', { style: { fontWeight: 600, marginBottom: 3 } }, t('large.scanning')),
          h('div', { style: { color: 'var(--dsw-alias-label-secondary)', lineHeight: 1.55 } }, t('large.scanningDesc'))))

      const scanningView = h('div', { className: 'wfc-scanning' },
        h('div', { className: 'wfc-spinner', 'aria-hidden': true }),
        h('div', null,
          h('div', { style: { fontWeight: 600, marginBottom: 3 } }, t('status.scanning')),
          h('div', { style: { color: 'var(--dsw-alias-label-secondary)', lineHeight: 1.55 } }, t('status.scanningDesc'))))

      const customForm = h(CustomForm, {
        t,
        value: customRoot,
        onChange: setCustomRoot,
        onSubmit: () => runScan(customRoot),
        scanning,
      })

      const customFormLarge = h(CustomForm, {
        t,
        value: customRoot,
        onChange: setCustomRoot,
        onSubmit: () => runLargeScan(customRoot),
        scanning: largeScanning,
      })

      const errorView = scanError ? h('div', { className: 'wfc-alert' },
        h('div', { className: 'wfc-alert-title' }, t('error.title')),
        h('div', { style: { lineHeight: 1.55 } }, scanError),
        h('div', { className: 'wfc-actions', style: { marginTop: 9 } },
          h('button', { type: 'button', className: 'wfc-btn', onClick: () => runScan(scanRoot) }, t('error.retry')))) : null

      const largeErrorView = largeError ? h('div', { className: 'wfc-alert' },
        h('div', { className: 'wfc-alert-title' }, t('large.errorTitle')),
        h('div', { style: { lineHeight: 1.55 } }, largeError),
        h('div', { className: 'wfc-actions', style: { marginTop: 9 } },
          h('button', { type: 'button', className: 'wfc-btn', onClick: () => runLargeScan() }, t('error.retry')))) : null

      const noRoots = scan && scan.accounts.length === 0
      const noGroups = scan && scan.accounts.length > 0 && scan.groups.length === 0
      const largeNoRoots = largeScan && largeScan.accounts.length === 0
      const largeNoGroups = largeScan && largeScan.accounts.length > 0 && largeScan.groups.length === 0

      const summary = scan && scan.accounts.length > 0 ? h('div', { className: 'wfc-summary' },
        h('div', { className: 'wfc-stat' }, h('div', { className: 'wfc-stat-label' }, t('summary.accounts')), h('div', { className: 'wfc-stat-value' }, scan.accounts.length)),
        h('div', { className: 'wfc-stat' }, h('div', { className: 'wfc-stat-label' }, t('summary.files')), h('div', { className: 'wfc-stat-value' }, scan.totalFiles)),
        h('div', { className: 'wfc-stat' }, h('div', { className: 'wfc-stat-label' }, t('summary.groups')), h('div', { className: 'wfc-stat-value' }, scan.groupCount)),
        h('div', { className: 'wfc-stat' }, h('div', { className: 'wfc-stat-label' }, t('summary.reclaimable')), h('div', { className: 'wfc-stat-value' }, formatBytes(scan.reclaimableBytes)))) : null

      const largestLargeBytes = largeScan
        ? largeScan.groups.reduce((max, group) => group.files.reduce((inner, file) => Math.max(inner, file.size), max), 0)
        : 0
      const largeSummary = largeScan && largeScan.accounts.length > 0 ? h('div', { className: 'wfc-summary' },
        h('div', { className: 'wfc-stat' }, h('div', { className: 'wfc-stat-label' }, t('summary.accounts')), h('div', { className: 'wfc-stat-value' }, largeScan.accounts.length)),
        h('div', { className: 'wfc-stat' }, h('div', { className: 'wfc-stat-label' }, t('large.summaryFiles')), h('div', { className: 'wfc-stat-value' }, largeScan.totalFiles)),
        h('div', { className: 'wfc-stat' }, h('div', { className: 'wfc-stat-label' }, t('large.summarySize')), h('div', { className: 'wfc-stat-value' }, formatBytes(largeScan.totalBytes))),
        h('div', { className: 'wfc-stat' }, h('div', { className: 'wfc-stat-label' }, t('large.summaryMax')), h('div', { className: 'wfc-stat-value' }, formatBytes(largestLargeBytes)))) : null

      const meta = scan ? h('div', null,
        h('div', { className: 'wfc-meta' },
          h('span', null, t('meta.scanned', { count: scan.totalFiles, size: formatBytes(scan.totalBytes) })),
          h('span', { className: 'wfc-dot' }),
          h('span', null, t('meta.duration', { ms: scan.durationMs })),
          scan.warnings && scan.warnings.length > 0 ? h('span', { className: 'wfc-dot' }) : null,
          scan.warnings && scan.warnings.length > 0 ? h('span', { style: { color: 'var(--dsw-alias-state-warn-primary)' } }, t('error.warnings', { count: scan.warnings.length })) : null),
        h('div', { className: 'wfc-hint' }, t('meta.method'))) : null

      const largeMeta = largeScan ? h('div', null,
        h('div', { className: 'wfc-meta' },
          h('span', null, t('large.meta', {
            size: formatBytes(largeScan.thresholdBytes),
            ext: largeScan.extensions.length > 0 ? largeScan.extensions.join(', ') : t('large.allExtensions'),
            ms: largeScan.durationMs,
          })),
          largeScan.warnings && largeScan.warnings.length > 0 ? h('span', { className: 'wfc-dot' }) : null,
          largeScan.warnings && largeScan.warnings.length > 0 ? h('span', { style: { color: 'var(--dsw-alias-state-warn-primary)' } }, t('error.warnings', { count: largeScan.warnings.length })) : null),
        largeScan.skippedFilter > 0 ? h('div', { className: 'wfc-hint' }, t('large.skippedFilter', { count: largeScan.skippedFilter })) : null) : null

      const chipsScan = mode === 'large' ? largeScan : scan
      const chips = chipsScan && chipsScan.accounts.length > 0 ? h('div', { className: 'wfc-chips' },
        h('button', {
          type: 'button',
          className: `wfc-chip${accountFilter === 'all' ? ' active' : ''}`,
          onClick: () => setAccountFilter('all'),
        }, t('filter.all'), h('span', { className: 'wfc-chip-count' }, chipsScan.totalFiles)),
        chipsScan.accounts.map((account) => h('button', {
          key: account.id,
          type: 'button',
          className: `wfc-chip${accountFilter === account.id ? ' active' : ''}`,
          title: account.dir,
          onClick: () => setAccountFilter(account.id),
        }, account.displayName, h('span', { className: 'wfc-chip-count' }, account.fileCount)))) : null

      const rootsView = chipsScan ? h('details', { className: 'wfc-roots' },
        h('summary', null, t('meta.roots')),
        chipsScan.roots.length === 0
          ? h('span', { className: 'wfc-root-line' }, t('roots.none'))
          : chipsScan.roots.map((root) => h('span', { key: root.path, className: 'wfc-root-line' }, root.path))) : null

      const emptyNoRoots = noRoots ? h('div', { className: 'wfc-empty' },
        h('div', { className: 'wfc-empty-title' }, t('empty.noRoots.title')),
        h('div', { className: 'wfc-empty-desc' }, t('empty.noRoots.desc')),
        h('div', { style: { width: 'min(620px, 100%)', marginTop: 6 } }, customForm),
        h('p', { className: 'wfc-hint' }, t('custom.hint'))) : null

      const largeEmptyNoRoots = largeNoRoots ? h('div', { className: 'wfc-empty' },
        h('div', { className: 'wfc-empty-title' }, t('empty.noRoots.title')),
        h('div', { className: 'wfc-empty-desc' }, t('empty.noRoots.desc')),
        h('div', { style: { width: 'min(620px, 100%)', marginTop: 6 } }, customFormLarge),
        h('p', { className: 'wfc-hint' }, t('custom.hint'))) : null

      const emptyNoGroups = noGroups ? h('div', { className: 'wfc-empty' },
        h('div', { className: 'wfc-empty-title' }, t('empty.noFiles.title')),
        h('div', { className: 'wfc-empty-desc' }, t('empty.noFiles.desc'))) : null

      const largeEmptyNoGroups = largeNoGroups ? h('div', { className: 'wfc-empty' },
        h('div', { className: 'wfc-empty-title' }, t('large.noFiles')),
        h('div', { className: 'wfc-empty-desc' }, t('large.noFilesDesc'))) : null

      const groupList = scan && scan.groups.length > 0 ? h('div', { className: 'wfc-groups' },
        visibleGroups.map((group) => h(GroupCard, {
          key: group.id,
          group,
          t,
          selected,
          onToggle: toggleFile,
          onReset: resetGroup,
        }))) : null

      const largeGroupList = largeScan && largeScan.groups.length > 0 ? h('div', { className: 'wfc-groups' },
        visibleLargeGroups.map((group) => h(LargeGroupCard, {
          key: group.id,
          group,
          t,
          selected: largeSelected,
          onToggle: toggleLargeFile,
          onSelectAll: selectAllLarge,
          onClear: clearLargeGroup,
        }))) : null

      const truncation = scan && scan.groupsTruncated ? h('div', { className: 'wfc-notice warn' }, t('error.groupsTruncated')) : null
      const largeTruncation = largeScan && largeScan.truncated ? h('div', { className: 'wfc-notice warn' }, t('meta.truncated')) : null

      const footer = activeScan && activeScan.groups.length > 0 ? h('div', { className: 'wfc-footer' },
        h('div', { className: 'wfc-footer-info' },
          selectedStat.count > 0
            ? h('span', null, t('status.selected', { count: selectedStat.count, size: formatBytes(selectedStat.bytes) }))
            : h('span', null, t('status.noneSelected'))),
        h('button', {
          type: 'button',
          className: 'wfc-btn primary',
          onClick: startCleanup,
          disabled: selectedStat.count === 0 || preparing || activeScanning,
        }, preparing ? t('action.preparing') : t('action.cleanup'))) : null

      const activeCustomForm = mode === 'large' ? customFormLarge : customForm
      const customDetails = activeScan && activeScan.accounts.length > 0 ? h('details', { className: 'wfc-custom' },
        h('summary', null, t('custom.summary')),
        activeCustomForm,
        h('p', { className: 'wfc-hint' }, t('custom.hint'))) : null

      return h('div', { className: 'wfc-root' },
        h('style', null, CSS),
        header,
        tabs,
        noticeView,
        mode === 'large'
          ? (largeScanning ? largeScanningView : null)
          : (scanning ? scanningView : null),
        mode === 'large' ? largeErrorView : errorView,
        mode === 'large' ? largeForm : null,
        mode === 'large' ? largeSummary : summary,
        mode === 'large' ? largeMeta : meta,
        chips,
        mode === 'large' ? largeEmptyNoRoots : emptyNoRoots,
        mode === 'large' ? largeEmptyNoGroups : emptyNoGroups,
        mode === 'large' ? largeGroupList : groupList,
        mode === 'large' ? largeTruncation : truncation,
        customDetails,
        rootsView,
        footer,
        h(Dialog, {
          open: confirmOpen,
          title: t('confirm.title'),
          description: t('confirm.desc'),
          onClose: () => { if (!deleting) { setConfirmOpen(false); setPlan(null); setAcknowledged(false) } },
          footer: [
            h('button', {
              key: 'cancel',
              type: 'button',
              className: 'wfc-btn',
              disabled: deleting,
              onClick: () => { setConfirmOpen(false); setPlan(null); setAcknowledged(false) },
            }, t('action.cancel')),
            h('button', {
              key: 'confirm',
              type: 'button',
              className: 'wfc-btn danger',
              disabled: !acknowledged || deleting,
              onClick: confirmCleanup,
            }, deleting ? t('action.deleting') : t('confirm.action', { count: plan ? plan.fileCount : 0 })),
          ],
        },
        plan ? h('div', null,
          h('div', { className: 'wfc-confirm-summary' }, t('confirm.summary', { count: plan.fileCount, size: formatBytes(plan.bytes) })),
          h('div', { className: 'wfc-confirm-list' }, plan.groups.map((group) => h('div', { key: group.id, className: 'wfc-confirm-row' },
            h('span', { className: 'wfc-confirm-name', title: group.title }, group.title === group.accountName ? group.title : `${group.title} · ${group.accountName}`),
            h('span', { className: 'wfc-confirm-meta' }, `${group.fileCount} · ${formatBytes(group.bytes)}`)))),
          h('p', { className: 'wfc-warning' }, t('confirm.warning')),
          h('label', { className: 'wfc-checkline' },
            h('input', { type: 'checkbox', checked: acknowledged, onChange: (event) => setAcknowledged(event.target.checked) }),
            h('span', null, t('confirm.ack'))),
          dialogError ? h('div', { className: 'wfc-dialog-error' }, dialogError) : null) : null),
        h(TrashDialog, {
          open: trashOpen,
          onClose: () => setTrashOpen(false),
          t,
          trash,
          loading: trashLoading,
          restoring,
          onRestore: restore,
          onRefresh: loadTrash,
        }))
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        const locale = ctx.locale
        const t = makeT(locale)
        ctx.effect(() => {
          const offZh = locale.register(NS, 'zh', zh)
          const offEn = locale.register(NS, 'en', en)
          return () => { offZh(); offEn() }
        }, 'wechat-file-cleaner: dictionaries')

        function Section() {
          return h(WechatCleanerPage, { t, locale })
        }

        function NavIcon({ size = 20 }) {
          return h(Icon, { size })
        }

        // The cleanup workspace is a global panel beside Plugins and
        // Automation tasks, not a Settings section.
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: 'wechat-file-cleaner',
        }, Section))

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: 'wechat-file-cleaner',
          order: 20,
          label: () => t('nav.title'),
        }, NavIcon))
      },
    }
  },
})
