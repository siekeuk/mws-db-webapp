var express = require('express');
var router = express.Router();
var config = require('config');
var resModel = {};
var title = config.resData.title;
var keywords = config.resData.keywords;

// 共通JS変数
resModel = config.resData;
resModel.env = process.env.NODE_ENV;
resModel.releaseDate = config.releaseDate;

router.get('/', function(req, res) {
  resModel.title = title;
  resModel.keywords = keywords;
  res.render('index', resModel);
});

module.exports = router;
