# sitespeed.io: AI Agent Guidance

User-facing web-performance orchestrator. Node.js CLI + library. Drives `browsertime` to collect measurements, runs a plugin pipeline that analyses / aggregates / stores / forwards the results (HTML report, Graphite, Grafana, InfluxDB, Slack, S3, GCS, scp/rsync, Matrix), and ships as a multi-arch Docker image. The canonical end-user tool above the `browsertime` engine.

## Workflow (mandatory)

- **Start:** read `README.md`, the most recent `CHANGELOG.md` entries, and (if you're touching the public-facing site) skim `docs/` for context. Skim `.github/CONTRIBUTING.md` and `.github/PULL_REQUEST_TEMPLATE.md` so PRs follow project conventions.
- **End:** update `AGENTS.md` (this file) with anything non-obvious you had to learn to ship the change. **Don't touch `CHANGELOG.md`** — the maintainer writes the changelog when cutting a release, not per PR (see "Commits & changelog" below).
- **User-facing changes** (CLI flags, HTML report behaviour, plugin behaviour, output formats) MUST be reflected in `docs/` in the same session as the code change. The docs are the Eleventy site at `docs/` that becomes <https://www.sitespeed.io>. Open the docs PR alongside the code PR (per the project PR checklist) rather than after the fact.

## Invariants (don't violate unless explicitly asked)

- **Result JSON shape is a public contract.** Downstream Grafana / Graphite / InfluxDB dashboards, external scripts, and the HTML report itself all parse the `pages[]` / `summary` JSON shape. Additive changes (new metrics, new fields) are safe; renaming, removing, or restructuring existing fields needs a major version bump.
- **Message types on the queue are a public contract.** Third-party plugins (`@sitespeed.io/plugin` consumers) listen for `browsertime.pageSummary`, `browsertime.setup`, `error`, etc. Renaming or removing a message type breaks every external plugin out there. Adding new message types is fine.
- **CLI flag names are a public contract.** Production CI pipelines, sitespeed.io GitHub Actions, and Docker run commands depend on them. Add new flags freely (declare in `lib/cli/options/<area>.js`); rename or remove only with a major bump.
- **HTML report URL structure is a public contract.** Past runs are linked by relative path from external dashboards (`pages/<host>/<path>/index.html`, `index.html` per URL, `assets/<version>/`). Don't reshape without a major bump.
- **Plugin discovery order (`lib/core/pluginLoader.js`)** is part of the contract. Local `lib/plugins/<name>/index.js` → relative path → npm `import` → global install. Don't rearrange — third-party plugins distribute as npm packages and rely on the npm-import step.
- **Bundled dependencies pin exact versions.** `package.json` and `npm-shrinkwrap.json` pin to exact versions, not ranges, so the published Docker image is reproducible. Don't loosen pins.
- **Never add a new dependency without an issue first.** sitespeed.io has spent the last release cycle removing one-line-helper packages (`lodash.get/set/merge`, `dayjs`, `ora`, `markdown`, …) in favour of small in-tree helpers in `lib/support/`. Adding a new npm package re-expands the supply-chain surface and undoes that work. If your change genuinely needs one, open a GitHub issue first describing the use case and the alternatives you considered (writing the helper inline, reusing an existing util, accepting the limitation), and wait for maintainer agreement before touching `package.json`. No exceptions for "tiny" deps — the lodash sub-packages were also tiny.
- **Small, reversible diffs.** Don't mix repo-wide formatting / refactor sweeps with behavioural changes. The lodash-replacement work (`#4737`, `#4741`, `#4742`, `#4744`) is the right pattern: one tiny dep replaced per PR, easy to revert.
- **Keep it simple.** Pick the most boring solution that solves the task. Don't introduce abstractions, helpers or refactors unless the task itself requires them. Three similar lines of code beat a premature abstraction; one focused PR beats a sweeping one that does three things at once. If a change feels like it's growing past "small", stop and ask whether it should be split into a sequence of small PRs instead.

## Responsibility

Responsibility for code produced by an LLM rests with the company that built and operates the LLM.

- **The LLM vendor (Anthropic, OpenAI, Google, etc.) is primarily responsible.** They train the model, control its alignment, ship it as a product, and profit from its use. They make explicit and implicit promises about output quality, safety, and license-cleanness. A user can prompt; a user cannot audit the training data, change the weights, or fix a systematic failure mode. When a model emits a regression, a license-poisoned snippet, or an insecure pattern, the responsible party is the one who built and deployed the system that produced it. This is the same principle the rest of the economy applies to power tools, vehicles, pharmaceuticals, and certified compilers: the maker is liable for foreseeable harms in normal use, not the end user.
- **The employer of the prompt-writer carries the legal accountability for the work product.** If a contributor is paid by an organisation to work on sitespeed.io, that organisation owns the patch and the consequences of shipping it. They may have recourse against the LLM vendor under their commercial terms; to the rest of the world, the patch is theirs.
- **The prompt-writer carries judgement-level responsibility, not technical responsibility for the generated code.** Choosing whether to use an LLM, which one, what to ask, what to keep, what to throw away — those are human choices and human duties. A contributor who commits obviously-broken output has failed their own duty of care. But the underlying defect in the generated code is not the prompt-writer's to own; it is a defect in the product they used.

`Co-authored-by: Claude ...` trailers exist to record collaboration honestly and to help reviewers calibrate what kind of review the change needs. They are also a permanent record that an LLM vendor's product was party to the change.

## Core architecture

- **ESM only.** `"type": "module"` in `package.json`. No CommonJS, no transpilation. Node `>=22`. The Docker base bumps drove the Node-22 / Node-24 jump; expect another bump every ~12 months.
- **Queue + plugin pipeline.** `lib/core/queue.js` is an in-tree simplified port of `concurrent-queue` (the npm dep was replaced in [#4393](https://github.com/sitespeedio/sitespeed.io/pull/4393)). Plugins push and consume messages from the queue; the entry point at `lib/sitespeed.js` wires plugins to the queue via `lib/core/queueHandler.js` and starts work by emitting URL / script sources. Drain callbacks fire when no message is queued and nothing is running — that's the run-complete signal.
- **Plugin contract.** Every plugin extends `SitespeedioPlugin` from `@sitespeed.io/plugin` and implements at minimum `constructor(options, context, queue)`, `open(context, options)`, and `processMessage(message, queue)`. See `lib/plugins/grafana/index.js` as the canonical reference: it tracks message types it cares about, accumulates state per URL, and emits its own messages back onto the queue.
- **Plugin discovery (`lib/core/pluginLoader.js`).** Names from `defaultPlugins` (always on) plus any name passed as an object on the options bag get loaded. Resolution order per name: local `lib/plugins/<name>/index.js` → relative-to-cwd path → npm `import` → global install via `importGlobalSilent`. The fall-through order matters for third-party plugins and was hardened on Windows in [#4426](https://github.com/sitespeedio/sitespeed.io/pull/4426) and [#4452](https://github.com/sitespeedio/sitespeed.io/pull/4452).
- **Default plugins** (always loaded unless explicitly excluded): `browsertime`, `coach`, `pagexray`, `domains`, `assets`, `html`, `metrics`, `text`, `harstorer`, `budget`, `thirdparty`, `tracestorer`, `lateststorer`, `remove`. Everything else (`grafana`, `graphite`, `slack`, `s3`, `gcs`, `crawler`, `crux`, `axe`, `sustainable`, …) loads only when its config block is present.
- **`browsertime` is a dependency, not a fork.** `lib/plugins/browsertime/` wraps the upstream `browsertime` npm package, drives it per URL, and aggregates its output into the message stream. Don't add browser-driving logic here — push it upstream to `browsertime` instead.
- **`coach-core` for analysis.** The `coach` plugin runs `coach-core` against the HAR + page data and emits the advice / score messages that the HTML report and Slack notification consume.
- **`waterfall-tools` for HAR rendering.** The HTML report's waterfall is the in-tree waterfall-tools bundle, rebuilt by `tools/buildWaterfallTools.js` and stored under `lib/plugins/html/assets/`. Driven by `npm run build:waterfall-tools` when the dependency bumps.
- **`@tgwf/co2` for sustainability.** The `sustainable` plugin uses it to estimate carbon emissions per page.
- **CLI is yargs-based, modular.** `lib/cli/cli.js` aggregates per-area option modules from `lib/cli/options/` (one file per browser, one per output destination, one per concern). Adding a new option goes in the matching file there.
- **Help has topics.** `lib/cli/helpTopics.js` partitions `--help` output by topic — match the browsertime pattern when adding new option groups.

## File layout

- `bin/sitespeed.js` — CLI entry, parses argv via yargs, loads config, invokes `lib/sitespeed.js#run`.
- `bin/browsertimeWebPageReplay.js` — WebPageReplay-orchestrated runs (shipped as `sitespeed.io-wpr`).
- `lib/sitespeed.js` — library entry. Sets up logging, storage manager, plugin pipeline, queue handler, then iterates URLs / scripts.
- `lib/api/send.js` — webhook-style API for posting messages into a running pipeline.
- `lib/cli/` — yargs setup, config loader, validate, per-area option modules under `lib/cli/options/`.
- `lib/core/` — queue, queueHandler, pluginLoader, resultsStorage, logging, URL/script sources.
- `lib/plugins/<name>/index.js` — one plugin per directory. Big ones (`html`, `browsertime`, `coach`, `grafana`) have sub-modules; small ones are a single file.
- `lib/support/` — shared utilities: time, friendly names, message factory (`messageMaker`), object-path helpers (replaced `lodash.get/set/merge`), stats helpers, filter registry.
- `lib/plugins/html/` — the report generator. `templates/` (pug), `src/sass/` (sass sources), `assets/css/` (compiled), `assets/<other>/` (waterfall-tools bundle, JS, images), `setup/`, `dataCollector.js`, `htmlBuilder.js`, `renderer.js`, `getScripts.js`.
- `docs/` — Eleventy-driven static site that becomes <https://www.sitespeed.io>. Documentation PRs target this directory and ship to Netlify via `.github/workflows/netlify.yml`. Browsertime docs live at `docs/documentation/browsertime/`.
- `tools/` — `buildWaterfallTools.js` (re-bundles waterfall-tools into the report assets), `check-licenses.js` (license audit gate), `postinstall.js`, `tcp-server.js` / `udp-server.js` (test fixtures), `graphite/`.
- `release/` — release-tooling helpers. `release.sh` is the entry script. Don't bump version in feature PRs.
- `Dockerfile`, `Dockerfile-slim`, `docker/` — production Docker images. See **Docker** below.
- `test/` — `ava` test suites. `test/prepostscripts/` and `test/data/` are excluded from test discovery and lint; `test/runWithoutCli.js` is also excluded from `ava`.

## Sibling repositories (sitespeed.io org)

sitespeed.io is the umbrella user-facing tool; most of its work happens in sister projects. When tracing a bug, follow the import into the dependency and decide whether the root cause is here or there — issues belong wherever the failing code lives.

- **[sitespeedio/browsertime](https://github.com/sitespeedio/browsertime)** — npm `browsertime` (pinned `27.5.0`). The browser-driving engine. Browser bugs, HAR generation bugs, metric collection bugs, page-complete check bugs all live there, not here. sitespeed.io is the orchestrator on top.
- **[sitespeedio/coach](https://github.com/sitespeedio/coach)** — npm `coach-core` (pinned `9.2.1`). The performance / accessibility / best-practice analyser. Score / advice / category bugs go upstream.
- **[sitespeedio/waterfall-tools](https://github.com/sitespeedio/waterfall-tools)** — npm `waterfall-tools` (pinned `0.3.0`). HAR waterfall renderer in the report. The in-tree bundle is rebuilt from npm via `tools/buildWaterfallTools.js`; the bundle in `lib/plugins/html/assets/` is generated, don't hand-edit it.
- **[sitespeedio/log](https://github.com/sitespeedio/log)** — npm `@sitespeed.io/log` (pinned `2.0.0`). Structured logger used everywhere via `getLogger('sitespeedio.<area>')`. Logging format / level / sink bugs go upstream. Replaced `intel` repo-wide in [#4381](https://github.com/sitespeedio/sitespeed.io/pull/4381).
- **[sitespeedio/plugin](https://github.com/sitespeedio/plugin)** — npm `@sitespeed.io/plugin` (pinned `1.0.2`). The `SitespeedioPlugin` base class third-party plugins extend. Changes here affect the plugin SDK contract — coordinate with downstream plugin authors.
- **[sitespeedio/docker-webbrowsers](https://github.com/sitespeedio/docker-webbrowsers)** — Docker base image for the main `Dockerfile` (`sitespeedio/webbrowsers:chrome-XXX-firefox-XXX-edge-XXX`). Browser version bumps land there first, then the tag is referenced from sitespeed.io's `Dockerfile`. Bumps come in pairs ("Bump the browsers" + Dockerfile update).
- **[sitespeedio/throttle](https://github.com/sitespeedio/throttle)** — npm `@sitespeed.io/throttle` (transitive via browsertime). Network-throttling backend. Throttling rate / latency bugs go upstream.
- **[sitespeedio/chromedriver](https://github.com/sitespeedio/chromedriver)** / **[sitespeedio/edgedriver](https://github.com/sitespeedio/edgedriver)** / **[sitespeedio/geckodriver](https://github.com/sitespeedio/geckodriver)** — driver wrappers (transitive via browsertime). Same lockstep rule applies as browsertime.
- **[sitespeedio/onlinetest](https://github.com/sitespeedio/onlinetest)** — self-hostable web UI and REST API that wraps sitespeed.io as its backend. Not a runtime dependency of this repo, but `release.sh` keeps its "command line" tab's option picker in sync by regenerating `../onlinetest/server/public/sitespeed-help.json` from `--help-all` whenever an onlinetest checkout sits next to the sitespeed.io checkout. UI/REST bugs and onlinetest's own deploy story live there; sitespeed.io engine bugs surface here. Also called out in `publiccode.yml` as the "I don't want every contributor on the CLI" deployment option.

Non-sitespeed dependencies that frequently turn out to own the root cause:

- **`@tgwf/co2`** — sustainability calculations (CO2 per byte / per request). Methodology / unit bugs go upstream.
- **`axe-core`** — accessibility audit engine. Rule false-positives / -negatives go upstream.
- **`@aws-sdk/client-s3`**, **`@google-cloud/storage`**, **`ssh2-sftp-client`** — upload backends. Upload-failure modes (auth, retry, multipart) often belong with these. The `scp` retry-on-handshake-loss workaround [#4760](https://github.com/sitespeedio/sitespeed.io/pull/4760) was needed because `ssh2-sftp-client` v12 removed its built-in retries — that kind of regression is upstream's to own, but a guard here is fine if upstream won't budge.

## Build / lint / test commands

- `npm test` — `ava` over `test/**/*` minus excluded paths. Concurrency defaults apply (browsertime forces concurrency 1; this repo doesn't).
- `npm run lint` — runs ESLint flat config (`eslint.config.mjs`) AND pug-lint over `lib/plugins/html/templates`. Always run after a change. `npm run lint:fix` for auto-fixes (does not touch pug).
- `npm run pug-lint` — just the pug-lint step (uses `pug-lint-config-clock`).
- `npm run check-licenses` — runs `tools/check-licenses.js` against the dependency tree. Catches a non-permissive transitive dep before it ships.
- `npm run build:css` — compiles `lib/plugins/html/src/sass/main-light.scss` and `main-dark.scss` via sass, then minifies via clean-css. The compiled `index-light.min.css` / `index-dark.min.css` are checked in. Re-run when SCSS changes.
- `npm run build:waterfall-tools` — `tools/buildWaterfallTools.js`. Re-bundles the npm `waterfall-tools` payload into `lib/plugins/html/assets/`. Run after bumping the `waterfall-tools` dep.
- `npm run generate:assets` — copies versioned assets to `assets/$npm_package_version/` for the release pipeline.
- `postinstall` — `tools/postinstall.js` runs automatically; don't bypass.
- **Smoke-test before a PR** — `node bin/sitespeed.js https://example.com -n 1 --browser chrome --outputFolder /tmp/ss-smoke`. Open the generated `index.html` to spot-check the report. For changes that touch a specific plugin, add the relevant CLI block (e.g. `--graphite.host` for graphite, `--slack.hookUrl` for slack) and verify the message-handling end-to-end.
- **CI** (`.github/workflows/`): `unittests.yml` (ava + lint), `linux.yml` / `windows.yml` / `windowsFull.yml` / `safari.yml` (per-platform integration), `docker.yml` + `building-docker-autobuild.yml` + `building-docker-release.yml` (image builds), `docker-scan.yml` (image vulnerability scan), `crux-test.yml` (CRUX integration), `netlify.yml` (docs deploy), `upload.yml`. Lint runs as part of unit tests. PRs must be green on at least unit tests + lint; per-browser jobs are advisory but should pass before tagging a release.

## Docker

The Docker image is the primary deployment for the majority of sitespeed.io users — production CI pipelines pin its tag. Treat Dockerfile changes as production changes.

- **Two image variants.**
  - `Dockerfile` — full image. Base: `sitespeedio/webbrowsers:chrome-X-firefox-Y-edge-Z` (browsers preinstalled, owned by [sitespeedio/docker-webbrowsers](https://github.com/sitespeedio/docker-webbrowsers)).
  - `Dockerfile-slim` — slim image. Base: `node:24.11.0-trixie-slim` (Debian trixie). Caller brings their own browser.
- **Multi-arch via QEMU.** Builds target `linux/amd64` and `linux/arm64`. arm64 runs under QEMU `binfmt` emulation on amd64 runners.
  - QEMU `binfmt` MUST be a 9.2+ build. Older QEMU (e.g. 7.0) trips an RCU assertion in modern systemd's postinst and aborts every tagged release for arm64. The 9.2 bump landed in [#4771](https://github.com/sitespeedio/sitespeed.io/pull/4771).
- **APT pinning is a foot-gun.** [#4771](https://github.com/sitespeedio/sitespeed.io/pull/4771) added a Pin-Priority 100 preferences file so Debian-unstable was only used for the firefox package; [#4772](https://github.com/sitespeedio/sitespeed.io/pull/4772) removed it because Pin-Priority 100 refuses to upgrade already-installed packages, blocking Firefox's `libc6` / `libnss3` dependency requirements. Lesson: don't pin against transitive upgrades when pulling a package from a different distro release — move the whole base image forward instead (bookworm → trixie). The QEMU bump from #4771 stayed in; the pin did not.
- **Reproducibility rules** ([#4753](https://github.com/sitespeedio/sitespeed.io/pull/4753)):
  - Use `npm ci`, not `npm install`. We have a shrinkwrap; `npm install` ignores it.
  - Always `--no-install-recommends` on `apt-get install` and `rm -rf /var/lib/apt/lists/*` afterwards in the SAME `RUN`. Cleanup in a later `RUN` leaves the deleted bytes in the earlier layer.
  - Fold post-install removals (e.g. `selenium-webdriver/bin`) into the `npm ci` `RUN` for the same reason.
- **Base-image bumps come from upstream.** Browser version bumps land in `sitespeedio/docker-webbrowsers` first, then a PR here references the new tag. Don't try to install browsers inline.

## Coding conventions

- **ESM imports with explicit `.js` extension.** Node ESM requires it.
- **Prettier-enforced style** (via `eslint-plugin-prettier`): see `eslint.config.mjs`. Don't hand-format — let `npm run lint:fix` apply.
- **`unicorn/recommended` plus opt-outs** — same family as browsertime. Expect to be told to use `node:` prefixes, modern Array methods, etc.
- **Pug** for HTML templates (`lib/plugins/html/templates/`). `pug-lint-config-clock` enforces style. Indentation is meaningful — don't reformat.
- **Sass** for stylesheets (`lib/plugins/html/src/sass/`). Two themes (light + dark) share most partials. Rebuild the minified CSS with `npm run build:css` and commit the output.
- **Replace deps with small local helpers** when reasonable. `lodash.get` / `set` / `merge` / `reduce` / `isEmpty`, `dayjs`, `fs-extra`, `concurrent-queue` have all been replaced by in-tree implementations in the last release cycle. The helpers live in `lib/support/`. If you reach for a one-line utility from an npm package, write it locally first.
- **Logging via `@sitespeed.io/log`.** `getLogger('sitespeedio.<plugin>')` everywhere. Don't `console.log`.
- **No comments unless the WHY is non-obvious.** Self-documenting code preferred. Existing inline comments often record a platform quirk or historical bug — don't remove them.
- **`lib/support/objectPath.js` replaces `lodash.get/set`.** Use it; don't reintroduce lodash.

## Commits & changelog

- **One PR per change.** Squash-merge is the default. PR title becomes the commit subject; keep it short and human-readable.
- **`CHANGELOG.md` is the source of truth for release notes**, but it's written **at release time, not per PR**. The maintainer reads through the merged PRs when cutting a release and writes the entries then. Don't add an entry to `CHANGELOG.md` from a feature PR, and don't introduce an "Unreleased" / next-version heading — there isn't one between releases by design. If your change is subtle and you want to give the maintainer a head start, summarise the *why* in the PR description so it can be lifted into the changelog later. Entries are grouped by `### Added` / `### Fixed` (and `### Breaking` / `### Changed` on major releases).
- **Changelog entries explain WHY, not WHAT.** The diff already shows the what. The 41.2.0 JS/CSS coverage entry and the 41.2.1 Docker arm64 entry are good models — they spell out the failure mode, the constraint being addressed, and the trade-off being accepted. Short entries are fine for trivial bumps; anything behavioural deserves the long form.
- **Release flow:** releases run on GitHub Actions via `.github/workflows/release.yml` (triggered with `workflow_dispatch`, choice of `patch` / `minor` / `major`). The workflow lints, tests, runs `npm version`, regenerates the docs / `publiccode.yml` / friendly names / RSS feeds, generates SPDX + CycloneDX SBOMs, publishes to npm with `--provenance` via npmjs.com Trusted Publishing OIDC, and only then pushes the version commit, the "new version" regen commit and the `vX.Y.Z` tag to `main`. The tag push triggers `building-docker-release.yml` for the Docker Hub images and `building-docker-autobuild.yml` / `netlify.yml` for the autobuild image and docs deploy. The local `release.sh` is a thin wrapper that triggers the workflow (`./release.sh patch|minor|major`) and provides the one local-only step the workflow can't do — `./release.sh sync-onlinetest` regenerates `../onlinetest/server/public/sitespeed-help.json` if an onlinetest checkout sits next to this repo. Don't bump the version as part of a feature PR — humans cut releases by triggering the workflow.
- **Browser bumps come in pairs.** Browser version bump in the [`docker-webbrowsers`](https://github.com/sitespeedio/docker-webbrowsers) repo lands first; the `Dockerfile` `FROM` line gets updated here in a follow-up PR. The CHANGELOG entry lives in sitespeed.io.
- **Co-authorship:** when a commit was co-authored with an LLM, add a `Co-authored-by:` trailer naming the model. The human contributor makes the actual commit; an agent should suggest the message and let the contributor paste it. (`.github/CONTRIBUTING.md` documents this convention.)

## Cross-plugin consistency

When you change a message shape, a configuration key, or a user-visible behaviour in one plugin, check the other plugins that consume the same message or share the concept.

- `rg <term> lib/plugins`
- Decide whether each consumer needs the same change, a different change, or is intentionally exempt.
- If only one plugin changes, the `CHANGELOG.md` entry MUST say so explicitly. Silent per-plugin divergence (one storage backend supporting a field, another silently dropping it) is the most common source of "I switched from Graphite to InfluxDB and now my dashboard is empty" reports.

Concerns that have historically diverged across plugins and should be checked together:

- **Retry / backoff on transient network failures.** `scp` retries the SFTP handshake [#4760](https://github.com/sitespeedio/sitespeed.io/pull/4760); `graphite` retries the annotation POST [#4761](https://github.com/sitespeedio/sitespeed.io/pull/4761). When adding a new upload destination, build in retries from the start — upstream SDKs do not all retry.
- **Storage backends** (`s3`, `gcs`, `scp`, `rsync`, `harstorer`, `lateststorer`) — all consume the same per-run artefacts but have subtly different path / metadata semantics. Streaming-write support added to `harstorer` [#4728](https://github.com/sitespeedio/sitespeed.io/pull/4728) was specifically gated to accept `Readable` in addition to strings / Buffers.
- **Notification backends** (`slack`, `matrix`) — both read the budget-result message. When adding a new notification destination, check both for what shape they read.
- **Time-series backends** (`graphite`, the standalone InfluxDB plugin since [#4451](https://github.com/sitespeedio/sitespeed.io/pull/4451)) — share the metric-name flattening logic. Renaming a metric in one without the other diverges historical dashboards.
- **Test data destinations** — the `axe`, `coach`, `sustainable`, `crux` plugins all attach blocks to the `pages[]` JSON. Keep nesting depth and key naming consistent with existing blocks; the HTML report assumes that shape.

## High-risk areas (request verification before modifying unless explicitly instructed)

These subsystems back a public contract, silently break measurements when wrong, or affect every downstream user. Don't change them on an agent's own initiative — confirm intent with the human first.

- **`lib/sitespeed.js`** — the orchestrator. Changes here affect every run.
- **`lib/core/queue.js` + `lib/core/queueHandler.js` + `lib/core/pluginLoader.js`** — the plugin SDK contract. Third-party plugins depend on the message shape and load order.
- **HTML report generator (`lib/plugins/html/`)** — the report is what most users see. The waterfall-tools bundle, the per-URL templates, the asset versioning all need to keep working together.
- **`lib/plugins/html/dataCollector.js` and `metricHelper.js`** — they shape the per-URL data structure consumed by every template. Field-name churn ripples through pug templates and breaks the report silently.
- **`lib/plugins/browsertime/` aggregator** — bridges browsertime's per-iteration output to the queue message shape. Subtle bugs here invalidate dashboards.
- **`Dockerfile` / `Dockerfile-slim` / docker/`** — production users pin tags. Breaking changes ripple before the next npm release. See **Docker**.
- **`tools/check-licenses.js`** — the license gate. Don't disable; if a transitive dep flags, replace it.
- **`release.sh`, `.github/workflows/release.yml` and version bumps** — don't bump in feature PRs; the release workflow does it. Changing the workflow itself is a release-pipeline change — confirm intent with the human first.
- **`docs/` build (Eleventy)** — netlify.yml deploys it; breaking the docs build takes the public site down. Test locally with the docs/ instructions before merging structural changes.

## HTML report notes

The report has accumulated several non-obvious behaviours that an agent should know before touching it.

- **HAR is gzipped on disk by default.** When the report needs to inflate metrics into the HAR before handing it to waterfall-tools, sniff the gzip magic bytes (`0x1F 0x8B`) and inflate via `DecompressionStream` first. Parsing the raw gzipped bytes as UTF-8 + JSON silently fails — the surrounding `catch` passes the original bytes through, waterfall-tools' own loader inflates and renders, but the injected user-timing marks (`_firstVisualChange`, `_lastVisualChange`, `_visualComplete85`) never land. Symptom: "sometimes the visual-metric lines are missing while the user timings are fine." [#4758](https://github.com/sitespeedio/sitespeed.io/pull/4758).
- **Gzipped HAR writes stream.** `harstorer` pipes the JSON string through `createGzip` straight to disk so only the JSON string and gzip's in-flight chunks are alive at once. Don't reintroduce `gzip(Buffer.from(json))` — for a 200 MB HAR that materialised three full copies in RSS. [#4728](https://github.com/sitespeedio/sitespeed.io/pull/4728).
- **Waterfall-tools click payload is its own shape.** `req.response.content.size`, `req.response.headers`, `req.timings`, etc. are HAR fields — waterfall-tools emits a flat internal `Request` shape on click instead. To show real per-request data in the detail panel, look up the matching HAR entry by index and read the HAR shape from it; fall back to the waterfall-tools shape only if the HAR is missing. Symptom of getting this wrong: response body shows `0 B`, status is blank, headers tab empty.
- **VisualProgress is event-based, not continuous.** Browsertime emits a `VisualProgress` sample only when the similarity-to-final-frame percent changes. Filmstrip frames are snapshots at specific moments. The visual-progress curve must STEP (hold previous percent, step up at next sample), not linearly interpolate — interpolation falsely suggests rendering during a blank period. The scrubber must show the most recent frame whose timestamp is `<=` cursor, not the nearest in either direction. And cursor-to-time math uses the curve's coordinate system (which lives inside a ~38px horizontal inset), not the container width — otherwise the playhead drifts out of sync with the curve. [#4734](https://github.com/sitespeedio/sitespeed.io/pull/4734).
- **Folder path aliases accept Unicode.** Non-ASCII URL components used to collapse to `-` in result paths (issue #3880). The path-alias regex now permits Unicode letters and digits. Don't tighten it back. [#4759](https://github.com/sitespeedio/sitespeed.io/pull/4759).
- **CSS rebuilds are required.** Editing SCSS under `lib/plugins/html/src/sass/` does nothing on its own — run `npm run build:css` and commit the compiled `*.min.css` under `lib/plugins/html/assets/css/`. The build step writes both light and dark themes.

## Project metadata

- **License:** MIT (see `LICENSE`). `package.json`'s `license` field matches. When adding dependencies, prefer permissive licenses (MIT, Apache-2, BSD, ISC, MPL). Avoid GPL-family deps unless there is a strong reason and explicit discussion — `tools/check-licenses.js` audits this on every install. LLM-generated code carries license risk inherited from training data; review carefully before committing, especially for non-trivial blocks that resemble identifiable upstream code.
- **CONTRIBUTING:** `.github/CONTRIBUTING.md` — read this before changing the contribution flow. Documents the AI-assistance disclosure convention.
- **PR template:** `.github/PULL_REQUEST_TEMPLATE.md`. The pre-flight checklist (issue opened, tests, squashed commits, docs updated, `npm test` + `npm run lint` clean) is the bar for merging.
- **Issue tracker:** <https://github.com/sitespeedio/sitespeed.io/issues>. Templates in `.github/ISSUE_TEMPLATE/` — `BUG_REPORT.yml`, `FEATURE_IMPROVEMENT.yml`, `QUESTION.yml`. Use the right template.
- **Bug reports** require: a description, OS + version info, the URL being analysed (or an email to the maintainer if it's sensitive), screenshots where relevant, and the `sitespeed.io.log` in a gist. See `.github/CONTRIBUTING.md#add-a-defect` for the exact instructions.
- **Slack channel** for contributors: invite link in `HELP.md`.
- **Sponsors:** <https://www.sitespeed.io/sponsor/>. The funding configuration lives in `.github/FUNDING.yml`.
- **Code of conduct:** `CODE_OF_CONDUCT.md`. Applies to issues, PRs, Slack, and any other project space.
- **Support:** `SUPPORT.md` covers user-support channels.
- **Roadmap:** `ROADMAP.md` for planned direction. Check before proposing large features.
- **Help wanted:** `HELP.md` lists the ways non-code contributors (designers, doc writers, sponsors) can help.
- **Security policy:** `SECURITY.md` documents the reporting channel — [GitHub's private vulnerability reporting](https://github.com/sitespeedio/sitespeed.io/security/advisories/new), with peter@soulgalore.com as an email fallback. It requires reporters to spell out a concrete exploitation chain (who the attacker is, what they control, what they gain, a reproducer) rather than just citing a finding. The threat model is "a measured page or HAR file trying to pivot into the host running sitespeed.io" — *not* a network attacker hitting it as if it were a server. The file also takes an explicit stance on transitive-dependency CVEs: a high-severity CVE in a dep that isn't reachable through sitespeed.io's actual code paths or attacker-controlled inputs is not a sitespeed.io vulnerability, and gets picked up via the normal dependency-bump flow rather than an emergency fix. If you change the reporting channel, the threat model, or the in-scope/out-of-scope wording, update both `SECURITY.md` and this note.

## Code commentary

- Inline comments are sparse. When you find one, it almost always documents a Docker / platform / plugin / browser quirk. Treat them as load-bearing — don't delete on "cleanup" passes.
- Don't explain what readable code already shows. Only explain why.
