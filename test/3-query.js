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

        it('and I have 2 query', function(){

            var id;
            var test;
            var test2;
            route.add('/teste/:id', function(request, next){
                id = request.param.id;
                test = request.query.test;
                test2 = request.query.test2;
            });

            route.execute('/teste/1?test=2&test2=3');

            expect(id).to.equal('1');
            expect(test).to.equal('2');
            expect(test2).to.equal('3');

        });
    });
});
