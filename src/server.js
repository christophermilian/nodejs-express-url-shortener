const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const dns = require('dns')
const cors = require('cors');
const app = express();
const UrlModel = require('./myApp.js').UrlModel

let mongoose;
try {
  mongoose = require('mongoose');
} catch (e) {
  console.log(e);
}

// Some legacy browsers hang on 204 status code
app.use(cors({ optionsSuccessStatus: 200 }));

// global setting for safety timeouts to handle possible
// wrong callbacks that will never be called
const TIMEOUT = 10000;

app.use(bodyParser.urlencoded({ extended: 'false' }));
app.use(bodyParser.json());
app.use('/public', express.static(process.cwd() + '/src/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/file/*?', function (req, res, next) {
  if (req.params[0] === '.env') {
    return next({ status: 401, message: 'ACCESS DENIED' });
  }
  fs.readFile(path.join(__dirname, req.params[0]), function (err, data) {
    if (err) {
      return next(err);
    }
    res.type('txt').send(data.toString());
  });
});

app.get('/is-mongoose-ok', function (req, res) {
  if (mongoose) {
    res.json({ isMongooseOk: !!mongoose.connection.readyState });
  } else {
    res.json({ isMongooseOk: false });
  }
});

app.use(function (req, res, next) {
  if (req.method !== 'OPTIONS' && UrlModel.modelName !== 'Url') {
    return next({ message: 'Url Model is not correct' });
  }
  next();
});

app.use((req, res, next)=>{
  console.log(`${req.method} ${req.path} -${req.ip}`)
  next()
})

app.post('/mongoose-model', function (req, res, next) {
  let p;
  p = new UrlModel(req.body);
  res.json(p);
});

const createUrl = require('./myApp.js').createAndSaveUrl;
app.post('/api/shorturl', function (req, res, next) {
  const { url } = req.body;
  const myURL = new URL(url);

  dns.lookup(myURL.hostname, (err, address, family) => {
    if (err) {
      res.json({ error: "invalid url"})
    } else {
     // in case of incorrect function use wait timeout then respond
    let t = setTimeout(() => {
      next({ message: 'timeout' });
    }, TIMEOUT);
    createUrl(req.body.url, (err, data) => {
      clearTimeout(t);
      if (err) {
        return next(err);
      }
      if (!data) {
        console.log('Missing `done()` argument');
        return next({ message: 'Missing callback argument' });
      }
      const response = {
        original_url: data.original_url,
        short_url: data.short_url
      }
      res.json(response)
    });
    };
  });
});

const findShortUrl = require('./myApp.js').findUrlByShortUrl;
app.get('/api/shorturl/:id', (req, res, next) => {
  let t = setTimeout(() => {
    next({ message: 'timeout' });
  }, TIMEOUT);
  findShortUrl(req.params.id, function (err, data) {
    clearTimeout(t);
    if (err) {
      return next(err);
    }
    if (!data) {
      console.log('Missing `done()` argument');
      return next({ message: 'Missing callback argument' });
    }
    res.redirect(data.original_url);
  });
});

// Error handler
app.use(function (err, req, res, next) {
  if (err) {
    res
      .status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }
});

// Unmatched routes handler
app.use(function (req, res) {
  if (req.method.toLowerCase() === 'options') {
    res.end();
  } else {
    res.status(404).type('txt').send('Not Found');
  }
});

const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

