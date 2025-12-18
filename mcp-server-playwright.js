#!/usr/bin/env node

/**
 * Playwright MCP Server for Claude Code
 *
 * This server provides browser automation capabilities to Claude Code
 * via the Model Context Protocol (MCP).
 *
 * Usage: node mcp-server-playwright.js
 */

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const {
  StdioServerTransport,
} = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  TextContent,
} = require("@modelcontextprotocol/sdk/types.js");
const { chromium } = require("playwright");

// Global browser instance
let browser = null;
let page = null;

/**
 * Launch browser instance
 */
async function launchBrowser() {
  if (!browser) {
    console.error("Launching Chromium browser...");
    browser = await chromium.launch({
      headless: true,
      args: ["--disable-gpu"],
    });
  }
  if (!page) {
    const context = await browser.createBrowserContext();
    page = await context.newPage();
    // Set viewport for consistent rendering
    await page.setViewportSize({ width: 1280, height: 720 });
  }
  return { browser, page };
}

/**
 * Close browser instance
 */
async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
  }
}

/**
 * Tool implementations
 */
const tools = {
  navigate: {
    description: "Navigate to a URL in the browser",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL to navigate to (e.g., http://localhost:3000)",
        },
      },
      required: ["url"],
    },
    handler: async (input) => {
      const { url } = input;
      const { page } = await launchBrowser();
      try {
        await page.goto(url, { waitUntil: "networkidle" });
        return {
          type: "text",
          text: `Successfully navigated to ${url}`,
        };
      } catch (error) {
        return {
          type: "text",
          text: `Failed to navigate: ${error.message}`,
        };
      }
    },
  },

  screenshot: {
    description: "Take a screenshot of the current page",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description:
            "Optional file path to save screenshot (e.g., /tmp/screenshot.png)",
        },
      },
    },
    handler: async (input) => {
      if (!page) {
        return {
          type: "text",
          text: "No page loaded. Use navigate first.",
        };
      }
      try {
        const path = input.path || "/tmp/screenshot.png";
        await page.screenshot({ path });
        return {
          type: "text",
          text: `Screenshot saved to ${path}`,
        };
      } catch (error) {
        return {
          type: "text",
          text: `Failed to take screenshot: ${error.message}`,
        };
      }
    },
  },

  click: {
    description: "Click an element on the page",
    inputSchema: {
      type: "object",
      properties: {
        selector: {
          type: "string",
          description:
            "CSS selector for the element (e.g., button, #id, .class)",
        },
      },
      required: ["selector"],
    },
    handler: async (input) => {
      const { selector } = input;
      if (!page) {
        return {
          type: "text",
          text: "No page loaded. Use navigate first.",
        };
      }
      try {
        await page.click(selector);
        return {
          type: "text",
          text: `Clicked element: ${selector}`,
        };
      } catch (error) {
        return {
          type: "text",
          text: `Failed to click: ${error.message}`,
        };
      }
    },
  },

  fill: {
    description: "Fill an input field with text",
    inputSchema: {
      type: "object",
      properties: {
        selector: {
          type: "string",
          description: "CSS selector for the input element",
        },
        text: {
          type: "string",
          description: "Text to fill in",
        },
      },
      required: ["selector", "text"],
    },
    handler: async (input) => {
      const { selector, text } = input;
      if (!page) {
        return {
          type: "text",
          text: "No page loaded. Use navigate first.",
        };
      }
      try {
        await page.fill(selector, text);
        return {
          type: "text",
          text: `Filled ${selector} with: ${text}`,
        };
      } catch (error) {
        return {
          type: "text",
          text: `Failed to fill: ${error.message}`,
        };
      }
    },
  },

  getPageContent: {
    description: "Get the visible text content of the current page",
    inputSchema: {
      type: "object",
      properties: {},
    },
    handler: async () => {
      if (!page) {
        return {
          type: "text",
          text: "No page loaded. Use navigate first.",
        };
      }
      try {
        const content = await page.textContent("body");
        return {
          type: "text",
          text: content || "Page is empty",
        };
      } catch (error) {
        return {
          type: "text",
          text: `Failed to get content: ${error.message}`,
        };
      }
    },
  },

  getHTML: {
    description: "Get the HTML structure of the current page or a selector",
    inputSchema: {
      type: "object",
      properties: {
        selector: {
          type: "string",
          description:
            "Optional CSS selector to get HTML of specific element (default: body)",
        },
      },
    },
    handler: async (input) => {
      if (!page) {
        return {
          type: "text",
          text: "No page loaded. Use navigate first.",
        };
      }
      try {
        const selector = input.selector || "body";
        const html = await page.locator(selector).first().innerHTML();
        return {
          type: "text",
          text: html,
        };
      } catch (error) {
        return {
          type: "text",
          text: `Failed to get HTML: ${error.message}`,
        };
      }
    },
  },

  waitForElement: {
    description: "Wait for an element to appear on the page",
    inputSchema: {
      type: "object",
      properties: {
        selector: {
          type: "string",
          description: "CSS selector for the element to wait for",
        },
        timeout: {
          type: "number",
          description: "Timeout in milliseconds (default: 5000)",
        },
      },
      required: ["selector"],
    },
    handler: async (input) => {
      const { selector, timeout = 5000 } = input;
      if (!page) {
        return {
          type: "text",
          text: "No page loaded. Use navigate first.",
        };
      }
      try {
        await page.waitForSelector(selector, { timeout });
        return {
          type: "text",
          text: `Element appeared: ${selector}`,
        };
      } catch (error) {
        return {
          type: "text",
          text: `Element did not appear: ${error.message}`,
        };
      }
    },
  },

  evaluateScript: {
    description: "Execute JavaScript in the page context",
    inputSchema: {
      type: "object",
      properties: {
        script: {
          type: "string",
          description: "JavaScript code to execute",
        },
      },
      required: ["script"],
    },
    handler: async (input) => {
      const { script } = input;
      if (!page) {
        return {
          type: "text",
          text: "No page loaded. Use navigate first.",
        };
      }
      try {
        const result = await page.evaluate((s) => {
          return eval(s);
        }, script);
        return {
          type: "text",
          text: `Script result: ${JSON.stringify(result)}`,
        };
      } catch (error) {
        return {
          type: "text",
          text: `Script failed: ${error.message}`,
        };
      }
    },
  },

  close: {
    description: "Close the browser and cleanup resources",
    inputSchema: {
      type: "object",
      properties: {},
    },
    handler: async () => {
      try {
        await closeBrowser();
        return {
          type: "text",
          text: "Browser closed successfully",
        };
      } catch (error) {
        return {
          type: "text",
          text: `Failed to close browser: ${error.message}`,
        };
      }
    },
  },
};

/**
 * MCP Server Setup
 */
const server = new Server(
  {
    name: "playwright-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Object.entries(tools).map(([name, tool]) => ({
      name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!tools[name]) {
    return {
      content: [
        {
          type: "text",
          text: `Unknown tool: ${name}`,
        },
      ],
      isError: true,
    };
  }

  try {
    const result = await tools[name].handler(args);
    return {
      content: [result],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Tool error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the server
 */
async function main() {
  console.error("Starting Playwright MCP Server...");

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Playwright MCP Server running on stdio");

  // Cleanup on exit
  process.on("SIGINT", async () => {
    console.error("Shutting down...");
    await closeBrowser();
    process.exit(0);
  });
}

main().catch(console.error);
