var express = require("express");
const tokenBucket = require("../app/rateLimiter/tokenBucket");
const leakyBucket = require("../app/rateLimiter/leakyBucket");
var router = express.Router();

/* GET home page. */
router.get("/", leakyBucket(60, 1000, "ip", false), function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
