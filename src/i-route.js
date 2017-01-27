"use strict";

/**
 * Class for use route
 * @author Ivanildo de Castro
 * @license MIT
 */
function IRoute(options){
    this.routes = [];
    this.setOptions(options);
}

IRoute.prototype.routes = [];

IRoute.prototype.options = {};

IRoute.prototype.setOptions = function(options){
    this.options = options || {};
};

IRoute.prototype.getOptions = function(){
    return this.options;
};

IRoute.prototype.add = function(path){
    var i;

    for(i = 1 ; i < arguments.length ; i++){
        this.routes.push({
            path: this.normalizePath(path, true),
            callback: arguments[i]
        });
    }

    return this;
};

IRoute.prototype.execute = function(path){

    var request = this.getRequest(path);
    var routes = this.get(request);
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

IRoute.prototype.executeNext = function(request, routes, index, total, options){

    if(options && options.redirect){

    }

    if(index < total){
        var route = routes[index];
        request.param = this.getParam(request.path, route);

        route.callback(
            request,
            this.executeNext.bind(
                this,
                request,
                routes,
                index + 1,
                total
            )
        );
    }

};

IRoute.prototype.get = function(request){
    return this.routes.filter(
        this.comparePaths.bind(this, request.basePath + request.path)
    );
};

IRoute.prototype.comparePaths = function(path, route){

    if(route.callback instanceof IRoute){
        console.log(path, route);
        route.getOptions().basePath += this.getOptions().basePath;
        route.execute(path);
        return false;
    }

    if(route.path === '*'){
        return true;
    }

    var regexp = this.getRegExpPath(route.path);
    return regexp.test(path);
};

IRoute.prototype.getRegExpPath = function(path){
    var regexp = path;

    if(typeof regexp === 'string'){
        regexp = regexp.replace(/(\/\:[^/]+)\?/g, '($1)?');
        regexp = regexp.replace(/\:[^/)]+/g, '([^/)]+)');
        regexp = new RegExp('^'+regexp+'$', 'gi');
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
