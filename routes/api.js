var express = require('express');
var router = express.Router();

/* GET API home page */
router.get('/', function(req, res, next) {
    //Return version=1 in json
  res.jsonp({
      'v' : '1' 
  });
});

module.exports = router;
