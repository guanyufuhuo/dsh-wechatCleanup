# Changelog

## 1.2.1 — 2026-11-12

- Authenticate the scan and quarantine endpoints through `ctx.connection.admit()` and `ctx.connection.requestRejection()`.
- Keep `x-wechat-cleaner` only as a request marker; a custom header or absent Origin is no longer sufficient to reach the file operations.
- Reject unauthenticated requests with 401 and cross-origin requests with 403.
- Send the browser's same-origin connection credential with the plugin API request.

## 1.2.0 — 2026-11-09

- Move the cleanup workspace out of Settings into its own sidebar panel beside Plugins and Automation tasks.
- Register the panel in the global `main` panel and add its sidebar icon; no Settings section remains.

## 1.1.0 — 2026-11-09

- Add a large-file scan tab with a configurable MB threshold.
- Filter large files by one or more extensions, such as `mp4`, `zip`, or `psd`.
- Group large-file results per WeChat account, with per-account select-all and clear actions.
- Reuse the existing explicit confirmation and restorable quarantine flow for large-file cleanup.
- Add tests for threshold filtering, extension filtering, and large-file cleanup/restore.

## 1.0.0 — 2026-11-09

- Initial public release.
- Discover WeChat accounts from WeChat 4 configuration, Documents, OneDrive, and macOS container locations.
- Group exact duplicates by SHA-256 and version-similar files by normalized name plus a bounded size ratio.
- Review per account, with optional whole-group cleanup.
- Require an explicit server-generated confirmation plan before any file moves.
- Move approved files into a restorable quarantine and support batch restore.
- Chinese and English UI, localized plugin metadata, and an original icon.
- Local-only processing: no file contents or paths leave the machine.
- Distributed directly from GitHub; this project is not published to npm.
