const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

function getHelloMessage() {
  if (process.env.AWS_REGION) return `Hello from ${process.env.AWS_REGION}!`;
  if (process.env.K_SERVICE) return 'Hello from GCP Cloud Run!';
  return 'Hello from local!';
}

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

function regionHandler(req, res) {
  res.send(getHelloMessage());
}

app.get('/api/region', regionHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${getHelloMessage()})`);
});
