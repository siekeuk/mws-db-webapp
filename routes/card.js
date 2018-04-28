var express = require('express');
var router = express.Router();
var logger = require('../lib/logger');
var config = require('config');
var cardInfoModel = require('../model/cardInfo.js');
var resModel = {};
var title = "";
var keywords = "";
resModel = config.resData;
resModel.releaseDate = config.releaseDate;
title = config.resData.title;
keywords = config.resData.keywords;

router.get('/', function(req, res) {

  resModel = {};
  var err = new Error('Not Found');
  err.status = 404;
  res.render('error', {
    message : err.message,
    error : {}
  });

});

router.get('/:releaseDate(\\d+)/:expansion([\\w]{3})/:collectNum([\\d]{1,3})/', function(req, res) {

  logger.debug('collectNum...');

  var select = {
    _id : 0,
    expansion : 1,
    cardName : 1,
    color : 1,
    manaCost : 1,
    typesLine : 1,
    rulesText : 1,
    flavorText : 1,
    powTouLoyLine : 1,
    rarityLine : 1,
    expansionLine : 1,
    releaseDate : 1
  };

  var query = {
    'releaseDate' : req.params.releaseDate,
    'expansion' : req.params.expansion,
    'collectorNumber' : Number(req.params.collectNum)
  };

  logger.debug(query);

  cardInfoModel.findOne(query, select, function(err, data) {
    if (data) {
      resModel.cardInfo = JSON.parse(JSON.stringify(data));
      resModel.keywords = keywords + "," + resModel.cardInfo.cardName.jpn
      resModel.title = title + " - " + resModel.cardInfo.cardName.jpn
      resModel.method = req.method;
      logger.debug(req.headers.referer);
      res.render('card', resModel);
    } else {
      var err = new Error('Not Found');
      err.status = 404;
      res.render('error', {
        message : err.message,
        error : {}
      });
    }
  });
});

router.get('/:releaseDate(\\d+)/:expansion([\\w]{3})/:cardName/', getCardRender);
router.post('/:releaseDate(\\d+)/:expansion([\\w]{3})/:cardName/', getCardRender);

function getCardRender(req, res) {
  logger.debug('cardName...');

  var select = {
    _id: 0,
    expansion: 1,
    cardName: 1,
    color: 1,
    manaCost: 1,
    typesLine: 1,
    rulesText: 1,
    flavorText: 1,
    powTouLoyLine: 1,
    rarityLine: 1,
    expansionLine: 1,
    releaseDate: 1
  };

  var query = {
    'releaseDate': req.params.releaseDate,
    'expansion': req.params.expansion,
    'cardName.jpn': req.params.cardName
  };

  cardInfoModel.findOne(query, select, function(err, data) {
    if (data) {
      resModel.cardInfo = JSON.parse(JSON.stringify(data));
      resModel.keywords = keywords + "," + resModel.cardInfo.cardName.jpn
      resModel.title = title + " - " + resModel.cardInfo.cardName.jpn
      resModel.method = req.method;
      logger.debug(resModel.method);
      res.render('card', resModel);
    } else {
      var err = new Error('Not Found');
      err.status = 404;
      res.render('error', {
        message: err.message,
        error: {}
      });
    }
  });
}

module.exports = router;
