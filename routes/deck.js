var express = require('express');
var router = express.Router();
var config = require('config');
var logger = require('../lib/logger');
var dbSelector = require('../model/dbUtil/selector.js');

var resModel = {};
var title = config.resData.title;
var keywords = config.resData.keywords;

// 共通JS変数
resModel = config.resData;
resModel.releaseDate = config.releaseDate;
var latestReleaseDate = config.releaseDate[0];


// Button: Download
router.get('/get-data/download', dbSelector.downloadDeckData);

// Button: Entry Deck
router.post('/entry', renderDeckInfoPage);

// Init: deck page
router.post('/get-list',  dbSelector.getDeckList);

// URI: /deck
router.get('/', renderDeckListPage);

// URI: /deck/20150718/10000/
router.get('/:releaseDate(\\d+)/:deckNo([\\w]{1,})/', renderDeckInfoPage);
router.post('/:releaseDate(\\d+)/:deckNo([\\w]{1,})/', renderDeckInfoPage);


function renderDeckListPage(req, res){
  resModel.title = title;
  resModel.method = req.method;
  resModel.keywords = keywords;
  res.render('deck', resModel);
}

function renderDeckInfoPage(req, res){
  resModel.title = title;
  resModel.method = req.method;
  resModel.keywords = keywords;
  res.render('deck_info', resModel);
}

module.exports = router;
