package com.palavrascruzadas.medico

import android.annotation.SuppressLint
import android.content.res.Configuration
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity

class MainActivity : ComponentActivity() {
  private lateinit var webView: WebView

  @SuppressLint("SetJavaScriptEnabled")
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)

    webView = findViewById(R.id.webview)
    WebView.setWebContentsDebuggingEnabled(true)
    with(webView.settings) {
      javaScriptEnabled = true
      domStorageEnabled = true
      cacheMode = WebSettings.LOAD_DEFAULT
      allowContentAccess = true
      allowFileAccess = true
      useWideViewPort = true
      loadWithOverviewMode = true
      builtInZoomControls = false
      displayZoomControls = false
    }
    webView.webViewClient = object : WebViewClient() {
      override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        applySystemThemeToWeb()
      }
    }

    // Load bundled web app
    webView.loadUrl("file:///android_asset/web/index.html")
  }

  private fun applySystemThemeToWeb() {
    val nightModeFlags = resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK
    val isNight = nightModeFlags == Configuration.UI_MODE_NIGHT_YES
    val js = if (isNight) {
      "document.body.classList.remove('light');" 
    } else {
      "document.body.classList.add('light');"
    }
    webView.evaluateJavascript(js, null)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    applySystemThemeToWeb()
  }

  override fun onBackPressed() {
    if (this::webView.isInitialized && webView.canGoBack()) {
      webView.goBack()
    } else {
      super.onBackPressed()
    }
  }
}

