const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors');
const fs = require('fs');
const forge = require('node-forge');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const SECRET = "phillpuss45670x";
const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwQZh22dm83pzwYuGDIORTE0HGdjcQvMnYbV2KOYXYswVCKdLdAGuyzj-tPoAjEXIIQZA/exec";

// Load private key
const privateKeyPem = fs.readFileSync('private.pem', 'utf8');
const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

function decryptCode(base64Encrypted) {
  const encryptedBytes = forge.util.decode64(base64Encrypted);
  const decrypted = privateKey.decrypt(encryptedBytes, 'RSA-OAEP', {
    md: forge.md.sha256.create()
  });
  return decrypted;
}

app.post('/submit', async (req, res) => {
  const { code, secret } = req.body.data || {};

  if (secret !== SECRET) {
    return res.status(403).send('Forbidden');
  }

  let decryptedText = '';
  try {
    decryptedText = decryptCode(code);
  } catch (err) {
    console.error('Decryption error:', err);
    return res.status(400).send('Decryption failed');
  }

  try {
    const response = await fetch(SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: decryptedText, token: SECRET })
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
