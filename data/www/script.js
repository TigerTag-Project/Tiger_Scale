// Add or modify masterspools here
// Format: { id, label, weight (in grams), image (URL or path) }
const masterspools = [
    {
        id: 'bambu_grey',
        label: 'BambuLab Grey',
        weight: 210,
        image: 'img/bambu_grey.png'
    },
    {
        id: 'bambu_transp',
        label: 'BambuLab Transparent',
        weight: 215,
        image: 'img/bambu_transp.png'
    },
    {
        id: 'r3d_grey',
        label: 'R3D Grey',
        weight: 239,
        image: 'img/r3d_grey.png'
    },
    {
        id: 'custom',
        label: 'Custom',
        weight: 0,
        image: 'img/custom.png'
    }
];

// ========== TRANSLATIONS ==========
// Translations live in locales/{lang}.json. The i18n controller (i18n.js) is
// loaded BEFORE this script in index.html and exposes window.t() and
// window.setLanguage() shims so the application code below keeps working.
//
// Backward-compat: the legacy `currentLang` global is updated by the controller
// every time the language changes (window.currentLang).
//
// To add a language: drop a new locales/<code>.json + add an entry in the
// LANGS object inside i18n.js. No change needed in this file.
//
// Override updateCloudText() in setLanguage() — keep the legacy hook so the
// status pill text re-renders when the language changes.
document.addEventListener("i18n:applied", () => {
    if (typeof updateCloudText === "function") updateCloudText();
    // Re-render translated status labels now that locale is loaded
    if (typeof setFirebaseConfigured === "function") setFirebaseConfigured(firebaseConfigured);
});

// Make sure t() exists even if i18n.js failed to load — never crash the app.
if (typeof window.t !== "function") {
    window.t = (k) => k;
}
if (typeof window.setLanguage !== "function") {
    window.setLanguage = () => {};
}


// ========== DOM ELEMENTS ==========
const cloudDot = document.getElementById('cloudDot');
const cloudText = document.getElementById('cloudText');
const fbDot = document.getElementById('fbDot');
const fbText = document.getElementById('fbText');
const weightEl = document.getElementById('weight');
const uidEl = document.getElementById('uid');
const calFactorEl = document.getElementById('calFactor');
const sendStateEl = document.getElementById('sendState');
const userNameEl = document.getElementById('userName');

// ========== STATE ==========
let currentWeight = null;
let currentUid = null;
let calFactor = null;
let cloudStatus = 'unknown';
let firebaseConfigured = false;

// ========== UTILITIES ==========
function setTextIfChanged(el, txt) {
    if (!el || el.textContent === txt) return;
    el.textContent = txt;
}

function toggleSection(el) {
    el.classList.toggle('active');
    const content = el.nextElementSibling;
    content.classList.toggle('active');
}

function updateCloudText() {
    const txt = cloudStatus === 'up' || cloudStatus === 'ok' ? t('cloud') : t('offline');
    setTextIfChanged(cloudText, txt);
}

function setCloudStatus(state) {
    const s = String(state || '').toLowerCase();
    cloudStatus = (s === 'up' || s === 'ok') ? 'up' : 'down';
    updateCloudText();
    
    if (cloudStatus === 'up') {
        cloudDot.className = 'status-dot active';
    } else {
        cloudDot.className = 'status-dot error';
    }
}

function setFirebaseConfigured(flag) {
    firebaseConfigured = !!flag;
    const el = document.getElementById('firebaseStatus');
    if (el) setTextIfChanged(el, firebaseConfigured ? t('validated') : t('notConfigured'));
    if (fbDot) fbDot.className = firebaseConfigured ? 'status-dot active' : 'status-dot warning';
    if (fbText) {
        if (firebaseConfigured) {
            const stored = localStorage.getItem('tt_displayName') || localStorage.getItem('tt_email') || '';
            const emailEl = document.getElementById('accountEmail');
            const emailVal = (emailEl ? emailEl.value : '') || stored;
            setTextIfChanged(fbText, emailVal || t('validated'));
        } else {
            setTextIfChanged(fbText, t('notConfigured'));
        }
    }
    // Header login button — always visible, style changes based on auth
    const btnHeaderLogin = document.getElementById('btnHeaderLogin');
    if (btnHeaderLogin) {
        btnHeaderLogin.classList.toggle('logged-in', firebaseConfigured);
    }
    // Auto-show/hide login modal
    if (typeof firebaseStatusKnown !== 'undefined' && firebaseStatusKnown) {
        if (firebaseConfigured) hideAuthModal(); else showAuthModal();
    }
}

function handleAccountBtn() {
    if (firebaseConfigured) {
        toggleAccountPopover();
    } else {
        openAuthModal();
    }
}

function toggleAccountPopover() {
    const pop = document.getElementById('accountPopover');
    if (!pop) return;
    const isOpen = pop.style.display !== 'none';
    if (isOpen) {
        closeAccountPopover();
    } else {
        pop.style.display = '';
        pop.setAttribute('aria-hidden', 'false');
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', _closePopoverOnOutside, true);
        }, 0);
    }
}

function closeAccountPopover() {
    const pop = document.getElementById('accountPopover');
    if (pop) { pop.style.display = 'none'; pop.setAttribute('aria-hidden', 'true'); }
    document.removeEventListener('click', _closePopoverOnOutside, true);
}

function _closePopoverOnOutside(e) {
    const pop = document.getElementById('accountPopover');
    const btn = document.getElementById('btnHeaderLogin');
    if (pop && !pop.contains(e.target) && btn && !btn.contains(e.target)) {
        closeAccountPopover();
    }
}

// Update the Account card with the user's email + avatar initial.
// Called from applyStatusSnapshot when /api/status reports a firebaseEmail.
function setAccountInfo(email) {
    if (!email) return;
    // Persist email for status bar
    const emailEl = document.getElementById('accountEmail');
    if (emailEl) emailEl.value = email;
    try { localStorage.setItem('tt_email', email); } catch (_) {}

    // displayName: prefer localStorage (set at login), fallback to email local part
    const stored = '';
    try { localStorage.getItem('tt_displayName') || ''; } catch (_) {}
    const displayName = (localStorage.getItem('tt_displayName') || '').trim()
                        || email.split('@')[0];

    // Populate popover
    const nameEl  = document.getElementById('accountDisplayName');
    const mailLbl = document.getElementById('accountEmailLabel');
    const avatarEl = document.getElementById('accountAvatar');

    if (nameEl)  setTextIfChanged(nameEl, displayName);
    if (mailLbl) setTextIfChanged(mailLbl, email);
    if (avatarEl) avatarEl.textContent = displayName.charAt(0).toUpperCase();

    // Also update fbText in status bar (only when actually authenticated)
    if (fbText && firebaseConfigured) setTextIfChanged(fbText, displayName || email);
    // Ensure the dot reflects the authenticated state
    if (firebaseConfigured && fbDot) fbDot.className = 'status-dot active';
}

function setSendState(msg, color) {
    if (!msg) {
        sendStateEl.classList.add('hidden');
        return;
    }
    setTextIfChanged(sendStateEl, msg);
    if (color) sendStateEl.style.background = color;
    sendStateEl.classList.remove('hidden');
}

function formatHMS(secs) {
    if (!isFinite(secs)) return '--:--:--';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return [h,m,s].map(x => String(x).padStart(2,'0')).join(':');
}

// ========== API FUNCTIONS ==========
function updateFirebaseAuth() {
    const emailEl = document.getElementById('firebaseEmail');
    const passEl = document.getElementById('firebasePassword');
    const email = (emailEl?.value || '').trim();
    const password = (passEl?.value || '').trim();
    if (!email || !password) {
        alert(t('alertFirebaseError'));
        return;
    }
    fetch('/api/firebase/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(res => {
        setFirebaseConfigured(!!res.configured);
        alert(t('alertFirebaseSaved'));
    })
    .catch(() => alert(t('alertFirebaseError')));
}

function deleteFirebaseAuth() {
    fetch('/api/firebase/logout', { method: 'POST' })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(() => {
        const emailEl = document.getElementById('firebaseEmail');
        const passEl = document.getElementById('firebasePassword');
        if (emailEl) emailEl.value = '';
        if (passEl) passEl.value = '';
        setFirebaseConfigured(false);
        alert(t('alertFirebaseDeleted'));
    })
    .catch(() => alert(t('alertFirebaseError')));
}

// ========== API KEY VISIBILITY TOGGLE ==========
function tareScale() {
    fetch('/api/tare', { method: 'POST' })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .catch(() => {});
}

// ========== TARE HOLD BUTTON ==========
let tareTimer = null;
let tareBtn = null;

function startTare() {
    if (!tareBtn) tareBtn = document.getElementById('tareBtn');
    
    // Add holding class to start animation
    tareBtn.classList.add('holding');
    
    // Set timer for 1 second
    tareTimer = setTimeout(() => {
        // Execute tare after 1 second
        tareScale();
        
        // Visual feedback
        tareBtn.classList.remove('holding');
        tareBtn.classList.add('success');
        
        // Reset after short delay
        setTimeout(() => {
            tareBtn.classList.remove('success');
            const progress = tareBtn.querySelector('.tare-progress');
            if (progress) progress.style.width = '0';
        }, 500);
    }, 1000);
}

function cancelTare() {
    if (!tareBtn) tareBtn = document.getElementById('tareBtn');
    
    // Cancel timer
    if (tareTimer) {
        clearTimeout(tareTimer);
        tareTimer = null;
    }
    
    // Remove holding class
    tareBtn.classList.remove('holding');
    
    // Reset progress bar
    const progress = tareBtn.querySelector('.tare-progress');
    if (progress) {
        progress.style.width = '0';
    }
}

// ========== TARE BUTTON IN CALIBRATION WIZARD ==========
let tareBtnCalib = null;
let tareTimerCalib = null;

function startTareCalib() {
    if (!tareBtnCalib) tareBtnCalib = document.getElementById('tareBtnCalib');
    
    // Add holding class to start animation
    tareBtnCalib.classList.add('holding');
    
    // Set timer for 1 second
    tareTimerCalib = setTimeout(() => {
        // Execute tare after 1 second
        tareScale();
        
        // Visual feedback
        tareBtnCalib.classList.remove('holding');
        tareBtnCalib.classList.add('success');
        
        // Reset after short delay
        setTimeout(() => {
            tareBtnCalib.classList.remove('success');
            const progress = tareBtnCalib.querySelector('.tare-progress');
            if (progress) progress.style.width = '0';
        }, 500);
    }, 1000);
}

function cancelTareCalib() {
    if (!tareBtnCalib) tareBtnCalib = document.getElementById('tareBtnCalib');
    
    // Cancel timer
    if (tareTimerCalib) {
        clearTimeout(tareTimerCalib);
        tareTimerCalib = null;
    }
    
    // Remove holding class
    tareBtnCalib.classList.remove('holding');
    
    // Reset progress bar
    const progress = tareBtnCalib.querySelector('.tare-progress');
    if (progress) {
        progress.style.width = '0';
    }
}

function updateCalibration() {
    const factor = parseFloat(document.getElementById('newCalFactor').value);
    if (isNaN(factor)) { 
        alert(t('alertInvalidFactor'));
        return;
    }
    
    // Validation: factor must be positive
    if (factor <= 0) {
        alert(t('alertNegativeFactor'));
        return;
    }
    
    fetch('/api/calibration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: factor })
    })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .catch(() => alert(t('alertError')));
}

function computeFactor() {
    const known = parseFloat(document.getElementById('knownWeight').value);
    if (isNaN(known) || known <= 0) {
        alert(t('alertInvalidWeight'));
        return;
    }
    if (currentWeight === null || calFactor === null) {
        alert(t('alertDataUnavailable'));
        return;
    }
    
    const newFactor = calFactor * (currentWeight / known);
    document.getElementById('newCalFactor').value = newFactor.toFixed(3);
    
    fetch('/api/calibration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newFactor })
    })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .catch(() => alert(t('alertError')));
}

function toggleServo() {
    const chk = document.getElementById('servoToggleCheck');
    fetch('/api/servo-toggle', { method: 'POST' })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(data => updateServoToggleBtn(data.servoEnabled))
    .catch(() => { if (chk) chk.checked = !chk.checked; }); // revert on error
}
function updateServoToggleBtn(enabled) {
    const chk = document.getElementById('servoToggleCheck');
    if (chk) chk.checked = !!enabled;
    // Keep hardware section motor-enabled in sync
    const enChk = document.getElementById('motorEnabledCheck');
    if (enChk) enChk.checked = !!enabled;
}

// ========== HARDWARE CONFIG ==========
let hwConfig = { rfidCount: 1, rfidSide: 'left', motorConnected: false, motorEnabled: false };

async function fetchHardwareConfig() {
    try {
        const r = await fetch('/api/hw/config', { cache: 'no-cache' });
        if (!r.ok) return; // endpoint may not exist yet — fail silently
        const d = await r.json();
        hwConfig = { ...hwConfig, ...d };
    } catch (_) { /* ESP32 may not have this endpoint yet */ }
    applyHardwareConfig();
}

function applyHardwareConfig() {
    // RFID count segment
    document.querySelectorAll('#rfidSegment .segment-btn').forEach(b => {
        b.classList.toggle('active', +b.dataset.val === hwConfig.rfidCount);
    });
    // RFID side selector — visible only when count == 1
    const sideRow = document.getElementById('rfidSideRow');
    if (sideRow) sideRow.style.display = (hwConfig.rfidCount === 1) ? '' : 'none';
    document.querySelectorAll('#rfidSideSegment .segment-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.val === hwConfig.rfidSide);
    });
    // Motor connected toggle
    const connChk = document.getElementById('motorConnectedCheck');
    if (connChk) connChk.checked = !!hwConfig.motorConnected;
    // Show/hide enabled row
    const enabledRow = document.getElementById('motorEnabledRow');
    if (enabledRow) enabledRow.style.display = hwConfig.motorConnected ? '' : 'none';
    // Motor enabled toggle
    const enChk = document.getElementById('motorEnabledCheck');
    if (enChk) enChk.checked = !!hwConfig.motorEnabled;
    // Motor test panel — visible only when both connected + enabled
    updateMotorTestPanel();
    // RFID test panel — hide reader 2 button if only 1 reader configured
    updateRfidTestPanel();
}

async function saveHardwareConfig() {
    try {
        await fetch('/api/hw/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hwConfig)
        });
    } catch (_) {}
}

function setRfidCount(n) {
    hwConfig.rfidCount = n;
    document.querySelectorAll('#rfidSegment .segment-btn').forEach(b => {
        b.classList.toggle('active', +b.dataset.val === n);
    });
    const sideRow = document.getElementById('rfidSideRow');
    if (sideRow) sideRow.style.display = (n === 1) ? '' : 'none';
    updateRfidTestPanel();
    saveHardwareConfig();
}

function setRfidSide(side) {
    hwConfig.rfidSide = side;
    document.querySelectorAll('#rfidSideSegment .segment-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.val === side);
    });
    updateRfidTestPanel();
    saveHardwareConfig();
}

function onMotorConnectedChange() {
    const chk = document.getElementById('motorConnectedCheck');
    hwConfig.motorConnected = !!(chk && chk.checked);
    const row = document.getElementById('motorEnabledRow');
    if (row) row.style.display = hwConfig.motorConnected ? '' : 'none';
    if (!hwConfig.motorConnected) {
        hwConfig.motorEnabled = false;
        const enChk = document.getElementById('motorEnabledCheck');
        if (enChk) enChk.checked = false;
        updateServoToggleBtn(false);
        stopMotorTest();
    }
    updateMotorTestPanel();
    saveHardwareConfig();
}

function onMotorEnabledChange() {
    const chk = document.getElementById('motorEnabledCheck');
    hwConfig.motorEnabled = !!(chk && chk.checked);
    updateServoToggleBtn(hwConfig.motorEnabled);
    if (!hwConfig.motorEnabled) stopMotorTest();
    updateMotorTestPanel();
    // Also call servo toggle endpoint so ESP32 state stays in sync
    fetch('/api/servo-toggle', { method: 'POST' })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(d => { if (typeof d.servoEnabled !== 'undefined') updateServoToggleBtn(d.servoEnabled); })
    .catch(() => { /* revert */
        hwConfig.motorEnabled = !hwConfig.motorEnabled;
        const c = document.getElementById('motorEnabledCheck');
        if (c) c.checked = hwConfig.motorEnabled;
    });
    saveHardwareConfig();
}

// ── Motor test ────────────────────────────────────────────────
// Speed levels → microseconds for a continuous rotation servo
// 1500 = stop, >1500 = forward, 2000 = full speed
const MOTOR_SPEED_US = { 1: 1530, 2: 1580, 3: 1650, 4: 1750, 5: 1900 };
let _motorTestRunning = false;
let _motorTestSpeed   = 2;

function updateMotorTestPanel() {
    const panel = document.getElementById('motorTestPanel');
    if (!panel) return;
    const show = !!(hwConfig.motorConnected && hwConfig.motorEnabled);
    panel.style.display = show ? '' : 'none';
    if (!show && _motorTestRunning) stopMotorTest();
    _updateMotorTestBtn();  // sync label/icon (no data-i18n on label — managed here only)
}

function setMotorTestSpeed(level) {
    _motorTestSpeed = level;
    // Sync slider position + CSS gradient fill
    const slider = document.getElementById('motorSpeedSlider');
    if (slider) {
        slider.value = level;
        slider.style.setProperty('--val', level);
    }
    // Color active tick dot
    document.querySelectorAll('.motor-speed-ticks span').forEach((s, i) => {
        s.style.color = (i + 1 === level) ? 'var(--orange, #e67e22)' : '';
        s.style.setProperty('--dot', (i + 1 <= level) ? 'var(--orange, #e67e22)' : 'var(--line, #e5e7eb)');
    });
    if (_motorTestRunning) {
        fetch('/api/servo/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ us: MOTOR_SPEED_US[level] })
        }).catch(() => {});
    }
}

function toggleMotorTest() {
    if (_motorTestRunning) stopMotorTest();
    else startMotorTest();
}

function startMotorTest() {
    const us = MOTOR_SPEED_US[_motorTestSpeed] || 1650;
    fetch('/api/servo/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ us })
    })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(() => {
        _motorTestRunning = true;
        _updateMotorTestBtn();
    })
    .catch(() => {});
}

function stopMotorTest() {
    fetch('/api/servo/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stop: true })
    }).catch(() => {});
    _motorTestRunning = false;
    _updateMotorTestBtn();
}

function _updateMotorTestBtn() {
    const btn   = document.getElementById('motorTestRunBtn');
    const label = document.getElementById('motorTestLabel');
    const icon  = document.getElementById('motorTestIcon');
    if (!btn) return;
    btn.classList.toggle('running', _motorTestRunning);
    if (label) label.textContent = _motorTestRunning ? t('motorTestStop') : t('motorTestRun');
    if (icon) icon.innerHTML = _motorTestRunning
        ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
        : '<polygon points="5,3 19,12 5,21"/>';
}

// ── RFID hardware test ────────────────────────────────────────────────────────
let _rfidTestRunning = false;
let _rfidTestPollId  = null;

function toggleRfidTest() {
    if (_rfidTestRunning) stopRfidTest(); else startRfidTest();
}

function startRfidTest() {
    // Clear both displays immediately before starting
    _setRfidUid('left',  '—', false);
    _setRfidUid('right', '—', false);
    fetch('/api/rfid/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
    })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(() => {
        _rfidTestRunning = true;
        _updateRfidTestBtn();
        _rfidTestPollId = setInterval(_pollRfidTestUid, 600);
    })
    .catch(() => {});
}

function stopRfidTest() {
    clearInterval(_rfidTestPollId); _rfidTestPollId = null;
    fetch('/api/rfid/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"stop":true}'
    }).catch(() => {});
    _rfidTestRunning = false;
    _updateRfidTestBtn();
}

function _pollRfidTestUid() {
    fetch('/api/rfid/test')
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => {
            if (d.uid_left)  _setRfidUid('left',  d.uid_left,  true);
            if (d.uid_right) _setRfidUid('right', d.uid_right, true);
        })
        .catch(() => {});
}

function _setRfidUid(side, text, detected) {
    const el  = document.getElementById(side === 'left' ? 'rfidTestUidLeft'  : 'rfidTestUidRight');
    const btn = document.getElementById(side === 'left' ? 'rfidClearBtnLeft' : 'rfidClearBtnRight');
    if (!el) return;
    el.textContent = text;
    el.classList.toggle('uid-detected', !!detected);
    if (btn) btn.style.display = detected ? '' : 'none';
}

function clearRfidUid(side) {
    fetch('/api/rfid/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"reset":true}'
    }).catch(() => {});
    _setRfidUid(side, '—', false);
}

function _updateRfidTestBtn() {
    const btn   = document.getElementById('rfidTestRunBtn');
    const label = document.getElementById('rfidTestLabel');
    const icon  = document.getElementById('rfidTestIcon');
    if (!btn) return;
    btn.classList.toggle('running', _rfidTestRunning);
    if (label) label.textContent = _rfidTestRunning ? t('motorTestStop') : t('rfidTestScan');
    if (icon) icon.innerHTML = _rfidTestRunning
        ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
        : '<polygon points="5,3 19,12 5,21"/>';
}

function updateRfidTestPanel() {
    const leftRow  = document.getElementById('rfidLeftRow');
    const rightRow = document.getElementById('rfidRightRow');
    if (hwConfig.rfidCount >= 2) {
        // 2 readers: show both
        if (leftRow)  leftRow.style.display  = '';
        if (rightRow) rightRow.style.display = '';
    } else {
        // 1 reader: show only the configured side
        if (leftRow)  leftRow.style.display  = (hwConfig.rfidSide === 'left')  ? '' : 'none';
        if (rightRow) rightRow.style.display = (hwConfig.rfidSide === 'right') ? '' : 'none';
    }
    if (!hwConfig.rfidCount && _rfidTestRunning) stopRfidTest();
}

function updateSpoolStatus(detected, position) {
    const detEl = document.getElementById('spoolDetectedVal');
    const posRow = document.getElementById('spoolPositionRow');
    const posEl  = document.getElementById('spoolPositionVal');
    if (!detEl) return;
    if (detected) {
        setTextIfChanged(detEl, t('yes'));
        if (posRow) posRow.style.display = '';
        if (posEl && position != null) setTextIfChanged(posEl, String(position));
    } else {
        setTextIfChanged(detEl, t('no'));
        if (posRow) posRow.style.display = 'none';
    }
}

function resetWiFi() {
    if (!confirm(t('alertReconfigConfirm'))) return;
    fetch('/api/reset-wifi', { method: 'POST' })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .catch(() => {});
}

function factoryReset() {
    if (!confirm(t('alertResetConfirm'))) return;
    fetch('/api/factory-reset', { method: 'POST' })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .catch(() => {});
}

// ========== CALIBRATION WIZARD ==========
function populateMasterspoolSelect() {
    const select = document.getElementById('masterspoolSelect');
    if (!select) return;
    
    // Clear existing options
    select.innerHTML = '';
    
    // Add masterspools as options
    masterspools.forEach(spool => {
        const option = document.createElement('option');
        option.value = spool.id;
        option.textContent = spool.label;
        select.appendChild(option);
    });
    
    // Trigger change to show first image
    onMasterspoolChange();
}

function onMasterspoolChange() {
    const select = document.getElementById('masterspoolSelect');
    const customInput = document.getElementById('calibKnownWeight');
    const img = document.getElementById('masterspoolImg');
    const errorMsg = document.getElementById('calibWeightError');
    
    if (!select) return;
    
    const selectedId = select.value;
    const selectedSpool = masterspools.find(s => s.id === selectedId);
    
    if (!selectedSpool) return;
    
    // Clear any previous error
    if (customInput) customInput.classList.remove('error');
    if (errorMsg) errorMsg.style.display = 'none';
    
    // Show/hide custom input
    if (selectedId === 'custom') {
        customInput.style.display = 'block';
        customInput.value = '';
        customInput.focus();
        
        // Add input listener to clear error on typing
        customInput.oninput = function() {
            if (this.classList.contains('error')) {
                this.classList.remove('error');
                if (errorMsg) errorMsg.style.display = 'none';
            }
        };
    } else {
        customInput.style.display = 'none';
        customInput.value = selectedSpool.weight;
    }
    
    // Update main image
    if (selectedSpool.image && img) {
        img.src = selectedSpool.image;
        img.style.display = 'block';
        img.onerror = function() {
            // If image fails to load, hide it
            this.style.display = 'none';
        };
    }
}

function updateProgressDots(activeStep) {
    document.querySelectorAll('.progress-dots .dot').forEach((dot, index) => {
        const step = index + 1;
        dot.classList.remove('active', 'completed');
        
        if (step === activeStep) {
            dot.classList.add('active');
        } else if (step < activeStep) {
            dot.classList.add('completed');
        }
    });
}

function calibStep1() {
    // Tare the scale
    fetch('/api/tare', { method: 'POST' })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(() => {
        // Move to step 2
        document.getElementById('step1').classList.remove('active');
        document.getElementById('step2').classList.add('active');
        updateProgressDots(2);
        
        // Initialize masterspool selector (set default value)
        populateMasterspoolSelect();
    })
    .catch(() => alert(t('alertError')));
}

function calibStep2() {
    const knownWeight = parseFloat(document.getElementById('calibKnownWeight').value);
    
    // Validation 1: if user entered weight is invalid or <= 0
    if (isNaN(knownWeight) || knownWeight <= 0) {
        showWeightInvalidModal();
        return;
    }
    
    // Validation 2: if user entered weight is between 0 and 200g
    if (knownWeight < 200) {
        showWeightErrorModal();
        return;
    }
    
    // Check data availability
    if (currentWeight === null || calFactor === null) {
        alert(t('alertDataUnavailable'));
        return;
    }
    
    // Calculate new factor
    const newFactor = calFactor * (currentWeight / knownWeight);
    
    // Validation: factor must be positive
    if (newFactor <= 0) {
        alert(t('alertNegativeFactor'));
        return;
    }
    
    // Send to device
    fetch('/api/calibration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newFactor })
    })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(() => {
        // Move to step 3
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step3').classList.add('active');
        updateProgressDots(3);
    })
    .catch(() => alert(t('alertError')));
}

function calibBack(step) {
    // Go back to step
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step' + step).classList.add('active');
    updateProgressDots(step);
    
    // Clear input
    document.getElementById('calibKnownWeight').value = '';
}

function calibReset() {
    // Reset wizard to step 1
    document.getElementById('step3').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    updateProgressDots(1);
    
    // Clear input
    document.getElementById('calibKnownWeight').value = '';
}

// ========== WEIGHT ERROR MODAL ==========
function showWeightErrorModal() {
    const modal = document.getElementById('weightErrorModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function closeWeightErrorModal() {
    const modal = document.getElementById('weightErrorModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function showWeightInvalidModal() {
    const modal = document.getElementById('weightInvalidModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function closeWeightInvalidModal() {
    const modal = document.getElementById('weightInvalidModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Close modal on click outside
document.addEventListener('DOMContentLoaded', function() {
    const errorModal = document.getElementById('weightErrorModal');
    const invalidModal = document.getElementById('weightInvalidModal');
    
    if (errorModal) {
        errorModal.addEventListener('click', function(e) {
            if (e.target === errorModal) {
                closeWeightErrorModal();
            }
        });
    }
    
    if (invalidModal) {
        invalidModal.addEventListener('click', function(e) {
            if (e.target === invalidModal) {
                closeWeightInvalidModal();
            }
        });
    }
});

// ========== STATUS MANAGEMENT ==========
function applyStatusSnapshot(s) {
    if (!s || typeof s !== 'object') return;
    
    // Weight
    if (typeof s.weight !== 'undefined' && currentWeight !== s.weight) {
        currentWeight = s.weight;
        setTextIfChanged(weightEl, String(s.weight));
        // Micro-animation on change
        weightEl.classList.remove('updated');
        void weightEl.offsetWidth; // reflow to restart animation
        weightEl.classList.add('updated');
    }
    
    // UID
    if (typeof s.uid !== 'undefined') {
        const u = s.uid || '';
        if (currentUid !== u) {
            currentUid = u;
            setTextIfChanged(uidEl, u || t('waiting'));
        }
    }
    
    // Cloud
    if (typeof s.cloud !== 'undefined') {
        setCloudStatus(s.cloud);
    }
    
    // API UI removed in Firebase-only mode
    // Modal trigger uses firebaseAuth ("am I signed in right now?") rather than
    // firebaseConfigured ("are creds stored?") - this catches the stale-creds case
    // (e.g. password changed on Firebase side) where stored creds exist but sign-in
    // fails on boot, in which case we want the user to re-authenticate via the modal.
    if (typeof s.firebaseAuth !== 'undefined') {
        firebaseStatusKnown = true; // status is real now, modal can react
        setFirebaseConfigured(!!s.firebaseAuth);
    } else if (typeof s.firebaseConfigured !== 'undefined') {
        firebaseStatusKnown = true;
        setFirebaseConfigured(!!s.firebaseConfigured);
    }
    if (typeof s.firebaseEmail === 'string') {
        // Keep the (now hidden) input updated for backward-compat callers
        const emailEl = document.getElementById('firebaseEmail');
        if (emailEl && !emailEl.value) emailEl.value = s.firebaseEmail;
        // Also feed the visible Account card avatar + email
        if (s.firebaseEmail) setAccountInfo(s.firebaseEmail);
    }
    
    // Calibration factor
    if (typeof s.calibrationFactor !== 'undefined') {
        const n = Number(s.calibrationFactor);
        const shown = isFinite(n) ? n.toFixed(2) : '-';
        setTextIfChanged(calFactorEl, shown);
        calFactor = n;
    }
    
    // Servo / motor enabled state
    if (typeof s.servoEnabled !== 'undefined') {
        hwConfig.motorEnabled = !!s.servoEnabled;
        updateServoToggleBtn(!!s.servoEnabled);
    }

    // Hardware config fields (rfidCount, motorConnected) if ESP32 exposes them
    let hwUpdated = false;
    if (typeof s.rfidCount      !== 'undefined') { hwConfig.rfidCount      = Number(s.rfidCount);    hwUpdated = true; }
    if (typeof s.rfidSide       !== 'undefined') { hwConfig.rfidSide       = s.rfidSide;              hwUpdated = true; }
    if (typeof s.motorConnected !== 'undefined') { hwConfig.motorConnected = !!s.motorConnected;      hwUpdated = true; }
    if (hwUpdated) applyHardwareConfig();

    // Spool detection
    if (typeof s.spoolDetected !== 'undefined') {
        updateSpoolStatus(!!s.spoolDetected, s.spoolPosition);
    }

    // Uptime
    if (typeof s.uptime_s !== 'undefined' || typeof s.uptime_ms !== 'undefined') {
        let secs = (typeof s.uptime_s !== 'undefined') ? Number(s.uptime_s) : Number(s.uptime_ms) / 1000;
        const upEl = document.getElementById('uptime');
        setTextIfChanged(upEl, formatHMS(secs));
    }
    
    // Send to cloud status
    if (typeof s.sendToCloud !== 'undefined') {
        const v = String(s.sendToCloud || '').trim();
        if (v === '' || v === '0') {
            setSendState('');
        } else if (v === 'send') {
            setSendState(t('sending'), 'rgba(255,255,255,0.2)');
        } else if (v === 'success') {
            setSendState(t('sent'), 'rgba(72,187,120,0.3)');
            setTimeout(() => setSendState(''), 1500);
        } else if (v === 'error') {
            setSendState(t('sendError'), 'rgba(245,101,101,0.3)');
            setTimeout(() => setSendState(''), 2000);
        } else if (/^\d+$/.test(v)) {
            setSendState(t('sendIn') + ' ' + v + 's', 'rgba(255,255,255,0.2)');
        }
    }
}

function pollStatus() {
    fetch('/api/status', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(s => applyStatusSnapshot(s))
    .catch(() => {});
}

// ========== AUTH MODAL ==========
// Tracks whether we have received a real firebaseConfigured status from /api/status
// Prevents the modal from flashing on first load (before we know the actual state)
let firebaseStatusKnown = false;

// Firebase public Web API key — same key used by the firmware.
// Intentionally public: https://firebase.google.com/docs/projects/api-keys
const FIREBASE_WEB_API_KEY = 'AIzaSyCkxPTs_Cv0KVLqsZj-UKWWqIY0OtfVpnw';

// Bridge page URL (Firebase Hosting target "cdn" -> site "tigertag-cdn")
const AUTH_BRIDGE_URL = 'https://tigertag-cdn.web.app/scale-auth.html';
const AUTH_BRIDGE_ORIGIN = 'https://tigertag-cdn.web.app';

let _authPopup = null;
let _authPopupWatcher = null;
let _authModalDismissed = false;   // true once user explicitly closes the modal

function showAuthModal() {
    if (_authModalDismissed) return;  // don't reopen if user already dismissed it
    const m = document.getElementById('firebaseLoginModal');
    if (!m) return;
    m.style.display = 'flex';
    m.setAttribute('aria-hidden', 'false');
}
function hideAuthModal() {
    const m = document.getElementById('firebaseLoginModal');
    if (!m) return;
    m.style.display = 'none';
    m.setAttribute('aria-hidden', 'true');
    setAuthError('');
}
function dismissAuthModal() {
    _authModalDismissed = true;
    hideAuthModal();
}
function openAuthModal() {
    _authModalDismissed = false;
    showAuthModal();
}
function setAuthError(msg) {
    const el = document.getElementById('authError');
    if (!el) return;
    if (!msg) { el.style.display = 'none'; el.textContent = ''; el.classList.remove('auth-info'); return; }
    el.textContent = msg;
    el.classList.remove('auth-info');
    el.style.display = 'block';
}
function setAuthInfo(msg) {
    const el = document.getElementById('authError');
    if (!el) return;
    if (!msg) { el.style.display = 'none'; el.textContent = ''; el.classList.remove('auth-info'); return; }
    el.textContent = msg;
    el.classList.add('auth-info');
    el.style.display = 'block';
}

// ── Password visibility toggle ──
function togglePasswordVisibility() {
    const input = document.getElementById('loginPassword');
    const eyeShow = document.querySelector('.pw-eye-show');
    const eyeHide = document.querySelector('.pw-eye-hide');
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    if (eyeShow) eyeShow.style.display = isHidden ? 'none' : '';
    if (eyeHide) eyeHide.style.display = isHidden ? '' : 'none';
}

// ── Password reset — sends a Firebase reset email directly from the browser ──
function sendPasswordReset() {
    setAuthError('');
    const email = (document.getElementById('loginEmail')?.value || '').trim();
    if (!email) {
        setAuthError(t('authEnterEmailFirst'));
        return;
    }
    fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_WEB_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'PASSWORD_RESET', email })
    })
    .then(r => r.json().then(j => ({ ok: r.ok, body: j })))
    .then(({ ok, body }) => {
        if (!ok) {
            const code = body?.error?.message || '';
            setAuthError(code === 'EMAIL_NOT_FOUND' ? t('authEmailNotFound') : t('alertFirebaseError'));
            return;
        }
        setAuthInfo(t('authResetSent'));
    })
    .catch(() => setAuthError(t('authNetworkError')));
}

// ── Email / Password sign-in (uses existing /api/firebase/auth endpoint) ──
function signInWithEmail() {
    setAuthError('');
    const email = (document.getElementById('loginEmail')?.value || '').trim();
    const password = (document.getElementById('loginPassword')?.value || '').trim();
    if (!email || !password) {
        setAuthError(t('alertFirebaseError'));
        return;
    }
    fetch('/api/firebase/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(r => r.json().then(j => ({ ok: r.ok, status: r.status, body: j })))
    .then(({ ok, status, body }) => {
        if (!ok || !body.auth) {
            setAuthError(t(status === 401 ? 'authInvalidCreds' : 'alertFirebaseError'));
            return;
        }
        setFirebaseConfigured(true);
        if (body.email) setAccountInfo(body.email);
        hideAuthModal();
    })
    .catch(() => setAuthError(t('authNetworkError')));
}

// ── Google sign-in via OAuth bridge (popup -> postMessage) ──
//
// Mobile note: iOS Safari aggressively blocks `window.open()` calls that
// include a features string (`width=...,height=...`) — it treats them as
// pop-ups and the popup-blocker discards them, returning null. On mobile
// we therefore open a plain `_blank` tab (which iOS allows from a direct
// user gesture). On desktop we keep the centered popup window for a
// nicer UX.
function isMobileDevice() {
    return ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0) ||
           /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function signInWithGoogleBridge() {
    setAuthError('');

    // The bridge needs to know our origin to validate + postMessage back to us
    const returnTo = encodeURIComponent(location.origin);
    const url = `${AUTH_BRIDGE_URL}?return_to=${returnTo}`;

    if (isMobileDevice()) {
        // Plain `_blank` — iOS opens a new tab from this user-gesture click
        _authPopup = window.open(url, '_blank');
    } else {
        // Centered popup on desktop
        const w = 460, h = 640;
        const left = Math.max(0, (screen.width - w) / 2);
        const top = Math.max(0, (screen.height - h) / 2);
        _authPopup = window.open(
            url,
            'tigertag-auth',
            `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
    }

    if (!_authPopup) {
        // Last-resort fallback: navigate the current tab to the bridge.
        // The bridge's "no opener" state lets the user copy tokens manually.
        // (Better than a dead end — no rare-on-modern-browsers blocker UX.)
        setAuthError(t('authPopupBlocked'));
        return;
    }

    // Watch for popup closed without success
    if (_authPopupWatcher) clearInterval(_authPopupWatcher);
    _authPopupWatcher = setInterval(() => {
        if (_authPopup && _authPopup.closed) {
            clearInterval(_authPopupWatcher);
            _authPopupWatcher = null;
            _authPopup = null;
        }
    }, 500);
}

// ── Sign out - clears tokens on the device and re-opens the login modal ──
function signOut() {
    if (!confirm(t('confirmSignOut'))) return;
    fetch('/api/firebase/logout', { method: 'POST' })
    .then(r => {
        console.log('[signOut] logout status:', r.status, 'ok:', r.ok);
        return r.ok ? r.json() : r.text().then(txt => Promise.reject('HTTP ' + r.status + ': ' + txt));
    })
    .then(() => {
        // Clear persisted user info
        try { localStorage.removeItem('tt_displayName'); localStorage.removeItem('tt_email'); } catch (_) {}
        // Reset local UI state
        const emailEl = document.getElementById('firebaseEmail');
        const passEl = document.getElementById('firebasePassword');
        if (emailEl) emailEl.value = '';
        if (passEl) passEl.value = '';
        // Clear the modal's input fields
        const loginEmail = document.getElementById('loginEmail');
        const loginPass = document.getElementById('loginPassword');
        if (loginEmail) loginEmail.value = '';
        if (loginPass) loginPass.value = '';
        // Reset popover
        const avatarEl = document.getElementById('accountAvatar');
        if (avatarEl) avatarEl.textContent = '?';
        const nameEl = document.getElementById('accountDisplayName');
        if (nameEl) nameEl.textContent = '—';
        const mailLbl = document.getElementById('accountEmailLabel');
        if (mailLbl) mailLbl.textContent = '—';
        closeAccountPopover();
        _authModalDismissed = false;   // always force modal open after explicit sign-out
        setFirebaseConfigured(false);
    })
    .catch(err => { console.error('[signOut] error:', err); alert(t('alertFirebaseError')); });
}

// ── postMessage listener - receives tokens from the bridge ──
window.addEventListener('message', (event) => {
    // SECURITY: only accept messages from the bridge origin
    if (event.origin !== AUTH_BRIDGE_ORIGIN) return;
    const data = event.data;
    if (!data || data.type !== 'tigertag-auth' || !data.payload) return;

    const p = data.payload;
    if (!p.idToken || !p.refreshToken || !p.uid) {
        setAuthError(t('alertFirebaseError'));
        return;
    }

    // Persist displayName locally so the UI can show it across sessions
    try {
        if (p.displayName) localStorage.setItem('tt_displayName', p.displayName);
        if (p.email)       localStorage.setItem('tt_email', p.email);
    } catch (_) {}

    // Send tokens to the firmware
    fetch('/api/firebase/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            idToken: p.idToken,
            refreshToken: p.refreshToken,
            uid: p.uid,
            email: p.email || '',
            displayName: p.displayName || '',
            provider: p.provider || 'google.com'
        })
    })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(() => {
        if (p.email) setAccountInfo(p.email);
        setFirebaseConfigured(true);
        hideAuthModal();
        // Best-effort close of the popup
        try { if (_authPopup) _authPopup.close(); } catch {}
    })
    .catch(() => setAuthError(t('authNetworkError')));
});

// ========== INITIALIZATION ==========
window.onload = () => {
    // Language: i18n.js (loaded before this script) auto-detects and applies
    // the user's language during its own init(). The legacy `currentLang`
    // local variable was removed when translations were externalised into
    // locales/*.json — referencing it here previously threw a ReferenceError
    // that aborted the rest of window.onload (no pollStatus, no modal, no
    // data). Use window.currentLang (set by the i18n controller) as a safe
    // alias, or fall back to "en".
    const lang = (window.TigerI18n && window.TigerI18n.getLang && window.TigerI18n.getLang())
              || window.currentLang
              || 'en';
    if (typeof window.setLanguage === 'function') {
        try { window.setLanguage(lang); } catch (_) {}
    }
    setFirebaseConfigured(false);

    // Initial weight display
    setTextIfChanged(weightEl, '…');

    // Fetch hardware config (RFID count, motor connected, etc.)
    fetchHardwareConfig();

    // Start polling
    pollStatus();
    setInterval(pollStatus, 1000);

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    }
};
