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
                handle: arguments[i]
            });
        }

    }else{

        for(; i < arguments.length ; i++){
            this.routes.push({
                path: this.normalizePath(path, true),
                handle: arguments[i],
                isMiddleware: isMiddleware
            });
        }
    }

    return this;
};

IRoute.prototype.execute = function(path){

    var request = this.getRequest(path);
    var routes = this.getValidRoutes(request);
    var next = function(){};
    var i;

    for(i = routes.length - 1 ; i >= 0 ; i--){
        next = this.executeNext.bind(
            this,
            routes[i],
            request,
            next
        );
    }

    next();
};

IRoute.prototype.executeNext = function(route, request, next){
    request.param = this.getParam(request.path, route);
    request.route = route;

    this.executeMiddleware(
        request,
        this.work(route.handle, request, next)
    );
};

IRoute.prototype.executeMiddleware = function(request, next){

    var i;

    for(i = this.middleware.length - 1 ; i >= 0 ; i--){
        next = this.work(
            this.middleware[i].handle,
            request,
            next
        )
    }

    next();
};

IRoute.prototype.work = function(handle, request, next){

    var hasPrototype = !!(
        handle.prototype &&
        Object.keys(handle.prototype).length
    );

    return function Next(){
        if(hasPrototype){
            new handle(request, next);
        }else{
            handle(
                request,
                next
            );
        }
    };
};

IRoute.prototype.getValidRoutes = function(request){
    return this.routes.filter(
        this.comparePaths.bind(this, request.path)
    );
};

IRoute.prototype.comparePaths = function(path, route){
    var regexp;

    if(route.handle instanceof IRoute){
        var iroute = route.handle;
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
        query: this.getQuery(path),
        iroute: this
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
