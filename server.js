const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/submit', (req, res) => {
  const code = req.body?.data?.code;
  if (!code) return res.status(400).send('Invalid input');

  fs.appendFile('codes.txt', code + '\n', (err) => {
    if (err) {
      console.error('Error saving code:', err);
      return res.sendStatus(500);
    }
    console.log('Saved:', code);
    res.sendStatus(200);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
