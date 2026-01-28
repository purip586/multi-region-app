const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const REGION = process.env.AWS_REGION || 'local';

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/hello', (req, res) => {
  res.send(`Hello from ${REGION}!`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in region ${REGION}`);
});
