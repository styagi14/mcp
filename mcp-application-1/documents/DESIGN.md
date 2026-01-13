# MCP Server Project Design

## Overview

This project implements a **Model Context Protocol (MCP)** server and client in TypeScript. MCP is an open protocol that enables AI assistants (like Claude) to connect to external tools and data sources.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          MCP ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐         STDIO Transport         ┌─────────────────┐   │
│  │             │  ◄──────────────────────────►   │                 │   │
│  │  MCP Client │      JSON-RPC Messages          │   MCP Server    │   │
│  │             │                                 │                 │   │
│  └─────────────┘                                 └─────────────────┘   │
│        │                                                │               │
│        │                                                │               │
│        ▼                                                ▼               │
│  ┌─────────────┐                                 ┌─────────────────┐   │
│  │  List Tools │                                 │  Tool Registry  │   │
│  │  Call Tools │                                 │  ┌───────────┐  │   │
│  │             │                                 │  │  greet    │  │   │
│  └─────────────┘                                 │  │  calculate│  │   │
│                                                  │  │  echo     │  │   │
│                                                  │  │  get_time │  │   │
│                                                  │  └───────────┘  │   │
│                                                  └─────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. MCP Server (`src/server.ts`)

The server exposes tools that can be called by any MCP client.

```
┌────────────────────────────────────────────────────────┐
│                     McpServer                          │
├────────────────────────────────────────────────────────┤
│  name: "example-mcp-server"                            │
│  version: "1.0.0"                                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │                 Registered Tools                 │  │
│  ├──────────────────────────────────────────────────┤  │
│  │                                                  │  │
│  │  greet          - Greet a person by name         │  │
│  │  calculate      - Arithmetic operations          │  │
│  │  get_current_time - Get current date/time        │  │
│  │  echo           - Echo back a message            │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │              StdioServerTransport                │  │
│  │  - Reads from stdin                              │  │
│  │  - Writes to stdout                              │  │
│  │  - JSON-RPC 2.0 protocol                         │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 2. MCP Client (`src/client.ts`)

The client connects to an MCP server and can list/call tools.

```
┌────────────────────────────────────────────────────────┐
│                     MCPClient                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Methods:                                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  connect(command, args)  - Connect to server     │  │
│  │  listTools()             - List available tools  │  │
│  │  callTool(name, args)    - Execute a tool        │  │
│  │  disconnect()            - Close connection      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Transport:                                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │              StdioClientTransport                │  │
│  │  - Spawns server process                         │  │
│  │  - Communicates via stdin/stdout                 │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Communication Flow

### Tool Registration (Server Startup)

```
┌──────────────────────────────────────────────────────────────────┐
│                    SERVER INITIALIZATION                         │
└──────────────────────────────────────────────────────────────────┘

  ┌─────────┐
  │  Start  │
  └────┬────┘
       │
       ▼
  ┌─────────────────────┐
  │  Create McpServer   │
  │  (name, version)    │
  └──────────┬──────────┘
             │
             ▼
  ┌─────────────────────┐
  │  Register Tools     │
  │  using registerTool │
  │  with Zod schemas   │
  └──────────┬──────────┘
             │
             ▼
  ┌─────────────────────┐
  │  Create Transport   │
  │  (StdioServer)      │
  └──────────┬──────────┘
             │
             ▼
  ┌─────────────────────┐
  │  server.connect()   │
  │  Wait for requests  │
  └─────────────────────┘
```

### Client-Server Interaction

```
┌──────────────────────────────────────────────────────────────────┐
│                    REQUEST/RESPONSE FLOW                         │
└──────────────────────────────────────────────────────────────────┘

    CLIENT                                           SERVER
      │                                                │
      │  1. connect()                                  │
      │  ─────────────────────────────────────────►    │
      │                spawn server process            │
      │                                                │
      │  2. listTools()                                │
      │  ─────────────────────────────────────────►    │
      │                                                │
      │  ◄─────────────────────────────────────────    │
      │     [greet, calculate, get_time, echo]         │
      │                                                │
      │  3. callTool("greet", {name: "World"})         │
      │  ─────────────────────────────────────────►    │
      │                                                │
      │                              ┌───────────────┐ │
      │                              │ Execute tool  │ │
      │                              │ handler       │ │
      │                              └───────────────┘ │
      │                                                │
      │  ◄─────────────────────────────────────────    │
      │     {content: [{type: "text",                  │
      │       text: "Hello, World!..."}]}              │
      │                                                │
      │  4. disconnect()                               │
      │  ─────────────────────────────────────────►    │
      │                close transport                 │
      │                                                │
```

## Tool Schema Design

Each tool is defined with:

```
┌─────────────────────────────────────────────────────────────────┐
│                        TOOL DEFINITION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  server.registerTool(                                           │
│    "tool_name",           ◄── Unique identifier                 │
│    {                                                            │
│      title: "...",        ◄── Human-readable title              │
│      description: "...",  ◄── What the tool does                │
│      inputSchema: {       ◄── Zod schema for validation         │
│        param1: z.string(),                                      │
│        param2: z.number(),                                      │
│      },                                                         │
│    },                                                           │
│    async (args) => {      ◄── Handler function                  │
│      // Tool logic                                              │
│      return {                                                   │
│        content: [{        ◄── Response format                   │
│          type: "text",                                          │
│          text: "result"                                         │
│        }]                                                       │
│      };                                                         │
│    }                                                            │
│  );                                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Available Tools

| Tool | Description | Input | Output |
|------|-------------|-------|--------|
| `greet` | Greet a person | `name: string` | Greeting message |
| `calculate` | Arithmetic ops | `operation: enum`, `a: number`, `b: number` | Calculation result |
| `get_current_time` | Current time | None | ISO timestamp |
| `echo` | Echo message | `message: string` | Echoed message |

## Project Structure

```
mcp-server/
├── src/
│   ├── server.ts        # MCP Server implementation
│   └── client.ts        # MCP Client implementation
├── docs/
│   └── DESIGN.md        # This design document
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                      TECHNOLOGY STACK                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │  TypeScript   │  │   Node.js     │  │    Zod        │       │
│  │  Type Safety  │  │   Runtime     │  │  Validation   │       │
│  └───────────────┘  └───────────────┘  └───────────────┘       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │           @modelcontextprotocol/sdk                 │       │
│  │  - McpServer: High-level server API                 │       │
│  │  - Client: Client connection management             │       │
│  │  - StdioServerTransport: Server-side stdio          │       │
│  │  - StdioClientTransport: Client-side stdio          │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Integration with Claude Code

To use this MCP server with Claude Code, add to your MCP settings:

```json
{
  "mcpServers": {
    "example-server": {
      "command": "npx",
      "args": ["tsx", "F:/code/claude-code-demo/mcp-server/src/server.ts"]
    }
  }
}
```

## Usage

```bash
# Install dependencies
npm install

# Run server (for Claude Code integration)
npm run dev:server

# Run client demo (spawns server and tests tools)
npm run dev:client

# Build for production
npm run build
```
