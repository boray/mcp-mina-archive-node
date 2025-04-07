#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MinaGraphQLClient ,BlockStatusFilter } from "./graphql-client.js";
import { z } from "zod";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";


const ConfigSchema = z.object({
	name: z.string().default("mcp-graphql"),
	endpoint: z.string().url().default("http://archive-node-api.gcp.o1test.net/"),
});

type Config = z.infer<typeof ConfigSchema>;

function parseArgs(): Config {
	const argv = yargs(hideBin(process.argv))
		.option("name", {
			type: "string",
			description: "Name of the MCP server",
			default: "mcp-mina-archive-node",
		})
		.option("endpoint", {
			type: "string",
			description: "Archive Node API endpoint",
			default: "http://archive-node-api.gcp.o1test.net/",
		})
		.help()
		.parseSync();

	try {
		return ConfigSchema.parse({
			name: argv.name,
			endpoint: argv.endpoint,
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error("Invalid config:");
			console.error(
				error.errors
					.map((e) => `  ${e.path.join(".")}: ${e.message}`)
					.join("\n"),
			);
		} else {
			console.error("Error parsing arguments:", error);
		}
		process.exit(1);
	}
}

const config = parseArgs();

const minaClient = new MinaGraphQLClient(config.endpoint);

const server = new McpServer({
  name: "mina-archive-node",
  version: "1.0.0",
  description: "MCP Server for Mina Archive Node API"
});

server.tool(
    "query-actions",
    "Query actions from the Mina blockchain with optional filters",
    {
      address: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{55,60}$/, 'Invalid Ethereum address format'),
      tokenId: z.string().optional().describe("Token ID to filter transactions"),
      status: z.enum(Object.values(BlockStatusFilter) as [BlockStatusFilter, ...BlockStatusFilter[]]).optional().describe("Transaction status to filter"),
      to: z.number().optional().describe("Block height to filter transactions"),
      from: z.number().optional().describe("Block height to filter transactions"),
      fromActionState: z.string().optional().describe("Action state to filter transactions"),
      endActionState: z.string().optional().describe("Action state to filter transactions"),
    },
    async ({ address, tokenId, status, to, from, fromActionState, endActionState }) => {
      try {
        const result = await minaClient.queryActions({address, tokenId, status, to, from, fromActionState, endActionState});
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        throw new Error(`Failed to query actions: ${error}`);
      }
    }
  );


server.tool(
  "query-events",
  "Query events from the Mina blockchain with optional filters",
  {
    address: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{55,60}$/, 'Invalid Ethereum address format'),
    tokenId: z.string().optional().describe("Token ID to filter transactions"),
    status: z.enum(Object.values(BlockStatusFilter) as [BlockStatusFilter, ...BlockStatusFilter[]]).optional().describe("Transaction status to filter"),
    to: z.number().optional().describe("Block height to filter transactions"),
    from: z.number().optional().describe("Block height to filter transactions"),
  },
  async ({ address, tokenId, status, to, from }) => {
    try {
      const result = await minaClient.queryEvents({address, tokenId, status, to, from});
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      throw new Error(`Failed to query events: ${error}`);
    }
  }
);

server.tool(
  "get-network-state",
  "Get the current state of the Mina network",
  {},
  async () => {
    try {
      const result = await minaClient.queryNetworkState();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      throw new Error(`Failed to get network state: ${error}`);
    }
  }
);

// Start the server
async function main() {
  try {
    // Use stdio transport for communication
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error(`Started Mina MCP server for archive node API for endpoint: ${config.endpoint}`,);
  } catch (error) {
    console.error(`Fatal error in main(): ${error}`);
    process.exit(1);
  }
}

main();
