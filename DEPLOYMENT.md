[Previous contents of DEPLOYMENT.md...]

## 4. Troubleshooting Steps
- **CORS Errors?** Update `CLIENT_URL` in Render to match your *exact* Vercel domain (no trailing lash).
- **Google API Errors?** Re-check your JSON key in the Render Environment Variable. It must be exact.
- **Client "Network Error"?** Ensure `REACT_APP_API_URL` uses `https` (not http) and points to the Render domain.

## 5. Phase 1 Checklist (Pre-Push)
- [x] Root `package.json` created.
- [ ] `env` variables moved to Render dashboard.
- [ ] `client/src/App.js` updated with conditional API URL logic.
