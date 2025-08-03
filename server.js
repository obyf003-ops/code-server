const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch'); // Using v2.x of node-fetch

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Secret token (must match Apps Script)
const SECRET = "phillpuss45670x";

// Google Apps Script Web App URL
const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwQZh22dm83pzwYuGDIORTE0HGdjcQvMnYbV2KOYXYswVCKdLdAGuyzj-tPoAjEXIIQZA/exec";

// Main endpoint
app.post('/submit', async (req, res) => {
  const { code, secret } = req.body.data || {};

  if (secret !== SECRET) {
    return res.status(403).send('Forbidden');
  }

  try {
    const response = await fetch(SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, token: SECRET }) // ✅ Add token here
    });

    const result = await response.text();
    res.send("Appended to Google Sheet: " + result);
  } catch (err) {
    console.error("Error posting to sheet:", err);
    res.status(500).send("Server error");
  }
});

// Optional: viewing endpoint for testing (Render log view)
app.get('/view', (req, res) => {
  const { key } = req.query;
  if (key !== SECRET) return res.status(403).send('Forbidden');
  res.send("View logic placeholder (if you used file or memory logging).");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
