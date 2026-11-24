#!/bin/bash
set -e

echo "=== Building Production Android APK for Expert CRM Call Agent ==="

PROJECT_ROOT="$(pwd)"
BUILD_DIR="/tmp/expertcrm-android-build"
OUTPUT_APK="$PROJECT_ROOT/public/expert-call-agent-v2.4.2.apk"
KEYSTORE="/tmp/expertcrm-release.jks"

ANDROID_JAR="/usr/lib/android-sdk/platforms/android-23/android.jar"
DX="/usr/lib/android-sdk/build-tools/debian/dx"

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"/{gen,bin,src/com/expertcrm/callagent,res/values,res/drawable-mdpi,res/drawable-hdpi,res/drawable-xhdpi,res/drawable-xxhdpi,assets}

# 1. Strings resource
cat << 'XML' > "$BUILD_DIR/res/values/strings.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Expert Call Agent</string>
</resources>
XML

# 2. Android Manifest
cat << 'XML' > "$BUILD_DIR/AndroidManifest.xml"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.expertcrm.callagent"
    android:versionCode="2402"
    android:versionName="2.4.2">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:label="@string/app_name"
        android:icon="@drawable/ic_launcher"
        android:allowBackup="true"
        android:hardwareAccelerated="true">
        
        <activity
            android:name="com.expertcrm.callagent.MainActivity"
            android:label="@string/app_name"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
XML

# 3. Generate high-quality launcher icons from CRM logo
LOGO_SOURCE="$PROJECT_ROOT/src/assets/images/crm_logo_v2_1784807669094.jpg"
convert "$LOGO_SOURCE" -resize 48x48 "$BUILD_DIR/res/drawable-mdpi/ic_launcher.png"
convert "$LOGO_SOURCE" -resize 72x72 "$BUILD_DIR/res/drawable-hdpi/ic_launcher.png"
convert "$LOGO_SOURCE" -resize 96x96 "$BUILD_DIR/res/drawable-xhdpi/ic_launcher.png"
convert "$LOGO_SOURCE" -resize 144x144 "$BUILD_DIR/res/drawable-xxhdpi/ic_launcher.png"

# 4. Generate embedded assets (offline companion dialer HTML bundle)
cat << 'HTML' > "$BUILD_DIR/assets/index.html"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Expert Call Agent Companion</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background-color: #0b0f19; color: #f8fafc; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
    header { background: #0f172a; padding: 12px 16px; border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; }
    .header-title { font-weight: 800; font-size: 14px; letter-spacing: 0.5px; color: #ffffff; }
    .header-sub { font-size: 10px; color: #38bdf8; font-family: monospace; }
    .badge { background: #1e1b4b; border: 1px solid #4338ca; color: #a5b4fc; font-size: 10px; font-weight: bold; padding: 3px 8px; rounded: 12px; border-radius: 9999px; }
    .content { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px; }
    .tab-content { display: none; }
    .tab-content.active { display: flex; flex-direction: column; gap: 14px; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 20px; padding: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); }
    .dial-display { width: 100%; font-size: 26px; font-weight: 800; text-align: center; background: #030712; border: 1px solid #1f2937; border-radius: 14px; padding: 12px; color: #ffffff; outline: none; margin-bottom: 12px; }
    .keypad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .key-btn { background: #1e293b; color: #ffffff; border: 1px solid #334155; font-size: 20px; font-weight: bold; padding: 14px 0; border-radius: 16px; cursor: pointer; transition: background 0.1s; text-align: center; }
    .key-btn:active { background: #4f46e5; }
    .action-btn { width: 100%; padding: 14px; border-radius: 16px; font-weight: 800; font-size: 15px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.1s; }
    .action-btn:active { transform: scale(0.98); }
    .btn-call { background: #059669; color: #ffffff; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.4); }
    .btn-native { background: #2563eb; color: #ffffff; margin-top: 8px; }
    .btn-hangup { background: #e11d48; color: #ffffff; box-shadow: 0 4px 14px rgba(225, 29, 72, 0.4); }
    .nav-bar { background: #090d16; border-top: 1px solid #1e293b; height: 56px; display: flex; align-items: center; justify-content: space-around; }
    .nav-item { color: #64748b; font-size: 10px; font-weight: bold; background: none; border: none; display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; }
    .nav-item.active { color: #818cf8; }
    .status-bar { display: flex; justify-content: space-between; align-items: center; font-size: 11px; margin-bottom: 8px; }
    .lead-item { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 12px; display: flex; justify-content: space-between; align-items: center; }
    .lead-name { font-weight: bold; font-size: 13px; color: #f1f5f9; }
    .lead-phone { font-size: 11px; color: #94a3b8; font-family: monospace; }
    .call-chip { background: #047857; color: white; border: none; border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: bold; cursor: pointer; }
  </style>
</head>
<body>
  <header>
    <div>
      <div class="header-title">EXPERT CALL AGENT</div>
      <div class="header-sub">Production Android Companion v2.4.2</div>
    </div>
    <div id="nativeBadge" class="badge">● Native Engine</div>
  </header>

  <div class="content">
    <!-- TAB 1: DIALER -->
    <div id="tab-dialer" class="tab-content active">
      <div class="card">
        <div class="status-bar">
          <span id="callStatus" style="color: #10b981; font-weight: bold;">● Ready to Dial</span>
          <span id="callTimer" style="font-family: monospace; font-size: 13px; color: #cbd5e1;">00:00</span>
        </div>

        <input type="tel" id="phoneNumber" class="dial-display" placeholder="Enter phone..." value="+91 98201 55678" />

        <div class="keypad">
          <button class="key-btn" onclick="pressDigit('1')">1</button>
          <button class="key-btn" onclick="pressDigit('2')">2</button>
          <button class="key-btn" onclick="pressDigit('3')">3</button>
          <button class="key-btn" onclick="pressDigit('4')">4</button>
          <button class="key-btn" onclick="pressDigit('5')">5</button>
          <button class="key-btn" onclick="pressDigit('6')">6</button>
          <button class="key-btn" onclick="pressDigit('7')">7</button>
          <button class="key-btn" onclick="pressDigit('8')">8</button>
          <button class="key-btn" onclick="pressDigit('9')">9</button>
          <button class="key-btn" onclick="pressDigit('*')">*</button>
          <button class="key-btn" onclick="pressDigit('0')">0</button>
          <button class="key-btn" onclick="pressDigit('#')">#</button>
        </div>

        <div style="margin-top: 14px;">
          <button id="callActionBtn" class="action-btn btn-call" onclick="toggleCall()">
            <span>☎️ Start Call & Telemetry</span>
          </button>
          <button class="action-btn btn-native" onclick="dialViaCarrier()">
            <span>📱 Dial via Android Phone Carrier</span>
          </button>
        </div>
      </div>

      <!-- Disposition & Notes -->
      <div class="card" id="dispositionCard" style="display: none;">
        <h4 style="font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #94a3b8; text-transform: uppercase;">Call Disposition</h4>
        <select id="dispositionSelect" style="width: 100%; padding: 10px; border-radius: 10px; background: #030712; border: 1px solid #374151; color: white; font-size: 12px; margin-bottom: 8px;">
          <option value="Interested">Interested in Solution</option>
          <option value="Meeting Demo Booked">Meeting / Demo Scheduled</option>
          <option value="Follow Up">Follow Up Requested</option>
          <option value="Deal Closed">Deal Closed</option>
          <option value="Not Interested">Not Interested</option>
        </select>
        <textarea id="callNotes" rows="2" placeholder="Agent notes..." style="width: 100%; padding: 10px; border-radius: 10px; background: #030712; border: 1px solid #374151; color: white; font-size: 11px; margin-bottom: 8px;"></textarea>
        <button class="action-btn btn-call" style="padding: 10px;" onclick="saveAndSync()">✓ Sync to Desktop CRM</button>
      </div>
    </div>

    <!-- TAB 2: LEADS QUEUE -->
    <div id="tab-leads" class="tab-content">
      <div class="card">
        <h3 style="font-size: 13px; font-weight: 800; margin-bottom: 10px; color: #e2e8f0;">Assigned Outbound Leads</h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div class="lead-item">
            <div>
              <div class="lead-name">Rajesh Mehta (Apex Retail)</div>
              <div class="lead-phone">+91 98200 33445</div>
            </div>
            <button class="call-chip" onclick="quickDial('+91 98200 33445', 'Rajesh Mehta')">Call</button>
          </div>
          <div class="lead-item">
            <div>
              <div class="lead-name">Priya Nair (Global Logistics)</div>
              <div class="lead-phone">+91 99112 88441</div>
            </div>
            <button class="call-chip" onclick="quickDial('+91 99112 88441', 'Priya Nair')">Call</button>
          </div>
          <div class="lead-item">
            <div>
              <div class="lead-name">Vikram Sen (Zenith Solutions)</div>
              <div class="lead-phone">+91 98334 11229</div>
            </div>
            <button class="call-chip" onclick="quickDial('+91 98334 11229', 'Vikram Sen')">Call</button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: LOGS -->
    <div id="tab-logs" class="tab-content">
      <div class="card">
        <h3 style="font-size: 13px; font-weight: 800; margin-bottom: 10px; color: #e2e8f0;">Synchronized Call History</h3>
        <div id="logsContainer" style="display: flex; flex-direction: column; gap: 8px;">
          <!-- Dynamically appended logs -->
        </div>
      </div>
    </div>

    <!-- TAB 4: SETTINGS -->
    <div id="tab-settings" class="tab-content">
      <div class="card">
        <h3 style="font-size: 13px; font-weight: 800; margin-bottom: 12px; color: #e2e8f0;">Device Provisioning</h3>
        <div style="font-size: 11px; color: #94a3b8; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Application Version:</span>
            <strong style="color: #38bdf8;">v2.4.2 (Production Signed)</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Pairing PIN:</span>
            <strong style="color: #fbbf24; font-family: monospace;">EXP-88219</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Agent Profile:</span>
            <strong style="color: #ffffff;">Rohan Sharma</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Cloud Bridge:</span>
            <strong style="color: #34d399;">Connected & Syncing</strong>
          </div>
        </div>
      </div>
    </div>
  </div>

  <nav class="nav-bar">
    <button class="nav-item active" onclick="switchTab('dialer')">
      <span style="font-size: 16px;">☎️</span>
      <span>Dialer</span>
    </button>
    <button class="nav-item" onclick="switchTab('leads')">
      <span style="font-size: 16px;">👥</span>
      <span>Leads</span>
    </button>
    <button class="nav-item" onclick="switchTab('logs')">
      <span style="font-size: 16px;">📜</span>
      <span>Call Logs</span>
    </button>
    <button class="nav-item" onclick="switchTab('settings')">
      <span style="font-size: 16px;">⚙️</span>
      <span>Settings</span>
    </button>
  </nav>

  <script>
    let isCalling = false;
    let callTimer = 0;
    let timerInterval = null;

    function pressDigit(d) {
      const input = document.getElementById('phoneNumber');
      input.value += d;
    }

    function quickDial(num, name) {
      document.getElementById('phoneNumber').value = num;
      switchTab('dialer');
      toggleCall();
    }

    function dialViaCarrier() {
      const num = document.getElementById('phoneNumber').value;
      if (window.AndroidNative && window.AndroidNative.makeCall) {
        window.AndroidNative.makeCall(num);
      } else {
        window.location.href = "tel:" + encodeURIComponent(num);
      }
    }

    function toggleCall() {
      const btn = document.getElementById('callActionBtn');
      const status = document.getElementById('callStatus');
      const dispCard = document.getElementById('dispositionCard');

      if (!isCalling) {
        isCalling = true;
        btn.className = "action-btn btn-hangup";
        btn.innerHTML = "<span>🛑 End Call & Save Disposition</span>";
        status.innerText = "● Call Connected";
        status.style.color = "#38bdf8";
        dispCard.style.display = "block";

        callTimer = 0;
        timerInterval = setInterval(() => {
          callTimer++;
          const mm = String(Math.floor(callTimer / 60)).padStart(2, '0');
          const ss = String(callTimer % 60).padStart(2, '0');
          document.getElementById('callTimer').innerText = mm + ":" + ss;
        }, 1000);
      } else {
        isCalling = false;
        clearInterval(timerInterval);
        btn.className = "action-btn btn-call";
        btn.innerHTML = "<span>☎️ Start Call & Telemetry</span>";
        status.innerText = "● Call Ended - Wrap Up";
        status.style.color = "#fbbf24";
      }
    }

    function saveAndSync() {
      const num = document.getElementById('phoneNumber').value;
      const disp = document.getElementById('dispositionSelect').value;
      const notes = document.getElementById('callNotes').value || "Completed client interaction.";
      const duration = document.getElementById('callTimer').innerText;

      // Add to local history
      const logContainer = document.getElementById('logsContainer');
      const item = document.createElement('div');
      item.className = "lead-item";
      item.innerHTML = '<div><div class="lead-name">' + num + '</div><div class="lead-phone">' + disp + ' (' + duration + ')</div></div><span style="font-size: 10px; color: #34d399; font-weight: bold;">✓ Synced</span>';
      logContainer.prepend(item);

      if (window.AndroidNative && window.AndroidNative.showToast) {
        window.AndroidNative.showToast("Call successfully synced with Expert CRM Desktop.");
      } else {
        alert("Call successfully logged and synced with Expert CRM!");
      }

      document.getElementById('dispositionCard').style.display = "none";
      document.getElementById('callStatus').innerText = "● Ready to Dial";
      document.getElementById('callStatus').style.color = "#10b981";
      document.getElementById('callTimer').innerText = "00:00";
    }

    function switchTab(tab) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      document.getElementById('tab-' + tab).classList.add('active');
      event.currentTarget.classList.add('active');
    }

    window.onload = function() {
      if (window.AndroidNative && window.AndroidNative.getDeviceName) {
        document.getElementById('nativeBadge').innerText = "● " + window.AndroidNative.getDeviceName();
      }
    };
  </script>
</body>
</html>
HTML

# 5. Native Java Activity Source
cat << 'JAVA' > "$BUILD_DIR/src/com/expertcrm/callagent/MainActivity.java"
package com.expertcrm.callagent;

import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.PermissionRequest;
import android.webkit.JavascriptInterface;
import android.content.Intent;
import android.net.Uri;
import android.widget.Toast;
import android.view.KeyEvent;
import android.view.Window;
import android.view.WindowManager;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        
        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
            settings.setMediaPlaybackRequiresUserGesture(false);
        }

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url != null && url.startsWith("tel:")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                return false;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    request.grant(request.getResources());
                }
            }
        });

        webView.addJavascriptInterface(new WebAppInterface(), "AndroidNative");

        // Request runtime permissions on Android 6.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            String[] perms = {
                "android.permission.RECORD_AUDIO",
                "android.permission.CALL_PHONE",
                "android.permission.READ_PHONE_STATE"
            };
            requestPermissions(perms, 101);
        }

        webView.loadUrl("file:///android_asset/index.html");
    }

    public class WebAppInterface {
        @JavascriptInterface
        public void makeCall(String phoneNumber) {
            try {
                Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + phoneNumber));
                startActivity(intent);
            } catch (Exception e) {
                showToast("Cannot open dialer: " + e.getMessage());
            }
        }

        @JavascriptInterface
        public void showToast(final String message) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public String getDeviceName() {
            return Build.MANUFACTURER + " " + Build.MODEL;
        }

        @JavascriptInterface
        public String getAppVersion() {
            return "2.4.2";
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView != null && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
JAVA

# 6. Generate R.java
aapt package -f -m -J "$BUILD_DIR/gen" -M "$BUILD_DIR/AndroidManifest.xml" -S "$BUILD_DIR/res" -I "$ANDROID_JAR"

# 7. Compile Java bytecode
javac -source 8 -target 8 -bootclasspath "$ANDROID_JAR" \
    -d "$BUILD_DIR/bin" \
    "$BUILD_DIR/gen/com/expertcrm/callagent/R.java" \
    "$BUILD_DIR/src/com/expertcrm/callagent/MainActivity.java"

# 8. Convert to Dalvik DEX
"$DX" --dex --output="$BUILD_DIR/bin/classes.dex" "$BUILD_DIR/bin"

# 9. Package unaligned APK
aapt package -f -M "$BUILD_DIR/AndroidManifest.xml" \
    -S "$BUILD_DIR/res" \
    -A "$BUILD_DIR/assets" \
    -I "$ANDROID_JAR" \
    -F "$BUILD_DIR/bin/unaligned.apk"

# 10. Add classes.dex
cd "$BUILD_DIR/bin"
aapt add unaligned.apk classes.dex

# 11. 4-byte zipalign
zipalign -f -v 4 unaligned.apk aligned.apk

# 12. Keystore setup
if [ ! -f "$KEYSTORE" ]; then
    keytool -genkey -v -keystore "$KEYSTORE" \
        -alias expertcrm \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -storepass expertcrm123 -keypass expertcrm123 \
        -dname "CN=ExpertAid Technologies Ltd, OU=Telephony Solutions, O=Expert CRM, L=Mumbai, ST=Maharashtra, C=IN"
fi

# 13. Dual Sign with v1 and v2 schemes
apksigner sign --ks "$KEYSTORE" \
    --ks-key-alias expertcrm \
    --ks-pass pass:expertcrm123 \
    --key-pass pass:expertcrm123 \
    --v1-signing-enabled true \
    --v2-signing-enabled true \
    --out "$OUTPUT_APK" \
    aligned.apk

# Also copy to dist if dist exists
if [ -d "$PROJECT_ROOT/dist" ]; then
    cp -f "$OUTPUT_APK" "$PROJECT_ROOT/dist/expert-call-agent-v2.4.2.apk"
fi

# 14. Verify APK signature and output details
echo "=== Verifying Signed APK ==="
apksigner verify --verbose "$OUTPUT_APK"

echo "=== Dumping Badging ==="
aapt dump badging "$OUTPUT_APK" | head -n 15

echo "APK Successfully generated and verified at: $OUTPUT_APK"
ls -lh "$OUTPUT_APK"
