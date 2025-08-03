const express = require('express');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
const app = express();

// Read encryption keys
const privateKey = fs.readFileSync('private.pem', 'utf8');
const publicKey = fs.readFileSync('public.pem', 'utf8');

// Middleware
app.use(cors()); // allow all origins
app.use(express.json());

// Endpoint: Get public key
app.get('/public-key', (req, res) => {
  res.type('text/plain').send(publicKey);
});

// Endpoint: Submit encrypted data
app.post('/submit', (req, res) => {
  const encryptedCode = req.body?.data?.code;
  if (!encryptedCode) return res.status(400).send('Missing code');

  try {
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(encryptedCode, 'base64')
    ).toString('utf8');

    fs.appendFile('codes.txt', decrypted + '\n', (err) => {
      if (err) {
        console.error('File write error:', err);
        return res.sendStatus(500);
      }
      console.log('Saved:', decrypted);
      res.sendStatus(200);
    });
  } catch (err) {
    console.error('Decryption failed:', err);
    res.status(400).send('Decryption failed');
  }
});

// Optional: Secure the /view route (add a token to query param)
const VIEW_SECRET = 'my-secret-token'; // Change this
app.get('/view', (req, res) => {
  if (req.query.token !== VIEW_SECRET) {
    return res.status(403).send('Forbidden');
  }

  fs.readFile('codes.txt', 'utf8', (err, data) => {
    if (err) {
      console.error('Read error:', err);
      return res.status(500).send('Could not read file');
    }
    res.type('text').send(data);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
