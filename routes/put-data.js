var express = require('express');
var router = express.Router();
var dbSelector = require('../model/dbUtil/selector.js');

router.post('/deck/entry', dbSelector.putDeckInfo);
router.get('/deck/entry', dbSelector.putDeckInfo);

module.exports = router;
