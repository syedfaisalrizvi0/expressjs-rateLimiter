var express = require('express');
const { tokenBucket } = require('../app/rateLimiter');
var router = express.Router();

/* GET home page. */
router.get('/',tokenBucket('ip',10,1),function(req, res, next) {
  res.render('index', { title: 'Express' }); 
});

module.exports = router;
