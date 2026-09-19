/**
 * Admin Authentication & Direct GitHub Sync Engine
 * Focus Site - Secured with Web Crypto API (AES-256-GCM + PBKDF2)
 */

(function () {
    const VAULT_STORAGE_KEY = 'focus_admin_vault_v1';
    const SESSION_KEY = 'focus_admin_session_unlocked';

    // In-memory decrypted credentials
    let activeConfig = null;

    // ============================================================
    // 1. Web Crypto Cryptographic Functions (AES-256-GCM + Fallback)
    // ============================================================
    const CryptoEngine = {
        hasSubtle() {
            return typeof window !== 'undefined' && 
                   Boolean(window.crypto) && 
                   Boolean(window.crypto.subtle);
        },

        async deriveKey(password, salt) {
            const enc = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                enc.encode(password),
                { name: 'PBKDF2' },
                false,
                ['deriveKey']
            );

            return crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );
        },

        fallbackEncrypt(plainText, password) {
            let res = '';
            for (let i = 0; i < plainText.length; i++) {
                const charCode = plainText.charCodeAt(i) ^ password.charCodeAt(i % password.length);
                res += String.fromCharCode(charCode);
            }
            return 'FB_' + btoa(unescape(encodeURIComponent(res)));
        },

        fallbackDecrypt(cipherText, password) {
            const raw = decodeURIComponent(escape(atob(cipherText.replace(/^FB_/, ''))));
            let res = '';
            for (let i = 0; i < raw.length; i++) {
                const charCode = raw.charCodeAt(i) ^ password.charCodeAt(i % password.length);
                res += String.fromCharCode(charCode);
            }
            return res;
        },

        async encrypt(plainText, password) {
            if (!this.hasSubtle()) {
                return this.fallbackEncrypt(plainText, password);
            }
            try {
                const enc = new TextEncoder();
                const salt = crypto.getRandomValues(new Uint8Array(16));
                const iv = crypto.getRandomValues(new Uint8Array(12));
                const key = await this.deriveKey(password, salt);

                const encrypted = await crypto.subtle.encrypt(
                    { name: 'AES-GCM', iv: iv },
                    key,
                    enc.encode(plainText)
                );

                const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
                combined.set(salt, 0);
                combined.set(iv, salt.length);
                combined.set(new Uint8Array(encrypted), salt.length + iv.length);

                let binary = '';
                for (let i = 0; i < combined.length; i++) {
                    binary += String.fromCharCode(combined[i]);
                }
                return 'AES_' + btoa(binary);
            } catch (err) {
                console.warn('SubtleCrypto encryption failed, using fallback:', err);
                return this.fallbackEncrypt(plainText, password);
            }
        },

        async decrypt(base64Data, password) {
            if (base64Data.startsWith('FB_')) {
                return this.fallbackDecrypt(base64Data, password);
            }
            const cleanData = base64Data.replace(/^AES_/, '');
            if (!this.hasSubtle()) {
                throw new Error('بيئة التصفح لا تدعم تشفير AES-GCM (يرجى استخدام HTTPS أو localhost).');
            }
            const binary = atob(cleanData);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            if (bytes.length < 28) throw new Error('البيانات المشفرة غير صالحة.');

            const salt = bytes.slice(0, 16);
            const iv = bytes.slice(16, 28);
            const ciphertext = bytes.slice(28);

            const key = await this.deriveKey(password, salt);
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                ciphertext
            );

            const dec = new TextDecoder();
            return dec.decode(decrypted);
        }
    };

    // Helper: Unicode-safe Base64 encoding/decoding for GitHub API
    function utf8ToBase64(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }

    function base64ToUtf8(base64) {
        return decodeURIComponent(escape(atob(base64.replace(/\s/g, ''))));
    }

    // ============================================================
    // 2. GitHub REST API Integration
    // ============================================================
    const GitHubAPI = {
        async getFile(path) {
            if (!activeConfig || !activeConfig.token) throw new Error('يرجى تسجيل الدخول أولاً');
            const cleanPath = path.replace(/^\//, '');
            const url = `https://api.github.com/repos/${activeConfig.repoOwner}/${activeConfig.repoName}/contents/${cleanPath}?ref=${activeConfig.branch || 'main'}&t=${Date.now()}`;

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${activeConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (res.status === 404) {
                return { sha: null, content: null, exists: false };
            }

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || `خطأ من GitHub (${res.status})`);
            }

            const data = await res.json();
            return {
                sha: data.sha,
                content: base64ToUtf8(data.content),
                exists: true
            };
        },

        async saveFile(path, content, commitMessage) {
            if (!activeConfig || !activeConfig.token) throw new Error('يرجى تسجيل الدخول أولاً');
            const cleanPath = path.replace(/^\//, '');
            const url = `https://api.github.com/repos/${activeConfig.repoOwner}/${activeConfig.repoName}/contents/${cleanPath}`;

            // 1. Get current SHA if exists
            const current = await this.getFile(cleanPath).catch(() => ({ sha: null }));

            const payload = {
                message: commitMessage || `Update ${cleanPath} via Focus Admin`,
                content: utf8ToBase64(content),
                branch: activeConfig.branch || 'main'
            };

            if (current && current.sha) {
                payload.sha = current.sha;
            }

            const res = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${activeConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || `فشل الحفظ على GitHub (${res.status})`);
            }

            return await res.json();
        }
    };

    // ============================================================
    // 3. Admin UI & Authentication Guard
    // ============================================================
    const AdminAuth = {
        init() {
            this.injectStyles();
            this.injectUI();
            this.checkAuthStatus();
        },

        isConfigured() {
            return Boolean(localStorage.getItem(VAULT_STORAGE_KEY));
        },

        getConfig() {
            return activeConfig;
        },

        injectStyles() {
            if (document.getElementById('admin-auth-styles')) return;
            const style = document.createElement('style');
            style.id = 'admin-auth-styles';
            style.textContent = `
                .auth-lockscreen {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.96);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    z-index: 999999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    direction: rtl;
                    font-family: 'IBM Plex Sans Arabic', sans-serif;
                    transition: opacity 0.25s ease;
                }
                .auth-box {
                    background: var(--card, #ffffff);
                    color: var(--text, #1f2937);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    max-width: 480px;
                    width: 100%;
                    padding: 36px 30px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    text-align: center;
                    animation: authFadeIn 0.3s ease;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                @keyframes authFadeIn {
                    from { opacity: 0; transform: scale(0.96); }
                    to { opacity: 1; transform: scale(1); }
                }
                .auth-icon-badge {
                    width: 64px;
                    height: 64px;
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    color: white;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    margin: 0 auto 20px;
                    box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
                }
                .auth-title {
                    font-size: 1.4rem;
                    font-weight: 700;
                    margin-bottom: 8px;
                }
                .auth-subtitle {
                    font-size: 0.9rem;
                    color: #64748b;
                    margin-bottom: 24px;
                    line-height: 1.6;
                }
                .auth-input-group {
                    margin-bottom: 16px;
                    text-align: right;
                }
                .auth-input-group label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-bottom: 6px;
                }
                .auth-input {
                    width: 100%;
                    padding: 12px 14px;
                    border: 1.5px solid var(--border, #d1d5db);
                    border-radius: 10px;
                    font-family: inherit;
                    font-size: 0.95rem;
                    background: var(--input-bg, #ffffff);
                    color: var(--text, #1f2937);
                    transition: border-color 0.2s, box-shadow 0.2s;
                    box-sizing: border-box;
                }
                .auth-input:focus {
                    outline: none;
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
                }
                .auth-btn-submit {
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: 0.2s;
                    margin-top: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-family: inherit;
                }
                .auth-btn-submit:hover {
                    opacity: 0.95;
                    transform: translateY(-1px);
                }
                .auth-error-msg {
                    color: #ef4444;
                    font-size: 0.88rem;
                    margin-top: 12px;
                    display: none;
                    background: rgba(239, 68, 68, 0.12);
                    padding: 10px 14px;
                    border-radius: 8px;
                    font-weight: 600;
                    border: 1px solid rgba(239, 68, 68, 0.25);
                    line-height: 1.5;
                }
                .auth-help-text {
                    font-size: 0.8rem;
                    color: #94a3b8;
                    margin-top: 14px;
                    line-height: 1.5;
                }
                .auth-help-text a {
                    color: #3b82f6;
                    text-decoration: underline;
                }
                /* Cloud Sync Status Bar & Action Button */
                .cloud-sync-bar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-right: auto;
                    flex-wrap: wrap;
                }
                .btn-cloud-sync {
                    background: linear-gradient(135deg, #059669, #10b981) !important;
                    color: white !important;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 18px;
                    border-radius: 8px;
                    border: none;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
                    transition: all 0.2s;
                    font-family: inherit;
                }
                .btn-cloud-sync:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
                }
                .btn-cloud-sync:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .btn-admin-logout, .btn-admin-config {
                    background: transparent;
                    border: 1px solid var(--border, #d1d5db);
                    color: var(--text, #1f2937);
                    padding: 8px 14px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    transition: 0.2s;
                    font-family: inherit;
                }
                .btn-admin-logout:hover {
                    background: rgba(239, 68, 68, 0.1);
                    border-color: #ef4444;
                    color: #ef4444;
                }
                .btn-admin-config:hover {
                    border-color: var(--primary, #2563eb);
                    color: var(--primary, #2563eb);
                }
                /* Notification Toast */
                .auth-toast {
                    position: fixed;
                    bottom: 24px;
                    left: 24px;
                    background: #1e293b;
                    color: white;
                    padding: 14px 22px;
                    border-radius: 12px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    z-index: 1000000;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    animation: toastUp 0.3s ease;
                    direction: rtl;
                    font-family: 'IBM Plex Sans Arabic', sans-serif;
                }
                @keyframes toastUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .auth-spinner {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: authSpin 0.7s linear infinite;
                    display: inline-block;
                }
                @keyframes authSpin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        },

        injectUI() {
            if (document.getElementById('auth-lockscreen')) return;

            const lockscreen = document.createElement('div');
            lockscreen.id = 'auth-lockscreen';
            lockscreen.className = 'auth-lockscreen';
            lockscreen.style.display = 'none';

            lockscreen.innerHTML = `
                <div class="auth-box">
                    <div class="auth-icon-badge" id="auth-box-icon">🔒</div>
                    <h2 class="auth-title" id="auth-box-title">لوحة تحكم المتجر</h2>
                    <p class="auth-subtitle" id="auth-box-desc">أدخل كلمة المرور لفك التشفير والوصول للوحة التحكم.</p>

                    <!-- Login Form (When already configured) -->
                    <form id="auth-login-form" style="display:none;">
                        <div class="auth-input-group">
                            <label for="auth-password">كلمة مرور المشرف (Admin Password)</label>
                            <input type="password" id="auth-password" class="auth-input" placeholder="••••••••" autocomplete="current-password" required>
                        </div>
                        <div class="auth-error-msg" id="auth-login-error">كلمة المرور غير صحيحة أو فشل فك التشفير.</div>
                        <button type="submit" id="auth-login-btn" class="auth-btn-submit">
                            <span>فتح لوحة التحكم</span>
                        </button>
                        <div style="margin-top:16px;">
                            <button type="button" id="auth-reset-btn" style="background:none;border:none;color:#94a3b8;font-size:0.8rem;cursor:pointer;text-decoration:underline;">إعادة ضبط إعدادات الربط بـ GitHub</button>
                        </div>
                    </form>

                    <!-- Initial Setup Form (First time or reset) -->
                    <form id="auth-setup-form" style="display:none;">
                        <div class="auth-input-group">
                            <label for="auth-repo-owner">اسم المستخدم في GitHub (Username / Owner)</label>
                            <input type="text" id="auth-repo-owner" class="auth-input" placeholder="مثال: your-username" required>
                        </div>
                        <div class="auth-input-group">
                            <label for="auth-repo-name">اسم المستودع (Repository Name)</label>
                            <input type="text" id="auth-repo-name" class="auth-input" placeholder="مثال: focus-site" required>
                        </div>
                        <div class="auth-input-group">
                            <label for="auth-repo-branch">الفرع (Branch)</label>
                            <input type="text" id="auth-repo-branch" class="auth-input" value="main" required>
                        </div>
                        <div class="auth-input-group">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                <label for="auth-github-token" style="margin-bottom:0;">رمز وصول GitHub (Personal Access Token - PAT)</label>
                                <button type="button" id="auth-token-guide-btn" style="background:none; border:none; color:#3b82f6; font-size:0.75rem; cursor:pointer; text-decoration:underline; font-family:inherit;">💡 كيف أستخرج هذا الرمز؟</button>
                            </div>
                            <input type="password" id="auth-github-token" class="auth-input" placeholder="ghp_xxxxxxxxxxxx أو github_pat_xxxx" required>
                            <small style="color:#64748b;font-size:0.75rem;display:block;margin-top:4px;">يتطلب صلاحية Contents: Read & Write فقط على مستودع الموقع.</small>
                        </div>
                        <div class="auth-input-group">
                            <label for="auth-new-password">أنشئ كلمة مرور قوية لحماية اللوحة (Master Password)</label>
                            <input type="password" id="auth-new-password" class="auth-input" placeholder="كلمة مرور سرية خاصة بك" required minlength="4">
                        </div>
                        <div class="auth-error-msg" id="auth-setup-error"></div>
                        <button type="submit" id="auth-setup-btn" class="auth-btn-submit">
                            <span>حفظ وتشفير الإعدادات بنجاح 🔒</span>
                        </button>
                        <p class="auth-help-text">
                            يتم تشفير هذا الرمز محلياً في متصفحك بتقنية <strong>AES-256-GCM</strong> المشفرة بكلمة مرورك، ولن يتم إرساله لأي جهة سوى خوادم GitHub الرسمية مباشرة عند النشر.
                        </p>
                    </form>
                </div>
            `;
            document.body.appendChild(lockscreen);

            // Bind Form Events cleanly
            const loginForm = document.getElementById('auth-login-form');
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
                return false;
            });

            const setupForm = document.getElementById('auth-setup-form');
            setupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSetup();
                return false;
            });

            document.getElementById('auth-token-guide-btn').onclick = () => this.openTokenGuideModal();
            document.getElementById('auth-reset-btn').onclick = () => {
                if (confirm('هل تريد إعادة ضبط إعدادات الربط بـ GitHub وكلمة المرور؟')) {
                    localStorage.removeItem(VAULT_STORAGE_KEY);
                    sessionStorage.removeItem(SESSION_KEY);
                    activeConfig = null;
                    this.checkAuthStatus();
                }
            };
        },

        openTokenGuideModal() {
            let guide = document.getElementById('auth-token-guide-modal');
            if (!guide) {
                guide = document.createElement('div');
                guide.id = 'auth-token-guide-modal';
                guide.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(6px);z-index:1000002;display:flex;align-items:center;justify-content:center;padding:20px;direction:rtl;font-family:"IBM Plex Sans Arabic",sans-serif;';
                guide.innerHTML = `
                    <div style="background:var(--card,#fff);color:var(--text,#1f2937);border-radius:18px;max-width:540px;width:100%;padding:28px;box-shadow:0 25px 50px rgba(0,0,0,0.5);text-align:right;border:1px solid var(--border,#ddd);max-height:90vh;overflow-y:auto;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                            <h3 style="margin:0;font-size:1.25rem;">🔑 خطوات استخراج رمز GitHub Token (PAT)</h3>
                            <button type="button" id="auth-close-guide" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text,#1f2937);">&times;</button>
                        </div>
                        <p style="font-size:0.9rem;color:#64748b;line-height:1.6;margin-bottom:16px;">
                            يتيح هذا الرمز للوحة التحكم تحديث ملفات المنتجات والمقالات على مستودعك تلقائياً دون الحاجة لرفعها يدوياً.
                        </p>
                        <ol style="padding-right:20px;font-size:0.9rem;line-height:1.8;margin-bottom:20px;">
                            <li>افتح صفحة الرموز مباشرة على GitHub: <br><a href="https://github.com/settings/tokens?type=beta" target="_blank" style="color:#2563eb;font-weight:bold;text-decoration:underline;">فتح إعدادات الرموز (GitHub Fine-grained Tokens)</a></li>
                            <li>اضغط على زر <strong>Generate new token</strong>.</li>
                            <li>اكتب اسماً للرمز في خانة <strong>Token name</strong> (مثال: Focus Site Admin).</li>
                            <li>في قسم <strong>Repository access</strong>: اختر <strong>Only select repositories</strong> وحدد مستودع متجرك.</li>
                            <li>في قسم <strong>Permissions</strong> > <strong>Repository permissions</strong>: ابحث عن <strong>Contents</strong> واختر <strong>Access: Read and write</strong>.</li>
                            <li>انزل لأسفل الصفحة واضغط <strong>Generate token</strong>.</li>
                            <li>انسخ الرمز فوراً (يبدأ بـ <code>github_pat_...</code> أو <code>ghp_...</code>) والصقه في خانة الرمز هنا.</li>
                        </ol>
                        <button type="button" id="auth-got-it-btn" style="width:100%;padding:12px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-weight:bold;cursor:pointer;font-family:inherit;">فهمت، العودة للإعدادات</button>
                    </div>
                `;
                document.body.appendChild(guide);
                document.getElementById('auth-close-guide').onclick = () => guide.style.display = 'none';
                document.getElementById('auth-got-it-btn').onclick = () => guide.style.display = 'none';
                guide.onclick = (e) => { if (e.target === guide) guide.style.display = 'none'; };
            }
            guide.style.display = 'flex';
        },

        checkAuthStatus() {
            const lockscreen = document.getElementById('auth-lockscreen');
            const loginForm = document.getElementById('auth-login-form');
            const setupForm = document.getElementById('auth-setup-form');
            const boxTitle = document.getElementById('auth-box-title');
            const boxDesc = document.getElementById('auth-box-desc');

            // Check if already unlocked in this tab session
            const sessionUnlocked = sessionStorage.getItem(SESSION_KEY);
            if (sessionUnlocked && this.isConfigured()) {
                try {
                    const parsed = JSON.parse(sessionUnlocked);
                    activeConfig = parsed;
                    if (lockscreen) lockscreen.style.display = 'none';
                    this.attachHeaderControls();
                    return;
                } catch (e) {
                    sessionStorage.removeItem(SESSION_KEY);
                }
            }

            // Needs Unlock / Configuration
            if (lockscreen) lockscreen.style.display = 'flex';

            if (this.isConfigured()) {
                // Show Login Form
                loginForm.style.display = 'block';
                setupForm.style.display = 'none';
                boxTitle.textContent = 'لوحة تحكم المتجر (محمية)';
                boxDesc.textContent = 'أدخل كلمة مرور المشرف لفك التشفير وإدارة المنتجات والمقالات.';
                setTimeout(() => {
                    const pwd = document.getElementById('auth-password');
                    if (pwd) pwd.focus();
                }, 100);
            } else {
                // Show Initial Setup Form
                loginForm.style.display = 'none';
                setupForm.style.display = 'block';
                boxTitle.textContent = 'تهيئة لوحة التحكم والربط المباشر بـ GitHub';
                boxDesc.textContent = 'قم بإعداد الربط السحابي لمرة واحدة لتتمكن من التعديل مباشرة دون رفع ملفات يدوياً.';
                setTimeout(() => {
                    const ownerInput = document.getElementById('auth-repo-owner');
                    if (ownerInput) ownerInput.focus();
                }, 100);
            }
        },

        async handleLogin() {
            const pwdInput = document.getElementById('auth-password');
            const errDiv = document.getElementById('auth-login-error');
            const btn = document.getElementById('auth-login-btn');
            const password = pwdInput.value;

            if (!password) return;

            errDiv.style.display = 'none';
            btn.disabled = true;
            btn.innerHTML = '<span class="auth-spinner"></span> جاري التحقق وفك التشفير...';

            try {
                const vaultData = localStorage.getItem(VAULT_STORAGE_KEY);
                if (!vaultData) throw new Error('لا توجد إعدادات محفوظة.');

                const decryptedText = await CryptoEngine.decrypt(vaultData, password);
                const config = JSON.parse(decryptedText);

                activeConfig = config;
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(config));

                const lockscreen = document.getElementById('auth-lockscreen');
                if (lockscreen) {
                    lockscreen.style.opacity = '0';
                    setTimeout(() => {
                        lockscreen.style.display = 'none';
                        lockscreen.style.opacity = '1';
                    }, 250);
                }

                this.attachHeaderControls();
                this.showToast('تم تسجيل الدخول وفك التشفير بنجاح 🔓');
            } catch (e) {
                console.error('Login error:', e);
                errDiv.textContent = 'كلمة المرور غير صحيحة، تعذر فك تشفير البيانات.';
                errDiv.style.display = 'block';
                pwdInput.value = '';
                pwdInput.focus();
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<span>فتح لوحة التحكم</span>';
            }
        },

        async handleSetup() {
            let owner = document.getElementById('auth-repo-owner').value.trim();
            let repo = document.getElementById('auth-repo-name').value.trim();
            let branch = document.getElementById('auth-repo-branch').value.trim() || 'main';
            let token = document.getElementById('auth-github-token').value.trim();
            let password = document.getElementById('auth-new-password').value;
            const errDiv = document.getElementById('auth-setup-error');
            const btn = document.getElementById('auth-setup-btn');

            // Smart Sanitization: If user pasted full GitHub URL in owner or repo
            if (owner.includes('github.com/')) {
                const parts = owner.replace(/^https?:\/\/github\.com\//, '').split('/');
                owner = parts[0] || '';
                if (parts[1] && !repo) repo = parts[1].replace(/\.git$/, '');
            }
            if (repo.includes('github.com/')) {
                const parts = repo.replace(/^https?:\/\/github\.com\//, '').split('/');
                if (!owner && parts[0]) owner = parts[0];
                repo = parts[1] || parts[0] || '';
            }
            if (repo.includes('/')) {
                const parts = repo.split('/');
                if (!owner) owner = parts[0];
                repo = parts[1];
            }
            repo = repo.replace(/\.git$/, '').trim();
            owner = owner.trim();

            if (!owner || !repo || !token || !password) {
                errDiv.textContent = 'يرجى ملء جميع الحقول المطلوبة.';
                errDiv.style.display = 'block';
                return;
            }

            if (password.length < 4) {
                errDiv.textContent = 'كلمة المرور يجب أن لا تقل عن 4 خانات.';
                errDiv.style.display = 'block';
                return;
            }

            errDiv.style.display = 'none';
            btn.disabled = true;
            btn.innerHTML = '<span class="auth-spinner"></span> جاري التشفير والتحقق من الاتصال...';

            try {
                // Test connection with timeout
                let allowSave = true;
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 4000);

                    const testRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
                        signal: controller.signal,
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    });
                    clearTimeout(timeoutId);

                    if (!testRes.ok) {
                        if (testRes.status === 401) {
                            throw new Error('رمز وصول GitHub (PAT) غير صالح أو منتهي الصلاحية.');
                        } else if (testRes.status === 404) {
                            const proceed = confirm(`تنبيه: لم يتم العثور على المستودع (${owner}/${repo}) عبر GitHub API.\nقد يكون المستودع خاصاً أو يحتاج لصلاحية، أو أن الاسم به خطأ مطبعي.\n\nهل تريد حفظ الإعدادات على أي حال ومتابعة الدخول؟`);
                            if (!proceed) allowSave = false;
                        } else {
                            const proceed = confirm(`تنبيه من GitHub (${testRes.status}). هل تريد المتابعة والحفظ على أي حال؟`);
                            if (!proceed) allowSave = false;
                        }
                    }
                } catch (netErr) {
                    if (netErr.message && netErr.message.includes('رمز وصول')) {
                        throw netErr;
                    }
                    console.warn('GitHub validation warning:', netErr);
                    // Network issue, ad blocker, or timeout: allow proceeding
                    const proceed = confirm(`تعذر فحص المستودع عبر الإنترنت (${netErr.message || 'خطأ في الاتصال'}).\nهل ترغب في حفظ الإعدادات وتجاوز الفحص الآن؟`);
                    if (!proceed) allowSave = false;
                }

                if (!allowSave) {
                    btn.disabled = false;
                    btn.innerHTML = '<span>حفظ وتشفير الإعدادات بنجاح 🔒</span>';
                    return;
                }

                const config = { repoOwner: owner, repoName: repo, branch: branch, token: token };
                const encrypted = await CryptoEngine.encrypt(JSON.stringify(config), password);

                localStorage.setItem(VAULT_STORAGE_KEY, encrypted);
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(config));
                activeConfig = config;

                // Close lockscreen smoothly
                const lockscreen = document.getElementById('auth-lockscreen');
                if (lockscreen) {
                    lockscreen.style.opacity = '0';
                    setTimeout(() => {
                        lockscreen.style.display = 'none';
                        lockscreen.style.opacity = '1';
                    }, 250);
                }

                this.attachHeaderControls();
                this.showToast('🎉 تم حفظ وتشفير الإعدادات وفتح لوحة التحكم بنجاح!');
            } catch (e) {
                console.error('Setup error:', e);
                errDiv.textContent = e.message || 'حدث خطأ أثناء الحفظ والتشفير.';
                errDiv.style.display = 'block';
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<span>حفظ وتشفير الإعدادات بنجاح 🔒</span>';
            }
        },

        logout() {
            sessionStorage.removeItem(SESSION_KEY);
            activeConfig = null;
            this.checkAuthStatus();
        },

        showToast(msg, duration = 3500) {
            const existing = document.querySelector('.auth-toast');
            if (existing) existing.remove();

            const toast = document.createElement('div');
            toast.className = 'auth-toast';
            toast.innerHTML = `<span>${msg}</span>`;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.4s ease';
                setTimeout(() => toast.remove(), 400);
            }, duration);
        },

        attachHeaderControls() {
            const header = document.querySelector('header');
            if (!header || document.getElementById('cloud-sync-controls')) return;

            const controls = document.createElement('div');
            controls.id = 'cloud-sync-controls';
            controls.className = 'cloud-sync-bar';

            const isBlogPage = window.location.pathname.includes('blog');
            const syncBtnLabel = isBlogPage ? '🚀 نشر المقالات إلى الموقع (GitHub)' : '🚀 نشر المنتجات إلى الموقع (GitHub)';

            controls.innerHTML = `
                <button type="button" id="btn-cloud-sync" class="btn-cloud-sync" title="حفظ التغييرات مباشرة إلى GitHub Pages">
                    <span>${syncBtnLabel}</span>
                </button>
                <button type="button" id="btn-pull-latest" class="btn-admin-config" title="سحب أحدث البيانات المخزنة على GitHub">
                    🔄 جلب من GitHub
                </button>
                <button type="button" id="btn-admin-lock" class="btn-admin-logout" title="قفل لوحة التحكم">
                    🔒 قفل اللوحة
                </button>
            `;

            header.appendChild(controls);

            // Bind Lock
            document.getElementById('btn-admin-lock').onclick = () => this.logout();

            // Bind Cloud Sync
            const syncBtn = document.getElementById('btn-cloud-sync');
            syncBtn.onclick = () => {
                if (typeof window.triggerCloudSync === 'function') {
                    window.triggerCloudSync();
                } else {
                    alert('لم يتم تعريف دالة النشر في هذه الصفحة.');
                }
            };

            // Bind Pull
            const pullBtn = document.getElementById('btn-pull-latest');
            pullBtn.onclick = () => {
                if (typeof window.triggerCloudPull === 'function') {
                    window.triggerCloudPull();
                } else {
                    alert('لم يتم تعريف دالة الجلب في هذه الصفحة.');
                }
            };
        }
    };

    // Global Export
    window.AdminAuth = AdminAuth;
    window.GitHubAPI = GitHubAPI;

    // Auto-init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AdminAuth.init());
    } else {
        AdminAuth.init();
    }
})();
