/*
 * TigerTagScale - ESP32 connected scale with captive portal
 * Version 1.3.0 - Firebase-only authentication, removed API key system
 */

#include <LittleFS.h>
#include <Arduino.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <WiFiManager.h>
#include <ESPAsyncWebServer.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESPmDNS.h>
#include <Preferences.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <HX711.h>
#include <MFRC522.h>
#include <SPI.h>
#include <ESP32Servo.h>

// ============================================================================
// HARDWARE CONFIGURATION
// ============================================================================

#define OLED_WIDTH  128
#define OLED_HEIGHT 64
#define OLED_RESET  -1
#define OLED_ADDR   0x3C

#define RC522_1_SS   5
#define RC522_1_RST  27
#define RC522_2_SS   14
#define RC522_2_RST  25

#define HX711_DOUT  32
#define HX711_SCK   33

#define SERVO_PIN   26
#define LED_PIN     2

#define WS_UPDATE_INTERVAL_MS 250

// Set to 1 to enable verbose RFID page dumps on Serial
#define DEBUG_RFID_DUMP 0
// Set to 1 to keep old TigerTag API-key/cloud-function bridge code.
#define ENABLE_LEGACY_API_BRIDGE 0
// Set to 1 for very verbose runtime logs (heavier flash/serial output).
#define DEBUG_VERBOSE_LOGS 0

// Servo control thresholds
const float    SERVO_WEIGHT_PRESENT_G      = 10.0f;
const float    SERVO_WEIGHT_REMOVED_G      =  8.0f;
const float    SERVO_MIN_SPIN_WEIGHT_G     = 15.0f;
const int      SERVO_STOP_US               = 1500;
const int      SERVO_SEARCH_US             = 1700;
const uint32_t RFID_SECOND_TAG_TIMEOUT_MS  = 6000;   // Faster fallback when 2nd tag is missing
const uint32_t RFID_FIRST_TAG_PAUSE_MS     =  250;   // Short pause after first tag
const float    AUTO_TARE_EMPTY_THRESHOLD_G =  8.0f;
const uint32_t AUTO_TARE_STABLE_MS         =  1200;
const uint32_t AUTO_TARE_TIMEOUT_MS        = 10000;  // 10 second safety timeout for auto-tare

#if ENABLE_LEGACY_API_BRIDGE
const char* TIGERTAG_CLOUD_FN_URL    = "https://us-central1-tigertag-connect.cloudfunctions.net/setSpoolWeightByRfid";
#endif
const char* TIGERTAG_DB_BRAND_URL    = "https://raw.githubusercontent.com/TigerTag-Project/TigerTag-RFID-Guide/main/database/id_brand.json";
const char* TIGERTAG_DB_MATERIAL_URL = "https://raw.githubusercontent.com/TigerTag-Project/TigerTag-RFID-Guide/main/database/id_material.json";

// Firebase Web API Key for the tigertag-connect project.
// This is the public client key exposed by Firebase Hosting at /__/firebase/init.json
// — it is not a secret and is intentionally public for all Firebase client apps.
const char* TIGERTAG_FIREBASE_WEB_API_KEY = "AIzaSyCkxPTs_Cv0KVLqsZj-UKWWqIY0OtfVpnw";


// ============================================================================
// FORWARD DECLARATIONS
// ============================================================================

enum OledState : uint8_t {
    OLED_STATE_IDLE,
    OLED_STATE_WEIGHING,
    OLED_STATE_UID_DETECTED,
    OLED_STATE_SENDING,
    OLED_STATE_SUCCESS,
    OLED_STATE_ERROR
};

void startMDNS();
void onWiFiEvent(WiFiEvent_t event);
void setupServo();
void startServoSearch();
void stopServoSearch();
void updateServoWorkflow(float weight);
String readRFIDFromReader(MFRC522 &reader, String &uidHexOut);
bool pushWeightToCloud(float w);
bool hasAnyDetectedUid();
bool hasTwoDifferentDetectedUids();
bool processAutoTare(float weight);
bool isFirebaseConfigured();
bool firebaseSignIn();
bool ensureFirebaseToken();
#if ENABLE_LEGACY_API_BRIDGE
bool sendSingleUidToCloud(const String& uid, float w, const char* sourceLabel);
static bool fetchApiKeyFromFirestore(const String& uid, const String& idToken);
bool fetchMetaFromApiByUid(const String& uid);
#endif
String getScaleMacAddress();
void initScaleFirestoreSync();
void sendScaleHeartbeat();
bool updateScaleLastSpool(const String& uid_a, const String& uid_b, float weight_raw, float weight_available);
bool waitForNtpSync(uint32_t timeoutMs = 10000, time_t minUnixTime = 1000000000L);
bool readInventoryDocTwinTag(const String& uid, String& outTwinUid);
float readInventoryContainerWeight(const String& uid, float* outMeasureGr = nullptr);
float computeWeightAvailable(float raw_grams, const String& uid_a);
bool readScaleDisplayName(const String& mac, String& outDisplayName, String* outServerTimestamp = nullptr);
String readRackName(const String& rackId);
#if ENABLE_LEGACY_API_BRIDGE
static void parseCloudSpoolMeta(const String& resp);
#endif
static void resetAfterSuccessfulSend(int shownWeight);
static String toHex2(uint8_t v);
static String normalizeUidHex(const String& uid);
static String mapColorName(uint8_t r, uint8_t g, uint8_t b);
static uint16_t be16(uint8_t hi, uint8_t lo);
static String lookupNameInTigerTagDb(const char* url, uint32_t id);
static String resolveBrandNameOnlineFirst(uint32_t idBrand);
static String resolveMaterialNameOnlineFirst(uint32_t idMaterial);
void dumpTigerTagPages(MFRC522 &reader, const String& uidDec);
void displayWeightWithState(float weight, const String& uid, OledState state);
void resetWeightFilters();

// Unique SSID + mDNS name derived from MAC
String gSetupSsid;
String gMdnsName;

// ============================================================================
// WEIGHT ROUNDING
// ============================================================================

static inline int roundWeight(float weight) {
    return (int)(weight + (weight >= 0 ? 0.5f : -0.5f));
}

static String macSuffix4() {
    uint8_t mac[6];
    WiFi.macAddress(mac);
    char suf[5];
    snprintf(suf, sizeof(suf), "%02X%02X", mac[4], mac[5]);
    return String(suf);
}

static String makeSetupSSID() {
    return String("Setup-TigerScale-") + macSuffix4();
}

// ============================================================================
// GLOBAL OBJECTS
// ============================================================================

Adafruit_SSD1306 display(OLED_WIDTH, OLED_HEIGHT, &Wire, OLED_RESET);
HX711 scale;
MFRC522 rfid1(RC522_1_SS, RC522_1_RST);
MFRC522 rfid2(RC522_2_SS, RC522_2_RST);
Servo spoolServo;
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");
Preferences prefs;
WiFiManager wm;

// ============================================================================
// CONFIGURATION VARIABLES
// ============================================================================

String   firebaseEmail        = "";
String   firebasePassword     = "";
String   firebaseIdToken      = "";
String   firebaseRefreshToken = "";
String   firebaseUid          = "";
uint32_t firebaseTokenMs      = 0;
bool     firebaseAuth         = false;
uint32_t lastFbBroadcastMs    = 0;
float    calibrationFactor  = 406.0f;
float    currentWeight      = 0.0f;
String   lastUID    = "";
String   lastUIDHex = "";
String   lastUID2   = "";
String   lastUID2Hex = "";

bool     wifiConnected           = false;
String   lastConnectedSSID       = "";      // Track WiFi network to detect changes
bool     cloudOK                 = false;
bool     servoSearching          = false;
bool     servoPausedForCalibration = false;
bool     autoTarePending         = false;
bool     loadPresent             = false;
bool     rfidLockedForCurrentLoad = false;
bool     servoLockedUntilAutotare = false;  // Servo locked after weight sent until auto-tare completes
bool     servoHoldAfterRemoval    = false;  // Keep servo stopped while load is being removed
uint32_t lastAutoPushSkipLogMs   = 0;
uint32_t firstUidDetectedMs      = 0;
uint32_t firstUidPauseUntilMs    = 0;
uint32_t autoTareStableSinceMs   = 0;
uint32_t autoTareStartedMs       = 0;        // Track when auto-tare started (for timeout safety)
uint32_t lastIdleAutoTareMs      = 0;        // Prevent infinite auto-tare loop at 0g
bool     idleAutoTareArmed       = true;     // Rearm only after leaving near-zero zone

// Auto-push configuration
const float    STABLE_EPSILON_G    =  0.6f;
const uint32_t STABLE_WINDOW_MS   =  2000;
const float    MIN_WEIGHT_TO_SEND_G =  5.0f;
const float    RESEND_DELTA_G      =  3.0f;
const uint32_t RESEND_COOLDOWN_MS  = 15000;

// Weight filter configuration
const float    EMA_ALPHA_FINE      = 0.04f;
const float    EMA_ALPHA_FAST      = 0.10f;
const int      MEDIAN_WINDOW_LARGE = 15;
const float    HYSTERESIS_THRESHOLD = 0.5f;
const float    DEAD_ZONE_G         = 1.0f;
const uint32_t STABLE_DISPLAY_MS   = 1500;
const float    MIN_WEIGHT_CHANGE_TO_RESET_G = 50.0f;

// Cloud weight cache
static float    gLastCloudWeight = NAN;
static float    gLastSentWeight  = NAN;
static uint32_t gCloudWeightSetMs = 0;

// Weight filter state
static float    gEmaWeight          = 0.0f;
static bool     gEmaInit            = false;
static float    gMedianBuf[MEDIAN_WINDOW_LARGE] = {0};
static int      gMedianIdx          = 0;
static int      gMedianCount        = 0;
static float    gLastDisplayedWeight = 0.0f;
static uint32_t gStableStartMs      = 0;
static bool     gIsStable           = false;

// Cloud sync result cache
static bool   gLastNetValid   = false;
static float  gLastNetWeight  = NAN;
static float  gLastRawWeight  = NAN;
static float  gLastContainer  = 0.0f;
static bool   gLastWeightCalcReliable = true;
static String gLastRackId     = "";      // Rack/shelf ID
static String gLastRackName   = "";      // Rack name (e.g., "Rack1")
static int    gLastLevel      = -1;      // Level in rack (0=A, 1=B, etc.)
static int    gLastPosition   = -1;      // Position in rack (0-based, display as +1)
static String gLastRackPosition = "";    // Formatted position (e.g., "A8")
static String gLastManufacturer = "--";
static String gLastMaterial   = "--";
static String gLastColor      = "--";

// Firestore scale sync
static String gScaleMacAddress = "";
static String gScaleDocPath    = "";
static uint32_t gLastHeartbeatMs = 0;
static bool gFirstHeartbeatDone = false;
static bool gNtpSynced = false;
const uint32_t HEARTBEAT_INTERVAL_MS = 30000;

// Auto-send state
volatile int sendCountdown      = -1;
String       sendPhase          = "";
uint32_t     sendPhaseLastChangeMs = 0;

// Auto-push stability tracking
static float    lastPushedWeight = NAN;
static uint32_t stableSinceMs   = 0;
static float    stableCandidate  = NAN;
static uint32_t lastPushMs       = 0;

// Name lookup cache to avoid repeated HTTP fetches for the same brand/material IDs

// OLED state
OledState currentOledState    = OLED_STATE_IDLE;
uint32_t  oledStateChangeMs   = 0;
const uint32_t OLED_MESSAGE_DURATION_MS = 2000;

// ============================================================================
// OLED DISPLAY
// ============================================================================

void displayMessage(String line1, String line2 = "", String line3 = "", String line4 = "") {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0,  0); display.println(line1);
    if (line2.length()) { display.setCursor(0, 16); display.println(line2); }
    if (line3.length()) { display.setCursor(0, 32); display.println(line3); }
    if (line4.length()) { display.setCursor(0, 48); display.println(line4); }
    display.display();
}

void displayWeightWithState(float weight, const String& uid, OledState state) {
    display.clearDisplay();

    display.setTextSize(1);
    display.setCursor(0, 0);
    display.println("Tiger-Scale");
    display.setCursor(104, 0);
    display.println(wifiConnected ? "WiFi" : "----");

    bool hasMetaInfo = (gLastManufacturer != "--" || gLastMaterial != "--" || gLastColor != "--" || gLastRackPosition.length() > 0);
    bool waitingForWeight = (state == OLED_STATE_IDLE)
                            && !hasMetaInfo
                            && !hasAnyDetectedUid()
                            && !loadPresent
                            && fabs(weight) < MIN_WEIGHT_TO_SEND_G;

    // When idle with no load: show IP and mDNS so the user can open the web UI
    if (waitingForWeight) {
        display.setTextSize(1);
        display.drawFastHLine(0, 10, 128, SSD1306_WHITE);
        display.setCursor(0, 30);
        display.println(wifiConnected ? WiFi.localIP().toString() : "No WiFi");
        display.setCursor(0, 42);
        display.println(gMdnsName + ".local");
        display.setCursor(0, 56);
        display.println("Place a spool");
        display.display();
        return;
    }

    // Show net weight (without container) instead of gross weight
    // Show net weight (weight - container) instead of gross weight
    // If we know the container weight, subtract it from the current reading
    float displayWeight = weight;
    if (gLastContainer > 0) {
        if (weight > gLastContainer) {
            displayWeight = weight - gLastContainer;  // Net weight in real-time
        } else {
            displayWeight = 0;  // Don't show negative weights
        }
        #if DEBUG_VERBOSE_LOGS
        Serial.printf("[DISPLAY] Raw: %.2f, Container: %.2f, Net: %.2f\n", weight, gLastContainer, displayWeight);
        #endif
    }

    // Big weight display
    display.setTextSize(2);
    display.setCursor(0, 20);
    display.print(roundWeight(displayWeight));
    display.println("g");

    // Show rack name and position if available
    if (gLastRackPosition.length() > 0) {
        display.setTextSize(1);

        // Show rack name (if available)
        if (gLastRackName.length() > 0) {
            display.setCursor(90, 32);
            display.println(gLastRackName);
        }

        // Show rack position (formatted as letter+number, e.g., "A8")
        display.setCursor(90, 40);
        display.println(gLastRackPosition);
    }

    display.setTextSize(1);
    switch (state) {
        case OLED_STATE_IDLE:
            if (gLastManufacturer != "--" || gLastMaterial != "--" || gLastColor != "--") {
                display.setCursor(0, 41); display.print("Fab: "); display.println(gLastManufacturer);
                display.setCursor(0, 49); display.print("Mat: "); display.println(gLastMaterial);
                display.setCursor(0, 57); display.print("Col: "); display.println(gLastColor);
            } else {
                display.setCursor(0, 48);
                display.println("Ready to weigh");
            }
            break;
        case OLED_STATE_WEIGHING:
            display.setCursor(0, 50);
            display.println("Weighing...");
            break;
        case OLED_STATE_UID_DETECTED:
        case OLED_STATE_SENDING:
            display.setCursor(0, 41); display.print("Fab: "); display.println(gLastManufacturer);
            display.setCursor(0, 49); display.print("Mat: "); display.println(gLastMaterial);
            display.setCursor(0, 57); display.print("Col: "); display.println(gLastColor);
            break;
        case OLED_STATE_SUCCESS:
            display.setCursor(0, 50);
            display.print("Net: ");
            display.println(String(roundWeight(gLastNetWeight)) + " g");
            display.setCursor(0, 56);
            display.println("OK Synced!");
            break;
        case OLED_STATE_ERROR:
            display.setCursor(0, 50);
            display.println("Error! Check WiFi/API");
            break;
    }
    display.display();
}

// ============================================================================
// CLOUD PARSING
// ============================================================================

static bool parseCloudNetWeights(const String& resp, float& netOut, float& rawOut, float& containerOut) {
    StaticJsonDocument<512> doc;
    if (deserializeJson(doc, resp)) return false;
    if (!(doc["success"] | false)) return false;
    if (!doc.containsKey("weight_available")) return false;
    netOut       = doc["weight_available"].as<float>();
    rawOut       = doc["weight"]          | NAN;
    containerOut = doc["container_weight"] | 0.0f;
    return true;
}

// ============================================================================
// WIFI SETUP
// ============================================================================

void configModeCallback(WiFiManager *myWiFiManager) {
    displayMessage("CONFIG MODE", "Connect to WiFi",
                   gSetupSsid.length() ? gSetupSsid : "Setup-TigerScale");
}

void saveConfigCallback() {
    displayMessage("Saving...", "WiFi config OK", "Reconnecting...");
}

void setupWiFi() {
    wm.setAPCallback(configModeCallback);
    wm.setSaveConfigCallback(saveConfigCallback);
    wm.setConfigPortalTimeout(180);

    displayMessage("Connecting WiFi...", "Waiting...");
    gSetupSsid = makeSetupSSID();
    gMdnsName  = String("tigerscale-") + macSuffix4();
    WiFi.setHostname(gMdnsName.c_str());

    if (!wm.autoConnect(gSetupSsid.c_str())) {
        displayMessage("WiFi ERROR", "Restarting...");
        delay(3000);
        ESP.restart();
    }

    wifiConnected = WiFi.isConnected();
    if (wifiConnected) startMDNS();

    cloudOK = true;

    displayMessage("WiFi Connected!", WiFi.SSID(), WiFi.localIP().toString(),
                   cloudOK ? "Cloud: OK" : "Cloud: FAIL");
    delay(2000);
}

// ============================================================================
// LITTLEFS
// ============================================================================

void listDir(fs::FS &fs, const char* dirname, uint8_t levels) {
    File root = fs.open(dirname);
    if (!root || !root.isDirectory()) {
        Serial.printf("[LITTLEFS] Cannot open dir: %s\n", dirname);
        return;
    }
    Serial.printf("[LITTLEFS] Listing: %s\n", dirname);
    File file = root.openNextFile();
    while (file) {
        if (file.isDirectory()) {
            Serial.printf("DIR  %s\n", file.name());
            if (levels) {
                String sub = String(dirname);
                if (!sub.endsWith("/")) sub += "/";
                sub += String(file.name());
                listDir(fs, sub.c_str(), levels - 1);
            }
        } else {
            Serial.printf("FILE %s (%u)\n", file.name(), (unsigned)file.size());
        }
        file = root.openNextFile();
    }
}

void setupFileSystem() {
    Serial.println("[LITTLEFS] Init...");
    if (!LittleFS.begin(true)) {
        Serial.println("[LITTLEFS] Mount failed!");
        displayMessage("ERROR", "Filesystem FAIL", "Check data/");
        delay(3000);
        return;
    }
    Serial.println("[LITTLEFS] Mounted OK");
    File root = LittleFS.open("/www");
    if (!root) {
        Serial.println("[LITTLEFS] /www not found - run uploadfs");
        return;
    }
    listDir(LittleFS, "/www", 3);
}

// ============================================================================
// FIREBASE AUTHENTICATION
// ============================================================================

bool isFirebaseConfigured() {
    return firebaseEmail.length() > 0 && firebasePassword.length() > 0;
}

bool firebaseSignIn() {
    if (!isFirebaseConfigured() || !WiFi.isConnected()) return false;
    HTTPClient http;
    http.setTimeout(5000);
    String url = String("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=")
                 + String(TIGERTAG_FIREBASE_WEB_API_KEY);
    if (!http.begin(url)) return false;
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<192> body;
    body["email"]             = firebaseEmail;
    body["password"]          = firebasePassword;
    body["returnSecureToken"] = true;
    String bodyStr; serializeJson(body, bodyStr);

    int code = http.POST(bodyStr);
    String resp = http.getString();
    http.end();

    if (code != 200) {
        Serial.printf("[FIREBASE] SignIn failed HTTP %d: %s\n", code, resp.c_str());
        firebaseAuth = false;
        return false;
    }
    StaticJsonDocument<768> doc;
    if (deserializeJson(doc, resp)) {
        Serial.println("[FIREBASE] SignIn JSON parse error");
        firebaseAuth = false;
        return false;
    }
    firebaseIdToken      = String(doc["idToken"]      | "");
    firebaseRefreshToken = String(doc["refreshToken"] | "");
    firebaseUid          = String(doc["localId"]      | "");
    firebaseTokenMs      = millis();
    firebaseAuth         = firebaseIdToken.length() > 0;
    Serial.printf("[FIREBASE] SignIn %s uid=%s\n", firebaseAuth ? "OK" : "FAIL", firebaseUid.c_str());

#if ENABLE_LEGACY_API_BRIDGE
    if (firebaseAuth && firebaseUid.length() > 0 && apiKey.length() == 0) {
        fetchApiKeyFromFirestore(firebaseUid, firebaseIdToken);
    }
#endif
    return firebaseAuth;
}

#if ENABLE_LEGACY_API_BRIDGE
// Try multiple Firestore document paths to find the user's TigerTag API key.
// Stores it in the global apiKey variable so x-api-key header works automatically.
// Tries: collections/{uid}, collections/{uid}/keys, collections/{uid}/scale, etc.
static bool fetchApiKeyFromFirestore(const String& uid, const String& idToken) {
    const char* collections[] = {
        "users", "scales", "devices", "apiKeys", "api_keys", "accounts", "profiles", "members"
    };
    const char* subPaths[] = {
        "", "/keys", "/scale", "/device", "/auth", "/config"
    };
    const char* keyFields[] = {
        "apiKey", "api_key", "key", "publicKey", "accessKey", "token", "deviceKey"
    };

    for (const char* coll : collections) {
        for (const char* subPath : subPaths) {
            HTTPClient http;
            http.setTimeout(5000);
            String docPath = String(coll) + "/" + uid;
            if (subPath[0] != '\0') docPath += subPath;
            String url = String("https://firestore.googleapis.com/v1/projects/tigertag-connect"
                                "/databases/(default)/documents/") + docPath;
            if (!http.begin(url)) continue;
            http.addHeader("Authorization", "Bearer " + idToken);
            int code = http.GET();
            String resp = http.getString();
            http.end();

            if (code != 200) continue;

            StaticJsonDocument<2048> doc;
            if (deserializeJson(doc, resp)) continue;
            JsonObject fields = doc["fields"];
            if (fields.isNull()) continue;

            for (const char* field : keyFields) {
                if (!fields.containsKey(field)) continue;
                JsonVariant sv = fields[field]["stringValue"];
                if (sv.isNull()) continue;
                String found = sv.as<String>();
                found.trim();
                if (found.length() == 0) continue;
                apiKey = found;
                Serial.printf("[FIRESTORE] Got apiKey from %s.%s = %s\n", docPath.c_str(), field, found.c_str());
                return true;
            }
        }
    }
    Serial.println("[FIRESTORE] apiKey not found in any known path");
    return false;
}
#endif

bool ensureFirebaseToken() {
    if (!isFirebaseConfigured()) return false;
    // Token expires in 1 hour; refresh 5 min early
    if (firebaseAuth && firebaseIdToken.length() > 0
        && (millis() - firebaseTokenMs) < 3300000UL) return true;

    if (firebaseRefreshToken.length() > 0) {
        HTTPClient http;
        http.setTimeout(5000);
        String url = String("https://securetoken.googleapis.com/v1/token?key=")
                     + String(TIGERTAG_FIREBASE_WEB_API_KEY);
        if (http.begin(url)) {
            http.addHeader("Content-Type", "application/x-www-form-urlencoded");
            String body = "grant_type=refresh_token&refresh_token=" + firebaseRefreshToken;
            int code = http.POST(body);
            String resp = http.getString();
            http.end();
            if (code == 200) {
                StaticJsonDocument<768> doc;
                if (!deserializeJson(doc, resp)) {
                    firebaseIdToken      = String(doc["id_token"]      | "");
                    firebaseRefreshToken = String(doc["refresh_token"] | firebaseRefreshToken.c_str());
                    firebaseTokenMs      = millis();
                    firebaseAuth         = firebaseIdToken.length() > 0;
                    Serial.printf("[FIREBASE] Token refresh %s\n", firebaseAuth ? "OK" : "FAIL");
                    return firebaseAuth;
                }
            }
            Serial.printf("[FIREBASE] Refresh HTTP %d, falling back to sign-in\n", code);
        }
    }
    return firebaseSignIn();
}

// ============================================================================
// FIRESTORE SCALE HEARTBEAT & SYNC
// ============================================================================

String getScaleMacAddress() {
    uint8_t mac[6];
    WiFi.macAddress(mac);
    char macStr[13];
    snprintf(macStr, sizeof(macStr), "%02x%02x%02x%02x%02x%02x",
             mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
    return String(macStr);
}

void initScaleFirestoreSync() {
    if (firebaseUid.length() == 0) return;
    gScaleMacAddress = getScaleMacAddress();
    gScaleDocPath = "users/" + firebaseUid + "/scales/" + gScaleMacAddress;
    Serial.printf("[SCALE] Firestore doc path: %s\n", gScaleDocPath.c_str());
}

// Get current timestamp in milliseconds for Firestore
// Uses millis() + offset for 2026-05-02 since NTP may not be available immediately
// The exact Unix time doesn't matter as much as having a consistent number in ms
// that will update as the device runs
long long getTimestampMs() {
    // Offset for 2026-05-03 00:00:00 UTC in milliseconds
    // Unix timestamp: 1746316800 seconds = 1746316800000 milliseconds
    const long long EPOCH_2026_05_03_MS = 1746316800000LL;
    time_t t = time(nullptr);

    // If we have a reasonable Unix time (> Sep 2001), use it
    if (t > 1000000000L) {
        return (long long)t * 1000LL;
    }

    // Otherwise, use millis() + fixed offset for current date
    // This gives us approximate timestamp based on device uptime
    return EPOCH_2026_05_03_MS + (long long)millis();
}

// Dummy function for backward compatibility (no longer needed, but kept for now)
bool waitForNtpSync(uint32_t timeoutMs, time_t minUnixTime) {
    return true;  // Always succeed
}

// Get WiFi signal strength in dBm
// Returns signal strength in dBm (negative value), or 0 if WiFi not connected
int getWiFiSignalDbm() {
    if (WiFi.status() != WL_CONNECTED) {
        return 0;  // Not connected
    }
    return WiFi.RSSI();  // Returns value like -52, -78, etc.
}

// Read inventory/{uid} and extract twin_tag_uid if present
// Returns true if doc exists and reads twin_tag_uid into outTwinUid (empty if no twin)
bool readInventoryDocTwinTag(const String& uid, String& outTwinUid) {
    if (firebaseIdToken.length() == 0 || uid.length() == 0) return false;

    String uidHex = normalizeUidHex(uid);
    outTwinUid = "";
    HTTPClient http;
    String docPath = "users/" + firebaseUid + "/inventory/" + uidHex;
    String url = "https://firestore.googleapis.com/v1/projects/tigertag-connect/databases/(default)/documents/" + docPath;

    if (!http.begin(url)) return false;
    http.addHeader("Authorization", "Bearer " + firebaseIdToken);

    int code = http.GET();
    String resp = http.getString();
    http.end();

    if (code != 200) return false;

    StaticJsonDocument<512> doc;
    if (deserializeJson(doc, resp)) return false;

    JsonObject fields = doc["fields"];
    if (fields.containsKey("twin_tag_uid") && fields["twin_tag_uid"].containsKey("stringValue")) {
        outTwinUid = normalizeUidHex(fields["twin_tag_uid"]["stringValue"].as<String>());
    }
    return true;
}

// Read scale document from Firestore and extract display_name + server timestamp
// Returns true if doc exists, false otherwise
// outDisplayName: current display_name value (empty if not set)
// outServerTimestamp: Firestore server timestamp in ISO-8601 format (e.g., "2026-05-03T12:34:56.123Z")
bool readScaleDisplayName(const String& mac, String& outDisplayName, String* outServerTimestamp) {
    if (firebaseIdToken.length() == 0 || firebaseUid.length() == 0 || mac.length() == 0) return false;

    outDisplayName = "";
    if (outServerTimestamp) *outServerTimestamp = "";

    HTTPClient http;
    String docPath = "users/" + firebaseUid + "/scales/" + mac;
    String url = "https://firestore.googleapis.com/v1/projects/tigertag-connect/databases/(default)/documents/" + docPath;

    if (!http.begin(url)) return false;
    http.addHeader("Authorization", "Bearer " + firebaseIdToken);

    int code = http.GET();
    String resp = http.getString();
    http.end();

    if (code != 200) return false;  // Document doesn't exist yet

    StaticJsonDocument<512> doc;
    if (deserializeJson(doc, resp)) return false;

    // Extract display_name from fields
    JsonObject fields = doc["fields"];
    if (fields.containsKey("display_name") && fields["display_name"].containsKey("stringValue")) {
        outDisplayName = fields["display_name"]["stringValue"].as<String>();
    }

    // Extract updateTime (server timestamp from Firestore)
    if (outServerTimestamp && doc.containsKey("updateTime")) {
        *outServerTimestamp = doc["updateTime"].as<String>();
    }

    return true;
}

// Read rack document from Firestore and extract rack name
// Returns rack name (e.g., "Atelier"), or empty string if not found
String readRackName(const String& rackId) {
    if (firebaseIdToken.length() == 0 || firebaseUid.length() == 0 || rackId.length() == 0) {
        return "";
    }

    HTTPClient http;
    String docPath = "users/" + firebaseUid + "/racks/" + rackId;
    String url = "https://firestore.googleapis.com/v1/projects/tigertag-connect/databases/(default)/documents/" + docPath;

    if (!http.begin(url)) return "";
    http.addHeader("Authorization", "Bearer " + firebaseIdToken);

    int code = http.GET();
    String resp = http.getString();
    http.end();

    if (code != 200) return "";

    StaticJsonDocument<512> doc;
    if (deserializeJson(doc, resp)) return "";

    // Extract 'name' field from Firestore REST API format
    JsonObject fields = doc["fields"];
    if (!fields.isNull() && fields.containsKey("name")) {
        if (fields["name"].containsKey("stringValue")) {
            return fields["name"]["stringValue"].as<String>();
        }
    }

    // Also try at root level
    if (doc.containsKey("name")) {
        return doc["name"].as<String>();
    }

    return "";
}

// Read inventory/{uid} and extract container_weight (§5 contract requirement)
// Returns container_weight in grams, or 0.0 if not found
// Also optionally returns measure_gr if caller provides pointer
float readInventoryContainerWeight(const String& uid, float* outMeasureGr) {
    if (firebaseIdToken.length() == 0 || uid.length() == 0) {
        Serial.printf("[CONTAINER] skipped: no token or uid\n");
        return 0.0f;
    }

    // Canonical UID format for Firestore inventory paths: HEX uppercase
    String uidForLookup = normalizeUidHex(uid);

    // Check if uid is in decimal format (all digits)
    bool isDecimal = true;
    for (int i = 0; i < uid.length(); i++) {
        if (!isdigit(uid[i])) {
            isDecimal = false;
            break;
        }
    }

    // If decimal, convert to hexadecimal
    if (isDecimal && uid.length() > 0) {
        unsigned long long uidDec = 0;
        // Parse decimal string to number
        for (int i = 0; i < uid.length(); i++) {
            uidDec = uidDec * 10 + (uid[i] - '0');
        }
        // Convert to hex string (uppercase, no leading zeros)
        char hexBuf[32];
        snprintf(hexBuf, sizeof(hexBuf), "%llX", uidDec);
        uidForLookup = String(hexBuf);
        Serial.printf("[CONTAINER] Converted decimal %s → hex %s\n", uid.c_str(), uidForLookup.c_str());
    }

    // Canonical path policy:
    // 1) Try decimal UID doc first (same path used for writes)
    // 2) Fallback to HEX doc only if decimal doc is missing
    String resp = "";
    int code = -1;
    String usedDocPath = "";

    auto fetchInventoryDoc = [&](const String& id) -> int {
        HTTPClient http;
        String docPath = "users/" + firebaseUid + "/inventory/" + id;
        String url = "https://firestore.googleapis.com/v1/projects/tigertag-connect/databases/(default)/documents/" + docPath;
        Serial.printf("[CONTAINER] GET %s\n", docPath.c_str());
        if (!http.begin(url)) {
            Serial.printf("[CONTAINER] http.begin failed\n");
            return -1;
        }
        http.addHeader("Authorization", "Bearer " + firebaseIdToken);
        int c = http.GET();
        resp = http.getString();
        http.end();
        if (c == 200) usedDocPath = docPath;
        return c;
    };

    code = fetchInventoryDoc(uidForLookup);

    // HEX-only policy: no decimal fallback

    if (code != 200) {
        Serial.printf("[CONTAINER] HTTP %d - not found. Resp: %.150s\n", code, resp.c_str());
        return 0.0f;  // Not found - will use raw weight as weight_available
    }

    Serial.printf("[CONTAINER] Using doc: %s\n", usedDocPath.c_str());

    StaticJsonDocument<1024> doc;
    if (deserializeJson(doc, resp)) {
        Serial.printf("[CONTAINER] JSON parse failed\n");
        return 0.0f;
    }

    float container = 0.0f;

    // Try to find container_weight in fields first (Firestore REST API format)
    JsonObject fields = doc["fields"];
    if (!fields.isNull() && fields.containsKey("container_weight")) {
        JsonObject cw = fields["container_weight"];
        if (cw.containsKey("doubleValue")) {
            container = cw["doubleValue"].as<float>();
            Serial.printf("[CONTAINER] ✅ Found in fields.container_weight.doubleValue: %.2f g\n", container);
        } else if (cw.containsKey("integerValue")) {
            // integerValue comes as a string from Firestore REST API
            String ivStr = cw["integerValue"].as<String>();
            container = (float)ivStr.toInt();
            Serial.printf("[CONTAINER] ✅ Found in fields.container_weight.integerValue: %.2f g\n", container);
        }
    }
    // Also check for container_weight at root level (direct format)
    else if (doc.containsKey("container_weight")) {
        container = doc["container_weight"].as<float>();
        Serial.printf("[CONTAINER] ✅ Found at root level: %.2f g\n", container);
    }
    else {
        Serial.printf("[CONTAINER] ❌ 'container_weight' not found anywhere in document\n");
    }

    // Optional: extract measure_gr if caller wants it
    if (outMeasureGr != nullptr && fields.containsKey("measure_gr")) {
        JsonObject mg = fields["measure_gr"];
        if (mg.containsKey("doubleValue")) {
            *outMeasureGr = mg["doubleValue"].as<float>();
        } else if (mg.containsKey("integerValue")) {
            String mgStr = mg["integerValue"].as<String>();
            *outMeasureGr = (float)mgStr.toInt();
        }
    }

    // Store container weight globally for real-time display calculation
    if (container > 0) {
        extern float gLastContainer;  // Global variable for display
        gLastContainer = container;
        Serial.printf("[CONTAINER] Stored globally: gLastContainer = %.2f g\n", container);
    }

    // Extract rack location information from nested rack object
    // Can be in two formats:
    // 1. Firestore REST API: fields.rack.objectValue.fields.{id, level, position}
    // 2. Direct format: rack.{id, level, position} OR fields.rack.{id, level, position}
    extern String gLastRackId;
    extern String gLastRackName;
    extern int gLastLevel;
    extern int gLastPosition;
    extern String gLastRackPosition;

    // Reset rack info
    gLastRackId = "";
    gLastRackName = "";
    gLastLevel = -1;
    gLastPosition = -1;


    // Try to read rack from different possible locations
    bool rackFound = false;
    JsonObject rackObj;

    // Option 1: Direct format at root level (doc["rack"])
    if (!doc.isNull() && doc.containsKey("rack") && !doc["rack"].isNull()) {
        rackObj = doc["rack"];
        rackFound = true;
        Serial.printf("[RACK] Found at root level\n");
    }
    // Option 2: In fields directly (fields.rack as object)
    else if (!fields.isNull() && fields.containsKey("rack")) {
        JsonObject rackField = fields["rack"];

        // Check if it's a nullValue (spool not placed)
        if (rackField.containsKey("nullValue")) {
            Serial.printf("[RACK] ℹ️  Spool not placed in rack (rack is null)\n");
        }
        // Option 2a: Direct object in fields (fields.rack.id, fields.rack.level, etc.)
        else if (!rackField.containsKey("mapValue") && !rackField.containsKey("objectValue") && rackField.containsKey("id")) {
            rackObj = rackField;
            rackFound = true;
            Serial.printf("[RACK] Found in fields.rack (direct format)\n");
        }
        // Option 2b: Firestore REST API format with mapValue (fields.rack.mapValue.fields)
        else if (rackField.containsKey("mapValue")) {
            JsonObject rackMapVal = rackField["mapValue"];
            if (rackMapVal.containsKey("fields")) {
                rackObj = rackMapVal["fields"];
                rackFound = true;
            }
        }
        // Option 2c: Firestore REST API format with objectValue (fields.rack.objectValue.fields)
        else if (rackField.containsKey("objectValue")) {
            JsonObject rackObjVal = rackField["objectValue"];
            if (rackObjVal.containsKey("fields")) {
                rackObj = rackObjVal["fields"];
                rackFound = true;
            }
        }
    }

    String positionLabelRaw = "";

    // If rack object was found, extract fields
    if (rackFound && !rackObj.isNull()) {
        #if DEBUG_VERBOSE_LOGS
        String rackDebug;
        serializeJson(rackObj, rackDebug);
        Serial.printf("[RACK] raw object: %s\n", rackDebug.c_str());
        #endif

        // Read rack ID
        if (rackObj.containsKey("id")) {
            JsonVariant idVal = rackObj["id"];
            if (idVal.is<String>()) {
                // Direct string format
                gLastRackId = idVal.as<String>();
            } else if (idVal.is<JsonObject>()) {
                // REST API format with stringValue
                JsonObject idObj = idVal.as<JsonObject>();
                if (idObj.containsKey("stringValue")) {
                    gLastRackId = idObj["stringValue"].as<String>();
                }
            }
            if (gLastRackId.length() > 0) {
                gLastRackName = readRackName(gLastRackId);
            }
        }

        // Read level (0=A, 1=B, 2=C, ...)
        if (rackObj.containsKey("level")) {
            JsonVariant lvVal = rackObj["level"];
            if (lvVal.is<int>()) {
                // Direct int format
                gLastLevel = lvVal.as<int>();
            } else if (lvVal.is<JsonObject>()) {
                // REST API format with integerValue
                JsonObject lvObj = lvVal.as<JsonObject>();
                if (lvObj.containsKey("integerValue")) {
                    String lvStr = lvObj["integerValue"].as<String>();
                    gLastLevel = lvStr.toInt();
                }
            }
        }

        // Read position (0-based, will be formatted as +1 for display)
        if (rackObj.containsKey("position")) {
            JsonVariant posVal = rackObj["position"];
            if (posVal.is<int>()) {
                // Direct int format
                gLastPosition = posVal.as<int>();
            } else if (posVal.is<JsonObject>()) {
                // REST API format with integerValue
                JsonObject posObj = posVal.as<JsonObject>();
                if (posObj.containsKey("integerValue")) {
                    String posStr = posObj["integerValue"].as<String>();
                    gLastPosition = posStr.toInt();
                }
            }
        }

        // Optional canonical label (preferred): "A1", "E5", etc.
        const char* labelKeys[] = { "position_label", "positionLabel", "slot_label", "slotLabel", "rack_position_label", "rackPositionLabel", "label" };
        for (size_t i = 0; i < (sizeof(labelKeys) / sizeof(labelKeys[0])); i++) {
            const char* k = labelKeys[i];
            if (!rackObj.containsKey(k)) continue;
            JsonVariant plVal = rackObj[k];
            if (plVal.is<String>()) {
                positionLabelRaw = plVal.as<String>();
            } else if (plVal.is<JsonObject>()) {
                JsonObject plObj = plVal.as<JsonObject>();
                if (plObj.containsKey("stringValue")) {
                    positionLabelRaw = plObj["stringValue"].as<String>();
                }
            }
            positionLabelRaw.trim();
            positionLabelRaw.toUpperCase();
            if (positionLabelRaw.length() > 0) break;
        }

        // Fallback lookup for label at document/fields root variants
        if (positionLabelRaw.length() == 0) {
            const char* rootLabelKeys[] = { "position_label", "positionLabel", "rack_position_label", "rackPositionLabel", "slot_label", "slotLabel", "label" };
            for (size_t i = 0; i < (sizeof(rootLabelKeys) / sizeof(rootLabelKeys[0])); i++) {
                const char* k = rootLabelKeys[i];
                JsonVariant plVal;
                if (!fields.isNull() && fields.containsKey(k)) {
                    plVal = fields[k];
                } else if (!doc.isNull() && doc.containsKey(k)) {
                    plVal = doc[k];
                } else {
                    continue;
                }
                if (plVal.is<String>()) {
                    positionLabelRaw = plVal.as<String>();
                } else if (plVal.is<JsonObject>()) {
                    JsonObject plObj = plVal.as<JsonObject>();
                    if (plObj.containsKey("stringValue")) {
                        positionLabelRaw = plObj["stringValue"].as<String>();
                    }
                }
                positionLabelRaw.trim();
                positionLabelRaw.toUpperCase();
                if (positionLabelRaw.length() > 0) break;
            }
        }

        Serial.printf("[RACK] raw level=%d position=%d label=%s\n",
                      gLastLevel, gLastPosition,
                      positionLabelRaw.length() > 0 ? positionLabelRaw.c_str() : "(none)");
    }

    // Preferred source: canonical position label from Firestore
    if (positionLabelRaw.length() > 0) {
        gLastRackPosition = positionLabelRaw;
        if (gLastRackName.length() > 0) {
            Serial.printf("[RACK] ✅ %s position %s (from position_label)\n",
                          gLastRackName.c_str(), gLastRackPosition.c_str());
        } else {
            Serial.printf("[RACK] ✅ Position %s (from position_label)\n",
                          gLastRackPosition.c_str());
        }
    }
    // Fallback: compute from level + position (0-based)
    else if (gLastLevel >= 0 && gLastPosition >= 0) {
        char levelChar = 'A' + gLastLevel;
        int positionNum = gLastPosition + 1;

        // Some backends store position as 1-based and may use 0 as "unknown".
        // If we ever receive a value <= 0, keep legacy +1 fallback; otherwise preserve +1 convention.
        if (gLastPosition <= 0) {
            positionNum = 1;
        }

        char buf[8];
        snprintf(buf, sizeof(buf), "%c%d", levelChar, positionNum);
        gLastRackPosition = String(buf);

        if (gLastRackName.length() > 0) {
            Serial.printf("[RACK] ✅ %s position %s (from level/position)\n",
                          gLastRackName.c_str(), gLastRackPosition.c_str());
        } else {
            Serial.printf("[RACK] ✅ Position %s (from level/position)\n",
                          gLastRackPosition.c_str());
        }
    } else {
        Serial.printf("[RACK] ❌ Missing level (%d) or position (%d)\n", gLastLevel, gLastPosition);
        gLastRackPosition = "";
    }

    return container;
}

// Compute weight_available per §5 contract:
// weight_available = max(0, raw_grams - container_weight)
// Then clamp to measure_gr if set, and [0, 100000] as sanity bound
// Rounds to 1 decimal place
float computeWeightAvailable(float raw_grams, const String& uid_a) {
    float measure_gr = 0.0f;
    float container = readInventoryContainerWeight(uid_a, &measure_gr);
    gLastWeightCalcReliable = true;

    // Guardrail: if raw is clearly below container, this sample is likely invalid
    // (tag still detected but spool already removed / transient bad read).
    const float INVALID_BELOW_CONTAINER_MARGIN_G = 20.0f;
    if (container > 0.0f && raw_grams < (container - INVALID_BELOW_CONTAINER_MARGIN_G)) {
        gLastWeightCalcReliable = false;
        Serial.printf("[WEIGHT_CALC] INVALID raw=%.2f below container=%.2f (margin=%.1f)\n",
                      raw_grams, container, INVALID_BELOW_CONTAINER_MARGIN_G);
    }

    // Compute net weight: raw - container (§5 contract)
    float net = fmax(0.0f, raw_grams - container);

    Serial.printf("[WEIGHT_CALC] uid=%s raw=%.2f container=%.2f net=%.2f",
                  uid_a.c_str(), raw_grams, container, net);

    // If measure_gr is set, clamp to it (spool design capacity)
    if (measure_gr > 0 && net > measure_gr) {
        Serial.printf(" measure_gr=%.2f(clamped)", measure_gr);
        net = measure_gr;
    } else if (measure_gr > 0) {
        Serial.printf(" measure_gr=%.2f(ok)", measure_gr);
    }

    // Sanity bounds [0, 100000]
    net = fmax(0.0f, fmin(100000.0f, net));

    // Round to 1 decimal place
    net = roundf(net * 10.0f) / 10.0f;

    Serial.printf(" final=%.1f\n", net);
    return net;
}

void sendScaleHeartbeat() {
    if (firebaseUid.length() == 0 || firebaseIdToken.length() == 0 || gScaleMacAddress.length() == 0)
        return;

    uint32_t now = millis();
    if ((now - gLastHeartbeatMs) < HEARTBEAT_INTERVAL_MS) return;
    gLastHeartbeatMs = now;

    HTTPClient http;
    String docPath = "users/" + firebaseUid + "/scales/" + gScaleMacAddress;

    StaticJsonDocument<512> doc;

    // === SCHEMA v2: Always update these fields ===

    // === First: Read scale document to get Firestore server timestamp ===
    String currentDisplayName = "";
    String serverTimestamp = "";
    bool scaleDocExists = readScaleDisplayName(gScaleMacAddress, currentDisplayName, &serverTimestamp);

    // 1. fw_version (required)
    doc["fields"]["fw_version"]["stringValue"] = "1.3.0";

    // 2. last_heartbeat_at (required) — Use Firestore server timestamp
    // If we got a server timestamp from the doc read, use it
    // Otherwise, fall back to local time (NTP if synced, or approximation)
    if (serverTimestamp.length() > 0) {
        // Use the timestamp from Firestore server
        doc["fields"]["last_heartbeat_at"]["timestampValue"] = serverTimestamp;
    } else {
        // Fallback: use local time (NTP if available, or approximation)
        char iso8601_str[30];
        time_t now_sec = time(nullptr);
        if (now_sec > 1000000000L) {
            // NTP synced — use current server time
            struct tm* timeinfo = gmtime(&now_sec);
            strftime(iso8601_str, sizeof(iso8601_str), "%Y-%m-%dT%H:%M:%SZ", timeinfo);
        } else {
            // Fallback: approximation based on May 3, 2026 + uptime
            time_t fallback_sec = 1746316800L + (millis() / 1000);
            struct tm* timeinfo = gmtime(&fallback_sec);
            strftime(iso8601_str, sizeof(iso8601_str), "%Y-%m-%dT%H:%M:%SZ", timeinfo);
        }
        doc["fields"]["last_heartbeat_at"]["timestampValue"] = iso8601_str;
    }

    // 3. current_spool_uid_1 (required) — RFID UID in uppercase, no separators, or null
    if (lastUID.length() > 0) {
        doc["fields"]["current_spool_uid_1"]["stringValue"] = lastUID;
    } else {
        doc["fields"]["current_spool_uid_1"]["nullValue"] = "NULL_VALUE";
    }

    // 4. current_spool_uid_2 (required) — second tag or null
    if (lastUID2.length() > 0) {
        doc["fields"]["current_spool_uid_2"]["stringValue"] = lastUID2;
    } else {
        doc["fields"]["current_spool_uid_2"]["nullValue"] = "NULL_VALUE";
    }

    // 5. power_source (required) — enum: "ac", "battery", "usb", "poe"
    doc["fields"]["power_source"]["stringValue"] = "usb";  // Default: USB powered (no battery)

    // 6. battery_percent (required) — 0–100 integer or null
    doc["fields"]["battery_percent"]["nullValue"] = "NULL_VALUE";  // null because no battery

    // 7. is_charging (required) — boolean or null
    doc["fields"]["is_charging"]["nullValue"] = "NULL_VALUE";  // null because no battery

    String updateMaskStr = "?updateMask.fieldPaths=fw_version&updateMask.fieldPaths=last_heartbeat_at&updateMask.fieldPaths=current_spool_uid_1&updateMask.fieldPaths=current_spool_uid_2&updateMask.fieldPaths=power_source&updateMask.fieldPaths=battery_percent&updateMask.fieldPaths=is_charging";

    // === Generate default display name (in case needed) ===
    String lastFourDigits = gScaleMacAddress.substring(8);  // last 4 chars of MAC
    lastFourDigits.toUpperCase();
    String defaultName = "TigerScale-" + lastFourDigits;

    // === Handle display_name: preserve user customizations ===
    // (We already read the display_name above when getting server timestamp)
    if (scaleDocExists && currentDisplayName.length() > 0 && currentDisplayName != defaultName) {
        // Document exists with a custom name — preserve it
        doc["fields"]["display_name"]["stringValue"] = currentDisplayName;
    } else {
        // Document doesn't exist or display_name is empty/default — use default name
        doc["fields"]["display_name"]["stringValue"] = defaultName;
    }
    updateMaskStr += "&updateMask.fieldPaths=display_name";

    // === On first heartbeat: set mac and hardware_revision ===
    if (!gFirstHeartbeatDone) {
        // mac (required) — lowercase hex, no separators
        doc["fields"]["mac"]["stringValue"] = gScaleMacAddress;

        // hardware_revision (optional)
        doc["fields"]["hardware_revision"]["nullValue"] = "NULL_VALUE";  // Not set by firmware (optional)

        updateMaskStr += "&updateMask.fieldPaths=mac&updateMask.fieldPaths=hardware_revision";
        gFirstHeartbeatDone = true;
    }

    // === Optional fields (sent if available) ===
    // wifi_signal_dbm (optional) — WiFi RSSI in dBm (negative value, e.g., -52)
    int wifiRssi = getWiFiSignalDbm();
    if (wifiRssi != 0) {
        doc["fields"]["wifi_signal_dbm"]["integerValue"] = String(wifiRssi);
    } else {
        doc["fields"]["wifi_signal_dbm"]["nullValue"] = "NULL_VALUE";
    }
    updateMaskStr += "&updateMask.fieldPaths=wifi_signal_dbm";

    String url = "https://firestore.googleapis.com/v1/projects/tigertag-connect/databases/(default)/documents/" + docPath + updateMaskStr;

    if (!http.begin(url)) return;
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + firebaseIdToken);

    String payload;
    serializeJson(doc, payload);

    Serial.printf("[HEARTBEAT] PATCH %s\n", docPath.c_str());
    #if DEBUG_VERBOSE_LOGS
    Serial.printf("[HEARTBEAT] Payload (%d bytes): %.120s\n", payload.length(), payload.c_str());
    #endif

    int code = http.PATCH(payload);
    String resp = http.getString();
    http.end();

    if (code >= 200 && code < 300) {
        Serial.printf("[HEARTBEAT] OK (%d) uid_1=%s uid_2=%s fw=1.3.0\n", code,
                     lastUID.length() > 0 ? lastUID.c_str() : "null",
                     lastUID2.length() > 0 ? lastUID2.c_str() : "null");
    } else {
        Serial.printf("[HEARTBEAT] FAIL (%d) resp: %.150s\n", code, resp.c_str());
    }
}

// Write weight_available + last_update to inventory/{uid} (and twin if paired).
// IMPORTANT (§5): weight_available MUST be: max(0, raw_grams - container_weight).
// Read container_weight from the Firestore doc first, then compute net weight.
// Caller must pass the correctly computed weight_available, not raw grams.
bool updateScaleLastSpool(const String& uid_a, const String& uid_b = "", float weight_raw = 0, float weight_available = 0) {
    if (firebaseUid.length() == 0 || firebaseIdToken.length() == 0)
        return false;

    // Edge case: no tags detected
    if (uid_a.length() == 0) {
        Serial.println("[WEIGHT] no UID detected, skipping weight write");
        return false;
    }

    const String uidAHex = normalizeUidHex(uid_a);
    const String uidBHex = normalizeUidHex(uid_b);

    // Get Firestore server timestamp by reading scale document
    String serverTimestamp = "";
    String displayName = "";
    bool scaleDocExists = readScaleDisplayName(gScaleMacAddress, displayName, &serverTimestamp);

    // If we got a server timestamp from Firestore, use it; otherwise fallback to local time
    String tsStr;
    if (serverTimestamp.length() > 0) {
        tsStr = serverTimestamp;  // Use Firestore timestamp (ISO 8601 format like "2026-05-03T12:34:56.789Z")
        Serial.printf("[WEIGHT] Using Firestore timestamp: %s\n", tsStr.c_str());
    } else {
        long long timestampMs = getTimestampMs();
        char tsBuf[20];
        snprintf(tsBuf, sizeof(tsBuf), "%lld", timestampMs);
        tsStr = String(tsBuf);
        Serial.printf("[WEIGHT] Using local timestamp: %s (Firestore unavailable)\n", tsStr.c_str());
    }

    // Case 1: Single tag (or same tag detected twice)
    if (uidBHex.length() == 0 || uidBHex == uidAHex) {
        String twin_a = "";
        readInventoryDocTwinTag(uidAHex, twin_a);

        // If uid_a has a twin_tag_uid, update both docs with same payload (§6.2)
        if (twin_a.length() > 0) {
            Serial.printf("[WEIGHT] uid_a=%s has twin=%s, updating both (non-atomic)\n", uidAHex.c_str(), twin_a.c_str());

            HTTPClient http;
            bool success = true;

            // Update doc A
            String docPath_a = "users/" + firebaseUid + "/inventory/" + uidAHex;
            String url_a = "https://firestore.googleapis.com/v1/projects/tigertag-connect/databases/(default)/documents/" + docPath_a + "?updateMask.fieldPaths=weight_available&updateMask.fieldPaths=last_update";

            if (http.begin(url_a)) {
                http.addHeader("Content-Type", "application/json");
                http.addHeader("Authorization", "Bearer " + firebaseIdToken);

                StaticJsonDocument<256> doc_a;
                doc_a["fields"]["weight_available"]["doubleValue"] = weight_available;
                doc_a["fields"]["last_update"]["timestampValue"] = tsStr;

                String payload_a;
                serializeJson(doc_a, payload_a);

                Serial.printf("[WEIGHT] A URL: %s\n", url_a.c_str());
                Serial.printf("[WEIGHT] A payload: %.80s\n", payload_a.c_str());

                int code_a = http.PATCH(payload_a);
                String resp_a = http.getString();
                http.end();

                if (code_a < 200 || code_a >= 300) {
                    Serial.printf("[WEIGHT] A FAIL (%d): %.120s\n", code_a, resp_a.c_str());
                    success = false;
                }
            }

            // Update doc B (twin)
            String docPath_b = "users/" + firebaseUid + "/inventory/" + twin_a;
            String url_b = "https://firestore.googleapis.com/v1/projects/tigertag-connect/databases/(default)/documents/" + docPath_b + "?updateMask.fieldPaths=weight_available&updateMask.fieldPaths=last_update";

            if (http.begin(url_b)) {
                http.addHeader("Content-Type", "application/json");
                http.addHeader("Authorization", "Bearer " + firebaseIdToken);

                StaticJsonDocument<256> doc_b;
                doc_b["fields"]["weight_available"]["doubleValue"] = weight_available;
                doc_b["fields"]["last_update"]["timestampValue"] = tsStr;

                String payload_b;
                serializeJson(doc_b, payload_b);

                int code_b = http.PATCH(payload_b);
                http.end();

                if (code_b < 200 || code_b >= 300) {
                    Serial.printf("[WEIGHT] update B FAIL (%d)\n", code_b);
                    success = false;
                }
            }

            if (success) {
                lastUID = uidAHex;
                Serial.printf("[WEIGHT] twin update uid_a=%s uid_b=%s weight=%.1f OK\n", uidAHex.c_str(), twin_a.c_str(), weight_available);
                sendScaleHeartbeat();
                return true;
            }
            return false;
        } else {
            // Single tag without twin — write only to uid_a
            HTTPClient http;
            String docPath = "users/" + firebaseUid + "/inventory/" + uidAHex;
            String url = "https://firestore.googleapis.com/v1/projects/tigertag-connect/databases/(default)/documents/" + docPath;
            String updateMask = "?updateMask.fieldPaths=weight_available&updateMask.fieldPaths=last_update";

            if (!http.begin(url + updateMask)) return false;
            http.addHeader("Content-Type", "application/json");
            http.addHeader("Authorization", "Bearer " + firebaseIdToken);

            StaticJsonDocument<256> doc;
            doc["fields"]["weight_available"]["doubleValue"] = weight_available;
            doc["fields"]["last_update"]["timestampValue"] = tsStr;

            String payload;
            serializeJson(doc, payload);

            Serial.printf("[WEIGHT] URL: %s\n", (url + updateMask).c_str());
            Serial.printf("[WEIGHT] Payload (%d bytes): %.80s\n", payload.length(), payload.c_str());

            int code = http.PATCH(payload);
            String resp = http.getString();
            http.end();

            if (code >= 200 && code < 300) {
                lastUID = uidAHex;
                Serial.printf("[WEIGHT] uid=%s weight=%.1f OK\n", uidAHex.c_str(), weight_available);
                sendScaleHeartbeat();
                return true;
            } else {
                Serial.printf("[WEIGHT] uid=%s weight=%.1f FAIL (%d) resp: %.120s\n", uidAHex.c_str(), weight_available, code, resp.c_str());
                return false;
            }
        }
    } else {
        // Case 2: Two different tags detected — implement decision matrix from §6.1
        String twin_a = "", twin_b = "";
        readInventoryDocTwinTag(uidAHex, twin_a);
        readInventoryDocTwinTag(uidBHex, twin_b);

        Serial.printf("[WEIGHT] 2 tags detected: uid_a=%s (twin=%s) uid_b=%s (twin=%s)\n",
                      uidAHex.c_str(), twin_a.length() > 0 ? twin_a.c_str() : "none",
                      uidBHex.c_str(), twin_b.length() > 0 ? twin_b.c_str() : "none");

        // Decision matrix (§6.1):
        // [A=B, B=A] ✅ Paired correctly → update both
        // [A=B, B=null] ⚠️ Asymmetric → update both, fix B.twin_tag_uid=A
        // [A=null, B=A] ⚠️ Asymmetric → update both, fix A.twin_tag_uid=B
        // [A=null, B=null] 🆕 New pair → update both, set A.twin_tag_uid=B, B.twin_tag_uid=A
        // [A=C, B=*] 🚨 Conflict → only update A, log warning
        // [A=*, B=C] 🚨 Conflict → only update B, log warning
        // [A≠B AND A∉{B,null} AND B∉{A,null}] → different spools → skip

        bool twin_a_is_b = (twin_a == uidBHex);
        bool twin_b_is_a = (twin_b == uidAHex);
        bool twin_a_is_other = (twin_a.length() > 0 && twin_a != uidBHex);
        bool twin_b_is_other = (twin_b.length() > 0 && twin_b != uidAHex);

        if (twin_a_is_other) {
            // A is already paired to someone else (conflict)
            Serial.printf("[WEIGHT] CONFLICT: A already paired to %s, skipping weight write\n", twin_a.c_str());
            return false;
        }
        if (twin_b_is_other) {
            // B is already paired to someone else (conflict)
            Serial.printf("[WEIGHT] CONFLICT: B already paired to %s, skipping weight write\n", twin_b.c_str());
            return false;
        }
        if (!twin_a_is_b && !twin_b_is_a && twin_a.length() > 0 && twin_b.length() > 0) {
            // Both have different twin_tag_uids (different spools on platform)
            Serial.printf("[WEIGHT] multi-spool: uid_a links to %s, uid_b links to %s, skipping\n", twin_a.c_str(), twin_b.c_str());
            return false;
        }

        // All other cases are valid twin-pair scenarios — update with repair
        Serial.printf("[WEIGHT] twin-pair: updating uid_a=%s uid_b=%s (non-atomic)\n", uidAHex.c_str(), uidBHex.c_str());

        HTTPClient http;
        bool success = true;

        // Update A (weight + possibly twin_tag_uid repair)
        String docPath_a = "users/" + firebaseUid + "/inventory/" + uidAHex;
        String maskStr_a = "?updateMask.fieldPaths=weight_available&updateMask.fieldPaths=last_update";
        if (!twin_a_is_b) maskStr_a += "&updateMask.fieldPaths=twin_tag_uid";
        String url_a = "https://firestore.googleapis.com/v1/projects/tigertag-connect/databases/(default)/documents/" + docPath_a + maskStr_a;

        if (http.begin(url_a)) {
            http.addHeader("Content-Type", "application/json");
            http.addHeader("Authorization", "Bearer " + firebaseIdToken);

            StaticJsonDocument<256> doc_a;
            doc_a["fields"]["weight_available"]["doubleValue"] = weight_available;
            doc_a["fields"]["last_update"]["timestampValue"] = tsStr;
            if (!twin_a_is_b) {
                doc_a["fields"]["twin_tag_uid"]["stringValue"] = uidBHex;
            }

            String payload_a;
            serializeJson(doc_a, payload_a);

            int code_a = http.PATCH(payload_a);
            http.end();

            if (code_a < 200 || code_a >= 300) {
                Serial.printf("[WEIGHT] twin A FAIL (%d)\n", code_a);
                success = false;
            }
        }

        // Update B (weight + possibly twin_tag_uid repair)
        String docPath_b = "users/" + firebaseUid + "/inventory/" + uidBHex;
        String maskStr_b = "?updateMask.fieldPaths=weight_available&updateMask.fieldPaths=last_update";
        if (!twin_b_is_a) maskStr_b += "&updateMask.fieldPaths=twin_tag_uid";
        String url_b = "https://firestore.googleapis.com/v1/projects/tigertag-connect/databases/(default)/documents/" + docPath_b + maskStr_b;

        if (http.begin(url_b)) {
            http.addHeader("Content-Type", "application/json");
            http.addHeader("Authorization", "Bearer " + firebaseIdToken);

            StaticJsonDocument<256> doc_b;
            doc_b["fields"]["weight_available"]["doubleValue"] = weight_available;
            doc_b["fields"]["last_update"]["timestampValue"] = tsStr;
            if (!twin_b_is_a) {
                doc_b["fields"]["twin_tag_uid"]["stringValue"] = uidAHex;
            }

            String payload_b;
            serializeJson(doc_b, payload_b);

            int code_b = http.PATCH(payload_b);
            http.end();

            if (code_b < 200 || code_b >= 300) {
                Serial.printf("[WEIGHT] twin B FAIL (%d)\n", code_b);
                success = false;
            }
        }

        if (success) {
            lastUID = uidAHex;
            lastUID2 = uidBHex;
            Serial.printf("[WEIGHT] twin-pair update uid_a=%s uid_b=%s weight=%.1f OK\n", uidAHex.c_str(), uidBHex.c_str(), weight_available);
            sendScaleHeartbeat();
            return true;
        }
        return false;
    }
    return false;
}

// ============================================================================
// WEBSOCKET
// ============================================================================

void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client,
               AwsEventType type, void *arg, uint8_t *data, size_t len) {
    if (type == WS_EVT_CONNECT) {
        Serial.printf("[WS] client #%u connected\n", client->id());
        // Send weight snapshot immediately on connect
        char snap[160];
        snprintf(snap, sizeof(snap), "{\"weight\":%d,\"uid\":\"%s\",\"uid2\":\"%s\"}",
                 roundWeight(currentWeight), lastUID.c_str(), lastUID2.c_str());
        client->text(snap);
        // Push current Firebase status
        StaticJsonDocument<192> out;
        out["type"]       = "firebaseStatus";
        out["auth"]       = firebaseAuth;
        out["configured"] = isFirebaseConfigured();
        if (firebaseAuth) out["email"] = firebaseEmail;
        String s; serializeJson(out, s);
        client->text(s);

    } else if (type == WS_EVT_DATA) {
        AwsFrameInfo *info = (AwsFrameInfo*)arg;
        if (!info->final || info->opcode != WS_TEXT) return;
        String msg = String((const char*)data).substring(0, len);

        StaticJsonDocument<256> doc;
        if (deserializeJson(doc, msg)) {
            Serial.println("[WS] bad JSON");
            return;
        }
        // No WS command types currently needed; extend here if required
        (void)doc;
    }
}

// ============================================================================
// WEIGHT FILTER HELPERS
// ============================================================================

void resetWeightFilters() {
    gEmaWeight          = 0.0f;
    gEmaInit            = false;
    gMedianIdx          = 0;
    gMedianCount        = 0;
    gLastDisplayedWeight = 0.0f;
    gStableStartMs      = 0;
    gIsStable           = false;
    memset(gMedianBuf, 0, sizeof(gMedianBuf));
}

// ============================================================================
// POST-SEND STATE RESET (shared by all send paths)
// ============================================================================

static void resetAfterSuccessfulSend(int shownWeight) {
    currentOledState = OLED_STATE_IDLE;
    oledStateChangeMs = millis();
    lastUID = ""; lastUID2 = "";
    lastUIDHex = ""; lastUID2Hex = "";
    firstUidDetectedMs = 0; firstUidPauseUntilMs = 0;
    stableSinceMs = 0; stableCandidate = NAN;
    rfidLockedForCurrentLoad = true;
    servoLockedUntilAutotare = true;  // Lock servo until auto-tare completes
    stopServoSearch();
    Serial.println("[SERVO] Cycle locked after send, waiting for removal + auto tare");
    char buf[128];
    snprintf(buf, sizeof(buf), "{\"weight\":%d,\"uid\":\"%s\",\"uid2\":\"%s\"}",
             shownWeight, lastUID.c_str(), lastUID2.c_str());
    ws.textAll(buf);
    displayWeightWithState(currentWeight, lastUID, currentOledState);
}

// ============================================================================
// SHARED WEIGHT PUSH HANDLER (used by /api/weight and /api/push-weight)
// ============================================================================

static void handleWeightPushBody(AsyncWebServerRequest *request,
                                  uint8_t *data, size_t len,
                                  size_t index, size_t total,
                                  bool allowUidOverride) {
    StaticJsonDocument<192> doc;
    if (deserializeJson(doc, data, len) || !doc.containsKey("weight")) {
        request->send(400, "application/json", "{\"error\":\"missing weight\"}");
        return;
    }
    float w  = doc["weight"].as<float>();
    int   wi = roundWeight(w);

    if (!ensureFirebaseToken()) {
        request->send(401, "application/json", "{\"error\":\"not authenticated\"}");
        return;
    }

    bool ok = false;
    if (allowUidOverride && doc.containsKey("uid")) {
        String uidOverride = String(doc["uid"] | "");
        uidOverride.trim();
        if (uidOverride.length() > 0) {
            #if ENABLE_LEGACY_API_BRIDGE
            ok = sendSingleUidToCloud(uidOverride, wi, "REST/weight");
            #else
            String prevUid1 = lastUID;
            String prevUid2 = lastUID2;
            lastUID  = normalizeUidHex(uidOverride);
            lastUID2 = "";
            ok = pushWeightToCloud(wi);
            if (!ok) {
                lastUID  = prevUid1;
                lastUID2 = prevUid2;
            }
            #endif
        } else {
            if (!hasAnyDetectedUid()) {
                request->send(400, "application/json", "{\"error\":\"missing uid (present a tag)\"}");
                return;
            }
            ok = pushWeightToCloud(wi);
        }
    } else {
        if (!hasAnyDetectedUid()) {
            request->send(400, "application/json", "{\"error\":\"missing uid (present a tag)\"}");
            return;
        }
        ok = pushWeightToCloud(wi);
    }

    if (ok) {
        int shown = wi;
        if (gLastNetValid) {
            currentWeight  = gLastNetWeight;
            shown          = roundWeight(gLastNetWeight);
            gLastNetValid  = true;
            gLastRawWeight = gLastRawWeight;
            gLastContainer = gLastContainer;
        } else {
            currentWeight = (float)wi;
            gLastNetValid = false;
        }
        resetAfterSuccessfulSend(shown);
        request->send(200, "application/json", "{\"status\":\"ok\"}");
    } else {
        request->send(502, "application/json", "{\"error\":\"upstream sync failed\"}");
    }
}

// ============================================================================
// WEB SERVER
// ============================================================================

void setupWebServer() {
    ws.onEvent(onWsEvent);
    server.addHandler(&ws);

    // Serve index.html(.gz), with a built-in fallback page when LittleFS has no UI files
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
        if (LittleFS.exists("/www/index.html.gz")) {
            AsyncWebServerResponse *r = request->beginResponse(
                LittleFS, "/www/index.html.gz", "text/html; charset=utf-8");
            r->addHeader("Content-Encoding", "gzip");
            r->addHeader("Cache-Control", "no-store");
            request->send(r); return;
        }
        if (LittleFS.exists("/www/index.html")) {
            AsyncWebServerResponse *r = request->beginResponse(
                LittleFS, "/www/index.html", "text/html; charset=utf-8");
            r->addHeader("Cache-Control", "no-store");
            request->send(r); return;
        }
        // Fallback: built-in diagnostic page (no LittleFS needed)
        String ip   = WiFi.localIP().toString();
        String mdns = gMdnsName + ".local";
        String html =
            "<!DOCTYPE html><html><head><meta charset='utf-8'>"
            "<meta name='viewport' content='width=device-width,initial-scale=1'>"
            "<title>TigerScale</title>"
            "<style>body{font-family:sans-serif;max-width:480px;margin:40px auto;padding:0 16px}"
            "h1{color:#e67e22}table{width:100%;border-collapse:collapse}"
            "td{padding:6px 8px;border-bottom:1px solid #eee}td:first-child{font-weight:bold;width:40%}"
            ".warn{background:#fff3cd;border:1px solid #ffc107;padding:12px;border-radius:6px;margin:16px 0}"
            "</style></head><body>"
            "<h1>TigerScale</h1>"
            "<div class='warn'>&#9888; Web UI not found in flash.<br>"
            "Upload the filesystem: <code>pio run --target uploadfs</code></div>"
            "<h2>Device Info</h2><table>"
            "<tr><td>IP</td><td><b>" + ip + "</b></td></tr>"
            "<tr><td>mDNS</td><td>" + mdns + "</td></tr>"
            "<tr><td>WiFi</td><td>" + WiFi.SSID() + "</td></tr>"
            "<tr><td>API status</td><td><a href='/api/status'>/api/status</a></td></tr>"
            "<tr><td>Tare</td><td><a href='#' onclick=\"fetch('/api/tare',{method:'POST'}).then(r=>r.json()).then(d=>alert(JSON.stringify(d)));return false\">Tare now</a></td></tr>"
            "</table>"
            "<h2>Weight</h2>"
            "<p id='w'>Loading...</p>"
            "<script>"
            "var ws=new WebSocket('ws://'+location.host+'/ws');"
            "ws.onmessage=function(e){var d=JSON.parse(e.data);"
            "if(d.weight!==undefined)document.getElementById('w').textContent=d.weight+' g';};"
            "</script>"
            "</body></html>";
        request->send(200, "text/html; charset=utf-8", html);
    });

    // CSS (cache 24h)
    server.on("/style.css", HTTP_GET, [](AsyncWebServerRequest *request) {
        if (LittleFS.exists("/www/style.css")) {
            AsyncWebServerResponse *r = request->beginResponse(LittleFS, "/www/style.css", "text/css");
            r->addHeader("Cache-Control", "max-age=86400");
            request->send(r); return;
        }
        if (LittleFS.exists("/www/style.css.gz")) {
            AsyncWebServerResponse *r = request->beginResponse(LittleFS, "/www/style.css.gz", "text/css");
            r->addHeader("Content-Encoding", "gzip");
            r->addHeader("Cache-Control", "max-age=86400");
            request->send(r); return;
        }
        request->send(404, "text/plain", "style.css not found");
    });
    server.serveStatic("/styles.css", LittleFS, "/www/styles.css").setCacheControl("no-store");

    // JavaScript (no-store)
    server.on("/app.js", HTTP_GET, [](AsyncWebServerRequest *request) {
        if (LittleFS.exists("/www/app.js")) {
            AsyncWebServerResponse *r = request->beginResponse(
                LittleFS, "/www/app.js", "application/javascript");
            r->addHeader("Cache-Control", "no-store");
            request->send(r); return;
        }
        if (LittleFS.exists("/www/app.js.gz")) {
            AsyncWebServerResponse *r = request->beginResponse(
                LittleFS, "/www/app.js.gz", "application/javascript");
            r->addHeader("Content-Encoding", "gzip");
            r->addHeader("Cache-Control", "no-store");
            request->send(r); return;
        }
        request->send(404, "text/plain", "app.js not found");
    });
    server.serveStatic("/script.js", LittleFS, "/www/script.js").setCacheControl("no-store");
    server.serveStatic("/img", LittleFS, "/www/img").setCacheControl("no-store");


    server.on("/api/reset-wifi", HTTP_POST, [](AsyncWebServerRequest *request){
        request->send(200, "application/json", "{\"status\":\"resetting\"}");
        delay(500);
        wm.resetSettings();
        ESP.restart();
    });

    server.on("/api/factory-reset", HTTP_POST, [](AsyncWebServerRequest *request){
        request->send(200, "application/json", "{\"status\":\"factory reset\"}");
        delay(500);
        prefs.begin("config", false);
        prefs.clear();
        prefs.end();
        wm.resetSettings();
        ESP.restart();
    });

    // Status - uses ArduinoJson
    server.on("/api/status", HTTP_GET, [](AsyncWebServerRequest *request){
        StaticJsonDocument<512> doc;
        doc["weight"]            = roundWeight(currentWeight);
        doc["rawWeight"]         = (float)((int)(currentWeight * 100)) / 100.0f;
        doc["uid"]               = lastUID;
        doc["uid_hex"]           = lastUIDHex;
        doc["uid2"]              = lastUID2;
        doc["uid2_hex"]          = lastUID2Hex;
        doc["wifi"]              = WiFi.SSID();
        doc["ip"]                = WiFi.localIP().toString();
        doc["mdns"]              = gMdnsName + ".local";
        doc["cloud"]             = cloudOK ? "ok" : "down";
        doc["firebaseConfigured"] = isFirebaseConfigured();
        doc["firebaseAuth"]      = firebaseAuth;
        doc["firebaseEmail"]     = firebaseEmail;
        doc["calibrationFactor"] = calibrationFactor;
        doc["uptime_ms"]         = millis();
        doc["uptime_s"]          = millis() / 1000;
        String stc;
        if      (sendPhase == "countdown" && sendCountdown >= 0) stc = String(sendCountdown);
        else if (sendPhase == "send")    stc = "send";
        else if (sendPhase == "success") stc = "success";
        else if (sendPhase == "error")   stc = "error";
        doc["sendToCloud"] = stc;
        String out; serializeJson(doc, out);
        request->send(200, "application/json", out);
    });

    // Firebase auth
    server.on("/api/firebase/auth", HTTP_POST, [](AsyncWebServerRequest *request){}, NULL,
        [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total){
            StaticJsonDocument<256> doc;
            if (deserializeJson(doc, data, len)) {
                request->send(400, "application/json",
                              "{\"success\":false,\"error\":\"bad json\"}"); return;
            }
            String email    = doc["email"]    | "";
            String password = doc["password"] | "";
            email.trim(); password.trim(); email.toLowerCase();
            if (email.length() == 0 || password.length() == 0) {
                request->send(400, "application/json",
                              "{\"success\":false,\"error\":\"email and password required\"}"); return;
            }
            bool accountChanged = (firebaseEmail != email);
            firebaseEmail = email; firebasePassword = password;
            // Invalidate old token when credentials change
            if (accountChanged) {
                firebaseIdToken = ""; firebaseRefreshToken = "";
                firebaseTokenMs = 0;  firebaseAuth = false;
            }
            prefs.begin("config", false);
            prefs.putString("fbEmail", firebaseEmail);
            prefs.putString("fbPass",  firebasePassword);
            prefs.end();
            // Attempt sign-in now
            bool signedIn = firebaseSignIn();
            StaticJsonDocument<192> rsp;
            rsp["success"]        = true;
            rsp["configured"]     = true;
            rsp["accountChanged"] = accountChanged;
            rsp["email"]          = firebaseEmail;
            rsp["auth"]           = signedIn;
            String s; serializeJson(rsp, s);
            request->send(200, "application/json", s);
        }
    );

    server.on("/api/firebase/auth", HTTP_GET, [](AsyncWebServerRequest *request){
        StaticJsonDocument<128> rsp;
        rsp["configured"] = isFirebaseConfigured();
        rsp["auth"]       = firebaseAuth;
        rsp["email"]      = firebaseEmail;
        String s; serializeJson(rsp, s);
        request->send(200, "application/json", s);
    });

    server.on("/api/firebase/auth", HTTP_DELETE, [](AsyncWebServerRequest *request){
        firebaseEmail = ""; firebasePassword = "";
        firebaseIdToken = ""; firebaseRefreshToken = "";
        firebaseTokenMs = 0; firebaseAuth = false;
        prefs.begin("config", false);
        prefs.remove("fbEmail"); prefs.remove("fbPass");
        prefs.end();
        request->send(200, "application/json", "{\"success\":true,\"configured\":false,\"auth\":false}");
    });

    #if ENABLE_LEGACY_API_BRIDGE
    // Set TigerTag API key (legacy bridge mode)
    server.on("/api/set-apikey", HTTP_POST, [](AsyncWebServerRequest *request){}, NULL,
        [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total){
            StaticJsonDocument<128> doc;
            if (deserializeJson(doc, data, len)) {
                request->send(400, "application/json", "{\"success\":false,\"error\":\"bad json\"}");
                return;
            }
            String key = String(doc["apiKey"] | "");
            key.trim();
            if (key.length() == 0) {
                request->send(400, "application/json", "{\"success\":false,\"error\":\"apiKey required\"}");
                return;
            }
            apiKey = key;
            prefs.begin("config", false);
            prefs.putString("apiKey", apiKey);
            prefs.end();
            Serial.printf("[APIKEY] Stored: %s\n", apiKey.c_str());
            StaticJsonDocument<128> rsp;
            rsp["success"] = true;
            rsp["apiKey"] = apiKey.substring(0, 4) + "...";
            String s; serializeJson(rsp, s);
            request->send(200, "application/json", s);
        }
    );
    #endif

    server.on("/api/ping", HTTP_GET, [](AsyncWebServerRequest *request){
        request->send(200, "text/plain", "pong");
    });

    // Weight push - shared implementation (ArduinoJson, merged handlers)
    server.on("/api/weight", HTTP_POST, [](AsyncWebServerRequest *r){}, NULL,
        [](AsyncWebServerRequest *r, uint8_t *d, size_t l, size_t i, size_t t){
            handleWeightPushBody(r, d, l, i, t, true);
        }
    );
    server.on("/api/push-weight", HTTP_POST, [](AsyncWebServerRequest *r){}, NULL,
        [](AsyncWebServerRequest *r, uint8_t *d, size_t l, size_t i, size_t t){
            handleWeightPushBody(r, d, l, i, t, false);
        }
    );

    // Tare
    server.on("/api/tare", HTTP_POST, [](AsyncWebServerRequest *request){
        scale.tare();
        currentWeight = 0.0f;
        resetWeightFilters();
        autoTarePending = false;
        autoTareStableSinceMs = 0;
        lastUID = "";
        float offset = scale.get_offset();
        prefs.begin("config", false);
        prefs.putFloat("tareFactor", offset);
        prefs.end();
        Serial.printf("[TARE] Manual tare saved: %f\n", offset);
        displayWeightWithState(currentWeight, lastUID, currentOledState);
        char buf[128];
        snprintf(buf, sizeof(buf), "{\"weight\":%d,\"uid\":\"%s\",\"uid2\":\"%s\"}",
                 roundWeight(currentWeight), lastUID.c_str(), lastUID2.c_str());
        ws.textAll(buf);
        request->send(200, "application/json", "{\"status\":\"ok\"}");
    });

    // Calibration (ArduinoJson)
    server.on("/api/calibration", HTTP_POST, [](AsyncWebServerRequest *request){}, NULL,
        [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total){
            StaticJsonDocument<128> doc;
            if (deserializeJson(doc, data, len)) {
                request->send(400, "application/json", "{\"error\":\"bad json\"}"); return;
            }
            float f = 0.0f;
            if      (doc.containsKey("factor")) f = doc["factor"].as<float>();
            else if (doc.containsKey("value"))  f = doc["value"].as<float>();
            if (f == 0.0f) {
                request->send(400, "application/json", "{\"error\":\"invalid factor\"}"); return;
            }
            calibrationFactor = f;
            scale.set_scale(calibrationFactor);
            resetWeightFilters();
            servoPausedForCalibration = true;
            stopServoSearch();
            Serial.printf("[CAL] calibrationFactor=%.4f\n", calibrationFactor);
            prefs.begin("config", false);
            prefs.putFloat("calFactor", calibrationFactor);
            prefs.end();
            displayWeightWithState(currentWeight, lastUID, currentOledState);
            request->send(200, "application/json", "{\"status\":\"ok\"}");
        }
    );

    server.onNotFound([](AsyncWebServerRequest *request){
        const char* m = "OTHER";
        switch (request->method()) {
            case HTTP_GET:    m = "GET";    break;
            case HTTP_POST:   m = "POST";   break;
            case HTTP_DELETE: m = "DELETE"; break;
            case HTTP_PUT:    m = "PUT";    break;
            default: break;
        }
        Serial.printf("[404] %s %s\n", m, request->url().c_str());
        request->send(404, "text/plain", "404 Not Found");
    });

    server.begin();
    Serial.println("[HTTP] Server started on port 80");
}

// ============================================================================
// CLOUD COMMUNICATION
// ============================================================================
#if ENABLE_LEGACY_API_BRIDGE
bool sendSingleUidToCloud(const String& uid, float w, const char* sourceLabel) {
    if (!wifiConnected || !WiFi.isConnected()) {
        Serial.printf("[%s] skipped: WiFi not connected\n", sourceLabel);
        return false;
    }
    if (!ensureFirebaseToken()) {
        Serial.printf("[%s] skipped: Firebase not authenticated\n", sourceLabel);
        return false;
    }
    if (apiKey.length() == 0) {
        Serial.printf("[%s] skipped: no apiKey (Firestore lookup pending)\n", sourceLabel);
        // Try to fetch it now that we have a valid token
        if (firebaseUid.length() > 0) fetchApiKeyFromFirestore(firebaseUid, firebaseIdToken);
        if (apiKey.length() == 0) return false;
    }
    if (uid.length() == 0) {
        Serial.printf("[%s] skipped: missing UID\n", sourceLabel);
        return false;
    }

    HTTPClient http;
    if (!http.begin(TIGERTAG_CLOUD_FN_URL)) {
        Serial.printf("[%s] http.begin failed\n", sourceLabel);
        return false;
    }
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", apiKey);

    int wInt = roundWeight(w);
    StaticJsonDocument<128> payloadDoc;
    payloadDoc["uid"]    = uid;
    payloadDoc["weight"] = wInt;
    String payloadStr; serializeJson(payloadDoc, payloadStr);

    Serial.printf("[%s] POST uid=%s weight=%d apiKey=%s...\n", sourceLabel, uid.c_str(), wInt,
                  apiKey.length() > 4 ? apiKey.substring(0, 4).c_str() : "???");
    int code = http.POST(payloadStr);
    String resp = http.getString();
    http.end();

    if (code >= 200 && code < 300) {
        float net = NAN, raw = NAN, cont = 0.0f;
        gLastNetValid = parseCloudNetWeights(resp, net, raw, cont);
        parseCloudSpoolMeta(resp);
        if (gLastNetValid) {
            gLastNetWeight = net;
            gLastRawWeight = raw;
            gLastContainer = cont;
            Serial.printf("[%s] net=%.2f raw=%.2f container=%.2f\n", sourceLabel, net, raw, cont);
        }
        return true;
    }
    Serial.printf("[%s] Upstream error %d\n", sourceLabel, code);
    return false;
}

static void parseCloudSpoolMeta(const String& resp) {
    StaticJsonDocument<1024> doc;
    if (deserializeJson(doc, resp)) return;

    auto pick = [&](const char* a, const char* b, const char* c, const char* d) -> String {
        const char* v = nullptr;
        if (a) v = doc[a] | nullptr;
        if ((!v || !*v) && b) v = doc[b] | nullptr;
        if ((!v || !*v) && c) v = doc[c] | nullptr;
        if ((!v || !*v) && d) v = doc[d] | nullptr;
        return (v && *v) ? String(v) : String("--");
    };

    String m = pick("manufacturer", "brand", "vendor", "maker");
    String t = pick("material", "filament_type", "filamentMaterial", "type");
    String c = pick("color", "colour", "filament_color", "filamentColor");

    if (m == "--") {
        const char* cid = doc["container_id"] | nullptr;
        if (cid && *cid) {
            String s = String(cid);
            int us = s.indexOf('_');
            if (us > 0) s = s.substring(0, us);
            s.toUpperCase();
            m = s;
        }
    }
    if (t == "--") {
        String series = pick("series", "name_series", "material_series", nullptr);
        if (series != "--") t = series;
    }
    if (c == "--") {
        String name   = pick("name", "color_name", "colour_name", nullptr);
        String online = pick("online_color", "online_colour", nullptr, nullptr);
        if (name != "--" && online != "--") c = name + " " + online;
        else if (name != "--")   c = name;
        else if (online != "--") c = online;
    }
    if (m == "--" && doc.containsKey("id_brand"))
        m = resolveBrandNameOnlineFirst(doc["id_brand"].as<uint32_t>());
    if (t == "--" && doc.containsKey("id_material"))
        t = resolveMaterialNameOnlineFirst(doc["id_material"].as<uint32_t>());

    if (m != "--") gLastManufacturer = m;
    if (t != "--") gLastMaterial     = t;
    if (c != "--") gLastColor        = c;
}
#endif

bool pushWeightToCloud(float w) {
    // Use Firestore REST API directly (via updateScaleLastSpool)
    // instead of cloud function (which may not be deployed)

    if (lastUID.length() == 0) {
        Serial.println("[AutoPush] skipped: missing UID");
        return false;
    }

    // Compute weight_available (net weight per §5 contract)
    float weightAvailable = computeWeightAvailable(w, lastUID);
    if (!gLastWeightCalcReliable) {
        Serial.printf("[AutoPush] skipped: invalid weight sample (raw=%.2f container=%.2f)\n",
                      w, gLastContainer);
        return false;
    }
    gLastNetWeight = weightAvailable;
    gLastNetValid  = true;

    // Call updateScaleLastSpool with:
    // - lastUID: primary tag
    // - lastUID2: secondary tag (if different and exists)
    // - weight_raw: raw grams from scale
    // - weight_available: computed net weight
    Serial.printf("[AutoPush] Writing to Firestore: uid_1=%s uid_2=%s weight=%.2f\n",
                  lastUID.c_str(),
                  lastUID2.length() > 0 && lastUID2 != lastUID ? lastUID2.c_str() : "null",
                  weightAvailable);

    return updateScaleLastSpool(lastUID, lastUID2, w, weightAvailable);
}

#if ENABLE_LEGACY_API_BRIDGE
bool fetchMetaFromApiByUid(const String& uid) {
    if (uid.length() == 0 || !wifiConnected || !WiFi.isConnected())
        return false;

    if (!ensureFirebaseToken()) {
        Serial.printf("[META] skipped: Firebase not authenticated\n");
        return false;
    }

    if (apiKey.length() == 0) {
        Serial.printf("[META] skipped: no apiKey (Firestore lookup pending)\n");
        if (firebaseUid.length() > 0) fetchApiKeyFromFirestore(firebaseUid, firebaseIdToken);
        if (apiKey.length() == 0) return false;
    }

    HTTPClient http;
    if (!http.begin(TIGERTAG_CLOUD_FN_URL)) return false;
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", apiKey);

    StaticJsonDocument<128> payloadDoc;
    payloadDoc["uid"]    = uid;
    payloadDoc["weight"] = roundWeight(currentWeight);
    String payloadStr; serializeJson(payloadDoc, payloadStr);

    int code = http.POST(payloadStr);
    String resp = http.getString();
    http.end();

    if (code < 200 || code >= 300) return false;
    parseCloudSpoolMeta(resp);
    return true;
}
#endif

void handleAutoPush(float w) {
    const uint32_t now = millis();

    if ((sendPhase == "success" || sendPhase == "error") && (now - sendPhaseLastChangeMs > 1500)) {
        sendPhase = ""; sendCountdown = -1;
    }

    if (w < MIN_WEIGHT_TO_SEND_G || !firebaseAuth
        || !hasAnyDetectedUid() || !WiFi.isConnected()) {
        if (now - lastAutoPushSkipLogMs > 3000) {
            #if DEBUG_VERBOSE_LOGS
            Serial.printf("[AutoPush] waiting: w=%.2f firebase=%s uid=%s wifi=%s\n",
                          w, firebaseAuth ? "OK" : "NOT_AUTH",
                          hasAnyDetectedUid() ? "OK" : "MISSING",
                          WiFi.isConnected() ? "OK" : "DOWN");
            #endif
            lastAutoPushSkipLogMs = now;
        }
        sendPhase = ""; sendCountdown = -1;
        stableSinceMs = 0; stableCandidate = NAN;
        return;
    }

    if (isnan(stableCandidate)) {
        stableCandidate = w;
        stableSinceMs   = now;
        sendPhase       = "countdown";
        sendCountdown   = ((int)STABLE_WINDOW_MS + 999) / 1000;
    }

    if (fabs(w - stableCandidate) > STABLE_EPSILON_G) {
        stableCandidate = w;
        stableSinceMs   = now;
        sendPhase       = "countdown";
        sendCountdown   = ((int)STABLE_WINDOW_MS + 999) / 1000;
        return;
    }

    uint32_t elapsed = now - stableSinceMs;

    // IMMEDIATE SEND if 2 different tags detected (don't wait for stability)
    bool twoTagsDetected = hasTwoDifferentDetectedUids();
    if (!twoTagsDetected && elapsed < STABLE_WINDOW_MS) {
        int newCount = ((int)(STABLE_WINDOW_MS - elapsed) + 999) / 1000;
        if (newCount != sendCountdown) sendCountdown = newCount;
        return;
    }

    // Apply cooldown and delta guard before sending
    if (!isnan(lastPushedWeight)) {
        if (fabs(w - lastPushedWeight) < RESEND_DELTA_G) return;
        if (now - lastPushMs < RESEND_COOLDOWN_MS) return;
    }

    sendPhase = "send"; sendCountdown = 0;
    displayMessage("Sending...", "Fab: " + gLastManufacturer, String(roundWeight(w)) + " g");

    bool ok = pushWeightToCloud(w);
    if (ok) {
        float toDisplay = (gLastNetValid && !isnan(gLastNetWeight)) ? gLastNetWeight : w;
        int   wInt      = roundWeight(toDisplay);

        // Persist for delta/cooldown guard on next call
        lastPushedWeight = toDisplay;
        lastPushMs       = now;

        gLastSentWeight   = w;
        gLastCloudWeight  = toDisplay;
        gCloudWeightSetMs = now;
        currentWeight     = toDisplay;
        Serial.printf("[CLOUD] Sent: %.2f g, Net: %.2f g\n", w, toDisplay);

        // Compute weight_available per §5: read container_weight from Firestore and compute net
        float weightAvailable = 0.0f;
        if (lastUID.length() > 0) {
            weightAvailable = computeWeightAvailable(w, lastUID);
            Serial.printf("[FIRESTORE] uid=%s raw=%.2f weight_available=%.1f\n", lastUID.c_str(), w, weightAvailable);
        } else {
            Serial.println("[FIRESTORE] skipping weight write: no UID");
        }

        // Firestore write already done in pushWeightToCloud()

        resetAfterSuccessfulSend(wInt);
        gLastNetValid = false;

        sendPhase = "success"; sendPhaseLastChangeMs = millis(); sendCountdown = -1;
    } else {
        displayMessage("Sync failed", "Check WiFi/API", String(roundWeight(w)) + " g");
        delay(2000);
        currentOledState  = OLED_STATE_ERROR;
        oledStateChangeMs = millis();
        displayWeightWithState(w, lastUID, OLED_STATE_ERROR);
        sendPhase = "error"; sendPhaseLastChangeMs = millis(); sendCountdown = -1;
    }
}

// ============================================================================
// mDNS
// ============================================================================

void startMDNS() {
    MDNS.end();
    delay(50);
    if (!WiFi.isConnected()) return;
    if (MDNS.begin(gMdnsName.c_str())) {
        MDNS.addService("http", "tcp", 80);
        Serial.println("[mDNS] http://" + gMdnsName + ".local");
    } else {
        Serial.println("[mDNS] start failed");
    }
}

void onWiFiEvent(WiFiEvent_t event) {
    switch (event) {
        case ARDUINO_EVENT_WIFI_STA_GOT_IP:
#ifdef SYSTEM_EVENT_STA_GOT_IP
        case SYSTEM_EVENT_STA_GOT_IP:
#endif
            wifiConnected = true;
            Serial.println("[WiFi] Connected: " + WiFi.localIP().toString());
            startMDNS();
            break;
        case ARDUINO_EVENT_WIFI_STA_DISCONNECTED:
#ifdef SYSTEM_EVENT_STA_DISCONNECTED
        case SYSTEM_EVENT_STA_DISCONNECTED:
#endif
            wifiConnected = false;
            Serial.println("[WiFi] Disconnected");
            MDNS.end();
            break;
        default: break;
    }
}

// ============================================================================
// SCALE
// ============================================================================

void setupScale() {
    scale.begin(HX711_DOUT, HX711_SCK);
    scale.set_scale(calibrationFactor);

    prefs.begin("config", true);
    float savedTare = prefs.getFloat("tareFactor", 0.0f);
    prefs.end();

    if (savedTare != 0.0f) {
        scale.set_offset(savedTare);
        Serial.printf("[SCALE] Tare restored: %f\n", savedTare);
        displayMessage("Scale OK", "Tare restored");
    } else {
        scale.tare();
        Serial.println("[SCALE] First boot tare done");
        displayMessage("Scale OK", "Tare done");
    }
    delay(1000);
}

static bool isRapidChange(float raw) {
    static float    gLastRaw     = 0.0f;
    static uint32_t gLastRawTime = 0;
    uint32_t now = millis();
    uint32_t dt  = now - gLastRawTime;
    if (dt < 50) return false;
    float delta  = fabs(raw - gLastRaw);
    gLastRaw     = raw;
    gLastRawTime = now;
    return (dt < 100 && delta > 2.0f);
}

static float applyDeadZone(float value) {
    if (fabs(value) < DEAD_ZONE_G) return 0.0f;
    return (value >= 0) ? (value - DEAD_ZONE_G) : (value + DEAD_ZONE_G);
}

static float applyHysteresis(float newValue, float lastValue) {
    return (fabs(newValue - lastValue) < HYSTERESIS_THRESHOLD) ? lastValue : newValue;
}

static float computeMedian() {
    if (gMedianCount == 0) return gEmaWeight;
    float tmp[MEDIAN_WINDOW_LARGE];
    memcpy(tmp, gMedianBuf, gMedianCount * sizeof(float));
    for (int i = 1; i < gMedianCount; ++i) {
        float key = tmp[i]; int j = i - 1;
        while (j >= 0 && tmp[j] > key) { tmp[j+1] = tmp[j]; j--; }
        tmp[j+1] = key;
    }
    return (gMedianCount % 2 == 1)
        ? tmp[gMedianCount / 2]
        : (tmp[gMedianCount/2 - 1] + tmp[gMedianCount/2]) / 2.0f;
}

float readWeight() {
    if (!scale.is_ready()) return currentWeight;

    float raw = scale.get_units(1);

    gMedianBuf[gMedianIdx] = raw;
    gMedianIdx = (gMedianIdx + 1) % MEDIAN_WINDOW_LARGE;
    if (gMedianCount < MEDIAN_WINDOW_LARGE) gMedianCount++;
    float medianVal = computeMedian();

    bool  rapidChange = isRapidChange(raw);
    float alphaToUse  = rapidChange ? EMA_ALPHA_FAST : EMA_ALPHA_FINE;

    if (!gEmaInit) { gEmaWeight = medianVal; gEmaInit = true; }
    else            { gEmaWeight += alphaToUse * (medianVal - gEmaWeight); }

    float withHysteresis = applyHysteresis(gEmaWeight, gLastDisplayedWeight);
    float withDeadZone   = applyDeadZone(withHysteresis);

    float delta = fabs(withDeadZone - gLastDisplayedWeight);
    if (delta < 0.2f) {
        if (gStableStartMs == 0) gStableStartMs = millis();
        else if (millis() - gStableStartMs > STABLE_DISPLAY_MS) gIsStable = true;
    } else {
        gStableStartMs = millis();
        gIsStable = false;
    }

    gLastDisplayedWeight = withDeadZone;
    currentWeight        = withDeadZone;
    return currentWeight;
}

// ============================================================================
// RFID
// ============================================================================

static String u64ToDec(uint64_t v) {
    if (v == 0) return String("0");
    char buf[21]; buf[20] = '\0'; int i = 20;
    while (v > 0 && i > 0) {
        uint64_t q = v / 10ULL;
        buf[--i] = '0' + (uint8_t)(v - q * 10ULL);
        v = q;
    }
    return String(&buf[i]);
}

static String normalizeUidHex(const String& uid) {
    String s = uid;
    s.trim();
    if (s.length() == 0) return s;

    bool isDecimal = true;
    for (int i = 0; i < s.length(); i++) {
        if (!isdigit(s[i])) { isDecimal = false; break; }
    }

    if (isDecimal) {
        unsigned long long uidDec = 0ULL;
        for (int i = 0; i < s.length(); i++) {
            uidDec = uidDec * 10ULL + (unsigned long long)(s[i] - '0');
        }
        char hexBuf[32];
        snprintf(hexBuf, sizeof(hexBuf), "%llX", uidDec);
        return String(hexBuf);
    }

    s.toUpperCase();
    return s;
}

void setupRFID() {
    SPI.begin();
    rfid1.PCD_Init();
    rfid2.PCD_Init();
    displayMessage("RFID OK", "2x RC522 ready");
    delay(1000);
}

void setupServo() {
    // Ensure GPIO 26 is completely clean before attaching servo
    pinMode(SERVO_PIN, OUTPUT);
    digitalWrite(SERVO_PIN, LOW);
    delay(50);

    spoolServo.setPeriodHertz(50);
    spoolServo.attach(SERVO_PIN, 1000, 2000);

    // Force servo to STOP position multiple times to ensure clean state
    for (int i = 0; i < 5; i++) {
        spoolServo.writeMicroseconds(SERVO_STOP_US);
        delay(10);
    }
    servoSearching = false;
    Serial.println("[SERVO] Ready on GPIO 26 (clean state)");
}

void startServoSearch() {
    if (servoSearching) return;

    // Re-attach servo if it was detached
    if (!spoolServo.attached()) {
        spoolServo.setPeriodHertz(50);
        spoolServo.attach(SERVO_PIN, 1000, 2000);
        Serial.println("[SERVO] Re-attached after detach");
    }

    spoolServo.writeMicroseconds(SERVO_SEARCH_US);
    servoSearching = true;
    Serial.printf("[SERVO] Searching RFID... (uid=%s uid2=%s hasLock=%d)\n",
                  lastUID.c_str(), lastUID2.c_str(), rfidLockedForCurrentLoad);
}

void stopServoSearch() {
    if (!servoSearching) return;  // Already stopped, no need to detach repeatedly

    Serial.println("[SERVO] Stopping search...");
    // Keep servo attached for faster restart; stop with neutral pulse.
    // Detach only when explicitly needed elsewhere.
    if (!spoolServo.attached()) {
        spoolServo.setPeriodHertz(50);
        spoolServo.attach(SERVO_PIN, 1000, 2000);
    }
    spoolServo.writeMicroseconds(SERVO_STOP_US);

    servoSearching = false;
}

bool processAutoTare(float weight) {
    if (!autoTarePending) return false;

    // CRITICAL: Always stop servo immediately when entering auto-tare mode
    // This prevents the servo from running if updateServoWorkflow() was skipped
    stopServoSearch();

    sendPhase = ""; sendCountdown = -1;
    stableSinceMs = 0; stableCandidate = NAN;

    if (fabs(weight) <= AUTO_TARE_EMPTY_THRESHOLD_G) {
        if (autoTareStableSinceMs == 0) {
            autoTareStableSinceMs = millis();
            Serial.printf("[AUTOTARE] Waiting for stable empty (weight=%.2f)\n", weight);
        } else if (millis() - autoTareStableSinceMs >= AUTO_TARE_STABLE_MS) {
            scale.tare();
            currentWeight = 0.0f;
            resetWeightFilters();
            autoTarePending = false;
            servoLockedUntilAutotare = false;  // Unlock servo after auto-tare completes
            autoTareStableSinceMs = 0;
            autoTareStartedMs = 0;              // Reset auto-tare start time
            if (servoHoldAfterRemoval) {
                servoHoldAfterRemoval = false;
                rfidLockedForCurrentLoad = false;
                Serial.println("[SERVO] Removal hold released after auto-tare - ready for next measurement");
            }

            // Clear display information (RFID, rack, material, etc.)
            gLastRackId = "";
            gLastRackName = "";
            gLastLevel = -1;
            gLastPosition = -1;
            gLastRackPosition = "";
            gLastManufacturer = "--";
            gLastMaterial = "--";
            gLastColor = "--";
            gLastContainer = 0.0f;

            float offset = scale.get_offset();
            prefs.begin("config", false);
            prefs.putFloat("tareFactor", offset);
            prefs.end();
            Serial.printf("[AUTOTARE] ✅ Auto tare complete, scale ready for next measurement\n");
            return true;
        }
    } else {
        autoTareStableSinceMs = 0;
    }
    return false;
}

void updateServoWorkflow(float weight) {
    // HOLD: after removal event, keep servo stopped until scale is effectively empty
    if (servoHoldAfterRemoval) {
        stopServoSearch();
        return;
    }

    // STOP: Servo locked after weight sent — wait for auto-tare completion
    if (servoLockedUntilAutotare) {
        stopServoSearch();
        return;
    }

    // STOP: Tags detected — servo paused until auto-tare completes
    if (lastUID.length() > 0 && lastUID2.length() == 0 && !rfidLockedForCurrentLoad) {
        uint32_t now = millis();
        if (firstUidPauseUntilMs == 0) {
            firstUidPauseUntilMs = now + RFID_FIRST_TAG_PAUSE_MS;
            stopServoSearch();
            return;
        }
        if (now < firstUidPauseUntilMs) {
            stopServoSearch();
            return;
        }
        if (firstUidDetectedMs > 0 &&
            (now - firstUidDetectedMs) < RFID_SECOND_TAG_TIMEOUT_MS &&
            weight >= SERVO_MIN_SPIN_WEIGHT_G) {
            startServoSearch();
            return;
        }
        stopServoSearch();
        return;
    }
    if (lastUID.length() > 0) {
        stopServoSearch();
        return;
    }

    // Emergency stop if weight is empty
    if (fabs(weight) <= SERVO_WEIGHT_REMOVED_G) {
        stopServoSearch();
        if (servoPausedForCalibration) {
            servoPausedForCalibration = false;
        }
        return;
    }

    if (servoPausedForCalibration) {
        stopServoSearch();
        return;
    }

    // Only activate servo if weight is significant (>= 150g)
    if (weight < SERVO_MIN_SPIN_WEIGHT_G) {
        stopServoSearch();
        return;
    }

    // Servo runs while waiting for weight to be sent
    startServoSearch();
}

static String toHex2(uint8_t v) {
    char b[3]; snprintf(b, sizeof(b), "%02X", v); return String(b);
}

static String mapColorName(uint8_t r, uint8_t g, uint8_t b) {
    uint8_t mx = max(r, max(g, b));
    uint8_t mn = min(r, min(g, b));
    uint8_t diff = mx - mn;
    if (mx < 25)  return "Black";
    if (mn > 230) return "White";
    if (diff < 18 && mx > 80 && mx < 230)       return "Gray";
    if (r > 200 && g > 160 && b < 100)           return "Yellow";
    if (r > 200 && b > 170 && g < 130)           return "Pink";
    if (g > 160 && b > 160 && r < 120)           return "Cyan";
    if (r > 140 && g > 80 && g < 170 && b < 90)  return "Orange";
    if (r > 120 && b > 120 && g < 100)           return "Purple";
    if (g > r + 25 && g > b + 25)                return "Green";
    if (b > r + 25 && b > g + 25)                return "Blue";
    if (r > g + 25 && r > b + 25)                return "Red";
    return "Unknown";
}

static uint16_t be16(uint8_t hi, uint8_t lo) {
    return ((uint16_t)hi << 8) | (uint16_t)lo;
}

static String lookupNameInTigerTagDb(const char* url, uint32_t id) {
    if (!WiFi.isConnected()) return "--";
    HTTPClient http;
    http.setTimeout(4500);
    if (!http.begin(url)) return "--";
    int code = http.GET();
    if (code < 200 || code >= 300) { http.end(); return "--"; }
    String body = http.getString();
    http.end();
    if (body.length() == 0) return "--";

    int p = 0;
    while (true) {
        p = body.indexOf("\"id\"", p);
        if (p < 0) break;
        int c = body.indexOf(':', p); if (c < 0) break;
        int s = c + 1;
        while (s < (int)body.length() && (body[s] == ' ' || body[s] == '\t')) s++;
        int e = s;
        while (e < (int)body.length() && body[e] >= '0' && body[e] <= '9') e++;
        if (e <= s) { p = c + 1; continue; }
        uint32_t got = (uint32_t)body.substring(s, e).toInt();
        if (got != id) { p = e; continue; }
        int objEnd = body.indexOf('}', e);
        if (objEnd < 0) objEnd = min((int)body.length(), e + 500);
        String obj = body.substring(p, objEnd);
        int k = obj.indexOf("\"label\""); if (k < 0) k = obj.indexOf("\"name\"");
        if (k < 0) return "--";
        int c2 = obj.indexOf(':', k); if (c2 < 0) return "--";
        int q1 = obj.indexOf('"', c2 + 1);
        int q2 = (q1 >= 0) ? obj.indexOf('"', q1 + 1) : -1;
        if (q1 < 0 || q2 <= q1) return "--";
        String out = obj.substring(q1 + 1, q2); out.trim();
        return out.length() ? out : "--";
    }
    return "--";
}

static String resolveBrandNameOnlineFirst(uint32_t idBrand) {
    String name = lookupNameInTigerTagDb(TIGERTAG_DB_BRAND_URL, idBrand);
    if (name == "--") name = String("ID ") + String(idBrand);
    return name;
}

static String resolveMaterialNameOnlineFirst(uint32_t idMaterial) {
    String name = lookupNameInTigerTagDb(TIGERTAG_DB_MATERIAL_URL, idMaterial);
    if (name == "--") name = String("ID ") + String(idMaterial);
    return name;
}

void dumpTigerTagPages(MFRC522 &reader, const String& uidDec) {
#if DEBUG_RFID_DUMP
    Serial.println("[TAG] ----- DUMP START -----");
    Serial.println("[TAG] UID DEC: " + uidDec);
    byte buf[18]; byte sz;
    for (byte start = 0x04; start <= 0x18; start += 4) {
        sz = sizeof(buf);
        MFRC522::StatusCode sc = reader.MIFARE_Read(start, buf, &sz);
        if (sc != MFRC522::STATUS_OK || sz < 16) {
            Serial.printf("[TAG] READ 0x%02X fail: %s\n", start, reader.GetStatusCodeName(sc));
            continue;
        }
        for (byte p = 0; p < 4; ++p) {
            byte i = p * 4;
            Serial.printf("[TAG] P%02X: %02X %02X %02X %02X\n",
                          start + p, buf[i], buf[i+1], buf[i+2], buf[i+3]);
        }
    }
    Serial.println("[TAG] ----- DUMP END -----");
#else
    (void)reader; (void)uidDec;
#endif
}

String readRFIDFromReader(MFRC522 &reader, String &uidHexOut) {
    if (!reader.PICC_IsNewCardPresent() || !reader.PICC_ReadCardSerial()) return "";

    String hexStr; hexStr.reserve(reader.uid.size * 2);
    uint64_t decVal = 0ULL;
    for (byte i = 0; i < reader.uid.size; i++) {
        byte b = reader.uid.uidByte[i];
        if (b < 0x10) hexStr += '0';
        hexStr += String(b, HEX);
        decVal = (decVal << 8) | b;
    }
    hexStr.toUpperCase();
    uidHexOut = hexStr;
    String decStr = u64ToDec(decVal);

    dumpTigerTagPages(reader, decStr);

    // Read TigerTag page data via SPI
    // IDs are on the tag; names are looked up from TigerTag DB (GitHub)
    byte data[18]; byte size = sizeof(data);
    MFRC522::StatusCode sc = reader.MIFARE_Read(0x05, data, &size);
    if (sc == MFRC522::STATUS_OK && size >= 16) {
        uint16_t idMaterial16 = be16(data[4],  data[5]);
        uint16_t idBrand16    = be16(data[10], data[11]);
        uint8_t  r = data[12], g = data[13], b = data[14];

        gLastManufacturer = resolveBrandNameOnlineFirst(idBrand16);
        gLastMaterial     = resolveMaterialNameOnlineFirst(idMaterial16);
        gLastColor        = mapColorName(r, g, b) + " #" + toHex2(r) + toHex2(g) + toHex2(b);

        Serial.printf("[TAG] uid=%s -> Fab=%s Mat=%s Col=%s\n",
                      decStr.c_str(), gLastManufacturer.c_str(), gLastMaterial.c_str(), gLastColor.c_str());
    } else {
        gLastManufacturer = "--"; gLastMaterial = "--"; gLastColor = "--";
    }

    reader.PICC_HaltA();
    reader.PCD_StopCrypto1();
    return decStr;
}

bool hasAnyDetectedUid() {
    return lastUID.length() > 0 || lastUID2.length() > 0;
}

bool hasTwoDifferentDetectedUids() {
    return lastUID.length() > 0 && lastUID2.length() > 0 && lastUID != lastUID2;
}

static bool isLikelyTigerTagUidHex(const String& uidHex) {
    // TigerTag UIDs used in this project are typically 7-byte (14 hex chars).
    // Accept >= 12 chars as valid to avoid truncation/noise from short 4-byte UIDs.
    return uidHex.length() >= 12;
}

// ============================================================================
// SETUP & LOOP
// ============================================================================

void setup() {
    Serial.begin(115200);
    pinMode(LED_PIN, OUTPUT);
    Wire.begin(21, 22);

    if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
        Serial.println(F("OLED init failed"));
        while (1);
    }

    displayMessage("TigerTagScale", "Starting...", "v1.3.0");
    delay(2000);

    prefs.begin("config", true);
    firebaseEmail     = prefs.getString("fbEmail",  "");
    firebasePassword  = prefs.getString("fbPass",   "");
    calibrationFactor = prefs.getFloat("calFactor", calibrationFactor);
    prefs.end();

    Serial.printf("[BOOT] Firebase configured: %s\n",
                  isFirebaseConfigured() ? "yes" : "no");

    WiFi.onEvent(onWiFiEvent);
    setupWiFi();
    if (WiFi.isConnected()) startMDNS();

    // Sign in to Firebase on boot if credentials are stored
    if (isFirebaseConfigured() && WiFi.isConnected()) {
        displayMessage("Firebase", "Signing in...");
        firebaseSignIn();
        displayMessage("Firebase", firebaseAuth ? "Auth OK" : "Auth FAIL");
        delay(1500);
        if (firebaseAuth) {
            initScaleFirestoreSync();
        }
    }

    setupFileSystem();
    setupWebServer();
    setupScale();
    // setupScale() already handles tare (restores saved tare or runs first-boot tare)
    currentWeight = 0.0f;
    resetWeightFilters();
    autoTarePending = false;
    autoTareStableSinceMs = 0;

    setupRFID();
    setupServo();

    // Show IP in large text so it's easy to read and type into a browser
    display.clearDisplay();
    display.setTextSize(1); display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);  display.println("READY! Open browser:");
    display.setTextSize(1);
    display.setCursor(0, 16); display.println(WiFi.localIP().toString());
    display.setCursor(0, 28); display.println(gMdnsName + ".local");
    display.setCursor(0, 44); display.println("WiFi: " + WiFi.SSID());
    display.display();
    delay(5000);  // 5 s so the user can read and write down the IP
}

void loop() {
    static uint32_t lastUpdate = 0;
    static uint32_t lastBlink  = 0;

    if (millis() - lastBlink > 1000) {
        digitalWrite(LED_PIN, !digitalRead(LED_PIN));
        lastBlink = millis();
    }

    // Detect WiFi network change - clear credentials if WiFi SSID changed
    if (WiFi.isConnected()) {
        String currentSSID = WiFi.SSID();
        if (lastConnectedSSID.length() > 0 && currentSSID != lastConnectedSSID) {
            // WiFi changed! Clear Firebase credentials to force relogin
            Serial.printf("[WIFI] Network changed: %s → %s. Clearing Firebase credentials.\n",
                          lastConnectedSSID.c_str(), currentSSID.c_str());
            firebaseAuth = false;
            firebaseIdToken = "";
            firebaseRefreshToken = "";
            firebaseUid = "";
            firebaseEmail = "";
            firebasePassword = "";
            lastConnectedSSID = currentSSID;
        }
        if (lastConnectedSSID.length() == 0) {
            lastConnectedSSID = currentSSID;
        }
    }

    // Firestore heartbeat every 30 seconds
    sendScaleHeartbeat();

    if (!rfidLockedForCurrentLoad && !autoTarePending) {
        // --- Step 1: poll both readers back-to-back (pure SPI, no HTTP) ---
        String uid1Hex, uid1 = readRFIDFromReader(rfid1, uid1Hex);
        String uid2Hex, uid2 = readRFIDFromReader(rfid2, uid2Hex);
        String uid1Key = uid1Hex.length() ? uid1Hex : normalizeUidHex(uid1);
        String uid2Key = uid2Hex.length() ? uid2Hex : normalizeUidHex(uid2);

        // Ignore short/non-TigerTag UIDs in automatic weighing flow.
        if (uid1Key.length() > 0 && !isLikelyTigerTagUidHex(uid1Key)) {
            Serial.printf("[RFID] Ignored short UID1: %s\n", uid1Key.c_str());
            uid1Key = ""; uid1Hex = ""; uid1 = "";
        }
        if (uid2Key.length() > 0 && !isLikelyTigerTagUidHex(uid2Key)) {
            Serial.printf("[RFID] Ignored short UID2: %s\n", uid2Key.c_str());
            uid2Key = ""; uid2Hex = ""; uid2 = "";
        }

        // --- Step 2: store new UIDs ---
        bool newUid1 = uid1Key.length() > 0 && uid1Key != lastUID && uid1Key != lastUID2;
        bool newUid2 = uid2Key.length() > 0 && uid2Key != lastUID && uid2Key != lastUID2;

        if (newUid1) {
            if (lastUID.length() == 0) {
                lastUID = uid1Key; lastUIDHex = uid1Hex;
                if (firstUidDetectedMs == 0) firstUidDetectedMs = millis();
            } else {
                lastUID2 = uid1Key; lastUID2Hex = uid1Hex;
            }
            currentOledState = OLED_STATE_UID_DETECTED;
            oledStateChangeMs = millis();
            stopServoSearch();  // Stop servo when tag detected
            Serial.println("[RFID] UID1: " + uid1Key + " / " + uid1Hex);
        }

        if (newUid2) {
            if (lastUID.length() == 0) {
                lastUID = uid2Key; lastUIDHex = uid2Hex;
                lastUID2 = ""; lastUID2Hex = "";
                if (firstUidDetectedMs == 0) firstUidDetectedMs = millis();
            } else {
                lastUID2 = uid2Key; lastUID2Hex = uid2Hex;
            }
            currentOledState = OLED_STATE_UID_DETECTED;
            oledStateChangeMs = millis();
            stopServoSearch();  // Stop servo when tag detected
            Serial.println("[RFID] UID2: " + uid2Key + " / " + uid2Hex);
        }

        #if ENABLE_LEGACY_API_BRIDGE
        // --- Step 3: HTTP metadata fetch from legacy cloud function ---
        if (newUid1) fetchMetaFromApiByUid(uid1Key);
        if (newUid2 && uid2Key != uid1Key) fetchMetaFromApiByUid(uid2Key);
        #endif
    }

    float weight = readWeight();
    // Only auto-tare on negative if the filter has fully settled (median buffer full)
    // and the reading is significantly negative — avoids taring during EMA warm-up.
    if (weight < -2.0f && gMedianCount >= MEDIAN_WINDOW_LARGE) {
        scale.tare(); currentWeight = 0.0f; resetWeightFilters(); stopServoSearch();
        Serial.printf("[TARE] Auto tare on negative weight: %.2f\n", weight);
        delay(120);
        return;
    }
    if (weight < 0.0f) weight = 0.0f;

    // Auto-tare logic:
    // 1. If weight is locked after send AND weight is low (< 50g): trigger auto-tare
    // 2. Also trigger if no RFID is detected AND weight drops to near-zero (< 5g)
    // This allows scale to go back to 0 before weighing again

    // Case 1: Servo locked after weight sent (normal flow)
    if (servoLockedUntilAutotare && !autoTarePending && weight < 50.0f) {
        // Weight is in low range and servo is locked - start auto-tare
        autoTarePending = true;
        autoTareStartedMs = millis();  // Track when auto-tare started
        Serial.printf("[AUTOTARE] Activated (servo locked, weight=%.2f g)\n", weight);
    }

    // Case 2: No RFID detected AND weight is very low (< 5g) - auto-tare anyway
    // Anti-loop: trigger once, then wait until weight leaves near-zero band before rearming.
    if (!servoLockedUntilAutotare && !autoTarePending && lastUID.length() == 0) {
        const float IDLE_AUTOTARE_TRIGGER_G = 5.0f;
        const float IDLE_AUTOTARE_REARM_G   = 12.0f;
        const uint32_t IDLE_AUTOTARE_COOLDOWN_MS = 5000;

        if (weight > IDLE_AUTOTARE_REARM_G) {
            idleAutoTareArmed = true;
        }

        bool cooldownOk = (millis() - lastIdleAutoTareMs) > IDLE_AUTOTARE_COOLDOWN_MS;
        if (idleAutoTareArmed && cooldownOk && weight < IDLE_AUTOTARE_TRIGGER_G) {
            autoTarePending = true;
            autoTareStartedMs = millis();
            idleAutoTareArmed = false;
            lastIdleAutoTareMs = millis();
            Serial.printf("[AUTOTARE] Activated (no RFID, weight=%.2f g)\n", weight);
        }
    }

    // Safety timeout: unlock servo if auto-tare takes too long (10 seconds)
    if (autoTarePending && autoTareStartedMs > 0 && millis() - autoTareStartedMs > AUTO_TARE_TIMEOUT_MS) {
        Serial.printf("[AUTOTARE] TIMEOUT - Force unlock servo after %.0f seconds\n", (millis() - autoTareStartedMs) / 1000.0f);
        autoTarePending = false;
        servoLockedUntilAutotare = false;
        autoTareStableSinceMs = 0;
        autoTareStartedMs = 0;
    }

    if (autoTarePending) {
        processAutoTare(weight);
    } else {
        updateServoWorkflow(weight);
    }

    // Detect spool removal by comparing to last sent weight
    if (!isnan(gLastSentWeight) && fabs(weight - gLastSentWeight) > MIN_WEIGHT_CHANGE_TO_RESET_G) {
        Serial.printf("[REMOVAL] Sent: %.2f, Now: %.2f\n", gLastSentWeight, weight);
        gLastSentWeight = NAN; gLastCloudWeight = NAN; gCloudWeightSetMs = 0;
        lastUID = ""; lastUID2 = ""; lastUIDHex = ""; lastUID2Hex = "";
        firstUidDetectedMs = 0; firstUidPauseUntilMs = 0;
        rfidLockedForCurrentLoad = true;   // Keep RFID locked during removal hold
        servoLockedUntilAutotare = false;  // CRITICAL: unlock servo for next measurement
        servoHoldAfterRemoval = true;      // Keep servo stopped until weight returns to empty
        autoTarePending = false;            // Cancel any pending auto-tare
        autoTareStableSinceMs = 0;          // Reset auto-tare timer
        autoTareStartedMs = 0;              // Reset auto-tare start time
        currentOledState = OLED_STATE_IDLE;
        Serial.printf("[SERVO] Spool removal detected - hold active until empty scale\n");
    }

    if (millis() - lastUpdate > WS_UPDATE_INTERVAL_MS) {
        uint32_t now = millis();

        if (sendPhase == "countdown" && currentOledState != OLED_STATE_SENDING) {
            currentOledState = OLED_STATE_SENDING; oledStateChangeMs = now;
        }
        bool keepInfoOnScreen = (fabs(weight) >= MIN_WEIGHT_TO_SEND_G) &&
                                (gLastManufacturer != "--" || gLastMaterial != "--" || gLastColor != "--" || gLastRackPosition.length() > 0);

        if (!keepInfoOnScreen &&
            (currentOledState == OLED_STATE_UID_DETECTED ||
             currentOledState == OLED_STATE_SUCCESS ||
             currentOledState == OLED_STATE_ERROR) &&
            (now - oledStateChangeMs > OLED_MESSAGE_DURATION_MS)) {
            currentOledState = (sendPhase == "countdown") ? OLED_STATE_SENDING : OLED_STATE_IDLE;
        }
        if (sendPhase == "send" && currentOledState != OLED_STATE_SENDING) {
            currentOledState = OLED_STATE_SENDING; oledStateChangeMs = now;
        }

        displayWeightWithState(weight, lastUID, currentOledState);

        String json = "{\"weight\":" + String(roundWeight(weight))
                      + ",\"uid\":\"" + lastUID
                      + "\",\"uid2\":\"" + lastUID2 + "\"}";
        ws.textAll(json);
        ws.cleanupClients();
        lastUpdate = millis();
    }

    // Rebroadcast Firebase status every 5 s for late-joining clients
    if (millis() - lastFbBroadcastMs > 5000 && ws.count() > 0) {
        StaticJsonDocument<128> out;
        out["type"]       = "firebaseStatus";
        out["auth"]       = firebaseAuth;
        out["configured"] = isFirebaseConfigured();
        String s; serializeJson(out, s);
        ws.textAll(s);
        lastFbBroadcastMs = millis();
    }

    if (!autoTarePending) handleAutoPush(weight);

    delay(10);
}
