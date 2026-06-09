# Security policy

## Supported versions

Only the latest released version of sitespeed.io receives security fixes. If you're on an older release, please upgrade before reporting — the issue may already be fixed on `main`.

## Reporting a vulnerability

Please don't open a public GitHub issue for security problems. Use [GitHub's private vulnerability reporting](https://github.com/sitespeedio/sitespeed.io/security/advisories/new) to file a confidential report; only the project maintainers see it, and we can coordinate a fix and a disclosure from there.

If GitHub's private reporting isn't an option for you, email Peter at peter@soulgalore.com and we'll work it out.

## What to include in the report

We need an exploitation scenario, not just a finding. Please tell us:

- **Who the attacker is.** sitespeed.io is a CLI you run against URLs you control or have permission to test. The realistic adversary is a *target site or HAR file* trying to pivot from being measured into compromising the host running sitespeed.io. If your scenario assumes a different attacker (a network attacker hitting sitespeed.io as if it were a server, an attacker who already has filesystem or shell access on the host), say so explicitly — it changes whether the impact is real for our users.
- **What the attacker controls.** A URL? The HTML / JS / response headers of a tested page? A HAR file fed back in? A config flag? An environment variable on the host?
- **What they gain.** Code execution on the host? Reading a file outside the result directory? Leaking a credential into a report or upload? A crash, an error, or noisy output isn't a vulnerability on its own — explain the impact.
- **A minimal reproducer**, ideally a `sitespeed.io <args>` invocation against a test URL or HAR you can share. We can't prioritise an issue we can't reproduce.

A working chain of "what the attacker controls → the vulnerable code path → an impact a sitespeed.io user would feel" is what turns a finding into a security report we can act on.

## What to expect

sitespeed.io is maintained by a small team on a volunteer / sponsor-funded basis, so we can't promise a fixed response SLA. In practice you'll get an acknowledgement within a few days. We'll keep you updated as we investigate, agree on a disclosure timeline, and ship the fix.

## What we treat as a vulnerability

Things we want to know about:

- Issues that let untrusted data from a tested page or HAR escape into the host running sitespeed.io — e.g. code execution via the HTML report, the docs site, or a plugin's input handling.
- Credentials or secrets leaking into the report, the log, or an upload destination by accident.
- Privilege or supply-chain issues in the published Docker image or npm package.

## What is *not* a vulnerability in sitespeed.io

### High-severity CVE in a dependency that doesn't apply to us

This is the most common case, and it's worth a clear answer up front: an automated scanner flags a CVE in one of sitespeed.io's (often transitive) dependencies, and someone files a report saying we need to upgrade urgently. We'll usually look at it and reply that the issue isn't exploitable in sitespeed.io's threat model, and that the upstream patched version will land in a normal dependency bump. That reply isn't dismissal — it's the actual answer. Here's the reasoning:

A CVE has three parts: a vulnerable code path in the library, an attacker capability needed to reach that code path (usually attacker-controlled input of a specific shape), and an impact. For the CVE to matter to *sitespeed.io users*, all three need to apply in how sitespeed.io actually uses the library. The most common reasons that doesn't hold:

- **sitespeed.io doesn't call the vulnerable code path.** Many libraries do many things; the CVE may be in a function we never invoke.
- **The attacker-controlled input doesn't exist in our flow.** A regex DoS that needs an attacker to send arbitrary strings to a server endpoint doesn't apply when sitespeed.io is a CLI and the inputs are URLs the user themselves chose.
- **The impact requires capabilities the attacker doesn't have in our context.** If exploiting it requires already running code on the host, and our threat model is "a measured page trying to escape into the host", the chain is broken before it starts.

If you can show a concrete chain from "data flowing through sitespeed.io" → "the vulnerable code in the dependency" → "an impact a sitespeed.io user would feel", we'll treat it as a real vulnerability and ship a fix on the project's normal timeline. Without that chain, we'll close the report and pick up the upstream patch when it lands as a normal dependency bump.

### Other things that aren't vulnerabilities

- A site sitespeed.io is testing is slow, broken, or returns malformed HTML. That's the site under test — file it with them.
- A dependency CVE that's already patched on `main` or in the latest release. Please upgrade first and re-check.

Thanks for helping keep sitespeed.io safe.

Peter
