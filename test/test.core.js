
var JSInterfaceMock = (function(globals, namespace){
	var instance,
			c = function(){
				this.dispatcher = "";
			};
	c.prototype = {
		
		registerDispatcher : function(name){
			this.dispatcher = name;
		},

		testMethod1 : function(arg1, callback){
			arg1(Array.prototype.slice.call(arguments));
		}
	};
	instance = new c();
	globals[namespace] = instance;
	return instance;
})(window, "Android");

describe('AndroidInterface', function(){

	var AI = AndroidInterface(window, "AI"),
			mockGetTimestamp = function(ai, timestamp){
				ai.getTimestamp = function(ts){
					return ts || timestamp;
				}
			};

	beforeEach(function(){
		AI = AndroidInterface(window, "AI");
	});

	describe('android javascript interface', function(){
		it('should register dispatcher', function(){
			var AI = AndroidInterface(window, "AI", "Android");
			expect(JSInterfaceMock.dispatcher).to.equal("AI.dispatch");
		});

		it('should wrap callbackable methods', function(done){
			var AI = AndroidInterface(window, "AI", "Android", ["testMethod1"]),
					expectedCallback = function(){ console.log('hello'); };
			mockGetTimestamp(AI, 100);
			expect(typeof AI._.testMethod1).to.equal("function");
			AI._.testMethod1(function(a){
				expect(a[1]).to.equal(100);
				done();
			}, expectedCallback);
			
		})
	});

	describe('callbacks', function(){
		it('register', function(){
			mockGetTimestamp(AI, 1);
			AI.registerCallback(function(){});
			
			expect(Object.keys(AI.callbacks).length).to.equal(1);
			expect(AI.callbacks[1]).to.not.equal(undefined);
		});

		it('destroy', function(){
			mockGetTimestamp(AI, 1);
			AI.registerCallback(function(){});
			
			expect(Object.keys(AI.callbacks).length).to.equal(1);
			expect(AI.callbacks[1]).to.not.equal(undefined);
			AI.destroyCallback(1);
			AI.destroyCallback(2);
			expect(Object.keys(AI.callbacks).length).to.equal(0);
		});

		it('with timeout', function(done){
			var expired = false;
			mockGetTimestamp(AI, 1);

			AI.registerCallback(function(){}, {
				timeout : 100,
				onTimeout : function(){ expired = true; }
			});
			expect(Object.keys(AI.callbacks).length).to.equal(1);
			setTimeout(function(){
				expect(Object.keys(AI.callbacks).length).to.equal(0);
				expect(expired).to.equal(true);
				done();	
			}, 200);

		});

		it('execute', function(){
			var test = false,
					testArg = false;
			mockGetTimestamp(AI, 1);

			AI.registerCallback(function(arg){ test = true; testArg = arg; });
			expect(Object.keys(AI.callbacks).length).to.equal(1);				
			AI.dispatch(1, true);
			expect(test).to.equal(true);
			expect(testArg).to.equal(true);
			// once
			AI.dispatch(1, "hello");
			expect(testArg).to.equal(true);
		});

		it('execute no once', function(){
			var test = false,
					testArg = false;
			mockGetTimestamp(AI, 1);

			AI.registerCallback(function(arg){ test = true; testArg = arg; }, {once : false});
			expect(Object.keys(AI.callbacks).length).to.equal(1);				
			AI.dispatch(1, "one");
			expect(testArg).to.equal("one");
			AI.dispatch(1, "two");
			expect(testArg).to.equal("two");
		})
	});



});