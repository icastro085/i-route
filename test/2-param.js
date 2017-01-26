"use strict";

var IRoute = require('./../src/i-route.js');

describe('IRoute #param', function() {

    describe('When I add a route with 1 param', function(){

        var route;
        beforeEach(function(){
            route = new IRoute();
        });

        it('should have a just 1 route', function(){

            var count=0;
            route.add('/teste/:id', function(request, next){
                count++;
            });

            route.execute('/teste/1');

            expect(count).to.equal(1);

        });

        it('should have a just 2 route', function(){

            var count=0;
            route.add('/teste/:id', function(request, next){
                count++;
                next();
            });

            route.add('/teste/1', function(request, next){
                count++;
                next();
            });

            route.execute('/teste/1');

            expect(count).to.equal(2);

        });

    });

    describe('When I add a route with 1 param', function(){
        var route;
        beforeEach(function(){
            route = new IRoute();
        });

        it('and get the param', function(){
            var count=0;
            var id;
            var name;

            route.add('/teste/:id/teste/:name', function(request, next){
                id = request.param.id;
                name = request.param.name;
            });

            route.execute('/teste/1/teste/testename');
            expect(id).to.equal('1');
            expect(name).to.equal('testename');
        });

        it('and I have optional param', function(){
            var count=0;
            var id;
            var name;

            route.add('/teste/:id/teste/:name?', function(request, next){
                id = request.param.id;
                name = request.param.name;
            });

            route.execute('/teste/1/teste');
            expect(id).to.equal('1');
            expect(name).to.equal(undefined);
        });

    });
});
