require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const { z } = require('zod');
const vision = require('@google-cloud/vision');
const language = require('@google-cloud/language');
const Tesseract = require('tesseract.js');
// Dynamic import for transformers might be needed in some envs, but require usually works for @xenova/node
// using standard require for simplicity, assuming compatible node version
const { pipeline } = require('@xenova/transformers');

const app = express();
const PORT = process.env.PORT || 5001;

// --- SECURITY CONTROLS ---

// 1. Hardening (Headers)
app.use(helmet());

// 2. Access Control (CORS)
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({
    origin: clientUrl,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// 3. DoS Protection (Rate Limiting)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// 4. Body Parsing
app.use(express.json({ limit: '10kb' }));

// 5. Secure File Uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed!'), false);
    }
});


// --- HYBRID AI ENGINE CONFIGURATION ---

// Google Cloud Clients
const keyConfig = process.env.GOOGLE_APPLICATION_CREDENTIALS ? {} : { keyFilename: 'credentials.json' };
const languageClient = new language.LanguageServiceClient(keyConfig);
const visionClient = new vision.ImageAnnotatorClient(keyConfig);

// Local Model Singleton
let sentimentPipeline = null;
const getLocalPipeline = async () => {
    if (!sentimentPipeline) {
        console.log('🔌 Initializing Local Neural Network (DistilBERT)...');
        sentimentPipeline = await pipeline('sentiment-analysis');
    }
    return sentimentPipeline;
};

// --- ABSTRACTION LAYERS (Circuit Breakers) ---

/**
 * Strategy: Try Google Cloud Vision -> Fallback to Tesseract.js
 */
const performOCR = async (fileBuffer) => {
    try {
        // Attempt Path 1: Google Cloud
        const [result] = await visionClient.textDetection(fileBuffer);
        const text = result.fullTextAnnotation ? result.fullTextAnnotation.text : null;
        if (!text) throw new Error('No text found by Google Vision');
        return { text, source: 'Cloud Vision API (v1)' };
    } catch (error) {
        console.warn('⚠️ Cloud Vision failed, switching to Local OCR (Tesseract)...');
        // Attempt Path 2: Tesseract.js
        const { data: { text } } = await Tesseract.recognize(fileBuffer, 'eng');
        return { text, source: 'Local Tesseract Engine' };
    }
};

/**
 * Strategy: Try Google Natural Language -> Fallback to Local DistilBERT
 * Returns normalized object: { score: number (-1 to 1), magnitude: number (0 to inf), source: string }
 */
const performSentimentAnalysis = async (text) => {
    try {
        // Attempt Path 1: Google Cloud
        const [result] = await languageClient.analyzeSentiment({ document: { content: text, type: 'PLAIN_TEXT' } });
        return {
            score: result.documentSentiment.score,
            magnitude: result.documentSentiment.magnitude,
            source: 'Cloud Natural Language API'
        };
    } catch (error) {
        console.warn('⚠️ Cloud NLP failed, switching to Local Neural Network (DistilBERT)...');

        // Attempt Path 2: Local Transformers
        const pipe = await getLocalPipeline();
        // DistilBERT usually returns [{ label: 'POSITIVE'|'NEGATIVE', score: 0.99 }]
        const [result] = await pipe(text);

        // Normalize Output to match Google's format
        // DistilBERT 'score' is confidence (0-1). We map label to neg/pos.
        let normalizedScore = 0;
        if (result.label === 'POSITIVE') normalizedScore = result.score;
        if (result.label === 'NEGATIVE') normalizedScore = -result.score;

        // Magnitude approximation: Confidence * 2 (Rough heuristic)
        const normalizedMagnitude = result.score * 2;

        return {
            score: normalizedScore,
            magnitude: normalizedMagnitude,
            source: `Local Neural Network (${result.label} ${(result.score * 100).toFixed(1)}%)`
        };
    }
};


// --- THE VERITAS ALGORITHM (Updated) ---

const analyzeMessage = async (text) => {
    let score = 10;
    const tricks = [];
    const lowerCaseText = text.toLowerCase();

    // 1. Pattern Matching
    const capsMatch = text.match(/\b[A-Z]{3,}\b/g);
    if (capsMatch && capsMatch.length > 2) {
        score -= 1.5;
        tricks.push('⚠️ **Excessive Capitalization:** Uses wildly capitalized words to grab attention.');
    }

    const urgencyPhrases = ['share immediately', 'forward this', 'delete soon', 'act now', 'urgent'];
    if (urgencyPhrases.some(phrase => lowerCaseText.includes(phrase))) {
        score -= 2.0;
        tricks.push('🚨 **False Urgency:** Demands immediate action to bypass critical thinking.');
    }

    // 2. Hybrid Sentiment Analysis
    let sentimentSource = 'Unknown';
    try {
        const sentiment = await performSentimentAnalysis(text);
        sentimentSource = sentiment.source;

        // Apply Logic
        if (sentiment.magnitude > 0.5) {
            const emotionalPenalty = Math.min(sentiment.magnitude * 0.5, 4.0);
            score -= emotionalPenalty;

            if (emotionalPenalty > 1) {
                tricks.push(`🧠 **High Emotional Charge:** Detected an emotional magnitude of ${sentiment.magnitude.toFixed(1)}. Neutral news is usually below 1.0.`);
            }
        }

        if (Math.abs(sentiment.score) > 0.8) {
            score -= 1.0;
            tricks.push(`⚖️ **Extreme Bias:** The language is heavily skewed (Score: ${sentiment.score.toFixed(2)}).`);
        }

    } catch (error) {
        console.error('Sentiment Analysis Failed completely:', error);
        tricks.push('⚠️ AI analysis skipped (All engines failed).');
    }

    // 3. Finalize
    score = Math.max(0, Math.min(10, score));
    score = Math.round(score * 10) / 10;

    // Add engine info to tricks for visibility
    tricks.push(`🔌 **Analysis Engine:** Executed via ${sentimentSource}`);

    return { score, tricks };
};

// Input Validation Schema
const analyzeSchema = z.object({
    message: z.string().min(1).max(5000)
});


// --- ROUTES ---

app.get('/', (req, res) => {
    res.send('🛡️ Veritas Hybrid Core is running.');
});

// Text Analysis
app.post('/api/analyze', async (req, res) => {
    const validation = analyzeSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: 'Invalid input', details: validation.error.errors });
    }
    try {
        const report = await analyzeMessage(validation.data.message);
        res.json(report);
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Image Analysis
app.post('/api/analyze-image', (req, res) => {
    const uploadSingle = upload.single('newsImage');
    uploadSingle(req, res, async (err) => {
        if (err) return res.status(400).json({ error: err.message });
        if (!req.file) return res.status(400).json({ error: 'Image file is required.' });

        try {
            // Use Circuit Breaker OCR
            const { text, source } = await performOCR(req.file.buffer);

            if (!text || text.trim().length === 0) {
                return res.status(400).json({ error: 'No text could be read from the image.' });
            }

            const report = await analyzeMessage(text);
            // Append OCR source info
            report.tricks.push(`👁️ **Vision Engine:** Extracted text via ${source}`);

            res.json(report);

        } catch (error) {
            console.error('Hybrid Vision Error:', error);
            res.status(500).json({ error: 'Failed to process image content.' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`🔒 Veritas Hybrid Server running on port ${PORT}`);
    console.log(`   Allowed Client: ${clientUrl}`);
});