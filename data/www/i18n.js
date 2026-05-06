/**
 * i18n.js — Translation controller for TigerScale device UI.
 *
 * Mirrors the architecture of web-installer/i18n.js + TigerTag Studio Manager:
 *   • locales/{lang}.json — one JSON token file per language
 *   • t(key, params)      — lookup with {{var}} interpolation, plurals, EN fallback
 *   • applyTranslations() — applies all data-i18n* attributes on the DOM
 *   • Lazy fetch          — only the active language is loaded eagerly,
 *                           others are fetched on demand to keep first-paint fast
 *   • EN bundled          — always loaded as fallback (no surprise key→raw display)
 *   • localStorage        — remembers user choice (key: tigertag_lang)
 *
 * Backward-compat: exposes window.t() and window.setLanguage() so existing
 * application code that pre-dates this controller keeps working unchanged.
 */
(function (global) {
    'use strict';

    const LANGS = {
        en:      { name: 'English',              short: 'EN'    },
        fr:      { name: 'Français',             short: 'FR'    },
        de:      { name: 'Deutsch',              short: 'DE'    },
        es:      { name: 'Español',              short: 'ES'    },
        it:      { name: 'Italiano',             short: 'IT'    },
        pl:      { name: 'Polski',               short: 'PL'    },
        pt:      { name: 'Português (Brasil)',   short: 'PT-BR' },
        'pt-pt': { name: 'Português (Portugal)', short: 'PT'    },
        zh:      { name: '中文 (简体)',            short: 'ZH'    }
    };
    const DEFAULT_LANG  = 'en';
    const FALLBACK_LANG = 'en';
    const STORAGE_KEY   = 'tigertag_lang';   // kept identical to legacy key
    const LOCALES_BASE  = 'locales';

    const state = {
        lang: DEFAULT_LANG,
        i18n: {}                              // { en: {…}, fr: {…}, … }
    };

    function t(key, params) {
        params = params || {};
        const cur  = state.i18n[state.lang]    || {};
        const fall = state.i18n[FALLBACK_LANG] || {};
        let val = (key in cur) ? cur[key] : (key in fall ? fall[key] : key);
        if (Array.isArray(val)) val = val[Math.floor(Math.random() * val.length)];
        if (val && typeof val === 'object' && ('one' in val || 'other' in val)) {
            const n = params.n != null ? params.n : 0;
            val = (n === 1) ? (val.one  != null ? val.one  : val.other)
                            : (val.other != null ? val.other : val.one);
        }
        if (typeof val !== 'string') return key;
        return val.replace(/\{\{(\w+)\}\}/g, (_, k) => params[k] != null ? params[k] : '');
    }

    function applyTranslations() {
        document.documentElement.lang = state.lang;
        document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
        document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const v = t(el.dataset.i18nTitle);
            el.setAttribute('title', v);
            el.setAttribute('aria-label', v);
        });
        document.dispatchEvent(new CustomEvent('i18n:applied', { detail: { lang: state.lang } }));
    }

    async function fetchLocale(lang) {
        if (state.i18n[lang]) return state.i18n[lang];     // already cached
        try {
            const r = await fetch(`${LOCALES_BASE}/${lang}.json`, { cache: 'no-cache' });
            if (r.ok) { state.i18n[lang] = await r.json(); }
        } catch (e) {
            console.warn('[i18n] fetch failed:', lang, e);
        }
        return state.i18n[lang] || null;
    }

    async function setLang(lang) {
        if (!LANGS[lang]) return;
        state.lang = lang;
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
        await fetchLocale(lang);
        applyTranslations();
        // Update legacy global currentLang for any code that reads it directly
        global.currentLang = lang;
        // Sync the dropdown trigger label (if present)
        const lbl = document.querySelector('#langTrigger .lang-trigger-label');
        if (lbl) lbl.textContent = (LANGS[state.lang] || LANGS[DEFAULT_LANG]).short;
        document.querySelectorAll('.lang-item').forEach(li => {
            li.classList.toggle('active', li.dataset.lang === state.lang);
        });
        // Sync modal select
        const modalSel = document.getElementById('modalLangSelect');
        if (modalSel) modalSel.value = lang;
        // Legacy compat: keep .lang-btn[data-lang] active states in sync
        document.querySelectorAll('.lang-btn[data-lang]').forEach(b => {
            b.classList.toggle('active', b.dataset.lang === state.lang);
        });
    }

    function detectInitialLang() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored && LANGS[stored]) return stored;
        } catch (_) {}
        const nav = (navigator.language || navigator.userLanguage || DEFAULT_LANG).slice(0, 2).toLowerCase();
        return LANGS[nav] ? nav : DEFAULT_LANG;
    }

    function buildSwitcher() {
        const root = document.getElementById('langSwitcher');
        if (!root) return;
        // If the host page kept the legacy EN/FR buttons, replace them with a dropdown.
        root.innerHTML = '';
        root.classList.add('lang-dropdown');

        const trigger = document.createElement('button');
        trigger.className = 'lang-trigger';
        trigger.type = 'button';
        trigger.id = 'langTrigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-label', 'Language');

        const label = document.createElement('span');
        label.className = 'lang-trigger-label';
        label.textContent = (LANGS[state.lang] || LANGS[DEFAULT_LANG]).short;
        const chev = document.createElement('span');
        chev.className = 'lang-trigger-chevron';
        chev.setAttribute('aria-hidden', 'true');
        chev.textContent = '▾';
        trigger.appendChild(label);
        trigger.appendChild(chev);

        const menu = document.createElement('ul');
        menu.className = 'lang-menu';
        menu.setAttribute('role', 'listbox');

        Object.keys(LANGS).forEach(code => {
            const info = LANGS[code];
            const li = document.createElement('li');
            li.className = 'lang-item';
            li.dataset.lang = code;
            li.setAttribute('role', 'option');
            li.tabIndex = 0;
            li.innerHTML =
                '<span class="lang-item-code">' + info.short + '</span>' +
                '<span class="lang-item-name">' + info.name + '</span>';
            li.addEventListener('click', () => { setLang(code); close(); });
            li.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLang(code); close(); }
            });
            menu.appendChild(li);
        });

        root.appendChild(trigger); root.appendChild(menu);

        // Populate the in-modal language select (if present)
        const modalSel = document.getElementById('modalLangSelect');
        if (modalSel && modalSel.options.length === 0) {
            Object.keys(LANGS).forEach(code => {
                const opt = document.createElement('option');
                opt.value = code;
                opt.textContent = LANGS[code].short + ' — ' + LANGS[code].name;
                if (code === state.lang) opt.selected = true;
                modalSel.appendChild(opt);
            });
        } else if (modalSel) {
            modalSel.value = state.lang;
        }

        const open  = () => { root.classList.add('open');    trigger.setAttribute('aria-expanded', 'true');
                              document.addEventListener('click', onDocClick, true);
                              document.addEventListener('keydown', onDocKey); };
        const close = () => { root.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false');
                              document.removeEventListener('click', onDocClick, true);
                              document.removeEventListener('keydown', onDocKey); };
        const onDocClick = e => { if (!root.contains(e.target)) close(); };
        const onDocKey   = e => { if (e.key === 'Escape') close(); };
        trigger.addEventListener('click', e => { e.stopPropagation(); root.classList.contains('open') ? close() : open(); });
    }

    async function init() {
        // Always preload the fallback language so a translation-miss doesn't show
        // raw key strings while we're fetching the active locale.
        await fetchLocale(FALLBACK_LANG);
        const lang = detectInitialLang();
        if (lang !== FALLBACK_LANG) await fetchLocale(lang);
        state.lang = lang;
        global.currentLang = lang;
        buildSwitcher();
        applyTranslations();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    global.TigerI18n = {
        t,
        setLang,
        applyTranslations,
        getLang:    () => state.lang,
        getLocales: () => Object.keys(LANGS),
        getDict:    (lang) => state.i18n[lang || state.lang] || {}
    };

    // Backward-compat shims so legacy script.js code keeps working
    if (typeof global.t !== 'function')           global.t           = (k, p) => t(k, p);
    if (typeof global.setLanguage !== 'function') global.setLanguage = (lang) => setLang(lang);
    global.setLang = (lang) => setLang(lang);

})(window);
