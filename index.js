require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const validUrl = require('valid-url');
const shortid = require('shortid');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Connect to MongoDB
mongoose.connect(mySecret = process.env['MONGO_URI'], {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});

const Url = mongoose.model('Url', urlSchema);

// API endpoint to shorten a URL
app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;

  if (!validUrl.isWebUri(url)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    let urlEntry = await Url.findOne({ original_url: url });

    if (!urlEntry) {
      const short_url = shortid.generate();
      urlEntry = new Url({ original_url: url, short_url });
      await urlEntry.save();
    }

    res.json({ original_url: urlEntry.original_url, short_url: urlEntry.short_url });
  } catch (error) {
    res.status(500).json({ error: 'server error' });
  }
});

// API endpoint to redirect to original URL
app.get('/api/shorturl/:short_url', async (req, res) => {
  const { short_url } = req.params;

  try {
    const urlEntry = await Url.findOne({ short_url: short_url });

    if (!urlEntry) {
      return res.json({ error: 'short url not found' });
    }

    res.redirect(urlEntry.original_url);
  } catch (error) {
    res.status(500).json({ error: 'server error' });
  }
});


// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
