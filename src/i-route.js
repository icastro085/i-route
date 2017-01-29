"use strict";

/**
 * Class for use route
 * @author Ivanildo de Castro
 * @license MIT
 */
function IRoute(options){
    this.routes = [];
    this.middleware = [];
    this.setOptions(options);
}

IRoute.prototype.routes = [];
IRoute.prototype.middleware = [];

IRoute.prototype.options = {};

IRoute.prototype.setOptions = function(options){
    this.options = options || {
        basePath: ''
    };
};

IRoute.prototype.getOptions = function(){
    return this.options;
};

IRoute.prototype.add = function(path){

    var isMiddleware = !(
        typeof path === 'string' ||
        path instanceof RegExp
    );

    var i = 1;

    if(isMiddleware){
        i = 0;
        path = '*';

        for(; i < arguments.length ; i++){
            this.middleware.push({
                callback: arguments[i]
            });
        }

    }else{

        for(; i < arguments.length ; i++){
            this.routes.push({
                path: this.normalizePath(path, true),
                callback: arguments[i],
                isMiddleware: isMiddleware
            });
        }
    }

    return this;
};

IRoute.prototype.execute = function(path){

    var request = this.getRequest(path);
    var routes = this.getValidRoutes(request);
    var total = routes.length;
    var options = {};

    if(total){
        this.executeNext(
            request,
            routes,
            0,
            total,
            options
        );
    }
};

IRoute.prototype.executeNext = function(
    request,
    routes,
    index,
    total,
    options
){

    if(options && options.redirect){

    }

    if(index < total){

        var route = routes[index];
        request.param = this.getParam(request.path, route);

        var next = this.executeNext.bind(
            this,
            request,
            routes,
            index + 1,
            total
        );

        var callback = this.work(route.callback, request, next);

        if(this.middleware && this.middleware.length){
            this.executeMiddleware(request, callback);
        }else{
            callback();
        }
    }
};

IRoute.prototype.work = function(callback, request, next){

    var hasPrototype = !!(
        callback.prototype &&
        Object.keys(callback.prototype).length
    );

    return function(){
        if(hasPrototype){
            new callback(request, next);
        }else{
            callback(
                request,
                next
            );
        }
    }.bind(this);
};

IRoute.prototype.executeMiddleware = function(request, callback){
    var middleware = [];

    for(var i = this.middleware.length - 1 ; i >= 0 ; i--){
        middleware.unshift(
            this.work(
                this.middleware[i].callback,
                request,
                middleware[i + 1] || callback
            )
        );
    }

    middleware[0]();
};

IRoute.prototype.getValidRoutes = function(request){
    return this.routes.filter(
        this.comparePaths.bind(this, request.path)
    );
};

IRoute.prototype.comparePaths = function(path, route){
    var regexp;

    if(route.callback instanceof IRoute){
        var iroute = route.callback;
        regexp = this.getRegExpPath(route.path, true);

        if(regexp.test(path)){
            iroute.execute(path.replace(regexp, ''));
        }

        return false;
    }

    if(route.path === '*'){
        return true;
    }

    regexp = this.getRegExpPath(route.path);
    return regexp.test(path);
};

IRoute.prototype.getRegExpPath = function(path, withoutEnd){
    var regexp = path;

    if(typeof regexp === 'string'){
        regexp = regexp.replace(/(\/\:[^/]+)\?/g, '($1)?');
        regexp = regexp.replace(/\:[^/)]+/g, '([^/)]+)');
        regexp = new RegExp('^'+regexp + (withoutEnd?'':'$'), 'gi');
    }

    return regexp;
};

IRoute.prototype.getRequest = function(path){
    return {
        basePath: this.normalizePath(this.options.basePath || ''),
        path: this.normalizePath(path),
        originalPath: path,
        param: this.getParam(),
        query: this.getQuery(path)
    };
};

IRoute.prototype.normalizePath = function(path, notSplitQuery){

    if(path instanceof RegExp){
        return path;
    }

    path = (path || '').trim();

    if(path === '*' || !path){
        return path;
    }

    if(!notSplitQuery){
        path = path.split('?')[0];
    }

    if(!/^\//.test(path)){
        path = '/' + path;
    }

    if(/\/$/.test(path)){
        path = path.substring(0, path.length - 1);
    }

    return path;
};

IRoute.prototype.getParam = function(path, route){
    if(
        !path ||
        !route ||
        typeof route.path !== 'string' ||
        route.path === '*'
    ){
        return {};
    }

    var regexp = this.getRegExpPath(route.path);
    var params = route.path.match(/\:[^/]+/g);
    var values = regexp.exec(path);
    var i;
    var result = {};
    var name;

    if(params && params.length){
        for(i = 0 ; i < params.length ; i++){
            name  = params[i].replace(/^:/, '');
            result[name] = values[i + 1];
        }
    }

    return result;
};

IRoute.prototype.getQuery = function(path){
    var queryString = path.split('?')[1];
    var query = {};

    if(queryString){
        queryString.match(/[^&=]+\=[^&=]+/g).map(function(item){
            var parts = item.split('=');
            query[parts[0]] = parts[1];
        });
    }

    return query;
};

if(module && module.exports){
    module.exports = IRoute;
}else{
    window.IRoute = IRoute;
}
