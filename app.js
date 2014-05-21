 

/**

 * Module dependencies.

 */



var express = require('express')

  , http = require('http')

  , path = require('path');


var morgan  = require('morgan');
var cookieParser = require('cookie-parser');
var session       = require('express-session');
var bodyParser = require('body-parser');
var directory = require('serve-index');
var serveStatic = require('serve-static');
var errorhandler = require('errorhandler')
var favicon = require('serve-favicon');

var app = express();

var server =http.createServer(app);



// all environments

//Basic

app.set('port', 8000);

//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(morgan({ format: 'dev', immediate: true }));

app.use(cookieParser('great_secret_key'));

app.use(session({secret: 'key', name: 'sid', cookie: { secure: true }}));

app.use(express.query());

app.use(bodyParser());

//app.use(express.methodOverride());



//public & static

app.use(serveStatic(path.join(__dirname, 'static'), {'index': ['default.html', 'default.htm','index.html','index.htm']}));

app.use('/public',directory(path.join(__dirname,'public'), {'icons': true}));

app.use('/public',serveStatic(path.join(__dirname,'public'))) ;



//Path Loader

var loader = require('./routeloader');

app.use(loader.loadpath('./Controllers'));



// development only

if (process.env.NODE_ENV === 'development') {
    app.use(errorhandler())
}



server.listen(app.get('port'), function(){

  console.log('Express 正运行于' + app.get('port')+'端口') ;

}); 
