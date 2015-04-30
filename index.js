// bootstrap the express application
var express = require('express');

// import the routers
var BaseRouter = require('./server/routers/base');
var APIRouter = require('./server/routers/api');
// console.log(BaseRouter, APIRouter);
// instantiate express
var app = express();

// grab a logging library
var logger = require('morgan');

// for json body parsing
var bodyParser = require('body-parser');

// use a templating engine
app.set('view engine', 'jade');

// configure template location
app.set('views', './client/templates')

// bind the logger to the express app
app.use(logger("dev", {}));

// bind the routers at the appropriate url
app.use('/', BaseRouter);
app.use('/api', APIRouter);

// serve static assets
app.use('/static', express.static('static'));

// give the environment a chance to set the port explicitly or default to 3000
var PORT = 3000;

// start up the server
var server = app.listen( PORT, function () {
  console.log("Listening: "+server.address().port)
});
