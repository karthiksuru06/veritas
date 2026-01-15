# Security Audit & Strategic Roadmap: Project Veritas

**Date:** January 15, 2026
**Auditor:** Karthik
**Target System:** Veritas (React Client / Node.js Express Server)
**Classification:** INTERNAL USE ONLY

---

## 1. Executive Summary

As requested, I have performed a high-level architectural and security audit of the **Veritas** application. While the core functionality (veracity analysis using Google Cloud AI) is sound, the current implementation is effectively a "Proof of Concept" (PoC). It currently lacks the necessary security controls, infrastructure robustness, and operational safeguards required for a production or public-facing deployment.

**Assessment Grade: D**
*The application functions, but critical security vulnerabilities exist that would lead to immediate compromise or data leakage if deployed today.*

---

## 2. Vulnerability Assessment (The "Audit")

This section details specific findings categorized by severity.

### 🚨 Critical Severity (Immediate Action Required)

**1. Secret Key Exposure (Credential Management)**
- **Observation:** The `credentials.json` file (Google Cloud Service Account Key) resides in the `server/` directory.
- **Risk:** There is **NO** `.gitignore` file in the server directory, and the root `.gitignore` is empty. If this project is pushed to GitHub/GitLab, your GCP keys will be scraped by bots within seconds, leading to account compromise and potentially massive cloud bills.
- **Remediation:** Immediately add `credentials.json` to `.gitignore`. Move secrets to Environment Variables (`.env`).

**2. Missing Denial-of-Service (DoS) Protections**
- **Observation:** The application uses `multer.memoryStorage()`.
- **Risk:** An attacker can upload a massive file (e.g., 5GB image). Since `memoryStorage` stores the file in RAM, the Node.js process will run out of memory and crash instantly.
- **Remediation:** Stream files directly to cloud storage or use disk storage with strict file size limits (e.g., 5MB cap).

### 🟠 High Severity

**3. Unrestricted Cross-Origin Resource Sharing (CORS)**
- **Observation:** `app.use(cors())` is used without arguments.
- **Risk:** This allows *any* website to make requests to your API. Malicious sites could interact with your backend on behalf of a user.
- **Remediation:** Restrict CORS to specific trusted domains (e.g., `http://localhost:3000` for dev, your production domain for prod).

**4. Lack of Rate Limiting**
- **Observation:** No rate limiter middleware is present.
- **Risk:** An attacker can script a loop to hit your `/api/analyze` endpoint 10,000 times a second. This will not only crash your server but will also drain your Google Cloud API quota/budget instantly.
- **Remediation:** Implement `express-rate-limit` to cap requests (e.g., 100 requests per 15 mins per IP).

### 🟡 Medium Severity

**5. Lack of Input Validation**
- **Observation:** Relying on basic checks like `if (!message)`.
- **Risk:** "Garbage in, Garbage out." Malicious payloads or unexpected data types could cause unhandled exceptions.
- **Remediation:** Use a validation library like `Zod` or `Joi` to strictly define expected schemas for incoming JSON and file data.

**6. Hardcoded Configuration**
- **Observation:** Port `5001` and file paths are hardcoded.
- **Risk:** Makes deployment in containerized environments (Docker/K8s) difficult and inflexible.
- **Remediation:** Use `process.env.PORT` and centralized config files.

---

## 3. Strategic Roadmap (The "To-Do" List)

This roadmap transforms the project from a prototype into a secure, enterprise-grade application.

### Phase 1: Hardening (Day 0-2)
*Goal: Stop the bleeding. Secure the code for safe version control.*

1.  **Git Hygiene:** Create robust `.gitignore` files for root and server. **(PRIORITY #1)**
2.  **Secret Management:** Install `dotenv`. Move hardcoded keys and credentials references to environment variables.
3.  **Basic Protection:**
    - Install `helmet` (sets secure HTTP headers).
    - Configure `cors` to allow only `localhost:3000`.
    - Add `express-rate-limit`.
4.  **Crash Prevention:** Add a `limit: '5mb'` to the Multer configuration.

### Phase 2: Professionalization (Day 3-7)
*Goal: Improve maintainability and developer experience.*

1.  **Architecture Refactor:** Separate `server.js` into:
    - `routes/`: API endpoint definitions.
    - `controllers/`: Logic for handling requests.
    - `services/`: Logic for talking to Google Cloud.
2.  **Input Validation:** Integrate `Joi` or `Zod` middleware to genericize request validation.
3.  **Logging:** Replace `console.log` with a structured logger like `winston` or `pino`. This is vital for debugging in production without leaking sensitive info.

### Phase 3: Production Readiness (Week 2)
*Goal: Prepare for deployment.*

1.  **Dockerization:** Create `Dockerfile` for client and server. Create `docker-compose.yml` for local orchestration.
2.  **CI/CD:** Set up a GitHub Action to lint code and auto-check for vulnerability.
3.  **Frontend Polish:** Ensure accessible UI (A11y) and handle API loading/error states gracefully (already partially done).

---

## 4. Auditor's Note
*Sir/Madam, the most pressing issue is the lack of a `.gitignore` regarding your credentials. I strongly advise we fix that immediately before any further development or git commits occur.*
