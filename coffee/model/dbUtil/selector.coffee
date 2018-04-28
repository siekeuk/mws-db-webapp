logger = require('../../lib/logger');
mongoose = require('mongoose');
cardInfoModel = require('../cardInfo.js');
DeckListModel = require('../deckList.js');
__ = require('underscore');
config = require('config');
moment = require("moment");

# 共通JS変数
latestReleaseDate = config.releaseDate[0];

# 半角チェッカー　どっかべつのとこうつそう
regHan = /^[a-zA-Z0-9 -/:-@\[-\`\{-\~]+$/;

dbSlector =

  #####################################################
  resCardInfo: (req, res) ->

    res.contentType('application/json');

    resModel = {};
    select =
      _id: 0
      expansion: 1
      cardName: 1
      color: 1
      manaCost: 1
      typesLine: 1
      rulesText: 1
      flavorText: 1
      convertedManaCost: 1
      supertype: 1
      cardType: 1
      subtype: 1
      powTouLoyLine: 1
      rarityLine: 1
      expansionLine: 1
      releaseDate: 1

    query = {};
    query.releaseDate = req.params.releaseDate;
    query.expansion = req.params.expansion;
    qName = if ~req.params.cardName.search(/^[a-zA-Z0-9 ]{2,}/) then 'cardName.eng' else 'cardName.jpn'
    query[qName] = req.params.cardName;

    cardInfoModel.findOne query, select, (err, data) ->
      if data
        resJson = JSON.stringify(data);
        res.send(resJson);
      else
        res.send JSON.stringify
          message: req.params.cardName + " がない",
          error: {},

  #####################################################
  resSubtype: (req, res) ->

    res.contentType('application/json')

    aggregation = [
      {$match:
        releaseDate: latestReleaseDate}
      {$unwind: '$subtype'}
      {$group:
        _id: '$subtype'}
      {$sort:
        _id: 1}
    ]
    cardInfoModel.aggregate aggregation, (err, data) ->
      subtype = [];
      __.each data, (record) ->
        subtype.push(record._id);

      resJson = JSON.stringify(subtype)
      res.send(resJson)

  #####################################################
  resSupertype: (req, res) ->

    res.contentType('application/json');

    aggregation = [
      {$match:
        releaseDate: latestReleaseDate}
      {$unwind: '$supertype'}
      {$group:
        _id: '$supertype'}
      {$sort:
        _id: 1}
    ]
    cardInfoModel.aggregate aggregation, (err, data) ->
      supertype = [];
      __.each data, (record) ->
        supertype.push(record._id);

      resJson = JSON.stringify(supertype);
      res.send(resJson);

  #####################################################
  resCardType: (req, res) ->

    res.contentType('application/json');

    aggregation = [
      {$match:
        releaseDate: latestReleaseDate}
      {$unwind: '$cardType'}
      {$group:
        _id: '$cardType'}
      {$sort:
        _id: 1}
    ]
    cardInfoModel.aggregate aggregation, (err, data) ->
      cardType = [];
      __.each data, (record) ->
        cardType.push(record._id);

      resJson = JSON.stringify(cardType);
      res.send(resJson);

  #####################################################
  resExpansion: (req, res) ->

    res.contentType('application/json');

    aggregation = [
      {$match:
        releaseDate: latestReleaseDate}
      {$group:
        _id: '$expansion'}
    ]
    resExpansion = JSON.parse(JSON.stringify(config.expansion));
    cardInfoModel.aggregate aggregation, (err, data) ->
      __.each data, (record) ->
        resExpansion[record._id] = "[#{record._id}] #{resExpansion[record._id]}";

      __.each resExpansion, (value, key) ->
        if (value.indexOf('['))
          delete resExpansion[key];

      resJson = JSON.stringify(resExpansion);
      res.send(resJson);

  #####################################################
  resDeckInfo: (req, res) ->

    res.contentType('application/json');

    aggregation = [
      {$match:
        releaseDate: req.params['releaseDate']
        deckNo: Number(req.params['deckNo'])}
      {$unwind: '$deck'}
      {$group:
        _id: '$deckNo'
        deckNo:
          $first: '$deckNo'
        deckName:
          $first: '$deckName'
        uploader:
          $first: '$uploader'
        comment:
          $last: '$deck.comment'
        latestDeck:
          $last: '$deck.updateDate'
        deck:
          $last: '$deck'}
      ]

    DeckListModel.aggregate aggregation, (err, result) ->
      if result
        resJson = JSON.stringify(result[0]);
        res.send(resJson);
      else
        err.status = 404;
        res.send
          message: err.message,
          error: {},

  #####################################################
  downloadDeckData: (req, res) ->

    res.contentType('application/json');

    logger.debug('req.body:\n'+console.dir(req.body));

    aggregation = [
      {$match:
        releaseDate: req.body['releaseDate']
        deckNo: Number(req.body['deckNo'])}
      {$unwind: '$deck'}
      {$group:
        _id: '$deckNo',
        deckName:
          $first: '$deckName',
        deck:
          $last: '$deck'}
    ]

    logger.debug('aggregation:\n'+JSON.stringify(aggregation, null, '    '));

    DeckListModel.aggregate aggregation, (err, result) ->
      if (result)
        resDeckDataString = """
        // Deck file for Magic Workstation (http://www.magicworkstation.com)


        """
        mwsString =
          Lands: '',
          Creatures: '',
          Spells: '',
          Sideboard: '',

        # category, count, expansion, cardName.eng
        cardInfoAry = result[0].deck.cardInfo;
        deckName = result[0].deckName + ".mwDeck";
        for value,i in cardInfoAry
          cardTextLine = '\t'
          cardTextLine += if value.category is 'Sideboard' then 'SB: ' else ''
          cardTextLine += value.count
          cardTextLine += ' '
          cardTextLine += "[#{value.expansion}]"
          cardTextLine += ' '
          cardTextLine += value.cardName.eng
          cardTextLine += '\n'
          mwsString[value.category] += cardTextLine;

        for key,value of mwsString
          resDeckDataString += "// #{key}\n"
          resDeckDataString += value + '\n'

        res.send JSON.stringify {deckName: deckName, mwsDeckData: resDeckDataString};
      else
        err.status = 404;
        res.send
          message: err.message,
          error: {}

  #####################################################
  putDeckInfo: (req, res) ->
    logger.debug('start... /put-data/deck/entry');
    logger.debug ('req.body:\r\n'+JSON.stringify(req.body, null, '    '))

    res.contentType('application/json');

    deckOne = req.body.deck.shift()
    deckListModel = new DeckListModel();
    deckListModel.deckName = req.body.deckName || '名も無き呪文書';
    deckListModel.uploader = req.body.uploader || '名も無きプレインズウォーカー';
    if req.headers['x-forwarded-for']
      deckListModel.ipAddress = req.headers['x-forwarded-for']
    else if req.connection and req.connection.remoteAddress
      deckListModel.ipAddress = req.connection.remoteAddress
    else if req.connection.socket and req.connection.socket.remoteAddress
      deckListModel.ipAddress = req.connection.socket.remoteAddress
    else if req.socket and req.socket.remoteAddress
      deckListModel.ipAddress = req.socket.remoteAddress
    else
      deckListModel.ipAddress = '0.0.0.0'
    deckListModel.releaseDate = req.body.releaseDate || latestReleaseDate;
    deckListModel.editKey = req.body.editKey;
    deckListModel.deck.push(deckOne);

    whereQuery =
      releaseDate: deckListModel.releaseDate,
      deckNo: Number(req.body.deckNo),
      editKey: req.body.editKey,


    logger.debug whereQuery
    logger.debug deckListModel.delFlg

    aJson =
      message: 'no message',
      result: 'still'

    # deckNoが非数ならば新規登録のためそのままsaveしちゃう！
    if  isNaN(whereQuery.deckNo)

      deckListModel.save (err) ->
        if err
          aJson.result = 'error';
          aJson.error = err;
          aJson.message = 'なんかエラーやって'
        else
          aJson.result = 'success';
          aJson.message = '登録完了！'
          aJson.deckNo = deckListModel.deckNo

        res.send(JSON.stringify(aJson));

    else

      DeckListModel.findOne whereQuery, (err, dlModel) ->

        unless err

          if dlModel

            #削除するのにdeckDataつめても意味ないので
            unless req.body.delFlg
              logger.debug('update desu')
              dlModel.deckName = deckListModel.deckName
              dlModel.uploader = deckListModel.uploader
              dlModel.deck.push(deckOne);

            else
              logger.debug('delete desu')
              dlModel.delFlg = req.body.delFlg

            dlModel.save (err) ->

              if err
                aJson.message = 'なんかエラーやって'
                aJson.result = 'error';

              else
                aJson.result = 'success';
                aJson.deckNo = whereQuery.deckNo
                aJson.delFlg = dlModel.delFlg

                if (req.body.delFlg)
                  aJson.message = '削除完了！'

                else
                  aJson.message = '更新完了！'

              res.send(JSON.stringify(aJson));

          else
            logger.debug('DeckListModel.findOne結果 false')
            aJson.result = 'error';
            aJson.message = 'なんか更新できんかった'
            aJson.error = 'たぶんeditkeyがまちがってる';
            res.send(JSON.stringify(aJson));

        else
          logger.debug('error findOne: ' + err);
          aJson.result = 'error';
          aJson.error = err;
          res.send JSON.stringify aJson

  getDeckList: (req, res) ->

    res.contentType('application/json');

    aggregation = [
      {$match:
        delFlg: '0'}
      {$unwind: "$deck"}
      {$group:
        _id: "$deckNo",
        deckName:
          $first: "$deckName"
        uploader:
          $first: "$uploader"
        releaseDate:
          $first: "$releaseDate"
        deckNo:
          $first: "$deckNo"
        firstEntry:
          $first: "$deck.updateDate"
        lastUpdated:
          $last: "$deck.updateDate"}
      {$sort:
        releaseDate:-1
        lastUpdated: -1}
    ]

    DeckListModel.aggregate aggregation, (err, result) ->
      resJson = {records : [], tortal : Number};

      if err
        logger.debug err;
        return;

      __.each result, (obj, idx) ->
        obj.recid = idx+1;
        obj.firstEntry = moment(obj.firstEntry).format("YYYY/MM/DD HH:mm")
        obj.lastUpdated = moment(obj.lastUpdated).format("YYYY/MM/DD HH:mm")

        if obj.firstEntry is obj.lastUpdated
          obj.lastUpdated = null;

        resJson.records.push(obj);

      resJson.total = resJson.records.length;
      aJson = JSON.stringify(resJson);
      res.send(aJson);


module.exports = dbSlector;
