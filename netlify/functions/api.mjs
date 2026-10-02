import serverless from "serverless-http";

// Secure cookies in production; must be set before the backend config is loaded
process.env.NODE_ENV ||= "production";

let backend;
const loadBackend = async () => {
  if (!backend) {
    const { default: app, connectDB } = await import("../../backend/serverless.js");
    backend = { connectDB, handle: serverless(app) };
  }
  return backend;
};

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const { connectDB, handle } = await loadBackend();
  if (/\/health\/?$/.test(event.path)) return handle(event, context);
  try {
    await connectDB();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Database connection failed" }),
    };
  }
  return handle(event, context);
};
