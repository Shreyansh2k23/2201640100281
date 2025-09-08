// backend/index.js
import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import { log } from 'logging-middleware'; // Import your logger!

const app = express();
const PORT = 3000;
const urlDatabase = {}; 

app.use(cors()); // Enable CORS for your frontend
app.use(express.json()); // Middleware to parse JSON bodies

// --- Mandatory Logging Integration Example ---
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // Use your logger
  log('backend', 'info', 'server', `Server started successfully on port ${PORT}.`);
});

// === API ENDPOINTS ===

/**
 * 1. Create Short URL (POST /shorturls)
 */
app.post('/shorturls', (req, res) => {
  const { url, shortcode, validity } = req.body;

  if (!url) {
    log('backend', 'error', 'handler', 'Missing URL in request body.');
    return res.status(400).json({ error: 'URL is required' });
  }

  // Determine the shortcode
  const id = shortcode || nanoid(7); // Use custom or generate a new one
  if (urlDatabase[id]) {
    log('backend', 'warn', 'handler', `Shortcode ${id} already exists.`);
    return res.status(409).json({ error: 'Shortcode is already in use.' });
  }

  // Calculate expiry date (defaults to 30 mins)
  const validityMinutes = validity || 30;
  const expiry = new Date(Date.now() + validityMinutes * 60 * 1000);

  // Store it
  urlDatabase[id] = {
    url: url,
    expiry: expiry.toISOString(),
    clicks: [], // To store click statistics
  };

  const shortLink = `http://localhost:${PORT}/${id}`;
  log('backend', 'info', 'handler', `Created new short link: ${shortLink} for ${url}`);
  
  res.status(201).json({
    shortLink: shortLink,
    expiry: urlDatabase[id].expiry,
  });
});


/**
 * 2. Redirect Short URL (GET /:shortcode)
 */
app.get('/:shortcode', (req, res) => {
  const { shortcode } = req.params;
  const record = urlDatabase[shortcode];

  if (!record) {
    log('backend', 'warn', 'redirect', `Shortcode not found: ${shortcode}`);
    return res.status(404).send('Not Found');
  }

  // Check for expiry
  if (new Date(record.expiry) < new Date()) {
    log('backend', 'warn', 'redirect', `Expired shortcode accessed: ${shortcode}`);
    delete urlDatabase[shortcode]; // Clean up expired link
    return res.status(410).send('Gone: This link has expired.');
  }
  
  // Log the click for stats
  record.clicks.push({
      timestamp: new Date().toISOString(),
      source: req.headers['referer'] || 'Direct',
      location: req.headers['x-forwarded-for'] || req.socket.remoteAddress, // Simplified location
  });

  log('backend', 'info', 'redirect', `Redirecting ${shortcode} to ${record.url}`);
  res.redirect(record.url);
});


/**
 * 3. Retrieve Statistics (GET /shorturls/:shortcode)
 */
app.get('/shorturls/:shortcode', (req, res) => {
  const { shortcode } = req.params;
  const record = urlDatabase[shortcode];

  if (!record) {
     log('backend', 'warn', 'stats', `Stats requested for non-existent shortcode: ${shortcode}`);
    return res.status(404).json({ error: 'Shortcode not found' });
  }

  const stats = {
    originalUrl: record.url,
    creationDate: new Date(new Date(record.expiry).getTime() - 30 * 60 * 1000).toISOString(), // Approximated
    expiryDate: record.expiry,
    totalClicks: record.clicks.length,
    clickData: record.clicks,
  };
  
  log('backend', 'info', 'stats', `Fetched stats for ${shortcode}`);
  res.status(200).json(stats);
});