express = require('express');
router = express.Router();
config = require('config');
logger = require('../lib/logger');
dbSelector = require('../model/dbUtil/selector.js');

articleProvider = require('../model/dbUtil/selector.js');

resModel = {};
title = config.resData.title;
keywords = config.resData.keywords;

# 共通JS変数
resModel = config.resData;
resModel.releaseDate = config.releaseDate;
latestReleaseDate = config.releaseDate[0];


# URI: /blog
router.get '/', (req, res) ->
  articleProvider.findAll (error, docs) ->
    res.render 'index.jade',
      locals:
        title: 'Blog',
        articles:docs


# URI: /blog
router.get '/blog/new', (req, res) ->
  res.render 'blog_new.jade', locals: title: 'New Post'


# URI: /blog/new
router.post '/blog/new', (req, res) ->
  articleProvider.save
    title: req.param('title'),
    body: req.param('body')
  , (error, docs) ->
    res.redirect('/')


# URI: /blog/:id
router.get '/blog/:id', (req, res) ->
  articleProvider.findById req.params.id, (error, article) ->
    res.render 'blog_show.jade',
    locals:
      title: article.title,
      article:article


# URI: /blog/addComment
router.post '/blog/addComment', (req, res) ->
  articleProvider.addCommentToArticle req.param('_id'),
    person: req.param('person'),
    comment: req.param('comment'),
    created_at: new Date()
  , (error, docs) ->
    res.redirect '/blog/' + req.param('_id')


module.exports = router;
