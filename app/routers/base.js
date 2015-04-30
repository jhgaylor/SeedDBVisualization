var BaseRouter = require('express').Router();

BaseRouter.route('/')
  .get(function (req, res) {
    // serve the SPA
  });

module.exports = BaseRouter;
