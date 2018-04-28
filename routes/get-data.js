var express = require('express');
var router = express.Router();
var dbSelector = require('../model/dbUtil/selector.js');

router.post('/card/:releaseDate(\\d+)/:expansion([\\w]{3})/:cardName/', dbSelector.resCardInfo);
router.get('/card/:releaseDate(\\d+)/:expansion([\\w]{3})/:cardName/', dbSelector.resCardInfo);

router.post('/deck/:releaseDate(\\d{8})/:deckNo(\\d+)/', dbSelector.resDeckInfo);
router.get('/deck/:releaseDate(\\d{8})/:deckNo(\\d+)/', dbSelector.resDeckInfo);

router.post('/deck/download', dbSelector.downloadDeckData);

//subtype
router.post('/subtype', dbSelector.resSubtype);

//cardType
router.post('/cardType', dbSelector.resCardType);

//supertype
router.post('/supertype', dbSelector.resSupertype);

//expansion
router.post('/expansion', dbSelector.resExpansion);

module.exports = router;
