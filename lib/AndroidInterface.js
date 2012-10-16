var AndroidInterface = function(globals, dispatcherName, androidNamespace, callbackableMethods){

  var instance,
      AI = function(){
        this._dispatcherName = dispatcherName;
        this._callbacks = {};
        this._proxy = this._proxy(this);
      },
      extend = function(c, p){
        var i;
        for(i in p){
          if(p.hasOwnProperty(i)){
            c[i] = p[i];
          }
        }
        return c;
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

    _registerCallback : function(fn, params){
      var callback = {
            fn : fn,
            params : params
          },
          timestamp = this._getTimestamp();
      if(params){
        if('timeout' in params){
          setTimeout(this._proxy(this._destroyCallback, timestamp, params.onTimeout), params.timeout);
        }       
      }

      if(typeof fn === "function"){
        this._callbacks[timestamp] = callback;
        return timestamp;
      }else{
        return null;
      }
    },

    _destroyCallback : function(timestamp, done){
      delete this._callbacks[timestamp];
      if(typeof done === "function"){
        done(timestamp);
      }
    },

    _getTimestamp : function(){
      return +Date.now();
    },

    _dispatch : function(){
      var args = Array.prototype.slice.call(arguments),
          timestamp = args.shift(),
          callback, once, executionArgs = args.shift();
      
      if(timestamp && timestamp in this._callbacks){
        callback = this._callbacks[timestamp];
        once = callback.params ? callback.params.once : undefined;
        if(typeof executionArgs !== "object"){ executionArgs = [executionArgs]; }
        if(once !== false){
          this._destroyCallback(timestamp);
        }
        callback.fn.apply(this, executionArgs);
      }

    }
  };

  instance = new AI();

  // register to Android JavascriptInterface
  (function(){
    var androidOrig = globals[androidNamespace];
    if(typeof androidOrig === "object" && typeof androidOrig['registerDispatcher'] === "function"){
      androidOrig['registerDispatcher'](dispatcherName + "._dispatch");
      //instance._ = androidOrig;
      extend(instance, androidOrig);

      // wrap callbackable methods
      if(typeof callbackableMethods === "object"){
        (function(){
          var i, length = callbackableMethods.length, item, orgFn;

          for(i = 0; i < length; i++){
            item = callbackableMethods[i];
            orgFn = androidOrig[item];
            instance[item] = function(){
              var args = Array.prototype.slice.call(arguments),
                  callback, callbackParams;

              // get last argument as callback
              callback = args.pop();
              // if last callback is object then this is the callback params. Now callback is currently the last argument.
              if(typeof callback === "object"){
                callbackParams == callback;
                callback = args.pop();
              }
              // register new callback
              args.push(instance._registerCallback(callback, callbackParams));
              // and execute original method when callback is registered callback timestamp
              orgFn.apply(androidOrig, args);
            }
          }
        })();
      }
    }
  })();


  globals[dispatcherName] = instance;
  return instance;
};