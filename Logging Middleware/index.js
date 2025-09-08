// logging-middleware/index.js
import axios from 'axios';

const LOGGING_API_URL = 'http://20.244.56.144/evaluation-service/logs';
// IMPORTANT: Replace this with the token you received after authentication.
const AUTH_TOKEN = 'Bearer YOUR_AUTH_TOKEN_HERE'; 

/**
 * Sends a log to the evaluation test server.
 * @param {string} stack - Should be "backend" or "frontend".
 * @param {string} level - "info", "warn", "error", "debug", or "fatal".
 * @param {string} package - The package/module where the log originates (e.g., "db", "controller").
 * @param {string} message - The descriptive log message.
 */
export const log = async (stack, level, pkg, message) => {
  try {
    const response = await axios.post(
      LOGGING_API_URL,
      {
        stack,
        level,
        package: pkg, // 'package' is a reserved keyword, so we use 'pkg' as the parameter name
        message,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_TOKEN,
        },
      }
    );
    console.log('Log created successfully:', response.data.logID);
    return response.data;
  } catch (error) {
    console.error('Failed to send log:', error.response ? error.response.data : error.message);
  }
};

// Example usage from the documentation:
// log("backend", "error", "handler", "received string, expected bool");
// log("backend", "fatal", "db", "Critical database connection failure.");