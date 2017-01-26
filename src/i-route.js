"use strict";

/**
 * Class for use route
 * @author Ivanildo de Castro
 * @license MIT
 */
function IRoute(options){
    this.options = options;
    this.routes = [];
}

IRoute.prototype.routes = [];

IRoute.prototype.add = function(path){
    var i;

    for(i = 1 ; i < arguments.length ; i++){
        this.routes.push({
            path: path,
            callback: arguments[i]
        });
    }

    return this;
};

IRoute.prototype.execute = function(path){
    var routes = this.get(path);
    var total = routes.length;
    var request = this.getRequest(path);
    var options = {};

    if(total){
        this.executeNext(request, routes, 0, total, options);
    }
};

IRoute.prototype.executeNext = function(request, routes, index, total, options){

    if(options.redirect){

    }

    if(index < total){
        var route = routes[index];
        request.params = this.getParams(request.path, route);

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

IRoute.prototype.get = function(path){
    return this.routes.filter(
        this.comparePaths.bind(this, path)
    );
};

IRoute.prototype.comparePaths = function(path, route){
    var regexp = this.getRegExpPath(route.path);
    return regexp.test(path);
};

IRoute.prototype.getRegExpPath = function(path){
    var regexp = path;

    if(typeof regexp === 'string'){
        regexp = regexp.replace(/(\/\:\w+)\?/g, '($1)?');
        regexp = regexp.replace(/\:\w+/g, '(\\w+)');
        regexp = new RegExp('^[\/]?'+regexp+'$', 'gi');
    }

    return regexp;
};

IRoute.prototype.getRequest = function(path){
    return {
        path: path,
        params: this.getParams()
    };
};

IRoute.prototype.getParams = function(path, route){
    if(!path || !route || typeof route.path !== 'string'){
        return {};
    }

    var regexp = this.getRegExpPath(route.path);
    var params = route.path.match(/\:\w+/g);
    var values = regexp.exec(path);
    var i;
    var result = {};
    var name;

    for(i = 0 ; i < params.length ; i++){
        name  = params[i].replace(/^:/, '');
        result[name] = values[i + 1];
    }

    return result;
};

if(module && module.exports){
    module.exports = IRoute;
}else{
    window.IRoute = IRoute;
}
