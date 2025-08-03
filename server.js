const express = require('express');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Load private/public keys
const privateKey = fs.readFileSync(path.join(__dirname, 'private.pem'), 'utf8');
const publicKey = fs.readFileSync(path.join(__dirname, 'public.pem'), 'utf8');

// POST /submit - receive encrypted data
app.post('/submit', (req, res) => {
  const encrypted = req.body?.data?.code;

  if (!encrypted) return res.status(400).send('Missing encrypted code');

  try {
    const buffer = Buffer.from(encrypted, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer
    );

    const decoded = decrypted.toString('utf8');

    fs.appendFileSync('codes.txt', decoded + '\n');
    console.log('Saved:', decoded);
    res.sendStatus(200);
  } catch (err) {
    console.error('Decryption failed:', err);
    res.status(500).send('Failed to decrypt');
  }
});

// GET /public-key - send public key to frontend
app.get('/public-key', (req, res) => {
  res.type('text/plain').send(publicKey);
});

// GET /view - protected by secret key
app.get('/view', (req, res) => {
  const secret = req.query.key;
  const YOUR_SECRET_KEY = 'phillpuss45670x'; // 🔒 change this to something only you know

  if (secret !== YOUR_SECRET_KEY) {
    return res.status(403).send('Forbidden');
  }

  const filePath = 'codes.txt';

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading codes.txt:', err);
      return res.status(500).send('Could not read codes.txt');
    }
    res.type('text').send(data);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
