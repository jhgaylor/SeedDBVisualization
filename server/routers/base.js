var BaseRouter = require('express').Router();

BaseRouter.route('/')
  .get(function (req, res) {
    // serve the SPA
    var data = {};
    res.render('index.jade', data);
  });

module.exports = BaseRouter;
