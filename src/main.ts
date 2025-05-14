import express from "express";
import { PORT } from "./config/server.js";
import mcpRoutes from "./routes/mcp-routes.js";

// Initialize Express application
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/mcp", mcpRoutes);

// Default route
app.get("/", (_, res) => {
	res.status(200).json({
		status: "ok",
		message: "MCP Notification Server is running",
	});
});

// Start the server
app.listen(PORT, () => {
	console.log(`MCP Notification Server listening on port ${PORT}`);
});
