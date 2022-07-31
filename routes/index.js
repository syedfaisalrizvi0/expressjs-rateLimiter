var express = require("express");
const tokenBucket = require("../app/rateLimiter/tokenBucket");
const leakyBucket = require("../app/rateLimiter/leakyBucket");
var router = express.Router();

/* GET home page. */
router.get(
  "/",
  [leakyBucket(60, 1000, "ip", false), tokenBucket("ip", 60, 1)],
  function (req, res, next) {
    res.send("hello");
  }
);

module.exports = router;
