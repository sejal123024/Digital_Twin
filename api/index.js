// Vercel Serverless Function entry point.
// Imports the shared Express app (without listen()) and exports it as the handler.
// Local development uses server/index.js instead — this file is ignored locally.
import app from '../server/app.js';

export default app;

