


var AndroidInterface = function(globals, dispatcherName, androidNamespace, callbackableMethods){

	var instance,
			AI = function(){
				this.dispatcherName = dispatcherName;
				this.callbacks = {};
				this._proxy = this._proxy(this);
			};

	AI.prototype = {

		_proxy : function(ctx){
			return function(){
				var args = Array.prototype.slice.call(arguments),
						fn = args.shift();
				return function(){
					fn.apply(ctx, args);
				}
			};
		},

		registerCallback : function(fn, params){
			var callback = {
						fn : fn,
						params : params
					},
					timestamp = this.getTimestamp();
			if(params){
				if('timeout' in params){
					setTimeout(this._proxy(this.destroyCallback, timestamp, params.onTimeout), params.timeout);
				}				
			}

			if(typeof fn === "function"){
				this.callbacks[timestamp] = callback;
				return timestamp;
			}else{
				return null;
			}
		},

		destroyCallback : function(timestamp, done){
			delete this.callbacks[timestamp];
			if(typeof done === "function"){
				done(timestamp);
			}
		},

		getTimestamp : function(){
			return +Date.now();
		},

		dispatch : function(){
			var args = Array.prototype.slice.call(arguments),
					timestamp = args.shift();
			if(timestamp && timestamp in this.callbacks){
				this.callbacks[timestamp].fn.apply(this, args);
			}

		}
	};

	instance = new AI();

	// register to Android JavascriptInterface
	(function(){
		var androidOrig = globals[androidNamespace];
		if(typeof androidOrig === "object" && typeof androidOrig['registerDispatcher'] === "function"){
			androidOrig['registerDispatcher'](dispatcherName + ".dispatch");
			instance._ = androidOrig;

			// wrap callbackable methods
			console.log(callbackableMethods);
			if(typeof callbackableMethods === "object"){
				(function(){
					var i, length = callbackableMethods.length, item, orgFn;

					for(i = 0; i < length; i++){
						item = callbackableMethods[i];
						orgFn = instance._[item];
						instance._[item] = function(){
							var args = Array.prototype.slice.call(arguments),
									callback, callbackParams;

							// get last argument as callback
							callback = args.pop();
							// if last callback is object then this is callback params. When callback is actually last argument
							if(typeof callback === "object"){
								callbackParams == callback;
								callback = args.pop();
							}
							// register new callback
							args.push(instance.registerCallback(callback, callbackParams));
							// and execute original method when callback is registered callback timestamp
							orgFn.apply(this, args);
						}
					}
				})();
			}
		}
	})();


	globals[dispatcherName] = instance;
	return instance;
};