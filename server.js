const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const fetch = require('node-fetch');
const crypto = require('crypto');

const app = express();
app.set('trust proxy', true); // Trust Render's proxy to get real client IP

const port = process.env.PORT || 3000;
const SECRET = "phillpuss45670x";
const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwQZh22dm83pzwYuGDIORTE0HGdjcQvMnYbV2KOYXYswVCKdLdAGuyzj-tPoAjEXIIQZA/exec";

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Load private key once at startup
let privateKey;
try {
  privateKey = fs.readFileSync('private.pem', 'utf8');
} catch (err) {
  console.error('Failed to load private.pem:', err);
  process.exit(1); // Exit if key is missing
}

function decryptRSA(base64Encrypted) {
  try {
    const buffer = Buffer.from(base64Encrypted, 'base64');
    return crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      buffer
    ).toString('utf8');
  } catch (err) {
    console.error('Decryption Error:', err.message);
    throw err;
  }
}

app.post('/submit', async (req, res) => {
  // Extract client IP from headers or req.ip
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip || 'unknown';
  
  // Log IP details for debugging
  console.log('Request Headers:', req.headers);
  console.log('X-Forwarded-For:', forwarded);
  console.log('req.ip:', req.ip);
  console.log('Client IP:', ip);

  // Validate request body
  const { code, secret } = req.body.data || {};
  if (!code || !secret) {
    console.error('Missing code or secret in request body:', req.body);
    return res.status(400).send('Bad Request: Missing code or secret');
  }

  if (secret !== SECRET) {
    console.error('Invalid secret:', secret);
    return res.status(403).send('Forbidden: Invalid secret');
  }

  try {
    // Decrypt the code
    const decrypted = decryptRSA(code);
    const payload = { token: SECRET, code: decrypted, ip };
    
    // Log payload for debugging
    console.log('Webhook Payload:', payload);

    // Send to Google Apps Script
    const response = await fetch(SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Check webhook response
    const responseText = await response.text();
    if (!response.ok) {
      console.error('Webhook Error:', response.status, responseText);
      return res.status(500).send(`Webhook Error: ${response.status} ${responseText}`);
    }

    console.log('Webhook Response:', responseText);
    res.status(200).end(); // Send empty 200 response
  } catch (err) {
    console.error('Error in /submit:', err.message);
    res.status(500).send(`Server Error: ${err.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});