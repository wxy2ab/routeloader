 

/**

 * Module dependencies.

 */



var express = require('express')

  , http = require('http')

  , path = require('path');



var app = express();

var server =http.createServer(app);



// all environments

//Basic

app.set('port', 8000);

app.use(express.favicon());

app.use(express.logger('dev'));

app.use(express.cookieParser('great_secret_key'));

app.use(express.session({secret: 'key'}));

app.use(express.query());

app.use(express.bodyParser());

//app.use(express.methodOverride());



//public & static

app.use(express.static(path.join(__dirname, 'static')));

app.use('/public',express.directory(path.join(__dirname,'public')));

app.use('/public',express.static(path.join(__dirname,'public'))) ;



//Path Loader

var loader = require('./routeloader');

app.use(loader.loadpath('./Controllers'));



// development only

if ('development' == app.get('env')) {

  app.use(express.errorHandler());

}



server.listen(app.get('port'), function(){

  console.log('Express 正运行于' + app.get('port')+'端口') ;

}); 
