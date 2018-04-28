var CardInfoModel, __, config, express, logger, resModel, router;

express = require('express');

router = express.Router();

config = require('config');

__ = require('underscore');

logger = require('../lib/logger');

CardInfoModel = require('../model/cardInfo.js');

resModel = {};

router.post('/', function(req, res) {
  var $or, a, action, colMap, freeWord, i, j, k, l, len, len1, len2, params, postData, query, records, ref, ref1, ref2, ref3, ref4, ref5, select, sortQuery, styleMap, value, word;
  res.contentType('application/json');
  records = [];
  a = {
    "total": 0,
    "records": []
  };
  colMap = {
    ex: "expansion",
    cn: "cardName.jpn",
    cl: "colorSort",
    mc: "convertedManaCost",
    pt: "powTouLoyLine",
    ty: "typesLine"
  };
  select = {
    _id: 0,
    ex: "$expansion",
    cn: "$cardName.jpn",
    cl: "$color",
    mc: "$manaCost",
    pt: "$powTouLoyLine",
    ty: "$typesLine"
  };
  query = {
    'releaseDate': config.releaseDate[0]
  };
  sortQuery = {};
  word = '';
  postData = {};
  styleMap = {
    'W': 'background-color:#F9F7F7;',
    'U': 'background-color:#B5DCF1;',
    'B': 'background-color:#B6ADAC;',
    'R': 'background-color:#F6AC97;',
    'G': 'background-color:#CFE1D8;',
    '土地': 'background-color:#E9D3BA;',
    'アーティファクト': 'background-color:#DCDDDF;',
    '多色': 'background-color:#FAF190;'
  };
  action = req.body.action;
  params = req.body.param;
  logger.debug("body is ...");
  logger.debug(JSON.stringify(req.body));
  if (params) {
    if (params.freeWord || params.freeWord === '') {
      logger.info("serverSide: simple-search");
      freeWord = params.freeWord.split(/[ |　]/).map(function(v) {
        return RegExp("" + v);
      });
      query.$and = [];
      $or = [];
      for (i = j = 0, len = freeWord.length; j < len; i = ++j) {
        value = freeWord[i];
        if (value) {
          $or = [];
          $or.push({
            'cardName.jpn': value
          });
          $or.push({
            rulesText: value
          });
          $or.push({
            expansion: value
          });
          $or.push({
            cardType: value
          });
          $or.push({
            subtype: value
          });
          $or.push({
            supertype: value
          });
          query.$and.push({
            $or: $or
          });
        }
      }
    } else if (Object.keys(params).length) {
      logger.info("serverSide: advanced-search");
      query.$and = [];
      if (params.color != null) {
        query.$and.push({
          color: {
            $in: params.color
          }
        });
      }
      ref2 = (ref = (ref1 = params.card_name) != null ? ref1.split(/[ |　]/) : void 0) != null ? ref : [];
      for (i = k = 0, len1 = ref2.length; k < len1; i = ++k) {
        value = ref2[i];
        if (value) {
          query.$and.push({
            'cardName.jpn': {
              $in: [RegExp("" + value)]
            }
          });
        }
      }
      ref5 = (ref3 = (ref4 = params.rule_text) != null ? ref4.split(/[ |　]/) : void 0) != null ? ref3 : [];
      for (i = l = 0, len2 = ref5.length; l < len2; i = ++l) {
        value = ref5[i];
        if (value) {
          query.$and.push({
            rulesText: {
              $in: [RegExp("" + value)]
            }
          });
        }
      }
      if (params.expansion != null) {
        query.$and.push({
          expansion: {
            $in: params.expansion
          }
        });
      }
      if (params.card_type != null) {
        query.$and.push({
          cardType: {
            $in: params.card_type
          }
        });
      }
      if (params.subtype != null) {
        query.$and.push({
          subtype: {
            $in: params.subtype
          }
        });
      }
      if (params.supertype != null) {
        query.$and.push({
          supertype: {
            $in: params.supertype
          }
        });
      }
    }
    logger.info("params: " + JSON.stringify(params));
  } else {
    logger.info("serverSide: no-search");
  }
  if (req.body.sort) {
    __.each(req.body.sort, function(param, index, array) {
      sortQuery[colMap[param.field]] = param.direction === 'asc' ? 1 : -1;
      if (param.field === 'mc') {
        sortQuery.colorSort = 1;
        return sortQuery.manaCost = 1;
      }
    });
  }
  sortQuery.generalId = 1;
  return CardInfoModel.count(query, function(err, count) {
    var aggregation;
    a.total = count;
    aggregation = [
      {
        $match: query
      }, {
        $sort: sortQuery
      }, {
        $project: select
      }, {
        $limit: Number(req.body.limit) + Number(req.body.offset)
      }, {
        $skip: Number(req.body.offset)
      }
    ];
    return CardInfoModel.aggregate(aggregation, function(err, data) {
      var aJson, recid, types;
      logger.debug(JSON.stringify(aggregation, null, '    '));
      types = '';
      recid = Number(req.body.offset);
      __.each(data, function(record) {
        record.recid = ++recid;
        if (record.cl.length === 1) {
          if (record.cl[0]) {
            record.style = styleMap[record.cl[0]];
          } else {
            if (~record.ty.indexOf('土地')) {
              record.style = styleMap['土地'];
            } else if (~record.ty.indexOf('アーティファクト')) {
              record.style = styleMap['アーティファクト'];
            } else {
              logger.info('style set arien bunki');
            }
          }
        } else {
          record.style = styleMap['多色'];
        }
        return records.push(record);
      });
      a.records = records;
      aJson = JSON.stringify(a);
      return res.send(aJson);
    });
  });
});

module.exports = router;
