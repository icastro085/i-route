"use strict";

var IRoute = require('./../src/i-route.js');

describe('IRoute #query', function() {

    var route;
    beforeEach(function(){
        route = new IRoute();
    });

    describe('When I add a route', function(){

        it('and I have query', function(){

            var test;
            route.add('/teste/:id', function(request, next){
                test = request.query.test;
            });

            route.execute('/teste/1?test=2');

            expect(test).to.equal('2');

        });
    });
});
