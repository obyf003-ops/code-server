const express = require('express');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
const app = express();

const PORT = process.env.PORT || 3000;

// Load private key once
const privateKey = fs.readFileSync('private.pem', 'utf8');

app.use(cors());
app.use(express.json());

// Serve the public key to frontend
app.get('/public-key', (req, res) => {
  const publicKey = fs.readFileSync('public.pem', 'utf8');
  res.type('text/plain').send(publicKey);
});

// Submit route with decryption
app.post('/submit', (req, res) => {
  const encryptedCode = req.body?.data?.code;
  if (!encryptedCode) return res.status(400).send('Missing code');

  let decrypted;
  try {
    decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(encryptedCode, 'base64')
    ).toString('utf8');
  } catch (err) {
    console.error('Decryption failed:', err);
    return res.status(400).send('Invalid encrypted data');
  }

  fs.appendFile('codes.txt', decrypted + '\n', (err) => {
    if (err) {
      console.error('Error saving code:', err);
      return res.sendStatus(500);
    }
    console.log('Saved:', decrypted);
    res.sendStatus(200);
  });
});

// View route (protected with key)
app.get('/view', (req, res) => {
  const SECRET = 'your-secret-key';
  const key = req.query.key;

  if (key !== SECRET) return res.status(403).send('Forbidden');

  fs.readFile('codes.txt', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Could not read codes.txt');
    }
    res.type('text').send(data);
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
