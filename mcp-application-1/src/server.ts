import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create the MCP server
const server = new McpServer({
  name: "example-mcp-server",
  version: "1.0.0",
});

// Tool: greet
server.registerTool(
  "greet",
  {
    title: "Greet Tool",
    description: "Greet a person by name",
    inputSchema: {
      name: z.string().describe("The name of the person to greet"),
    },
  },
  async ({ name }) => {
    return {
      content: [
        {
          type: "text",
          text: `Hello, ${name}! Welcome to the MCP server.`,
        },
      ],
    };
  }
);

// Tool: calculate
server.registerTool(
  "calculate",
  {
    title: "Calculator Tool",
    description: "Perform basic arithmetic operations",
    inputSchema: {
      operation: z.enum(["add", "subtract", "multiply", "divide"]).describe("The operation to perform"),
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    },
  },
  async ({ operation, a, b }) => {
    let result: number;

    switch (operation) {
      case "add":
        result = a + b;
        break;
      case "subtract":
        result = a - b;
        break;
      case "multiply":
        result = a * b;
        break;
      case "divide":
        if (b === 0) {
          return {
            content: [{ type: "text", text: "Error: Division by zero" }],
            isError: true,
          };
        }
        result = a / b;
        break;
    }

    return {
      content: [
        {
          type: "text",
          text: `${a} ${operation} ${b} = ${result}`,
        },
      ],
    };
  }
);

// Tool: get current time
server.registerTool(
  "get_current_time",
  {
    title: "Current Time Tool",
    description: "Get the current date and time",
    inputSchema: {},
  },
  async () => {
    const now = new Date();
    return {
      content: [
        {
          type: "text",
          text: `Current time: ${now.toISOString()}`,
        },
      ],
    };
  }
);

// Tool: echo
server.registerTool(
  "echo",
  {
    title: "Echo Tool",
    description: "Echo back the provided message",
    inputSchema: {
      message: z.string().describe("The message to echo back"),
    },
  },
  async ({ message }) => {
    return {
      content: [
        {
          type: "text",
          text: `Echo: ${message}`,
        },
      ],
    };
  }
);

// Start the server with stdio transport
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server running on stdio");
}

main().catch(console.error);
