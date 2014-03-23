### a router loader middleware for express.js ###
- - -
####code reside in routeloader folder
#####require express.js and sugar.js
- - -
```
 just load it like this
 > var express = require('express')
 > var app = express();
 >
 > var loader = require('./routeloader');
 > //load a directory
 > app.use(loader.loadpath('./Controllers'));
 ```

 ok
 
 then 
 
 under Controllers dir
 you may have a file like this
```
 //test1.js
 exports.hello=function(a,b){
    return parseInt(a)+parseInt(b);
};
exports.str=function(){
    return 'school';
}
```
 

and here we go
light up your app and vist this url http://host/[filename]/[methodname]
```
http://localhost/test1/hello
```
