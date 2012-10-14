# Android Interface #

AndroidInterface enable to you execute methods from Android JavascriptInterface as asynchronous method - by callback. This works only in android webview.

## How to use ##

### In Android side ###

Create class, which inherits for the JavascriptInterfaceAbstract from android/JavascriptInterfaceAbstract.java file.

	public class FooJSInterface extends JavascriptInterfaceAbstract {

	}

Implement your methods.
Remeber that method:
*	must be void type,
* the last argument must be string variable - this is the callback,
* he return results by executing this.runCallback(String callback, JSONArray results) method. The result is optional argument;

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

Add to your webView in activity. For example:

	WebView web = (WebView) findViewById(R.id.webview);
	web.addJavascriptInterface(new SomeJSInterface(web), "Android");

### In Javascript side ###

Initialize AndroidInterface

	