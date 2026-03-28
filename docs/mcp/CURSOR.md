# Cursor & MCP wiring for imgtorjs

## Referencing docs from the chat

Ask the agent to read these paths (or attach with `@`):

- `@docs/mcp/imgtorjs-agent-handbook.md` — operations entrypoint  
- `@docs/FEATURES.md` — full feature IDs and behaviour  
- `@docs/migration-subagents.md` — PR chain and prompts  
- `@README.md` — user-facing API examples  

After **PR 10**, add `@docs/migration/10-test-matrix.md` when changing behaviour.

## Optional: MCP server configuration

If you use a **filesystem** or **docs** MCP server, register the paths listed in [resources.json](resources.json). Example **placeholder** only (adjust to your server name and capabilities):

```json
{
  "mcpServers": {
    "imgtorjs-docs": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/absolute/path/to/imgtorjs"]
    }
  }
}
```

Replace `/absolute/path/to/imgtorjs` with your clone path. Do not commit tokens, client secrets, or non-placeholder credentials.

## PR 11 checklist

- [ ] Confirm every `resources.json` path exists; after PR 10, append `imgtorjs/test-matrix` → `docs/migration/10-test-matrix.md` to `resources.json`.  
- [ ] Add any team-specific MCP server repo if you publish a dedicated `imgtorjs` MCP package.  
- [ ] Link this file from root README “For AI agents” (done in PR 11 if not already present).
