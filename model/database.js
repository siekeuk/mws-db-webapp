var dbConfig = require('config').prop.db;
var mongo = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var logger = require('../lib/logger');

// MongoDBに接続
var db = {
	conn : function(db) {
		var uri = 'mongodb://'+dbConfig.user+':'+dbConfig.pass+'@'+dbConfig.host+'/' + db;
		mongo.connect(uri);
		autoIncrement.initialize(mongo.connection); // 連番を扱う場合のみ

		// 接続イベントを利用してログ出力
		mongo.connection.on('connected', function() {
			logger.debug('mongoose URI locates ' + 'mongodb://'+dbConfig.dbHost+'/' + db);
		});
	}
};

module.exports = db;
