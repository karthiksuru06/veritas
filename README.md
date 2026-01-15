<div align="center">

# 🛡️ VERITAS
### Verify what you share. Defend the truth.

[![Status](https://img.shields.io/badge/Status-Prototype-orange?style=for-the-badge&logo=git)]()
[![Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=react)]()
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)]()

<br />

**Veritas** is an AI-powered cognitive security tool designed to analyze credibility in the digital age.  
It combines **Google Cloud Vision** and **Natural Language Processing** to expose emotional manipulation, clickbait, and hidden bias.

[**Explore the Code**](#-tech-stack) · [**Report Bug**](issues) · [**Request Feature**](issues)

<br />

### 🚀 [**View Live Demo**](https://veritas-nine-rose.vercel.app/)

</div>

---

## 🚨 The Problem
In the modern information age, fake news travels **6x faster** than the truth. Bad actors exploit human psychology using:

*   🔥 **False Urgency:** *"Share this BEFORE it's deleted!"*
*   😡 **Emotional Spikes:** Triggering fear or rage to bypass critical thinking.
*   🖼️ **Image Fabrication:** Using text-heavy memes to evade traditional text filters.

## 💡 The Solution
Veritas acts as a **"Second Opinion"** engine.

1.  **Paste** a suspicious text or **Upload** a screenshot.
2.  **Analyze** using advanced NLP & OCR algorithms.
3.  **Understand** the risk with a simple **0-10 Trustworthiness Score**.

---

## ✨ Features

<table>
  <tr>
    <td align="center">🕵️‍♂️ <b>Multi-Modal Analysis</b></td>
    <td align="center">🧠 <b>Cognitive Security</b></td>
    <td align="center">⚡ <b>Instant Feedback</b></td>
  </tr>
  <tr>
    <td>Analyzes both <b>Raw Text</b> and <b>Images/Memes</b> (via OCR) to catch what others miss.</td>
    <td>Detects manipulative "Tricks" like <i>Urgency Phrases</i>, <i>ALL CAPS</i>, and <i>Sentiment Spikes</i>.</td>
    <td>Delivers a clear "Report Card" with a <b>Trustworthiness Score</b> and explanatory breakdown.</td>
  </tr>
</table>

---

## 🛠️ Tech Stack

This project uses a modern, robust architecture:

| Component | Technology | Role |
|:----------|:-----------|:-----|
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) | Dynamic, responsive user interface. |
| **Backend** | ![NodeJS](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) | REST API handling file analysis and logic. |
| **AI / ML** | ![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=flat&logo=google-cloud&logoColor=white) | **Vision API** (OCR) & **Natural Language API** (Sentiment). |
| **Storage** | ![Memory](https://img.shields.io/badge/In--Memory-FF6600?style=flat) | Transient data processing for user privacy. |

---

## 🚀 Getting Started

Follow these steps to get the system running locally.

### Prerequisites
*   Node.js & npm installed.
*   A valid `credentials.json` for Google Cloud in the `server/` directory.

### Installation

**1. Clone the repo**
```bash
git clone https://github.com/yourusername/veritas.git
```

**2. Start the Backend Server** (Port 5001)
```bash
cd server
npm install
npm start
```

**3. Start the Frontend Client** (Port 3000)
Open a new terminal window:
```bash
cd client
npm install
npm start
```

Your browser should open automatically to `http://localhost:3000`.

---

## 🔮 Roadmap

- [ ] 🐳 **Docker Support:** Containerize for easy deployment.
- [ ] 🧩 **Browser Extension:** Analyze text directly on Twitter/Facebook.
- [ ] 🔍 **Fact-Check API:** Cross-reference claims with reliable third-party sources.
- [ ] 💾 **History:** (Optional) Save past analyses to a local database.

---

<div align="center">

**Verified by Veritas**  
*Defending the digital commons, one byte at a time.*

</div>
