"use strict";

var IRoute = require('./../src/i-route.js');

describe('IRoute #add', function() {

    describe('When I add a route', function(){

        var route;
        beforeEach(function(){
            route = new IRoute();
        });

        it('should have a just 1 route', function(done){

            route.add('/teste/1', function(){});
            expect(route.routes.length).to.equal(1);
            done();

        });

    });

    describe('When I add 2 route', function(){

        var route;
        beforeEach(function(){
            route = new IRoute();
        });

        it('should just execute first', function(){

            var count = 0;
            var callback = function(request, next){
                count++;
                next();
            };

            route.add('/teste/1', callback);
            route.add('/teste/2', callback);
            route.execute('/teste/1');

            expect(count).to.equal(1);

        });

        it('should execute both', function(){

            var count = 0;
            var callback = function(request, next){
                count++;
                next();
            };

            route.add('/teste/1', callback);
            route.add('/teste/1', callback);
            route.execute('/teste/1');

            expect(count).to.equal(2);

        });

        it('should execute both that was not defined separate', function(){

            var count = 0;

            route.add('/teste/1',
                function(request, next){
                    count++;
                    next();
                },
                function(request, next){
                    count++;
                    next();
                }
            );

            route.execute('/teste/1');
            expect(count).to.equal(2);

        });
    });
});
