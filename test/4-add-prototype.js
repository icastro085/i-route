"use strict";

var IRoute = require('./../src/i-route.js');

describe('IRoute #add-prototype', function() {

    var route;
    beforeEach(function(){
        route = new IRoute();
    });

    describe('When I add a route with prototype', function(){

        it('should execute the construct like callback', function(){

            function MyController(request, next){
                this.initialize();
            }

            MyController.prototype.initialize = chai.spy();

            route.add('/teste/:id', MyController);

            route.execute('/teste/1');

            expect(MyController.prototype.initialize).to.have.been.called();

        });

        it('should execute the middleware like callback', function(){

            var spy = chai.spy();

            function MyController(request, next){
                this.initialize(next);
            }

            MyController.prototype.initialize = function(next){
                next();
            }

            route.add(MyController);
            route.add('/teste/:id', spy);
            route.execute('/teste/1');

            expect(spy).to.have.been.called();

        });
    });
});
