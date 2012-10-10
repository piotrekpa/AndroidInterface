package pl.piotrpardel.android;

import org.json.JSONArray;
import android.webkit.WebView;

public abstract class JavascriptInterfaceAbstract {
	String dispatcherName = "";
	WebView webview = null;
	
	public JavascriptInterfaceAbstract(WebView webview){
		this.webview = webview;
	}
	
	public void registerDispatcher(String name){
		this.dispatcherName = name;
	};
	
	protected void runCallback(String callback){
		this.webview.loadUrl("javascript:"+ this.dispatcherName +"(" + callback + ");");
	}
	
	protected void runCallback(String callback, JSONArray args){
		this.webview.loadUrl("javascript:"+ this.dispatcherName +"(" + callback + ", " + args.toString() + ");");
	}
}