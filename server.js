const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

// Config
const SECRET = "phillpuss45670x"; // must match Apps Script secret
const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwQZh22dm83pzwYuGDIORTE0HGdjcQvMnYbV2KOYXYswVCKdLdAGuyzj-tPoAjEXIIQZA/exec";

app.use(cors());
app.use(bodyParser.json());

app.post('/submit', async (req, res) => {
  const { code, secret } = req.body.data || {};

  if (secret !== SECRET) {
    return res.status(403).send('Forbidden');
  }

  try {
    const response = await fetch(SHEET_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        token: SECRET, // Send as `token`, not `secret`
      }),
    });

    const text = await response.text();
    res.send(`Google Sheet response: ${text}`);
  } catch (err) {
    console.error("Error posting to Google Sheet:", err);
    res.status(500).send("Server error");
  }
});

app.get('/view', (req, res) => {
  const { key } = req.query;
  if (key !== SECRET) return res.status(403).send("Unauthorized");
  res.send("View logic placeholder (if you used file or memory logging).");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
