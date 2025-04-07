# MCP Server for Mina Archive Node API

[![smithery badge](https://smithery.ai/badge/mcp-mina-archive-node)](https://smithery.ai/server/mcp-mina-archive-node)

This project implements a Model Context Protocol (MCP) server that provides access to the Mina blockchain data through a standardized interface. The server allows clients to query events and actions from the Mina blockchain using the MCP protocol.

## Overview

The MCP server acts as a bridge between AI applications and the Mina blockchain data. It exposes tools that allow clients to:

- Query blocks by height or state hash
- Query transactions by hash
- Get network state information

## Installation

### Installing via Smithery

To install mcp-mina-archive-node for Claude Desktop automatically via [Smithery](https://smithery.ai/server/mcp-mina-archive-node):

```bash
npx -y @smithery/cli install mcp-mina-archive-node --client claude
```

### Intalling via Smithery
To install the MCP to Claude via Smithery:

```bash
npx -y @smithery/cli install mcp-mina-archive-node --client claude
```

### Installing Manually
To manually install to Claude:

```json
{
    "mcpServers": {
        "mcp-graphql": {
            "command": "npx",
            "args": ["mcp-mina-archive-node"]
        }
    }
}
```

## Usage

### Tools

- `query-events`: Query events with optional filters
- `query-actions`: Query actions with optional filters
- `get-network-state`: Get the current state of the Mina network

## License

MIT
