const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const fetch = require('node-fetch');
const crypto = require('crypto');
const app = express();

const port = process.env.PORT || 3000;
const SECRET = "phillpuss45670x";
const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwQZh22dm83pzwYuGDIORTE0HGdjcQvMnYbV2KOYXYswVCKdLdAGuyzj-tPoAjEXIIQZA/exec";

app.use(cors());
app.use(bodyParser.json());

// Load private key once at startup
const privateKey = fs.readFileSync('private.pem', 'utf8');

function decryptRSA(base64Encrypted) {
  const buffer = Buffer.from(base64Encrypted, 'base64');
  return crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    buffer
  ).toString('utf8');
}

app.post('/submit', async (req, res) => {
  const { code, secret } = req.body.data || {};
  if (secret !== SECRET) return res.status(403).send('Forbidden');

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  try {
    const decrypted = decryptRSA(code);

    const response = await fetch(SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: SECRET, code: decrypted, ip }),
    });

    const result = await response.text();
    res.send("Appended decrypted log to Google Sheet: " + result);
  } catch (err) {
    console.error("Decryption/Post Error:", err);
    res.status(500).send("Server error during decryption or forwarding.");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
