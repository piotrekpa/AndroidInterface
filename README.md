# Android Interface #

AndroidInterface enables you to execute methods from Android JavascriptInterface as asynchronous method - by callback. This works only in android webview.

## How to use ##

### In Android side ###

Create class, which inherits for the JavascriptInterfaceAbstract from android/JavascriptInterfaceAbstract.java file.

	public class FooJSInterface extends JavascriptInterfaceAbstract {
	
	}

Implement your methods.
Remeber that this method:
*	must be of a void type,
* the last argument must be a string variable - this is the callback,
* returns results by executing this.runCallback(String callback, JSONArray results) method. The result is an optional argument

	```
	import org.json.JSONArray;
	import android.webkit.WebView;
	public class FooJSInterface extends JavascriptInterfaceAbstract {
		
		public SomeJSInterface(WebView web){
			super(web);
		}
		
		public void bar(String callback){
			JSONArray result;
			// block of code
			
			result.put("Hello");
			result.put("World");
			result.put(true);
			this.runCallback(callback, result);
		}
		
	}
	```

Add to your webView in activity. For example:

	WebView web = (WebView) findViewById(R.id.webview);
	web.addJavascriptInterface(new SomeJSInterface(web), "Android");

### In Javascript side ###

Initialize AndroidInterface

run

	AndroidInterface(window, "AI", "Android", ["bar"]),

when:
* window is a global context
* AI is the name of this interface - now you have a global access to the interface like `AI.bar`
* Android is an original name of the interface, which you set in addJavascriptInterface method
* ["bar"] is list of methods, which you would like to set as asynchronous

Now you can use android methods like this:

	AI.bar(function(){
		console.log(arguments);
	});

result is `['Hello', 'World', true]`

You can set special parameters:

	AI.bar(function(){
		console.log(arguments);
	}, {
		timeout : 500,
		onTimeout : function(){
			console.log('timeout!');
		}
	});

A list of the parameters:

* `timeout` - time to live in milisecons. When timeout expires, the callback is removed and onTimeout is execuded (if set)
* `onTimeout` - executed when timeout expires

