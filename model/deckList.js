// Modelでもmongooseを読み込みます
var mongo = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var deckList = require('./scheme/deckList')

var deckListSchema = new mongo.Schema(deckList, {
  collection: 'deckList'
});
deckListSchema.plugin(autoIncrement.plugin, {
  model: 'deckList',
  field: 'deckNo',
  startAt: 10000,
  incrementBy: 1
}); // 連番IDを使う場合のみ

module.exports = mongo.model('deckList', deckListSchema);
