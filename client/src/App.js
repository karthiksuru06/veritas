import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Upload, AlertTriangle, CheckCircle, Search, Server, Image as ImageIcon, Scan, X, Activity, Zap } from 'lucide-react';

// CHANGE THIS to your Render URL after deployment!
// For logic: we check environment variable, fallback to localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/analyze';
const API_IMAGE_URL = process.env.REACT_APP_API_IMAGE_URL || 'http://localhost:5001/api/analyze-image';

// --- COMPONENTS ---

const Header = () => (
    <header className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-900/30 rounded-lg border border-cyan-500/30">
                <Shield className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
                <h1 className="text-2xl font-bold tracking-wider text-slate-100">
                    VERITAS <span className="text-cyan-400 text-sm align-top">PRO</span>
                </h1>
                <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">Cognitive Security System</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono text-emerald-500">SYSTEM ONLINE</span>
        </div>
    </header>
);

const TrustScoreGuage = ({ score }) => {
    const getColor = (s) => {
        if (s >= 8) return 'text-emerald-400';
        if (s >= 5) return 'text-amber-400';
        return 'text-red-500';
    };

    const getLabel = (s) => {
        if (s >= 8) return 'TRUSTED';
        if (s >= 5) return 'CAUTION';
        return 'SUSPICIOUS';
    };

    return (
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
            {/* Outer Ring */}
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="96" cy="96" r="88"
                    stroke="currentColor" strokeWidth="8"
                    fill="transparent"
                    className="text-slate-800"
                />
                <motion.circle
                    initial={{ strokeDasharray: "553", strokeDashoffset: "553" }}
                    animate={{ strokeDashoffset: 553 - (553 * score) / 10 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    cx="96" cy="96" r="88"
                    stroke="currentColor" strokeWidth="8"
                    fill="transparent"
                    strokeLinecap="round"
                    className={getColor(score)}
                    style={{ strokeDasharray: "553" }}
                />
            </svg>
            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    className={`text-6xl font-black ${getColor(score)}`}
                >
                    {score}
                </motion.span>
                <span className={`text-sm font-bold tracking-widest mt-2 ${getColor(score)}`}>
                    {getLabel(score)}
                </span>
            </div>
        </div>
    );
};

const TricksList = ({ tricks }) => (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Analysis Logs
        </h3>
        {tricks.length > 0 ? (
            <ul className="space-y-3">
                {tricks.map((trick, i) => (
                    <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700 hover:border-red-500/30 transition-colors"
                    >
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        {/* Render simple markdown bolding if present */}
                        <span className="text-slate-300 text-sm leading-relaxed">{trick.replace(/\*\*/g, '')}</span>
                    </motion.li>
                ))}
            </ul>
        ) : (
            <div className="text-center py-8 text-slate-500 flex flex-col items-center gap-3">
                <CheckCircle className="w-12 h-12 text-emerald-500/20" />
                <p>No manipulative patterns detected.</p>
            </div>
        )}
    </div>
);

export default function VeritasApp() {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSlowServerWarning, setShowSlowServerWarning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // The "Resume Hack": Cold Start Detection
    useEffect(() => {
        let timer;
        if (loading) {
            timer = setTimeout(() => setShowSlowServerWarning(true), 3000); // Show after 3s
        } else {
            setShowSlowServerWarning(false);
        }
        return () => clearTimeout(timer);
    }, [loading]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setText(''); // Clear text if file is chosen
        setError(null);
    };

    const clearAll = () => {
        setText('');
        setFile(null);
        setResult(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleAnalyze = async () => {
        if (!text && !file) {
            setError("Input required: Please paste text or upload an image.");
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);

        // Artificial Minimum Delay for "Scanning" effect (UX efficiency)
        const minDelay = new Promise(resolve => setTimeout(resolve, 2000));

        try {
            let response;
            if (file) {
                const formData = new FormData();
                formData.append('newsImage', file);
                const [res] = await Promise.all([
                    axios.post(API_IMAGE_URL, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
                    minDelay
                ]);
                response = res;
            } else {
                const [res] = await Promise.all([
                    axios.post(API_URL, { message: text }),
                    minDelay
                ]);
                response = res;
            }

            setResult(response.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Connection failed. Is the server online?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-cyan-500/30">

            <Header />

            <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 flex flex-col justify-center min-h-[80vh]">

                {/* SERVER WAKE-UP WARNING (The Resume Hack) */}
                <AnimatePresence>
                    {showSlowServerWarning && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-0 bg-yellow-900/30 border border-yellow-700/50 text-yellow-200 px-4 py-3 rounded-lg text-sm flex items-center gap-3 w-full shadow-lg backdrop-blur-sm justify-center"
                        >
                            <Server className="w-5 h-5 shrink-0 animate-pulse" />
                            <div>
                                <strong>Server Waking Up:</strong> Warning: Free tier detected. Initial analysis may pause for ~60s.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* INPUT SECTION */}
                <section className="relative group">

                    {/* Scanning Laser Effect Overlay */}
                    <AnimatePresence>
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-20 pointer-events-none rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(34,211,238,0.2)]"
                            >
                                <div className="absolute inset-0 bg-cyan-900/10 backdrop-blur-[2px]"></div>
                                <motion.div
                                    className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee]"
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                                />
                                <div className="absolute top-4 right-4 font-mono text-cyan-400 text-xs animate-pulse">
                                    SCANNING TARGET...
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>


                    {/* Main Input Card */}
                    <div className={`bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-1 shadow-2xl transition-all duration-500 ${loading ? 'scale-[0.99] opacity-80 blur-[1px]' : 'hover:border-slate-600'}`}>
                        <div className="bg-slate-900/80 rounded-xl p-6 md:p-8 space-y-6">

                            {/* Text Input */}
                            <div className="relative">
                                <textarea
                                    className="w-full min-h-[160px] bg-slate-950/50 text-slate-300 p-4 rounded-xl border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-y placeholder:text-slate-600 focus:outline-none disabled:opacity-50"
                                    placeholder="Paste suspicious article text, tweet, or message here..."
                                    value={text}
                                    onChange={(e) => { setText(e.target.value); setFile(null); }}
                                    disabled={loading || !!file}
                                />
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4">
                                <div className="h-px bg-slate-800 flex-1"></div>
                                <span className="text-slate-500 text-xs font-mono uppercase">OR UPLOAD EVIDENCE</span>
                                <div className="h-px bg-slate-800 flex-1"></div>
                            </div>

                            {/* File Input Zone */}
                            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all mb-6 relative
                  ${file ? 'border-cyan-500/50 bg-cyan-900/10' : 'border-slate-700 hover:bg-slate-800/50 hover:border-slate-500'}
                  ${text ? 'opacity-50 pointer-events-none' : ''}
              `}>
                                <div className="flex flex-col items-center justify-center z-10">
                                    {file ? (
                                        <>
                                            <div className="flex items-center gap-2 text-cyan-400 mb-2">
                                                <CheckCircle className="w-5 h-5" />
                                                <span className="font-medium text-sm">{file.name}</span>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); clearAll(); }}
                                                className="text-xs text-red-400 hover:text-red-300 hover:underline"
                                            >
                                                Remove Image
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="p-3 bg-slate-800 rounded-full mb-2">
                                                <Upload className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <span className="text-slate-400 text-sm font-medium">Upload Screenshot</span>
                                            <span className="text-slate-600 text-xs mt-1">JPG, PNG, WEBP</span>
                                        </>
                                    )}
                                </div>
                                {file && <img src={URL.createObjectURL(file)} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-20 rounded-lg pointer-events-none" />}
                                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={loading} />
                            </label>

                            {/* Analyze Button */}
                            <button
                                onClick={handleAnalyze}
                                disabled={loading || (!text && !file)}
                                className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-3
                  ${loading ? 'bg-slate-800 cursor-not-allowed text-slate-500' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/20 active:scale-[0.98]'}`}
                            >
                                {loading ? (
                                    <>
                                        <Zap className="w-5 h-5 animate-pulse" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Scan className="w-5 h-5" />
                                        RUN VERIFICATION
                                    </>
                                )}
                            </button>

                            {error && (
                                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-200 animate-in fade-in slide-in-from-top-1">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* RESULTS DASHBOARD */}
                <AnimatePresence>
                    {result && !loading && (
                        <motion.section
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 100 }}
                            className="grid md:grid-cols-2 gap-6"
                        >
                            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center justify-center">
                                <h2 className="text-slate-400 font-mono uppercase tracking-widest text-xs mb-6">Trustworthiness Score</h2>
                                <TrustScoreGuage score={result.score} />
                            </div>

                            <TricksList tricks={result.tricks} />

                            <div className="md:col-span-2 flex justify-center">
                                <button
                                    onClick={clearAll}
                                    className="px-8 py-3 rounded-full border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-all text-sm font-medium tracking-wide flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Analyze Another Item
                                </button>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

            </main>
        </div>
    );
}