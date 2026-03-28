# Security

We take security reports for this project seriously. Please use the channels below so we can investigate and coordinate a fix before public disclosure.

## How to report

**Preferred:** Open a [private security advisory](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) on GitHub for this repository (**Security → Report a vulnerability**), when that option is available.

Do not file a **public** issue for undisclosed vulnerabilities.

We will acknowledge receipt when we can and work with you on timing for disclosure after a fix.

## Scope

In scope for reports to this project:

- The **imgtor** library (published package and source in this repository)
- The **demo** shipped or documented with this repo
- This repository’s **build pipeline** and release automation (e.g. CI, scripts used here)

## Out of scope

Please do **not** report the following here; use the appropriate upstream project instead:

- **[Fabric.js](https://github.com/fabricjs/fabric.js)** bugs or vulnerabilities—report them to the Fabric.js maintainers unless the issue is clearly caused only by how this repo wraps or configures Fabric in our code (in that case, describe the integration-specific aspect).

- Third-party dependency issues that are not specific to our usage in imgtor (report to the dependency’s maintainers).

- Theoretical issues without a practical impact on this library, demo, or pipeline, or spam / automated scanner noise without a concrete exploit path.

Thank you for helping keep users safe.
