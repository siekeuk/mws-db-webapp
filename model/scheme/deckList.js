var mongo = require('mongoose');
var cardInfo = {"expansion" : String,
                 "cardName" : {"jpn" : String,
                               "eng" : String},
                    "color" : [ String ],
                 "manaCost" : String,
                "supertype" : [ String ],
                 "cardType" : [ String ],
                  "subtype" : [ String ],
                "typesLine" : String,
                    "count" : Number,
                 "category" : String };

var DeckInfo = {
  "deckNo"      : Number,
  "deckName"    : String,
  "uploader"    : {type : String, 'default': '名も無きプレインズウォーカー'},
  "releaseDate" : String,
  "editKey"     : String,
  "delFlg"      : {type : String, 'default': '0'},
  "ipAddress"   : String,
  "deck": [new mongo.Schema({
      "comment"     : {type : String, 'default': ''},
      "updateDate": {type: Date, 'default': Date.now },
      "cardInfo": [new mongo.Schema(cardInfo, {_id: false} )] }, { _id: false})],
};

module.exports = DeckInfo;
