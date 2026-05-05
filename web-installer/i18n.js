/**
 * i18n.js — Lightweight translation controller for TigerScale Web Installer.
 *
 * Pattern aligned with TigerTag Studio Manager :
 *   • locales/{lang}.json — one JSON token file per language
 *   • t(key, params)      — lookup with {{var}} interpolation + plurals + fallback
 *   • applyTranslations() — applies all data-i18n* attributes on the DOM
 *   • loadLocales()       — async fetcher (parallel)
 *   • localStorage        — remembers user choice
 *   • navigator.language  — auto-detect on first visit
 *   • EN fallback         — for any missing translation key
 *
 * Supported attributes:
 *   data-i18n="key"             → element.textContent
 *   data-i18n-html="key"        → element.innerHTML (HTML allowed in token)
 *   data-i18n-placeholder="key" → input.placeholder
 *   data-i18n-title="key"       → element.title + aria-label (icon buttons)
 *   data-i18n-attr-content="key"→ <meta content="…">
 *
 * Token file format:
 *   { "key": "Plain string with {{name}}" }                 — interpolation
 *   { "key": ["A", "B", "C"] }                              — random pick
 *   { "key": { "one": "1 file", "other": "{{n}} files" } } — plural (params.n)
 */

(function (global) {
    'use strict';

    // ─────────────────────────────────────────────────────────────────
    // Configuration
    // ─────────────────────────────────────────────────────────────────

    /**
     * Available languages — aligned with TigerTag Studio Manager (9 locales).
     * Add by dropping `locales/<code>.json` and a new entry here.
     */
    const LANGS = {
        en:      { name: 'English',                  short: 'EN'    },
        fr:      { name: 'Français',                 short: 'FR'    },
        de:      { name: 'Deutsch',                  short: 'DE'    },
        es:      { name: 'Español',                  short: 'ES'    },
        it:      { name: 'Italiano',                 short: 'IT'    },
        pl:      { name: 'Polski',                   short: 'PL'    },
        pt:      { name: 'Português (Brasil)',       short: 'PT-BR' },
        'pt-pt': { name: 'Português (Portugal)',     short: 'PT'    },
        zh:      { name: '中文 (简体)',                short: 'ZH'    }
    };

    const DEFAULT_LANG = 'en';
    const FALLBACK_LANG = 'en';
    const STORAGE_KEY = 'tigerscale-installer-lang';
    const LOCALES_BASE = 'locales';

    // ─────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────

    const state = {
        lang: DEFAULT_LANG,
        i18n: {} // { en: {…}, fr: {…}, … }
    };

    // ─────────────────────────────────────────────────────────────────
    // Token resolution
    // ─────────────────────────────────────────────────────────────────

    /**
     * Look up `key` in the current language, falling back to FALLBACK_LANG,
     * then returning the key itself if it's missing in both.
     * Supports {{var}} interpolation, plural forms, and array random pick.
     */
    function t(key, params) {
        params = params || {};
        const cur  = state.i18n[state.lang]      || {};
        const fall = state.i18n[FALLBACK_LANG]   || {};
        let val = (key in cur) ? cur[key] : (key in fall ? fall[key] : key);

        // Array → random pick (useful for variety messages)
        if (Array.isArray(val)) {
            val = val[Math.floor(Math.random() * val.length)];
        }
        // Plural form: { one: '…', other: '…' } — params.n drives the choice
        if (val && typeof val === 'object' && ('one' in val || 'other' in val)) {
            const n = params.n != null ? params.n : 0;
            val = (n === 1) ? (val.one  != null ? val.one  : val.other)
                            : (val.other != null ? val.other : val.one);
        }
        if (typeof val !== 'string') return key;

        // {{name}} interpolation
        return val.replace(/\{\{(\w+)\}\}/g, function (_, k) {
            return params[k] != null ? params[k] : '';
        });
    }

    // ─────────────────────────────────────────────────────────────────
    // DOM application
    // ─────────────────────────────────────────────────────────────────

    function applyTranslations() {
        document.documentElement.lang = state.lang;

        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            el.textContent = t(el.dataset.i18n);
        });
        document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
            el.innerHTML = t(el.dataset.i18nHtml);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            el.placeholder = t(el.dataset.i18nPlaceholder);
        });
        document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
            const v = t(el.dataset.i18nTitle);
            el.setAttribute('title', v);
            el.setAttribute('aria-label', v);
        });
        document.querySelectorAll('[data-i18n-attr-content]').forEach(function (el) {
            el.setAttribute('content', t(el.dataset.i18nAttrContent));
        });

        // Update <title> if a token exists for it
        const pageTitle = state.i18n[state.lang] && state.i18n[state.lang].pageTitle;
        if (pageTitle) document.title = pageTitle;

        // Sync the language switcher (dropdown trigger label + active item)
        syncTriggerLabel();

        // Notify listeners (custom event)
        document.dispatchEvent(new CustomEvent('i18n:applied', { detail: { lang: state.lang } }));
    }

    // ─────────────────────────────────────────────────────────────────
    // Loading + lifecycle
    // ─────────────────────────────────────────────────────────────────

    /** Fetch every locale JSON in parallel. Missing files are silently ignored. */
    async function loadLocales() {
        const codes = Object.keys(LANGS);
        await Promise.all(codes.map(async function (lang) {
            try {
                const r = await fetch(LOCALES_BASE + '/' + lang + '.json', { cache: 'no-cache' });
                if (r.ok) state.i18n[lang] = await r.json();
            } catch (e) {
                console.warn('[i18n] failed to load', lang, e);
            }
        }));
    }

    /** Detect initial language : localStorage > navigator.language > DEFAULT_LANG. */
    function detectInitialLang() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored && LANGS[stored]) return stored;
        } catch (_) {}
        const nav = (navigator.language || navigator.userLanguage || DEFAULT_LANG).slice(0, 2).toLowerCase();
        return LANGS[nav] ? nav : DEFAULT_LANG;
    }

    /** Switch the active language and re-render. */
    function setLang(lang) {
        if (!LANGS[lang]) return;
        state.lang = lang;
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
        applyTranslations();
    }

    /**
     * Build a dropdown-style language switcher inside `#langSwitcher`.
     * Trigger button shows the current short code + chevron;
     * clicking opens a list of native language names below.
     */
    function buildSwitcher() {
        const root = document.getElementById('langSwitcher');
        if (!root) return;
        root.innerHTML = '';
        root.classList.add('lang-dropdown');

        // Trigger button
        const trigger = document.createElement('button');
        trigger.className = 'lang-trigger';
        trigger.type = 'button';
        trigger.id = 'langTrigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        const triggerLabel = document.createElement('span');
        triggerLabel.className = 'lang-trigger-label';
        triggerLabel.textContent = (LANGS[state.lang] || LANGS[DEFAULT_LANG]).short;
        const triggerChevron = document.createElement('span');
        triggerChevron.className = 'lang-trigger-chevron';
        triggerChevron.setAttribute('aria-hidden', 'true');
        triggerChevron.textContent = '▾';
        trigger.appendChild(triggerLabel);
        trigger.appendChild(triggerChevron);

        // Dropdown menu
        const menu = document.createElement('ul');
        menu.className = 'lang-menu';
        menu.setAttribute('role', 'listbox');

        Object.keys(LANGS).forEach(function (code) {
            const info = LANGS[code];
            const li   = document.createElement('li');
            li.className = 'lang-item';
            li.dataset.lang = code;
            li.setAttribute('role', 'option');
            li.tabIndex = 0;
            li.innerHTML =
                '<span class="lang-item-code">' + info.short + '</span>' +
                '<span class="lang-item-name">' + info.name + '</span>';
            li.addEventListener('click', function () {
                setLang(code);
                close();
            });
            li.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setLang(code);
                    close();
                }
            });
            menu.appendChild(li);
        });

        root.appendChild(trigger);
        root.appendChild(menu);

        // Open / close behaviour
        function open() {
            root.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
            document.addEventListener('click',  onDocClick,  true);
            document.addEventListener('keydown', onDocKey);
        }
        function close() {
            root.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
            document.removeEventListener('click',  onDocClick,  true);
            document.removeEventListener('keydown', onDocKey);
        }
        function onDocClick(e) {
            if (!root.contains(e.target)) close();
        }
        function onDocKey(e) {
            if (e.key === 'Escape') close();
        }
        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            if (root.classList.contains('open')) close(); else open();
        });
    }

    /** Re-sync the trigger label when the language changes. */
    function syncTriggerLabel() {
        const lbl = document.querySelector('#langTrigger .lang-trigger-label');
        if (lbl) lbl.textContent = (LANGS[state.lang] || LANGS[DEFAULT_LANG]).short;
        // Mark the active item in the menu
        document.querySelectorAll('.lang-item').forEach(function (li) {
            li.classList.toggle('active', li.dataset.lang === state.lang);
        });
    }

    /** Bootstrap : load locales, build UI, apply initial language. */
    async function init() {
        buildSwitcher();
        await loadLocales();
        state.lang = detectInitialLang();
        applyTranslations();
    }

    // Run automatically once the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ─────────────────────────────────────────────────────────────────
    // Public API (window.TigerI18n)
    // ─────────────────────────────────────────────────────────────────

    global.TigerI18n = {
        t: t,
        setLang: setLang,
        applyTranslations: applyTranslations,
        loadLocales: loadLocales,
        getLang:    function () { return state.lang; },
        getLocales: function () { return Object.keys(LANGS); },
        getDict:    function (lang) { return state.i18n[lang || state.lang] || {}; }
    };

})(window);
