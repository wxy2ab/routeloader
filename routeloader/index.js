/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-24
 * Time: 下午3:26
 * To change this template use File | Settings | File Templates.
 */
require('sugar');
var path = require('path');
var url=require('url');
var loadedlist={};
var xmlcheck=/<[a-z][\s\S]*>/i;
var _root=null;

function json2xml(o, tab) {
    var toXml = function(v, name, ind) {
        var xml = "";
        if (v instanceof Array) {
            for (var i=0, n=v.length; i<n; i++)
                xml += ind + toXml(v[i], name, ind+"\t") + "\n";
        }
        else if (typeof(v) == "object") {
            var hasChild = false;
            xml += ind + "<" + name;
            for (var m in v) {
                if (m.charAt(0) == "@")
                    xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
                else
                    hasChild = true;
            }
            xml += hasChild ? ">" : "/>";
            if (hasChild) {
                for (var m1 in v) {
                    if (m1 == "#text")
                        xml += v[m1];
                    else if (m1 == "#cdata")
                        xml += "<![CDATA[" + v[m1] + "]]>";
                    else if (m1.charAt(0) != "@")
                        xml += toXml(v[m1], m1, ind+"\t");
                }
                xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
            }
        }
        else {
            xml += ind + "<" + name + ">" + v.toString() +  "</" + name + ">";
        }
        return xml;
    }, xml="";
    for (var m in o) {
        xml += toXml(o[m], m, "");
    }
    return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
}

//process return value of object
function processobj(raw,res){
    if(raw instanceof  Date) {
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        res.send(raw.toJSON());
    }else if(Array.isArray(raw)){
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        res.send(JSON.stringify(raw));
    }else if(Object.has(raw,'type')&&Object.has(raw,'data')){
        switch(raw.type){
            case 'next':
                break;
            case 'delay':
                res.return=function(data){processobj(data,res);};
                break;
            case 'd':
                res.return=function(data){processobj(data,res);};
                break;
            case 'xml':
                res.setHeader('Content-Type', 'text/xml;charset=utf-8');
                if(typeof(raw.data)=='string'){
                    res.send(raw.data);
                }else{
                    res.send( json2xml( raw.data ) );
                }
                break;
            case 'json':
                res.setHeader('Content-Type', 'application/json;charset=utf-8');
                res.send(JSON.stringify(raw.data));
                break;
            case 'txt':
                res.setHeader('Content-Type', 'text/plain;charset=utf-8');
                res.send(raw.data);
                break;
            case 'text':
                res.setHeader('Content-Type', 'text/plain;charset=utf-8');
                res.send(raw.data);
                break;
            case 'jsonp':
                res.setHeader('Content-Type', 'application/javascript;charset=utf-8');
                if(typeof(raw.data)=='string'){
                    res.send(raw.data);
                }else{
                    res.send('eval('+JSON.stringify(raw.data)+');');
                }
                break ;
            case 'html':
                res.setHeader('Content-Type', 'text/html;charset=utf-8');
                res.send(raw.data);
                break;
            case 'htm' :
                res.setHeader('Content-Type', 'text/html;charset=utf-8');
                res.send(raw.data);
                break;
            case 'js':
                res.setHeader('Content-Type', 'application/javascript;charset=utf-8');
                res.send(raw.data);
                break;
            case 'javascript':
                res.setHeader('Content-Type', 'application/javascript;charset=utf-8');
                res.send(raw.data);
                break;
            case 'file':
                res.setHeader('Content-Type', 'application/octet-stream;charset=utf-8');
                if(Object.has(raw,'filename')){
                    res.download(raw.data,raw.filename);
                }else{
                    res.download(raw.data);
                }
                    break;
            default:
                res.setHeader('Content-Type', 'application/json;charset=utf-8');
                res.send(JSON.stringify(raw.data));
                break;
        }
    }else{
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        res.send(JSON.stringify(raw));
    }
}

//load root module
function getRootModule(){
    if(_root!==null)return _root;
    var root = module.parent;
    while( typeof(root.parent)!='undefined' &&  root.parent!==null ){
        root=root.parent;
    }
    _root= root;
    return root;
}

function loadsingle(uri){

    //加载并且注册
    //var loaded=require(uri);
    var loaded=getRootModule().require(uri);
    var modulename = path.basename(uri,'.js');
    loadedlist[modulename] = loaded;
}

function processRequest(req,res,next){
    var url = req.url;
    var skip=/(\/\w+\.\w+)$/.test(url);
    if(!skip){
        var parsed=req._parsedUrl?req._parsedUrl: url.parse(url);
        var pathname=parsed.pathname;
        var pair = pathname.match(/^\/(\w+)\/(\w+)$/);
        if(pair===null){next();return;}
        var key=pair[1];
        var val=pair[2];
        var query=req.query;

        if(Object.has(loadedlist,key) && Object.has(loadedlist[key],val))
        {
            var obj=Object.create(loadedlist[key]);
            //obj.prototype=loadedlist[key];
            obj.res=res;
            obj.req=req;

            var rawresult;
            if(typeof(obj[val])!='function'){rawresult=obj[val];}else{
                try{
                    rawresult=obj[val].apply(obj  ,Object.keys(query).map(function(k){return query[k];}));
                }
                catch(err){next(err);return;}
            }
            //delete loadedlist[key].req;
            //delete loadedlist[key].res;
            //if(typeof(rawresult)=='undefined'){next();return;}
            if(typeof(rawresult)=='undefined'){
                obj.res.return=function(data){processobj(data,res);};
                return;
            }

            //return
            switch(typeof(rawresult)){
                case 'number':
                    res.setHeader('Content-Type', 'text/plain;charset=utf-8');
                    res.send( rawresult.toString() );
                    break;
                case 'string':
                    if(xmlcheck.test(rawresult)){
                        if( rawresult.has('<!DOCTYPE html>') ||(rawresult.has('<html') && rawresult.has('</html>')) ){
                            res.setHeader('Content-Type', 'text/html;charset=utf-8');
                            res.send(rawresult);
                        }else{
                            res.setHeader('Content-Type', 'text/xml;charset=utf-8');
                            res.send(rawresult);
                        }
                    }
                    else {
                        res.setHeader('Content-Type', 'text/plain;charset=utf-8');
                        res.send(rawresult);
                    }
                    break;
                case  'boolean':
                    res.setHeader('Content-Type', 'text/plain;charset=utf-8');
                    res.send(rawresult);
                    break;
                case 'object':
                    if(Object.has(rawresult,'type' && rawresult.type=='next')){
                        next();
                        return;
                    }
                    processobj(rawresult,res);
                    break;
            }

        }else{
            next();
        }
    }
}

module.exports=  function(uri){loadsingle(uri);return processRequest;};

module.exports.loadpath=function(pathsearch,exclude,include){
    var fs = require('fs');
    var filter_exclude;
    var filter_include;
    var search;
    if(typeof(exclude)=='undefined'){
        exclude='$^';
    }
    if(typeof(filter_include)=='undefined'){
        include='';
    }
    if(typeof(exclude)=='string'){
        filter_exclude=[exclude];
    }
    if(typeof(include)=='undefined'){
        include='';
    }
    if(typeof(include)=='string'){
        filter_include=[include];
    }
    if(typeof(pathsearch)=='string'){
        search = [pathsearch];
    }
    var rootpath =path.dirname( getRootModule().filename);

    var processfile=function(pathtravel){
        var isexclude=false;
        var isinclude=false;
        var regex = new RegExp();
        fs.readdir(pathtravel,function(err,files){
            for(var file in files){
                var realfilename = path.resolve(pathtravel,files[file]);

                if(fs.lstatSync(realfilename).isDirectory()
                    && !fs.existsSync(path.resolve(realfilename,'package.json'))){
                    processfile(realfilename);
                    continue;
                }
                for(var ex in filter_exclude){
                    regex.compile(filter_exclude[ex]);
                    isexclude= regex.test(realfilename);
                    if(isexclude) break;
                }
                for(var inc in filter_include){
                    regex.compile(filter_include[inc]);
                    isinclude=regex.test(realfilename);
                    if(isinclude) break;
                }
                if(!isexclude && isinclude)
                {
                    loadsingle(realfilename);
                }
            }
        });

    };
    for(var dir in search){
        var location = path.resolve(rootpath,search[dir]);
        processfile(location);
    }
    return processRequest;
};
