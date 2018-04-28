// Modelでもmongooseを読み込みます
var mongo = require( 'mongoose' );
var cardInfo = require('./scheme/cardInfo');

var cardInfoSchema = new mongo.Schema(cardInfo, { collection: 'cardInfo'});

module.exports = mongo.model('cardInfo', cardInfoSchema);
