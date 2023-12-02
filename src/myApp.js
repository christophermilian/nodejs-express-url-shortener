require('dotenv').config();

let mongoose = require('mongoose');
const { urlSchema } = require('./database/urlSchema');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let UrlDoc = mongoose.model('Url', urlSchema);

const createAndSaveUrl = (urlInput, done) => {
    const shortenedURLId = Math.floor(Math.random() * 100000)
    const urlEntity = {
      original_url: urlInput,
      short_url: shortenedURLId
    };
    
    const newUrl = new UrlDoc(urlEntity);
  try {
    newUrl.save((err, data) => {
      if (err) return done(err);
      done(null, data);
    });
  } catch (error) {
    console.error(error);
    throw new Error('Could not create person document.');
  }
};

const findUrlByShortUrl = (shortUrl, done) => {
  UrlDoc.findOne({short_url: shortUrl}, (err, data) => {
    if(err) return done(err)
    return done(null, data)
  })
};

exports.UrlModel = UrlDoc;
exports.createAndSaveUrl = createAndSaveUrl;
exports.findUrlByShortUrl = findUrlByShortUrl;
