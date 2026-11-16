# Roadmap

This roadmap is the plan for the core team. Priorities can and will change over time, but this gives you a view of our current vision and direction. Check here before proposing a large feature, and open an issue if you want to discuss where the project is heading.

## Recently shipped

The 2024 goal — getting an online version of sitespeed.io up and running — is done: [onlinetest](https://github.com/sitespeedio/onlinetest) is a self-hostable web UI and REST API on top of sitespeed.io, so teams can run tests without putting every contributor on the CLI.

Since then (highlights from 38.x–41.x):

* A full redesign of the HTML report (40.0.0): card-based design, inline SVG charts, INP and Core Web Vitals front and centre, JS/CSS coverage, a rewritten compare view and a mobile-friendliness pass.
* Browsertime 27: Safari on iOS over USB, soft-navigation (SPA) measurement, TypeScript navigation scripts and a unified scripting API.
* Coach 9: severity tiers on every rule, an INP rule, modern image rules and updated privacy/security header rules.
* Supply-chain hardening: signed Docker images with SLSA provenance and SBOMs, npm publishing via Trusted Publishing with provenance, a written security policy and `publiccode.yml` for public-sector software catalogues.
* A smaller dependency tree: lodash, dayjs, ora, simplecrawler, concurrent-queue and more replaced with small in-tree helpers, plus large memory-use fixes for big HAR files.

## Current focus (2026)

**Measurement depth.** Mature the iOS testing story, soft-navigation/SPA measurement and JS/CSS coverage now that the foundations are in place.

**Onlinetest.** Continued investment in the online version as the "no CLI required" way to use sitespeed.io.

## Under consideration

Things we are thinking about but haven't committed to. Open or join an issue if one of these matters to you:

* OpenSearch as a results backend ([#4593](https://github.com/sitespeedio/sitespeed.io/issues/4593)).
* Moving the example Grafana dashboards from the JSON-API datasource to the Infinity datasource ([#4476](https://github.com/sitespeedio/sitespeed.io/issues/4476)).
