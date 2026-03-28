# MCP & agent operations (imgtorjs)

This folder is the **MCP-oriented documentation block** for tools and agents that need to modify or integrate **imgtorjs** without reading the entire tree.

## Contents

| File | Purpose |
| --- | --- |
| [imgtorjs-agent-handbook.md](imgtorjs-agent-handbook.md) | Single entrypoint: commands, API sketch, do/don’t |
| [resources.json](resources.json) | Machine-readable list of paths to expose as MCP resources |
| [CURSOR.md](CURSOR.md) | Cursor-specific: `@` files, optional `mcp.json` placeholder |

## Intended use

1. **Human or agent** reads the handbook first.
2. **IDE / MCP client** maps `resources.json` entries to resource URIs (your server or filesystem MCP defines the URI scheme).
3. **PR 11** in [migration-subagents.md](../migration-subagents.md) finalizes wording, validates JSON, and **after PR 10** adds the `imgtorjs/test-matrix` entry pointing at `docs/migration/10-test-matrix.md`.

## No secrets

Do not store API keys or tokens in this directory. `CURSOR.md` may show **placeholder** configuration only.
