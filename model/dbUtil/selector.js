var DeckListModel, __, cardInfoModel, config, dbSlector, latestReleaseDate, logger, moment, mongoose, regHan;

logger = require('../../lib/logger');

mongoose = require('mongoose');

cardInfoModel = require('../cardInfo.js');

DeckListModel = require('../deckList.js');

__ = require('underscore');

config = require('config');

moment = require("moment");

latestReleaseDate = config.releaseDate[0];

regHan = /^[a-zA-Z0-9 -\/:-@\[-\`\{-\~]+$/;

dbSlector = {
  resCardInfo: function(req, res) {
    var qName, query, resModel, select;
    res.contentType('application/json');
    resModel = {};
    select = {
      _id: 0,
      expansion: 1,
      cardName: 1,
      color: 1,
      manaCost: 1,
      typesLine: 1,
      rulesText: 1,
      flavorText: 1,
      convertedManaCost: 1,
      supertype: 1,
      cardType: 1,
      subtype: 1,
      powTouLoyLine: 1,
      rarityLine: 1,
      expansionLine: 1,
      releaseDate: 1
    };
    query = {};
    query.releaseDate = req.params.releaseDate;
    query.expansion = req.params.expansion;
    qName = ~req.params.cardName.search(/^[a-zA-Z0-9 ]{2,}/) ? 'cardName.eng' : 'cardName.jpn';
    query[qName] = req.params.cardName;
    return cardInfoModel.findOne(query, select, function(err, data) {
      var resJson;
      if (data) {
        resJson = JSON.stringify(data);
        return res.send(resJson);
      } else {
        return res.send(JSON.stringify({
          message: req.params.cardName + " がない",
          error: {}
        }));
      }
    });
  },
  resSubtype: function(req, res) {
    var aggregation;
    res.contentType('application/json');
    aggregation = [
      {
        $match: {
          releaseDate: latestReleaseDate
        }
      }, {
        $unwind: '$subtype'
      }, {
        $group: {
          _id: '$subtype'
        }
      }, {
        $sort: {
          _id: 1
        }
      }
    ];
    return cardInfoModel.aggregate(aggregation, function(err, data) {
      var resJson, subtype;
      subtype = [];
      __.each(data, function(record) {
        return subtype.push(record._id);
      });
      resJson = JSON.stringify(subtype);
      return res.send(resJson);
    });
  },
  resSupertype: function(req, res) {
    var aggregation;
    res.contentType('application/json');
    aggregation = [
      {
        $match: {
          releaseDate: latestReleaseDate
        }
      }, {
        $unwind: '$supertype'
      }, {
        $group: {
          _id: '$supertype'
        }
      }, {
        $sort: {
          _id: 1
        }
      }
    ];
    return cardInfoModel.aggregate(aggregation, function(err, data) {
      var resJson, supertype;
      supertype = [];
      __.each(data, function(record) {
        return supertype.push(record._id);
      });
      resJson = JSON.stringify(supertype);
      return res.send(resJson);
    });
  },
  resCardType: function(req, res) {
    var aggregation;
    res.contentType('application/json');
    aggregation = [
      {
        $match: {
          releaseDate: latestReleaseDate
        }
      }, {
        $unwind: '$cardType'
      }, {
        $group: {
          _id: '$cardType'
        }
      }, {
        $sort: {
          _id: 1
        }
      }
    ];
    return cardInfoModel.aggregate(aggregation, function(err, data) {
      var cardType, resJson;
      cardType = [];
      __.each(data, function(record) {
        return cardType.push(record._id);
      });
      resJson = JSON.stringify(cardType);
      return res.send(resJson);
    });
  },
  resExpansion: function(req, res) {
    var aggregation, resExpansion;
    res.contentType('application/json');
    aggregation = [
      {
        $match: {
          releaseDate: latestReleaseDate
        }
      }, {
        $group: {
          _id: '$expansion'
        }
      }
    ];
    resExpansion = JSON.parse(JSON.stringify(config.expansion));
    return cardInfoModel.aggregate(aggregation, function(err, data) {
      var resJson;
      __.each(data, function(record) {
        return resExpansion[record._id] = "[" + record._id + "] " + resExpansion[record._id];
      });
      __.each(resExpansion, function(value, key) {
        if (value.indexOf('[')) {
          return delete resExpansion[key];
        }
      });
      resJson = JSON.stringify(resExpansion);
      return res.send(resJson);
    });
  },
  resDeckInfo: function(req, res) {
    var aggregation;
    res.contentType('application/json');
    aggregation = [
      {
        $match: {
          releaseDate: req.params['releaseDate'],
          deckNo: Number(req.params['deckNo'])
        }
      }, {
        $unwind: '$deck'
      }, {
        $group: {
          _id: '$deckNo',
          deckNo: {
            $first: '$deckNo'
          },
          deckName: {
            $first: '$deckName'
          },
          uploader: {
            $first: '$uploader'
          },
          comment: {
            $last: '$deck.comment'
          },
          latestDeck: {
            $last: '$deck.updateDate'
          },
          deck: {
            $last: '$deck'
          }
        }
      }
    ];
    return DeckListModel.aggregate(aggregation, function(err, result) {
      var resJson;
      if (result) {
        resJson = JSON.stringify(result[0]);
        return res.send(resJson);
      } else {
        err.status = 404;
        return res.send({
          message: err.message,
          error: {}
        });
      }
    });
  },
  downloadDeckData: function(req, res) {
    var aggregation;
    res.contentType('application/json');
    logger.debug('req.body:\n' + console.dir(req.body));
    aggregation = [
      {
        $match: {
          releaseDate: req.body['releaseDate'],
          deckNo: Number(req.body['deckNo'])
        }
      }, {
        $unwind: '$deck'
      }, {
        $group: {
          _id: '$deckNo',
          deckName: {
            $first: '$deckName'
          },
          deck: {
            $last: '$deck'
          }
        }
      }
    ];
    logger.debug('aggregation:\n' + JSON.stringify(aggregation, null, '    '));
    return DeckListModel.aggregate(aggregation, function(err, result) {
      var cardInfoAry, cardTextLine, deckName, i, j, key, len, mwsString, resDeckDataString, value;
      if (result) {
        resDeckDataString = "// Deck file for Magic Workstation (http://www.magicworkstation.com)\n\n";
        mwsString = {
          Lands: '',
          Creatures: '',
          Spells: '',
          Sideboard: ''
        };
        cardInfoAry = result[0].deck.cardInfo;
        deckName = result[0].deckName + ".mwDeck";
        for (i = j = 0, len = cardInfoAry.length; j < len; i = ++j) {
          value = cardInfoAry[i];
          cardTextLine = '\t';
          cardTextLine += value.category === 'Sideboard' ? 'SB: ' : '';
          cardTextLine += value.count;
          cardTextLine += ' ';
          cardTextLine += "[" + value.expansion + "]";
          cardTextLine += ' ';
          cardTextLine += value.cardName.eng;
          cardTextLine += '\n';
          mwsString[value.category] += cardTextLine;
        }
        for (key in mwsString) {
          value = mwsString[key];
          resDeckDataString += "// " + key + "\n";
          resDeckDataString += value + '\n';
        }
        return res.send(JSON.stringify({
          deckName: deckName,
          mwsDeckData: resDeckDataString
        }));
      } else {
        err.status = 404;
        return res.send({
          message: err.message,
          error: {}
        });
      }
    });
  },
  putDeckInfo: function(req, res) {
    var aJson, deckListModel, deckOne, whereQuery;
    logger.debug('start... /put-data/deck/entry');
    logger.debug('req.body:\r\n' + JSON.stringify(req.body, null, '    '));
    res.contentType('application/json');
    deckOne = req.body.deck.shift();
    deckListModel = new DeckListModel();
    deckListModel.deckName = req.body.deckName || '名も無き呪文書';
    deckListModel.uploader = req.body.uploader || '名も無きプレインズウォーカー';
    if (req.headers['x-forwarded-for']) {
      deckListModel.ipAddress = req.headers['x-forwarded-for'];
    } else if (req.connection && req.connection.remoteAddress) {
      deckListModel.ipAddress = req.connection.remoteAddress;
    } else if (req.connection.socket && req.connection.socket.remoteAddress) {
      deckListModel.ipAddress = req.connection.socket.remoteAddress;
    } else if (req.socket && req.socket.remoteAddress) {
      deckListModel.ipAddress = req.socket.remoteAddress;
    } else {
      deckListModel.ipAddress = '0.0.0.0';
    }
    deckListModel.releaseDate = req.body.releaseDate || latestReleaseDate;
    deckListModel.editKey = req.body.editKey;
    deckListModel.deck.push(deckOne);
    whereQuery = {
      releaseDate: deckListModel.releaseDate,
      deckNo: Number(req.body.deckNo),
      editKey: req.body.editKey
    };
    logger.debug(whereQuery);
    logger.debug(deckListModel.delFlg);
    aJson = {
      message: 'no message',
      result: 'still'
    };
    if (isNaN(whereQuery.deckNo)) {
      return deckListModel.save(function(err) {
        if (err) {
          aJson.result = 'error';
          aJson.error = err;
          aJson.message = 'なんかエラーやって';
        } else {
          aJson.result = 'success';
          aJson.message = '登録完了！';
          aJson.deckNo = deckListModel.deckNo;
        }
        return res.send(JSON.stringify(aJson));
      });
    } else {
      return DeckListModel.findOne(whereQuery, function(err, dlModel) {
        if (!err) {
          if (dlModel) {
            if (!req.body.delFlg) {
              logger.debug('update desu');
              dlModel.deckName = deckListModel.deckName;
              dlModel.uploader = deckListModel.uploader;
              dlModel.deck.push(deckOne);
            } else {
              logger.debug('delete desu');
              dlModel.delFlg = req.body.delFlg;
            }
            return dlModel.save(function(err) {
              if (err) {
                aJson.message = 'なんかエラーやって';
                aJson.result = 'error';
              } else {
                aJson.result = 'success';
                aJson.deckNo = whereQuery.deckNo;
                aJson.delFlg = dlModel.delFlg;
                if (req.body.delFlg) {
                  aJson.message = '削除完了！';
                } else {
                  aJson.message = '更新完了！';
                }
              }
              return res.send(JSON.stringify(aJson));
            });
          } else {
            logger.debug('DeckListModel.findOne結果 false');
            aJson.result = 'error';
            aJson.message = 'なんか更新できんかった';
            aJson.error = 'たぶんeditkeyがまちがってる';
            return res.send(JSON.stringify(aJson));
          }
        } else {
          logger.debug('error findOne: ' + err);
          aJson.result = 'error';
          aJson.error = err;
          return res.send(JSON.stringify(aJson));
        }
      });
    }
  },
  getDeckList: function(req, res) {
    var aggregation;
    res.contentType('application/json');
    aggregation = [
      {
        $match: {
          delFlg: '0'
        }
      }, {
        $unwind: "$deck"
      }, {
        $group: {
          _id: "$deckNo",
          deckName: {
            $first: "$deckName"
          },
          uploader: {
            $first: "$uploader"
          },
          releaseDate: {
            $first: "$releaseDate"
          },
          deckNo: {
            $first: "$deckNo"
          },
          firstEntry: {
            $first: "$deck.updateDate"
          },
          lastUpdated: {
            $last: "$deck.updateDate"
          }
        }
      }, {
        $sort: {
          releaseDate: -1,
          lastUpdated: -1
        }
      }
    ];
    return DeckListModel.aggregate(aggregation, function(err, result) {
      var aJson, resJson;
      resJson = {
        records: [],
        tortal: Number
      };
      if (err) {
        logger.debug(err);
        return;
      }
      __.each(result, function(obj, idx) {
        obj.recid = idx + 1;
        obj.firstEntry = moment(obj.firstEntry).format("YYYY/MM/DD HH:mm");
        obj.lastUpdated = moment(obj.lastUpdated).format("YYYY/MM/DD HH:mm");
        if (obj.firstEntry === obj.lastUpdated) {
          obj.lastUpdated = null;
        }
        return resJson.records.push(obj);
      });
      resJson.total = resJson.records.length;
      aJson = JSON.stringify(resJson);
      return res.send(aJson);
    });
  }
};

module.exports = dbSlector;
