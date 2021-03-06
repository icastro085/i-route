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

            var spy = chai.spy();

            route.add(/\/teste\/[0-9]+/, spy);
            route.execute('/teste/1');

            expect(spy).to.have.been.called();

        });

    });

    describe('When I add 2 route', function(){

        it('should just execute first', function(){

            function callback(request, next){
                next();
            }

            var spy1 = chai.spy(callback);
            var spy2 = chai.spy(callback);

            route.add('/teste/1', spy1);
            route.add('/teste/2', spy2);
            route.execute('/teste/1');

            expect(spy1).to.have.been.called();
            expect(spy2).to.not.have.been.called();

        });

        it('should execute both', function(){

            function callback(request, next){
                next();
            }

            var spy1 = chai.spy(callback);
            var spy2 = chai.spy(callback);

            route.add('/teste/1', spy1);
            route.add('/teste/1', spy2);
            route.execute('/teste/1');

            expect(spy1).to.have.been.called();
            expect(spy2).to.have.been.called();

        });

        it('should execute both that was not defined separate', function(){

            function callback(request, next){
                next();
            }

            var spy1 = chai.spy(callback);
            var spy2 = chai.spy(callback);

            route.add('/teste/1', spy1, spy2);
            route.execute('/teste/1');

            expect(spy1).to.have.been.called();
            expect(spy2).to.have.been.called();

        });
    });

    describe('When I add a sub route', function(){

        var route2;
        beforeEach(function(){
            route2 = new IRoute();
        });

        it('should just sub callback', function(){

            var spy = chai.spy();

            route2.add('/editar', spy);
            route.add('/teste/:id', route2);

            route.execute('/teste/1/editar');

            expect(spy).to.have.been.called();

        });

        it('should parent calback and  sub callback', function(){

            var spy1 = chai.spy();
            var spy2 = chai.spy();

            route.add('/teste/:id', spy1);

            route2.add('/editar', spy2);
            route.add('/teste/:id', route2);

            route.execute('/teste/1/editar');
            route.execute('/teste/1');

            expect(spy1).to.have.been.called();
            expect(spy2).to.have.been.called();

        });

        it('should sub callback of other sub callback', function(){

            var route3 = new IRoute();
            var spy = chai.spy();

            route3.add('/clone', spy);
            route2.add('/editar', route3);
            route.add('/teste/:id', route2);

            route.execute('/teste/1/editar/clone');

            expect(spy).to.have.been.called();

        });

        it('should sub callback with the parent path like RegExp', function(){

            var route3 = new IRoute();
            var spy = chai.spy();

            route3.add('/clone', spy);
            route2.add(/^\/editar/, route3);
            route.add(/^\/teste\/[0-9]+/, route2);

            route.execute('/teste/1/editar/clone');

            expect(spy).to.have.been.called();

        });

    });

    describe('When I add a middleware', function(){
        it('should execute in order', function(){

            function callback(request, next){
                next();
            }

            var spy1 = chai.spy(callback);
            var spy2 = chai.spy(callback);
            var spy3 = chai.spy(callback);

            route.add(spy1);
            route.add('/teste/:id', spy2);
            route.add('/teste/:id', spy3);

            route.execute('/teste/1');

            expect(spy1).to.have.been.called();
            expect(spy2).to.have.been.called();
            expect(spy3).to.have.been.called();

            expect(spy1).to.have.been.called.twice;

        });
    });
});
