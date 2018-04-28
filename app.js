var config = require('config');
var express = require('express');
var path = require('path');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ECT = require('ect'); //add ect
var ectRenderer = ECT({ watch: true, root: __dirname + '/views', ext : '.ect' }); //add ect
var logger = require('./lib/logger');

//mongooseの読み込み
var mongoose = require('mongoose');
// Modelの設定
var db = require('./model/database');
db.conn(config.prop.db.database);

var routes = require('./routes/index');
var card = require('./routes/card');
var search = require('./routes/search');
var deck = require('./routes/deck');
var getData = require('./routes/get-data');
var putData = require('./routes/put-data');

var app = express();

// view engine setup
app.engine('ect', ectRenderer.render); //modified ect
app.set('view engine', 'ect'); //modified ect
app.use(compression());
app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({limit: '1mb', extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger.accessConfig);

// 第一引数はURI
app.use('/', routes);
app.use('/card', card);
app.use('/search', search);
app.use('/deck', deck);
app.use('/get-data', getData);
app.use('/put-data', putData);


/// error handlers
resObj = {
  env: process.env.NODE_ENV,
  message: '',
  error: null
};

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// development error handler
// will print stacktrace
if (process.env.NODE_ENV === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        resObj.message = err.message;
        resObj.error = err;
        logger.debug(resObj);
        res.render('error', resObj);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    resObj.message = err.message;
    resObj.error = {};
    res.render('error', resObj);
});


module.exports = app;
