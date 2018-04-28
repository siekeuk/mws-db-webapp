var log4js = require('log4js');
var config = require('config');
log4js.configure(config.log4js);

var logger = log4js.getLogger();

// expressに渡すアクセスログ設定
exports.accessConfig = log4js.connectLogger(
  logger, {
  level : log4js.levels.INFO,
  'format' : ':remote-addr - - ":method :url HTTP/:http-version" :status :content-length ":referrer" ":user-agent"'
});

// アプリケーションログ
exports.info = function(InStr){
  logger.info(InStr);
};
//アプリケーションログ（デバッグ）
exports.debug = function(InStr){
  logger.debug(InStr);
};

// エラーログ（警告レベル）
exports.warn = function(InStr){
  logger.warn(InStr);
};
// エラーログ（エラーレベル）
exports.error = function(InStr){
  logger.error(InStr);
};
// エラーログ（緊急レベル）
exports.fatal = function(InStr){
  logger.fatal(InStr);
};