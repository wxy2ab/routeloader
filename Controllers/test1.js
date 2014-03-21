/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-6-24
 * Time: 上午10:14
 * To change this template use File | Settings | File Templates.
 */
exports.hello=function(a,b){
    return parseInt(a)+parseInt(b);
};
exports.str=function(){
    return 'school';
}
exports.date=function(){
    return new Date();
}
exports.array=function(){
    return [1,2,3,4,5,6,7,8,9,0];
}
exports.html=function(){
    return '<html><boby><h1>cool</h1></body></html>';
}
exports.xml1=function(){
    return '<boby><h1>cool</h1></body>';
}
exports.xml=function(
    ){
    return {type:'xml',data:'<a>aaa</a>'};
}
exports.xml2=function(
    ){
    return {type:'xml',data:{a:{c:1,b:[{x:1},{x:2}]}}};
}
exports.json=function(){
    return {type:'json',data:'{}'}
}
exports.boolean=function(){
    return true;
}
exports.txt=function(){
    return 'this is a pure text line!';
}
exports.read=function(){
    return JSON.stringify( this.req.query );
}
exports.mod=function(){
    console.log(module);
    return JSON.stringify(module.paths);
}
exports.error=function(){
    a.x.c();
}

