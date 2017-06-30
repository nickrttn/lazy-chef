/* eslint curly: 0 */
const path = require('path');
const crypto = require('crypto');
const mime = require('mime');
const debug = require('debug')('upload');
const express = require('express');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, `../uploads/`));
  },
  filename: (req, file, callback) => {
    crypto.randomBytes(16, (err, raw) => {
      callback(null, `${req.body.recipe}-${raw.toString('hex')}.${mime.extension(file.mimetype)}`);
    });
  }
});
const upload = multer({storage});

const ensureLoggedIn = require('../lib/ensureLoggedIn');

const router = new express.Router();

router
  .use(ensureLoggedIn())
  .post('/photos', upload.single('photo'), uploadPhotos);

function uploadPhotos(req, res) {
  res.redirect('back');
}

module.exports = router;
