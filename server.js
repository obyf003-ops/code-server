const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Allow all origins (adjust if needed)
app.use(bodyParser.json());

const SECRET = "phillpuss45670x";

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
