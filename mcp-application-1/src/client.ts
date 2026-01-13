// Note: The MCP SDK only provides 'Client' class for clients (unlike 'McpServer' for servers)
// We alias it as 'McpClient' for naming consistency with McpServer
import { Client as McpClient } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

interface ToolResult {
  content: Array<{
    type: string;
    text?: string;
  }>;
  isError?: boolean;
}

class MCPClientWrapper {
  private client: McpClient;
  private transport: StdioClientTransport | null = null;

  constructor() {
    this.client = new McpClient(
      {
        name: "example-mcp-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );
  }

  async connect(command: string, args: string[] = []): Promise<void> {
    this.transport = new StdioClientTransport({
      command,
      args,
    });

    await this.client.connect(this.transport);
    console.log("Connected to MCP server");
  }

  async listTools(): Promise<void> {
    const response = await this.client.listTools();
    console.log("\nAvailable tools:");
    console.log("================");
    for (const tool of response.tools) {
      console.log(`\n- ${tool.name}: ${tool.description}`);
      if (tool.inputSchema) {
        console.log(`  Input schema: ${JSON.stringify(tool.inputSchema, null, 2)}`);
      }
    }
  }

  async callTool(name: string, args: Record<string, unknown> = {}): Promise<ToolResult> {
    console.log(`\nCalling tool: ${name}`);
    console.log(`Arguments: ${JSON.stringify(args)}`);

    const result = await this.client.callTool({
      name,
      arguments: args,
    });

    console.log("Result:", JSON.stringify(result, null, 2));
    return result as ToolResult;
  }

  async disconnect(): Promise<void> {
    if (this.transport) {
      await this.transport.close();
      console.log("\nDisconnected from MCP server");
    }
  }
}

// Demo: Connect to server and call tools
async function main(): Promise<void> {
  const client = new MCPClientWrapper();

  try {
    // Connect to the server using tsx to run TypeScript directly
    await client.connect("npx", ["tsx", "src/server.ts"]);

    // List available tools
    await client.listTools();

    // Call the greet tool
    await client.callTool("greet", { name: "World" });

    // Call the calculate tool
    await client.callTool("calculate", {
      operation: "add",
      a: 10,
      b: 5,
    });

    await client.callTool("calculate", {
      operation: "multiply",
      a: 7,
      b: 8,
    });

    // Call the get_current_time tool
    await client.callTool("get_current_time", {});

    // Call the echo tool
    await client.callTool("echo", { message: "Hello from MCP Client!" });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.disconnect();
  }
}

main().catch(console.error);
