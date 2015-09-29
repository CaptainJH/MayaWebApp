var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('texFlushing', { title: 'Texture Flushing Debug Kit' });
});

module.exports = router;
