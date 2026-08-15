# e-Gurukulam for IAS — Development, Security & Deployment Mandates

## 1. Local Testing Mandate
- **Local Review First**: All code modifications and feature updates MUST be thoroughly tested and verified on the local development server (`http://localhost:3000/` or `http://localhost:5173/`) before committing or pushing.
- **Never Auto-Push**: `git push` is **strictly prohibited** unless the user provides an explicit command (e.g., *"Push to GitHub"*, *"Deploy this"*).

## 2. Production Security Hardening Standards
- **Security Headers**: Enforced via `vercel.json` (`CSP`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`).
- **Input Sanitization**: All user form submissions MUST be sanitized via `src/utils/sanitize.js` to strip HTML tags and script injection vectors.
- **Spam & Bot Protection**:
  * Honeypot fields (`hp_trap`) are embedded in all public form components.
  * 3-Second submission rate limiting and button disabling during requests.
- **Secret & Key Isolation**:
  * Zero Google Sheet IDs, service account keys, or admin PINs hardcoded in JS files.
  * Public web app API endpoints MUST consume `import.meta.env.VITE_*` environment variables.
  * `.env` files, certificates (`*.pem`, `*.key`), and zip archives are strictly excluded in `.gitignore`.

## 3. Build & Pre-Push Verification
- Before declaring a feature complete or pushing, execute `npm run build` (`npx vite build`) to confirm **0 build errors** and clean bundle chunking.
