# sitespeed.io — Claude Code instructions

All agent guidance for this repository is maintained in a single tool-agnostic file: [AGENTS.md](AGENTS.md). That file is the canonical instruction set used by every coding agent that works on sitespeed.io — Claude Code, Cursor, Aider, Codex, and anything else that respects the emerging `AGENTS.md` convention. Keeping the content in one place prevents drift between tool-specific copies.

The import directive below tells Claude Code to read `AGENTS.md` whenever this `CLAUDE.md` is loaded. Don't add sitespeed.io-specific guidance here — add it to `AGENTS.md` so every agent sees it.

@AGENTS.md
