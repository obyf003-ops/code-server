const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const SECRET = "phillpuss45670x";
const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwQZh22dm83pzwYuGDIORTE0HGdjcQvMnYbV2KOYXYswVCKdLdAGuyzj-tPoAjEXIIQZA/exec";

app.post('/submit', async (req, res) => {
  const { code, secret } = req.body.data || {};

  if (secret !== SECRET) {
    return res.status(403).send('Forbidden');
  }

  // Save locally to code.txt
  fs.appendFile('code.txt', code + '\n', (err) => {
    if (err) console.error('Error saving to file:', err);
  });

  // Send to Google Sheet
  try {
    const response = await fetch(SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    const result = await response.text();
    res.send("Saved & Sheet OK: " + result);
  } catch (err) {
    console.error("Error posting to sheet:", err);
    res.status(500).send("Server error");
  }
});

app.get('/view', (req, res) => {
  if (req.query.key !== SECRET) return res.status(403).send("Forbidden");

  fs.readFile('code.txt', 'utf8', (err, data) => {
    if (err) return res.status(500).send("Error reading file");
    res.setHeader("Content-Type", "text/plain");
    res.send(data);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
