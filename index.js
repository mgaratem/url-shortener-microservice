require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const dns = require('dns');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

const urls = []

app.use(bodyParser.urlencoded({extended: false}));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.get('/api/shorturl/:id', function(req, res) {
  const urlData = urls.find(url => url.short_url === parseInt(req.params.id));
  if (!urlData) {
      res.json({ error: 'URL not found' });
  }
  res.redirect(urlData.original_url);
});

app.post('/api/shorturl', async (req, res, next) => {
  var originalUrl = req.body.url;
  try {
    await new Promise((resolve, reject) => {
        dns.lookup(new URL(originalUrl).hostname, (err) => {
            if (err) {
                reject(new Error('invalid url'));
            } else {
                resolve();
            }
        });
    });
    next();
  } catch (err) {
    return res.json({ error: 'invalid url'})
  }
}, function(req, res) {
  var originalUrl = req.body.url;
  var shortUrl = urls.length + 1;
  urls.push({ original_url: originalUrl, short_url: shortUrl });
  res.json({ original_url : originalUrl, short_url : shortUrl })
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
