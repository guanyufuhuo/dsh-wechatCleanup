# Release checklist

Distribution is **GitHub-only**. Do not publish this package to npm. Users install the repository URL through DSH's **Plugins → Add plugin** flow.

## Requirements for users

- DSH Web/Desktop `0.2.2-rc.1` or another `0.2.x`.
- Git available on `PATH`; DSH uses pnpm to fetch the repository.
- No npm account or npm package is involved.

## Before tagging

1. Update `version` in `package.json` and add a matching `CHANGELOG.md` entry.
2. Run the test suite:

   ```bash
   npm test
   ```

3. Optionally inspect what an offline package archive would contain (this does not publish anything):

   ```bash
   npm pack --dry-run
   ```

4. Confirm `package.json` still declares the correct repository, `engines.dsh`, bundle patch, and Client export.

## Commit, tag and push

```bash
git add -A
git commit -m "release: vX.Y.Z"
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin main
git push origin vX.Y.Z
```

The repository is <https://github.com/guanyufuhuo/dsh-wechatCleanup>.

## GitHub release

Create a GitHub Release from the pushed tag and include the user-facing notes from `CHANGELOG.md`.

Attach the source archive generated from the tagged commit:

```bash
git archive --format=zip -o dsh-wechat-file-cleaner-X.Y.Z-source.zip vX.Y.Z
```

Optionally attach the npm-format tarball produced by `npm pack` for offline inspection. It is an artifact, not a publication; never run `npm publish`.

## How users install

1. Open **Plugins** in DSH.
2. Choose **Add plugin** or **Install a third-party plugin**.
3. Enter:

   ```text
   https://github.com/guanyufuhuo/dsh-wechatCleanup.git
   ```

4. Enable the bundle and restart DSH if requested.

A Git-installed bundle has no automatic npm update channel. To update, remove it in **Plugins** and install the repository URL again. Quarantine data lives in `~/.dsh-wechat-cleaner/index.json` and the WeChat account folders, so reinstalling the plugin does not delete cleanup history.

## CI

`.github/workflows/ci.yml` runs the tests on pushes and pull requests. There is intentionally no npm publish workflow.

## Security

- Never commit a GitHub token, npm token, WeChat data, or a real `.dsh-wechat-cleaner` index.
- Test fixtures live only in temporary directories and are removed by the tests.
- The plugin exposes no Agent deletion tool; the confirmation check is enforced by the Host.
