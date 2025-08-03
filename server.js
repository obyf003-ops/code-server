const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Optional: secret token to prevent abuse
const SECRET = "phillpuss45670x"; // Change this to something private

// Google Apps Script Web App URL
const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwQZh22dm83pzwYuGDIORTE0HGdjcQvMnYbV2KOYXYswVCKdLdAGuyzj-tPoAjEXIIQZA/exec";

app.post('/submit', async (req, res) => {
  const { code, secret } = req.body.data || {};

  if (secret !== SECRET) {
    return res.status(403).send('Forbidden');
  }

  try {
    const response = await fetch(SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    const result = await response.text();
    res.send("Appended to Google Sheet: " + result);
  } catch (err) {
    console.error("Error posting to sheet:", err);
    res.status(500).send("Server error");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
