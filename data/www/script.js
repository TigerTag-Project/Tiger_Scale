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
const translations = {
    fr: {
        waiting: 'Attente du TigerTag...',
        quickActions: 'Actions rapides',
        tare: 'TARE',
        firebase: 'Firebase',
        firebaseStatus: 'Statut Firebase',
        firebaseEmail: 'Email Firebase',
        firebasePassword: 'Mot de passe Firebase',
        apiKey: 'Clé API',
        user: 'Utilisateur',
        newApiKey: 'Nouvelle clé API',
        update: 'Mettre à jour',
        delete: 'Supprimer',
        calibration: 'Calibration Magique',
        currentFactor: 'Facteur actuel',
        autoCalc: 'Calcul automatique',
        knownWeight: 'Poids connu (g)',
        compute: 'Calculer',
        manual: 'Manuel',
        newFactor: 'Nouveau facteur',
        apply: 'Appliquer',
        advanced: 'Avancé',
        reconfigWifi: 'Reconfigurer Wi‑Fi',
        factoryReset: 'Réinitialisation',
        uptime: 'Durée de fonctionnement',
        // Calibration wizard
        step1Title: 'Step 1',
        step1Instruction: 'Laissez la balance vide puis appuyez sur le bouton',
        step1Button: 'GO →',
        step2Title: 'Step 2',
        step2Instruction: 'Sélectionnez votre Masterspool vide et placez-la sur la balance',
        selectMasterspool: 'Sélectionnez votre Masterspool',
        step2Button: 'Calibrer ✓',
        step3Title: 'Calibré !',
        step3Instruction: 'La balance est maintenant calibrée',
        currentReading: 'Lecture actuelle',
        calibKnownWeight: 'Poids réel (g)',
        newFactor: 'Nouveau facteur',
        back: '← Retour',
        calibAgain: 'Restart',
        manualCalib: 'Calibration manuelle',
        // Status
        cloud: 'Cloud',
        offline: 'Hors ligne',
        validated: 'Validé',
        invalid: 'Invalide',
        notConfigured: 'Non configuré',
        configureApiKey: 'Configurer la clé API',
        apiKeyInvalid: 'Clé API invalide',
        // Alerts
        alertEnterKey: 'Veuillez saisir une clé API',
        alertUpdateError: 'Erreur lors de la mise à jour',
        alertDeleteConfirm: 'Supprimer la clé API ?',
        alertDeleteError: 'Erreur lors de la suppression',
        alertInvalidFactor: 'Facteur invalide',
        alertNegativeFactor: '⚠️ Le coefficient doit être positif',
        alertError: 'Erreur',
        alertInvalidWeight: 'Poids connu invalide',
        alertDataUnavailable: 'Données non disponibles',
        alertWeightTooLight: '⚠️ Poids trop léger (min. 200g)\nVérifiez que le filament est bien sur la balance.',
        errorWeightRequired: '⚠️ Veuillez entrer un poids valide (min. 200g)',
        modalWeightTooLightTitle: 'Poids insuffisant',
        modalWeightTooLightMessage: 'Le poids est trop léger pour une calibration. Utilisez une Masterspool ou un filament d\'au moins 200g.',
        modalWeightInvalidTitle: 'Poids invalide',
        modalWeightInvalidMessage: 'Veuillez entrer un poids valide',
        modalOk: 'OK',
        alertReconfigConfirm: 'Reconfigurer le Wi‑Fi ? L\'appareil redémarrera.',
        alertResetConfirm: '⚠️ ATTENTION : Cette action effacera toutes les données. Continuer ?',
        // Send status
        sending: '⏳ Envoi...',
        sent: '✓ Envoyé',
        sendError: '✗ Erreur',
        sendIn: 'Envoi dans',
        scanningRfid: '📡 Lecture RFID...',
        stabilizing: '⚖️ Stabilisation...',
        // Weight breakdown
        containerLabel: 'Bobine',
        filamentLabel:  'Filament',
        // Hardware
        hardware: 'Hardware',
        rfidReaders: 'Lecteurs RFID',
        rfidTest: 'Test RFID',
        rfidReaderLeft: 'Gauche',
        rfidReaderRight: 'Droite',
        rfidClear: 'Effacer',
        rfidTestScan: 'Scanner',
        motorConnected: 'Moteur connecté',
        motorEnabled: 'Rotation activée',
        motorTest: 'Test moteur',
        motorTestRun: 'Démarrer',
        motorTestStop: 'Arrêter',
        spoolDetected: 'Bobine détectée',
        spoolPosition: 'Position',
        yes: 'Oui',
        no: 'Non',
        rfidSide: 'Position',
        motorSpeedLabel: 'Vitesse de rotation',
        motorNoiseQuiet: 'Silencieux',
        motorNoiseModerate: 'Modéré',
        motorNoiseLoud: 'Bruyant',
        uidLeft: '◀ Gauche',
        uidRight: 'Droite ▶',
        uidTwin: '🔗 Jumeau'
    },
    en: {
        waiting: 'Waiting TigerTag...',
        quickActions: 'Quick Actions',
        tare: 'TARE',
        apiKey: 'API Key',
        user: 'User',
        newApiKey: 'New API Key',
        update: 'Update',
        delete: 'Delete',
        calibration: 'Wizard Calibration',
        currentFactor: 'Current factor',
        autoCalc: 'Auto calculation',
        knownWeight: 'Known weight (g)',
        compute: 'Compute',
        manual: 'Manual',
        newFactor: 'New factor',
        apply: 'Apply',
        advanced: 'Advanced',
        reconfigWifi: 'Reconfigure Wi‑Fi',
        factoryReset: 'Factory Reset',
        uptime: 'Uptime',
        // Calibration wizard
        step1Title: 'Step 1',
        step1Instruction: 'Leave the scale empty then press the button',
        step1Button: 'GO →',
        step2Title: 'Step 2',
        step2Instruction: 'Select your empty Masterspool and place it on the scale',
        selectMasterspool: 'Select your Masterspool',
        step2Button: 'Calibrate ✓',
        step3Title: 'Calibrated!',
        step3Instruction: 'The scale is now calibrated',
        currentReading: 'Current reading',
        calibKnownWeight: 'Real weight (g)',
        newFactor: 'New factor',
        back: '← Back',
        calibAgain: 'Restart',
        manualCalib: 'Manual calibration',
        // Status
        cloud: 'Cloud',
        offline: 'Offline',
        validated: 'Validated',
        invalid: 'Invalid',
        notConfigured: 'Not configured',
        configureApiKey: 'Setup API Key',
        apiKeyInvalid: 'Invalid API Key',
        // Alerts
        alertEnterKey: 'Please enter an API key',
        alertUpdateError: 'Update error',
        alertDeleteConfirm: 'Delete API key?',
        alertDeleteError: 'Delete error',
        alertInvalidFactor: 'Invalid factor',
        alertNegativeFactor: '⚠️ Coefficient must be positive',
        alertError: 'Error',
        alertInvalidWeight: 'Invalid known weight',
        alertDataUnavailable: 'Data unavailable',
        alertWeightTooLight: '⚠️ Weight too light (min. 200g)\nCheck that the filament is on the scale.',
        errorWeightRequired: '⚠️ Please enter a valid weight (min. 200g)',
        modalWeightTooLightTitle: 'Insufficient weight',
        modalWeightTooLightMessage: 'The weight is too light for calibration. Use a Masterspool or filament of at least 200g.',
        modalWeightInvalidTitle: 'Invalid weight',
        modalWeightInvalidMessage: 'Please enter a valid weight',
        modalOk: 'OK',
        alertReconfigConfirm: 'Reconfigure Wi‑Fi? Device will restart.',
        alertResetConfirm: '⚠️ WARNING: This will erase all data. Continue?',
        // Send status
        sending: '⏳ Sending...',
        sent: '✓ Sent',
        sendError: '✗ Error',
        sendIn: 'Sending in',
        scanningRfid: '📡 Scanning RFID...',
        stabilizing: '⚖️ Stabilizing...',
        // Weight breakdown
        containerLabel: 'Spool',
        filamentLabel:  'Filament',
        // Hardware
        hardware: 'Hardware',
        rfidReaders: 'RFID Readers',
        rfidTest: 'RFID test',
        rfidReaderLeft: 'Left',
        rfidReaderRight: 'Right',
        rfidClear: 'Clear',
        rfidTestScan: 'Scan',
        motorConnected: 'Motor connected',
        motorEnabled: 'Rotation enabled',
        motorTest: 'Motor test',
        motorTestRun: 'Run',
        motorTestStop: 'Stop',
        spoolDetected: 'Spool detected',
        spoolPosition: 'Position',
        yes: 'Yes',
        no: 'No',
        rfidSide: 'Position',
        motorSpeedLabel: 'Scan speed',
        motorNoiseQuiet: 'Quiet',
        motorNoiseModerate: 'Moderate',
        motorNoiseLoud: 'Loud',
        uidLeft: '◀ Left',
        uidRight: 'Right ▶',
        uidTwin: '🔗 Twin'
    }
};

translations.fr.save = 'Enregistrer';
translations.en.save = 'Save';
translations.fr.firebase = 'Firebase';
translations.fr.firebaseStatus = 'Statut Firebase';
translations.fr.firebaseEmail = 'Email Firebase';
translations.fr.firebasePassword = 'Mot de passe Firebase';
translations.en.firebase = 'Firebase';
translations.en.firebaseStatus = 'Firebase status';
translations.en.firebaseEmail = 'Firebase email';
translations.en.firebasePassword = 'Firebase password';
translations.fr.alertFirebaseSaved = 'Identifiants Firebase enregistres';
translations.fr.alertFirebaseDeleted = 'Identifiants Firebase supprimes';
translations.fr.alertFirebaseError = 'Erreur Firebase';
translations.en.alertFirebaseSaved = 'Firebase credentials saved';
translations.en.alertFirebaseDeleted = 'Firebase credentials deleted';
translations.en.alertFirebaseError = 'Firebase error';

// ── Auth modal (NEW) ──
translations.fr.authTitle = 'Bienvenue sur votre TigerScale';
translations.fr.authSub = 'Connectez-vous pour synchroniser vos bobines avec le cloud TigerTag.';
translations.fr.authGoogleBtn = 'Continuer avec Google';
translations.fr.authOr = 'ou';
translations.fr.authSignIn = 'Se connecter';
translations.fr.authNoAccount = 'Pas encore de compte ?';
translations.fr.authSignUp = 'Créer un compte';
translations.fr.authPopupBlocked = 'Le popup a été bloqué. Autorisez les popups pour ce site.';
translations.fr.authPopupClosed = 'Connexion annulée.';
translations.fr.authNetworkError = 'Erreur réseau. Vérifiez votre connexion.';
translations.fr.authInvalidCreds = 'Email ou mot de passe incorrect.';
translations.fr.authSuccess = 'Connecté !';
translations.en.authTitle = 'Welcome to your TigerScale';
translations.en.authSub = 'Sign in to sync your spools with the TigerTag cloud.';
translations.en.authGoogleBtn = 'Continue with Google';
translations.en.authOr = 'or';
translations.en.authSignIn = 'Sign in';
translations.en.authNoAccount = 'No account yet?';
translations.en.authSignUp = 'Create account';
translations.en.authPopupBlocked = 'Popup blocked. Please allow popups for this site.';
translations.en.authPopupClosed = 'Sign-in cancelled.';
translations.en.authNetworkError = 'Network error. Check your connection.';
translations.en.authInvalidCreds = 'Wrong email or password.';
translations.en.authSuccess = 'Signed in!';

// ── Account / logout (NEW) ──
translations.fr.account = 'Compte';
translations.fr.connectedAs = 'Connecté en tant que';
translations.fr.signOut = 'Se déconnecter';
translations.fr.confirmSignOut = 'Vous voulez vraiment vous déconnecter ? Vous devrez vous reconnecter pour synchroniser vos bobines.';
translations.en.account = 'Account';
translations.en.connectedAs = 'Signed in as';
translations.en.signOut = 'Sign out';
translations.en.confirmSignOut = 'Sign out for real? You will need to sign back in to sync your spools.';

let currentLang = localStorage.getItem('tigertag_lang') || 'en';

function t(key) {
    return translations[currentLang][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('tigertag_lang', lang);
    document.documentElement.lang = lang;
    
    // Update lang buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Update all translated elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        el.textContent = t(key);
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        el.placeholder = t(key);
    });
    
    // Update dynamic content
    updateCloudText();
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
    if (fbText) setTextIfChanged(fbText, firebaseConfigured ? 'FB OK' : 'FB OFF');
    // Toggle the Account card (visible only when authenticated)
    const accountCard = document.getElementById('accountCard');
    if (accountCard) accountCard.style.display = firebaseConfigured ? '' : 'none';
    // Auto-show/hide login modal — only after we know the actual status (not on init)
    if (typeof firebaseStatusKnown !== 'undefined' && firebaseStatusKnown) {
        if (firebaseConfigured) hideAuthModal(); else showAuthModal();
    }
}

// Update the Account card with the user's email + avatar initial.
// Called from applyStatusSnapshot when /api/status reports a firebaseEmail.
function setAccountInfo(email) {
    if (!email) return;
    const emailEl = document.getElementById('accountEmail');
    const avatarEl = document.getElementById('accountAvatar');
    if (emailEl) setTextIfChanged(emailEl, email);
    if (avatarEl) {
        // Use first char of the email's local part (before @) as avatar initial
        const local = email.split('@')[0] || '?';
        avatarEl.textContent = local.charAt(0).toUpperCase();
    }
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
    
    // Raw weight — big number (always shown) + kept for calibration
    if (typeof s.weight !== 'undefined') {
        currentWeight = s.weight;
        setTextIfChanged(weightEl, String(s.weight));
    }

    // Filament row — shown only when container is known (async, arrives later)
    if (typeof s.containerWeight !== 'undefined') {
        const rowEl = document.getElementById('filamentRow');
        const cwEl  = document.getElementById('containerWeightDisplay');
        const nwEl  = document.getElementById('netWeightDisplay');
        if (s.containerWeight > 0) {
            if (cwEl) setTextIfChanged(cwEl, String(s.containerWeight));
            if (nwEl) setTextIfChanged(nwEl, (typeof s.netWeight !== 'undefined' && s.netWeight >= 0)
                                              ? String(s.netWeight) : '—');
            if (rowEl) rowEl.style.display = '';
        } else {
            if (rowEl) rowEl.style.display = 'none';
        }
    }

    // UID Left (rfid2 — physically Left reader)
    if (typeof s.uid_left !== 'undefined') {
        const el = document.getElementById('uidLeftDisplay');
        if (el) setTextIfChanged(el, s.uid_left || '—');
    }

    // UID Right (rfid1 — physically Right reader)
    if (typeof s.uid_right !== 'undefined') {
        const u = s.uid_right || '';
        if (currentUid !== u) {
            currentUid = u;
            setTextIfChanged(uidEl, u || '—');
        }
    } else if (typeof s.uid !== 'undefined') {
        // fallback for older firmware frames
        const u = s.uid || '';
        if (currentUid !== u) {
            currentUid = u;
            setTextIfChanged(uidEl, u || '—');
        }
    }

    // UID Twin — fetched from Firestore (only set when no physical 2nd reader detected)
    if (typeof s.uid_twin !== 'undefined') {
        const twin = s.uid_twin || '';
        const twinRow = document.getElementById('uidTwinRow');
        const twinEl  = document.getElementById('uidTwinDisplay');
        if (twinEl) setTextIfChanged(twinEl, twin || '—');
        if (twinRow) twinRow.style.display = twin.length > 0 ? '' : 'none';
    }

    // Show/hide UID rows based on hardware config
    _updateUidRows();

    // Cloud
    if (typeof s.cloud !== 'undefined') {
        setCloudStatus(s.cloud);
    }
    
    // API UI removed in Firebase-only mode
    // Modal trigger uses firebaseAuth ("am I signed in right now?") rather than
    // firebaseConfigured ("are creds stored?") — this catches the stale-creds case
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
        const shown = isFinite(n) ? n.toFixed(2) : '—';
        setTextIfChanged(calFactorEl, shown);
        calFactor = n;
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
        } else if (v.startsWith('scanning:')) {
            // WF_SCANNING — motor rotating, waiting for RFID tag
            setSendState(t('scanningRfid'), 'rgba(255,255,255,0.12)');
        } else if (v.startsWith('stable:')) {
            // WF_STABLE_WAIT — UID found, weight stabilizing
            setSendState(t('stabilizing'), 'rgba(255,255,255,0.18)');
        } else if (/^\d+$/.test(v)) {
            // legacy fallback
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

// Bridge page URL (Firebase Hosting target "cdn" → site "tigertag-cdn")
const AUTH_BRIDGE_URL = 'https://tigertag-cdn.web.app/scale-auth.html';
const AUTH_BRIDGE_ORIGIN = 'https://tigertag-cdn.web.app';

let _authPopup = null;
let _authPopupWatcher = null;

function showAuthModal() {
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
function setAuthError(msg) {
    const el = document.getElementById('authError');
    if (!el) return;
    if (!msg) { el.style.display = 'none'; el.textContent = ''; return; }
    el.textContent = msg;
    el.style.display = 'block';
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
        hideAuthModal();
    })
    .catch(() => setAuthError(t('authNetworkError')));
}

// ── Google sign-in via OAuth bridge (popup → postMessage) ──
function signInWithGoogleBridge() {
    setAuthError('');

    // The bridge needs to know our origin to validate + postMessage back to us
    const returnTo = encodeURIComponent(location.origin);
    const url = `${AUTH_BRIDGE_URL}?return_to=${returnTo}`;

    // Open centered popup
    const w = 460, h = 640;
    const left = Math.max(0, (screen.width - w) / 2);
    const top = Math.max(0, (screen.height - h) / 2);
    _authPopup = window.open(
        url,
        'tigertag-auth',
        `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!_authPopup) {
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

// ── Sign out — clears tokens on the device and re-opens the login modal ──
function signOut() {
    if (!confirm(t('confirmSignOut'))) return;
    fetch('/api/firebase/logout', { method: 'POST' })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(() => {
        // Reset local UI state
        const emailEl = document.getElementById('firebaseEmail');
        const passEl = document.getElementById('firebasePassword');
        if (emailEl) emailEl.value = '';
        if (passEl) passEl.value = '';
        // Clear the modal's input fields too (so the next user starts fresh)
        const loginEmail = document.getElementById('loginEmail');
        const loginPass = document.getElementById('loginPassword');
        if (loginEmail) loginEmail.value = '';
        if (loginPass) loginPass.value = '';
        setAccountInfo('');
        const avatarEl = document.getElementById('accountAvatar');
        if (avatarEl) avatarEl.textContent = '?';
        setFirebaseConfigured(false); // this also re-shows the modal via setFirebaseConfigured
    })
    .catch(() => alert(t('alertFirebaseError')));
}

// ── postMessage listener — receives tokens from the bridge ──
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
        setFirebaseConfigured(true);
        hideAuthModal();
        // Best-effort close of the popup
        try { if (_authPopup) _authPopup.close(); } catch {}
    })
    .catch(() => setAuthError(t('authNetworkError')));
});

// ========== WEBSOCKET CLIENT ==========
let _ws = null;
let _wsReconnectTimer = null;

function wsConnect() {
    if (_ws && (_ws.readyState === WebSocket.OPEN || _ws.readyState === WebSocket.CONNECTING)) return;
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    _ws = new WebSocket(proto + '//' + location.host + '/ws');

    _ws.onopen = function() {
        console.log('[WS] connected');
        if (_wsReconnectTimer) { clearTimeout(_wsReconnectTimer); _wsReconnectTimer = null; }
    };

    _ws.onmessage = function(evt) {
        wsLogPush('in', evt.data);
        try {
            const data = JSON.parse(evt.data);
            // Unified frame — every field the UI needs arrives here at 250ms.
            // Legacy type dispatch kept for backward compat (no longer sent).
            if (data.type === 'firebaseStatus') {
                firebaseStatusKnown = true;
                setFirebaseConfigured(!!(data.auth || data.configured));
                if (data.email) setAccountInfo(data.email);
                return;
            }
            applyStatusSnapshot(data);
        } catch(e) {}
    };

    // Patch send to log outgoing frames too
    const _origSend = _ws.send.bind(_ws);
    _ws.send = function(data) { wsLogPush('out', data); _origSend(data); };

    _ws.onerror = function() { /* onclose fires right after */ };

    _ws.onclose = function() {
        console.log('[WS] closed — reconnect in 3s');
        if (!_wsReconnectTimer) {
            _wsReconnectTimer = setTimeout(function() {
                _wsReconnectTimer = null;
                wsConnect();
            }, 3000);
        }
    };
}

// ========== HARDWARE CONFIG ==========
let hwConfig = { rfidCount: 1, rfidSide: 'left', motorConnected: false, motorEnabled: false, motorSpeed: 3 };

async function fetchHardwareConfig() {
    try {
        const r = await fetch('/api/hw/config', { cache: 'no-cache' });
        if (!r.ok) return;
        const d = await r.json();
        hwConfig = { ...hwConfig, ...d };
    } catch (_) {}
    applyHardwareConfig();
}

function applyHardwareConfig() {
    // RFID count segment
    document.querySelectorAll('#rfidSegment .segment-btn').forEach(b => {
        b.classList.toggle('active', +b.dataset.val === hwConfig.rfidCount);
    });
    // RFID side selector — visible only when count=1
    const sideRow = document.getElementById('rfidSideRow');
    if (sideRow) sideRow.style.display = (hwConfig.rfidCount === 1) ? '' : 'none';
    // RFID side segment
    const side = hwConfig.rfidSide || 'left';
    document.querySelectorAll('#rfidSideSegment .segment-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.val === side);
    });
    // Motor connected toggle
    const connChk = document.getElementById('motorConnectedCheck');
    if (connChk) connChk.checked = !!hwConfig.motorConnected;
    const enabledRow = document.getElementById('motorEnabledRow');
    if (enabledRow) enabledRow.style.display = hwConfig.motorConnected ? '' : 'none';
    const enChk = document.getElementById('motorEnabledCheck');
    if (enChk) enChk.checked = !!hwConfig.motorEnabled;
    // Motor speed — init slider + noise badge without triggering a save
    const spd = hwConfig.motorSpeed || 3;
    _motorTestSpeed = spd;
    const slider = document.getElementById('motorSpeedSlider');
    if (slider) slider.value = spd;
    _updateMotorNoiseBadge(spd);
    updateMotorTestPanel();
    updateRfidTestPanel();
    _updateUidRows();
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
        stopMotorTest();
    }
    updateMotorTestPanel();
    saveHardwareConfig();
}

function onMotorEnabledChange() {
    const chk = document.getElementById('motorEnabledCheck');
    hwConfig.motorEnabled = !!(chk && chk.checked);
    if (!hwConfig.motorEnabled) stopMotorTest();
    updateMotorTestPanel();
    fetch('/api/servo-toggle', { method: 'POST' })
        .then(r => r.ok ? r.json() : Promise.reject())
        .catch(() => {
            hwConfig.motorEnabled = !hwConfig.motorEnabled;
            const c = document.getElementById('motorEnabledCheck');
            if (c) c.checked = hwConfig.motorEnabled;
        });
    saveHardwareConfig();
}

// ── Motor test ──────────────────────────────────────────────────────────────
const MOTOR_SPEED_US = { 1: 1530, 2: 1580, 3: 1650, 4: 1750, 5: 1900 };
let _motorTestRunning = false;
let _motorTestSpeed   = 2;

function updateMotorTestPanel() {
    const panel = document.getElementById('motorTestPanel');
    if (!panel) return;
    const show = !!(hwConfig.motorConnected && hwConfig.motorEnabled);
    panel.style.display = show ? '' : 'none';
    if (!show && _motorTestRunning) stopMotorTest();
    _updateMotorTestBtn();
}

function _updateMotorNoiseBadge(level) {
    const badge = document.getElementById('motorNoiseBadge');
    const label = document.getElementById('motorNoiseLabel');
    let noiseKey, icon;
    if (level <= 2)       { noiseKey = 'motorNoiseQuiet';    icon = '🔇'; }
    else if (level === 3) { noiseKey = 'motorNoiseModerate'; icon = '🔉'; }
    else                  { noiseKey = 'motorNoiseLoud';     icon = '🔊'; }
    if (badge) badge.textContent = icon;
    if (label) { label.textContent = t(noiseKey); label.dataset.i18n = noiseKey; }
}

function setMotorSpeed(level) {
    _motorTestSpeed = level;
    hwConfig.motorSpeed = level;
    const slider = document.getElementById('motorSpeedSlider');
    if (slider) { slider.value = level; slider.style.setProperty('--val', level); }
    document.querySelectorAll('.motor-speed-ticks span').forEach((s, i) => {
        s.style.color = (i + 1 === level) ? '#e67e22' : '';
        s.style.setProperty('--dot', (i + 1 <= level) ? '#e67e22' : '#e2e8f0');
    });
    _updateMotorNoiseBadge(level);
    if (_motorTestRunning) {
        fetch('/api/servo/test', { method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ us: MOTOR_SPEED_US[level] }) }).catch(() => {});
    }
    saveHardwareConfig();
}

function toggleMotorTest() { if (_motorTestRunning) stopMotorTest(); else startMotorTest(); }

function startMotorTest() {
    const us = MOTOR_SPEED_US[_motorTestSpeed] || 1650;
    fetch('/api/servo/test', { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ us }) })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(() => { _motorTestRunning = true; _updateMotorTestBtn(); })
    .catch(() => {});
}

function stopMotorTest() {
    fetch('/api/servo/test', { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stop: true }) }).catch(() => {});
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

// ── RFID hardware test ───────────────────────────────────────────────────────
let _rfidTestRunning = false;
let _rfidTestPollId  = null;

function toggleRfidTest() { if (_rfidTestRunning) stopRfidTest(); else startRfidTest(); }

function startRfidTest() {
    _setRfidUid('left',  '—', false);
    _setRfidUid('right', '—', false);
    fetch('/api/rfid/test', { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: '{}' })
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
    fetch('/api/rfid/test', { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: '{"stop":true}' }).catch(() => {});
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
    fetch('/api/rfid/test', { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: '{"reset":true}' }).catch(() => {});
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
    if (_rfidTestRunning && !hwConfig.rfidCount) stopRfidTest();
    const leftRow  = document.getElementById('rfidLeftRow');
    const rightRow = document.getElementById('rfidRightRow');
    if (hwConfig.rfidCount >= 2) {
        if (leftRow)  leftRow.style.display = '';
        if (rightRow) rightRow.style.display = '';
    } else {
        const activeSide = hwConfig.rfidSide || 'left';
        if (leftRow)  leftRow.style.display  = (activeSide === 'left')  ? '' : 'none';
        if (rightRow) rightRow.style.display = (activeSide === 'right') ? '' : 'none';
    }
}

function updateSpoolStatus(detected, position) {
    const detEl  = document.getElementById('spoolDetectedVal');
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

// ========== LOG SIDE PANEL ==========
let _fbLogPollId  = null;
let _logPanelOpen = false;
let _logActiveTab = 'fb';

function logPanelOpen(tab) {
    _logPanelOpen = true;
    document.getElementById('logSidePanel').classList.add('open');
    document.getElementById('logSideOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    logTabSwitch(tab || _logActiveTab);
}

function logPanelClose() {
    _logPanelOpen = false;
    document.getElementById('logSidePanel').classList.remove('open');
    document.getElementById('logSideOverlay').classList.remove('open');
    document.body.style.overflow = '';
    clearInterval(_fbLogPollId); _fbLogPollId = null;
}

function logTabSwitch(tab) {
    _logActiveTab = tab;
    document.getElementById('logPaneFb').classList.toggle('active', tab === 'fb');
    document.getElementById('logPaneWs').classList.toggle('active', tab === 'ws');
    document.getElementById('logTabFb').classList.toggle('active', tab === 'fb');
    document.getElementById('logTabWs').classList.toggle('active', tab === 'ws');
    if (tab === 'fb') {
        fbLogFetch();
        if (!_fbLogPollId) _fbLogPollId = setInterval(fbLogFetch, 4000);
    } else {
        clearInterval(_fbLogPollId); _fbLogPollId = null;
    }
}

// ========== FIREBASE LOG ==========

async function fbLogFetch() {
    const btn = document.getElementById('fbLogRefreshBtn');
    if (btn) btn.textContent = '…';
    try {
        const r = await fetch('/api/logs', { cache: 'no-store' });
        if (!r.ok) throw new Error(r.status);
        const entries = await r.json();   // array of strings, oldest first
        _fbLogRender(entries);
    } catch (_) {
        const c = document.getElementById('fbLogContainer');
        if (c) c.innerHTML = '<div class="ws-log-empty" style="color:#fc8181">Erreur de connexion</div>';
    } finally {
        if (btn) btn.textContent = '↺';
    }
}

function _fbLogEntryClass(line) {
    if (/ERR|FAIL|error|INVALID/i.test(line)) return 'fb-log-err';
    if (/ OK\b|result=|Signed|signed|AUTH OK/i.test(line)) return 'fb-log-ok';
    if (/TOKEN|REFRESH|auth/i.test(line)) return 'fb-log-auth';
    if (/PATCH|CONTAINER|TWIN|WEIGHT/i.test(line)) return 'fb-log-data';
    return '';
}

function _fbLogRender(entries) {
    const container = document.getElementById('fbLogContainer');
    const countEl   = document.getElementById('fbLogCount');
    if (!container) return;
    if (countEl) countEl.textContent = entries.length;
    if (entries.length === 0) {
        container.innerHTML = '<div class="ws-log-empty">Aucun log Firebase</div>';
        return;
    }
    // Show newest first
    container.innerHTML = entries.slice().reverse().map(line => {
        const cls = _fbLogEntryClass(line);
        return `<div class="fb-log-entry ${cls}"><pre class="ws-log-data">${line}</pre></div>`;
    }).join('');
}

async function fbLogClear() {
    try {
        await fetch('/api/logs/clear', { method: 'POST' });
        _fbLogRender([]);
    } catch (_) {}
}

// ========== WEBSOCKET LOG ==========
const WS_LOG_MAX = 100;
let _wsLogEntries    = [];
let _wsLogPaused     = false;
let _wsLogOnlyChange = true;
let _wsLogLastRaw    = null;
let _wsLogRenderTimer = null;

function _updateUidRows() {
    const leftRow  = document.getElementById('uidLeftRow');
    const rightRow = document.getElementById('uidRightRow');
    if (!leftRow || !rightRow) return;
    if (hwConfig.rfidCount >= 2) {
        leftRow.style.display  = '';
        rightRow.style.display = '';
    } else {
        const side = hwConfig.rfidSide || 'left';
        leftRow.style.display  = (side === 'left')  ? '' : 'none';
        rightRow.style.display = (side === 'right') ? '' : 'none';
    }
}

function wsLogPush(dir, raw) {
    if (_wsLogPaused) return;
    if (_wsLogOnlyChange && dir === 'in' && raw === _wsLogLastRaw) return;
    if (dir === 'in') _wsLogLastRaw = raw;

    const now  = new Date();
    const ts   = now.toTimeString().slice(0, 8) + '.' + String(now.getMilliseconds()).padStart(3, '0');
    let display;
    try {
        // Pretty-print only small payloads, compact otherwise
        const obj = JSON.parse(raw);
        const compact = JSON.stringify(obj);
        display = compact.length < 300 ? compact : JSON.stringify(obj, null, 2);
    } catch (_) { display = raw; }

    _wsLogEntries.unshift({ ts, dir, display });
    if (_wsLogEntries.length > WS_LOG_MAX) _wsLogEntries.pop();

    // Throttle DOM update to ~4 fps
    if (!_wsLogRenderTimer) {
        _wsLogRenderTimer = setTimeout(() => { _wsLogRenderTimer = null; _wsLogRender(); }, 250);
    }
}

function _wsLogRender() {
    const container = document.getElementById('wsLogContainer');
    const countEl   = document.getElementById('wsLogCount');
    if (!container) return;
    if (countEl) countEl.textContent = _wsLogEntries.length;
    if (_wsLogEntries.length === 0) {
        container.innerHTML = '<div class="ws-log-empty">Aucun message</div>';
        return;
    }
    const wasAtTop = container.scrollTop < 40;
    container.innerHTML = _wsLogEntries.map(e => {
        const cls   = e.dir === 'in' ? 'ws-log-in' : 'ws-log-out';
        const arrow = e.dir === 'in' ? '↓' : '↑';
        return `<div class="ws-log-entry ${cls}"><span class="ws-log-ts">${e.ts}</span><span class="ws-log-arrow">${arrow}</span><pre class="ws-log-data">${e.display}</pre></div>`;
    }).join('');
    // Keep scroll at top (newest first)
    if (wasAtTop) container.scrollTop = 0;
}

function wsLogClear() {
    _wsLogEntries = [];
    _wsLogLastRaw = null;
    _wsLogRender();
}

function wsLogTogglePause() {
    _wsLogPaused = !_wsLogPaused;
    const btn = document.getElementById('wsLogPauseBtn');
    if (btn) btn.textContent = _wsLogPaused ? '▶' : '⏸';
}

function wsLogSetOnlyChanges(val) {
    _wsLogOnlyChange = !!val;
}

// ========== INITIALIZATION ==========
window.onload = () => {
    // Set language
    setLanguage(currentLang);
    setFirebaseConfigured(false);

    // Initial weight display
    setTextIfChanged(weightEl, '…');

    // Load hardware config from ESP32 (RFID count, motor state)
    fetchHardwareConfig();

    // WebSocket — single data flow, all fields, 250ms same tick as OLED.
    // No HTTP polling: every field (weight, uid, cloud, firebase, calibration,
    // uptime) arrives through the unified WS frame.
    wsConnect();

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    }
};
