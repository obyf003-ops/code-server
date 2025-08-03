const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch'); // v2.x is used
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// 🔐 Optional: secret token to prevent abuse
const SECRET = "phillpuss45670x";

// 🌐 Google Apps Script Web App URL
const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwQZh22dm83pzwYuGDIORTE0HGdjcQvMnYbV2KOYXYswVCKdLdAGuyzj-tPoAjEXIIQZA/exec";

app.post('/submit', async (req, res) => {
  const { code, dropbox, secret } = req.body.data || {};

  if (secret !== SECRET) {
    return res.status(403).send('Forbidden');
  }

  // 🕵️ Get IP address
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';

  try {
    const response = await fetch(SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        dropbox,
        ip,
        token: SECRET
      })
    });

    const result = await response.text();
    res.send("Appended to Google Sheet: " + result);
  } catch (err) {
    console.error("Error posting to sheet:", err);
    res.status(500).send("Server error");
  }
});

// Optional: GET endpoint for testing
app.get('/', (req, res) => {
  res.send('Server is up and running.');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
