"use strict";

var IRoute = require('./../src/i-route.js');

describe('IRoute #add', function() {

    var route;
    beforeEach(function(){
        route = new IRoute();
    });

    describe('When I add a route', function(){

        it('should have a just 1 route', function(){

            route.add('/teste/1', function(){});
            expect(route.routes.length).to.equal(1);

        });

        it('should have a just 1 route with regexp', function(){

            var count = 0;
            route.add(/\/teste\/[0-9]+/, function(request){
                count++;
            });
            route.execute('/teste/1');
            expect(count).to.equal(1);

        });

    });

    describe('When I add 2 route', function(){

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

    describe('When I add a route for all', function(){

        var route2;
        beforeEach(function(){
            route2 = new IRoute();
        });

        it.only('should all routes', function(){

            var count = 0

            route2.add('/editar', function(){
                console.log(1);
                count++;
            });
            route.add('/teste/:id', route2);

            route.execute('/teste/1/editar');

            //expect(count).to.equal(1);

        });

    });
});
