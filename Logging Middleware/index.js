// logging-middleware/index.js
import axios from 'axios';

const LOGGING_API_URL = 'http://20.244.56.144/evaluation-service/logs';
// IMPORTANT: Replace this with the token you received after authentication.
const AUTH_TOKEN = ''; 

/**
 * @param {string} stack 
 * @param {string} level
 * @param {string} package 
 * @param {string} message -
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