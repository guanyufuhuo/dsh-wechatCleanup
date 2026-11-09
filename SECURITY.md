# Security policy

This plugin moves files on disk, so path handling and user consent are security-sensitive.

If you find a vulnerability, please report it privately through GitHub Security Advisories for
<https://github.com/guanyufuhuo/dsh-wechatCleanup> instead of opening a public issue with exploit details.

Please include:

- the affected version and DSH version;
- the WeChat storage layout involved;
- steps to reproduce, including whether the issue requires a malicious local page or a modified scan result;
- the impact on files outside the selected WeChat account folders.

The plugin never needs network access, credentials, or an agent tool. A report that a deletion can happen without the confirmation checkbox, that a request can name arbitrary paths, or that a restore overwrites an existing file is considered security-relevant.

## Supported versions

Security fixes are issued for the latest published minor line. Older versions should be upgraded.
