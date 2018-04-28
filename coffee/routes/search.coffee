express = require('express');
router = express.Router();
config = require('config');
__ = require('underscore');
logger = require('../lib/logger');
CardInfoModel = require('../model/cardInfo.js');

resModel = {};

router.post '/', (req, res) ->

  res.contentType('application/json');

  records = []
  a =
    "total" : 0,
    "records" : []

  colMap =
    ex : "expansion",
    cn : "cardName.jpn",
    cl : "colorSort",
    mc : "convertedManaCost",
    pt : "powTouLoyLine",
    ty : "typesLine"

  select =
    _id : 0,
    ex : "$expansion",
    cn : "$cardName.jpn",
    cl : "$color",
    mc : "$manaCost",
    pt : "$powTouLoyLine",
    ty : "$typesLine"

  query = 'releaseDate' : config.releaseDate[0]
  sortQuery = {};
  word = '';
  postData = {};

  styleMap =
    'W' : 'background-color:#F9F7F7;',
    'U' : 'background-color:#B5DCF1;',
    'B' : 'background-color:#B6ADAC;',
    'R' : 'background-color:#F6AC97;',
    'G' : 'background-color:#CFE1D8;',
    'Lnd' : 'background-color:#E9D3BA;',
    'Art' : 'background-color:#DCDDDF;',
    'Multi' : 'background-color:#FAF190;',

  action = req.body.action;

  params = req.body.param;
  # 検索パラメータがあれば
  logger.debug("body is ...");
  logger.debug(JSON.stringify(req.body));
  if params

    if params.freeWord or params.freeWord is ''

      logger.info("serverSide: simple-search");

      freeWord = params.freeWord.split(/[ |　]/).map (v) -> ///#{v}///;
      query.$and = [];
      $or = [];

      # 検索文字列
      for value,i in freeWord
        if value
          $or = [];
          $or.push({'cardName.jpn':value});
          $or.push({rulesText:value});
          $or.push({expansion:value});
          $or.push({cardType:value});
          $or.push({subtype:value});
          $or.push({supertype:value});
          query.$and.push $or: $or

    else if Object.keys(params).length
      logger.info("serverSide: advanced-search");

      query.$and = [];

      # color ----------------------------------------------------
      if params.color?
        query.$and.push({color:{$in: params.color}});

      # cardname ----------------------------------------------------
      for value, i in params.card_name?.split(/[ |　]/) ? []
        if value then query.$and.push({'cardName.jpn':{$in: [///#{value}///]}});

      # ruleText ----------------------------------------------------
      for value, i in params.rule_text?.split(/[ |　]/) ? []
        if value then query.$and.push({rulesText:{$in: [///#{value}///]}});

      # expansion ----------------------------------------------------
      if params.expansion?
        query.$and.push({expansion:{$in: params.expansion}});

      # cardType ----------------------------------------------------
      if params.card_type?
        query.$and.push({cardType:{$in: params.card_type}});

      # subtype ----------------------------------------------------
      if params.subtype?
        query.$and.push({subtype:{$in: params.subtype}});

      # supertype ----------------------------------------------------
      if params.supertype?
        query.$and.push({supertype:{$in: params.supertype}});

    logger.info("params: "+JSON.stringify(params));

  else
    logger.info("serverSide: no-search");


  # ソートの指定

  if req.body.sort
    # ソート指定
    __.each req.body.sort, (param, index, array) ->
      sortQuery[colMap[param.field]] = if param.direction is 'asc' then 1 else -1;
      if param.field is 'mc'
        sortQuery.colorSort = 1;
        sortQuery.manaCost = 1;

  sortQuery.generalId = 1;

  CardInfoModel.count query, ( err, count) ->

    a.total = count;
    aggregation = [
      {$match: query}
      {$sort: sortQuery}
      {$project: select}
      {$limit: Number(req.body.limit)+Number(req.body.offset)}
      {$skip: Number(req.body.offset)}
    ]


    CardInfoModel.aggregate aggregation , (err, data) ->
      logger.debug JSON.stringify aggregation, null, '    '
      types = '';
      recid = Number(req.body.offset);
      __.each data, (record) ->
        record.recid = ++recid;
        firstColor = record.cl[0]
        if record.cl.length is 1
          if firstColor
            record.style = styleMap[firstColor];
          else
            if ~record.ty.indexOf('土地')
              record.style = styleMap.lnd;
            else if(~record.ty.indexOf('アーティファクト'))
              record.style = styleMap.art;
            else
              logger.info('style set arien bunki')
        else
          record.style = styleMap.multi;
        records.push(record);
      a.records = records;
      aJson = JSON.stringify(a);
      res.send(aJson);

module.exports = router;
