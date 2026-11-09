# Release checklist

The plugin is packed as a plain ESM bundle: no build step, no runtime dependencies, no install scripts. Tests cover scanning, the HTTP confirmation flow, quarantine restore, the manifest, and Client registration.

## Before the first publish

1. The public repository is configured as <https://github.com/guanyufuhuo/dsh-wechatCleanup>. Confirm the repository is reachable and contains this package at its root.
2. Confirm the package name `dsh-wechat-file-cleaner` is still available on npm.
3. Run:

   ```bash
   npm test
   npm pack --dry-run
   npm pack
   ```

4. Inspect the tarball: it must contain `index.js`, `client.js`, `scanner.js`, `trash.js`, `cordis.patch.yml`, `locale/*.json`, `icon.svg`, `README.md`, `CHANGELOG.md`, and `LICENSE`, and must not contain personal paths, test fixtures, or the test directory.
5. Install the tarball into a clean DSH profile and verify:
   - the settings page appears;
   - scan finds the expected accounts;
   - a selected plan requires the consent checkbox;
   - cleanup moves files and the trash batch restores them;
   - both light and dark themes render correctly.

## Publish to npm

The package is configured with `publishConfig.access: public` and `engines.dsh: >=0.2.2-rc.1 <0.3.0-0`. Update the range when the supported DSH series changes.

```bash
npm login
npm publish
```

The repository includes GitHub Actions:

- `.github/workflows/ci.yml` runs the test suite on pushes and pull requests.
- `.github/workflows/publish.yml` publishes on a GitHub release or manual dispatch. Add an `NPM_TOKEN` repository secret with an npm automation token; the workflow also requests OIDC provenance (`id-token: write`).

## Submit to the Open Plugin Market

The market at <https://dshopen.org/index.json> lists plugins by npm version and repository. Prepare:

- npm package name: `dsh-wechat-file-cleaner`
- suggested category: `tools`
- keywords: `dsh`, `dsh-plugin`, `deepseek-harness`, `wechat`, `cleanup`, `duplicates`
- title: `WeChat file cleanup` / `微信文件清理`
- short description:
  - en: `Review duplicate and version-similar files per WeChat account and clean them into a restorable quarantine.`
  - zh: `按微信账号检查重复和版本相似的文件，确认后移入可恢复的清理回收站。`
- icon: submit `icon.svg` in the index's `icons/` directory and reference it from the entry.

A market entry has the shape below; replace the version with the published value:

```json
{
  "name": "dsh-wechat-file-cleaner",
  "title": {
    "en": "WeChat file cleanup",
    "zh": "微信文件清理"
  },
  "icon": "icons/<sha256>.svg",
  "repository": {
    "url": "https://github.com/guanyufuhuo/dsh-wechatCleanup"
  },
  "metadata": {
    "category": "tools",
    "keywords": [
      "dsh",
      "dsh-plugin",
      "deepseek-harness",
      "wechat",
      "cleanup",
      "duplicates"
    ]
  },
  "versions": [
    {
      "version": "1.0.0",
      "source": {
        "type": "npm",
        "registry": "https://registry.npmjs.org/"
      },
      "engines": {
        "dsh": ">=0.2.2-rc.1 <0.3.0-0"
      }
    }
  ],
  "description": {
    "en": "Review duplicate and version-similar files per WeChat account and clean them into a restorable quarantine.",
    "zh": "按微信账号检查重复和版本相似的文件，确认后移入可恢复的清理回收站。"
  }
}
```

## After publishing

- Tag the repository release (`v1.0.0`) and attach the tarball.
- Add the plugin to the market index through its contribution process.
- Watch issues for WeChat storage-layout changes; account discovery and scan roots are the most platform-sensitive parts.
- Never ship test fixtures or a real `.dsh-wechat-cleaner` index.
