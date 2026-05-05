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
        openPortal: 'Ouvrir le portail',
        factoryReset: 'Réinitialisation',
        uptime: 'Durée de fonctionnement',
        // Calibration wizard
        step1Title: 'Step 1',
        step1Instruction: 'Laissez la balance vide puis appuyez sur le bouton',
        step1Button: 'Next',
        step2Title: 'Step 2',
        step2Instruction: 'Sélectionnez votre Masterspool vide et placez-la sur la balance',
        selectMasterspool: 'Sélectionnez votre Masterspool',
        step2Button: 'Calibrer',
        step3Title: 'Calibré !',
        step3Instruction: 'La balance est maintenant calibrée',
        currentReading: 'Lecture actuelle',
        calibKnownWeight: 'Poids réel (g)',
        newFactor: 'Nouveau facteur',
        back: 'Retour',
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
        alertNegativeFactor: 'Le coefficient doit être positif',
        alertError: 'Erreur',
        alertInvalidWeight: 'Poids connu invalide',
        alertDataUnavailable: 'Données non disponibles',
        alertWeightTooLight: 'Poids trop léger (min. 200g)\nVérifiez que le filament est bien sur la balance.',
        errorWeightRequired: 'Veuillez entrer un poids valide (min. 200g)',
        modalWeightTooLightTitle: 'Poids insuffisant',
        modalWeightTooLightMessage: 'Le poids est trop léger pour une calibration. Utilisez une Masterspool ou un filament d\'au moins 200g.',
        modalWeightInvalidTitle: 'Poids invalide',
        modalWeightInvalidMessage: 'Veuillez entrer un poids valide',
        modalOk: 'OK',
        alertReconfigConfirm: 'Reconfigurer le Wi‑Fi ? L\'appareil redémarrera.',
        alertResetConfirm: 'ATTENTION : Cette action effacera toutes les données. Continuer ?',
        // Send status
        sending: 'Envoi...',
        sent: 'Envoyé',
        sendError: 'Erreur',
        sendIn: 'Envoi dans'
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
        openPortal: 'Open Portal',
        factoryReset: 'Factory Reset',
        uptime: 'Uptime',
        // Calibration wizard
        step1Title: 'Step 1',
        step1Instruction: 'Leave the scale empty then press the button',
        step1Button: 'Next',
        step2Title: 'Step 2',
        step2Instruction: 'Select your empty Masterspool and place it on the scale',
        selectMasterspool: 'Select your Masterspool',
        step2Button: 'Calibrate',
        step3Title: 'Calibrated!',
        step3Instruction: 'The scale is now calibrated',
        currentReading: 'Current reading',
        calibKnownWeight: 'Real weight (g)',
        newFactor: 'New factor',
        back: 'Back',
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
        alertNegativeFactor: 'Coefficient must be positive',
        alertError: 'Error',
        alertInvalidWeight: 'Invalid known weight',
        alertDataUnavailable: 'Data unavailable',
        alertWeightTooLight: 'Weight too light (min. 200g)\nCheck that the filament is on the scale.',
        errorWeightRequired: 'Please enter a valid weight (min. 200g)',
        modalWeightTooLightTitle: 'Insufficient weight',
        modalWeightTooLightMessage: 'The weight is too light for calibration. Use a Masterspool or filament of at least 200g.',
        modalWeightInvalidTitle: 'Invalid weight',
        modalWeightInvalidMessage: 'Please enter a valid weight',
        modalOk: 'OK',
        alertReconfigConfirm: 'Reconfigure Wi‑Fi? Device will restart.',
        alertResetConfirm: 'WARNING: This will erase all data. Continue?',
        // Send status
        sending: 'Sending...',
        sent: 'Sent',
        sendError: 'Error',
        sendIn: 'Sending in'
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
    // Auto-show/hide login modal - only after we know the actual status (not on init)
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
    fetch('/api/firebase/auth', { method: 'DELETE' })
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
    
    // Weight
    if (typeof s.weight !== 'undefined' && currentWeight !== s.weight) {
        currentWeight = s.weight;
        setTextIfChanged(weightEl, String(s.weight));
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

// Bridge page URL (Firebase Hosting target "cdn" -> site "tigertag-cdn")
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

// ── Google sign-in via OAuth bridge (popup -> postMessage) ──
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

// ── Sign out - clears tokens on the device and re-opens the login modal ──
function signOut() {
    if (!confirm(t('confirmSignOut'))) return;
    fetch('/api/firebase/auth', { method: 'DELETE' })
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

// ========== INITIALIZATION ==========
window.onload = () => {
    // Set language
    setLanguage(currentLang);
    setFirebaseConfigured(false);

    // Initial weight display
    setTextIfChanged(weightEl, '…');

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
