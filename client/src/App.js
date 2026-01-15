import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Upload, AlertTriangle, CheckCircle, Scan, X, Activity, Zap } from 'lucide-react';
import axios from 'axios';

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
                        <span className="text-slate-300 text-sm leading-relaxed">{trick}</span>
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

function App() {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleAnalyze = async () => {
        if (!text && !file) {
            setError("Input required: Please paste text or upload an image.");
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        // Artificial Minimum Delay for "Scanning" effect (UX)
        const minDelay = new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const formData = new FormData();
            let endpoint = 'http://localhost:5001/api/analyze';
            let headers = { 'Content-Type': 'application/json' };
            let body;

            if (file) {
                endpoint = 'http://localhost:5001/api/analyze-image';
                formData.append('newsImage', file);
                headers = { 'Content-Type': 'multipart/form-data' };
                body = formData;
            } else {
                body = JSON.stringify({ message: text });
            }

            const [response] = await Promise.all([
                axios.post(endpoint, body, { headers }),
                minDelay
            ]);

            setResult(response.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.message || "Connection refused. Is the Server Online?");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const clearAll = () => {
        setText('');
        setFile(null);
        setResult(null);
        setError(null);
        // Reset file input value
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-cyan-500/30">
            <Header />

            <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">

                {/* INPUT SECTION */}
                <section className="relative group">
                    {/* Scanning Laser Effect */}
                    <AnimatePresence>
                        {isAnalyzing && (
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
                    <div className={`bg-slate-800/40 border border-slate-700 rounded-2xl p-1 transition-all duration-500 ${isAnalyzing ? 'scale-[0.99] opacity-80 blur-[1px]' : 'hover:border-slate-600'}`}>
                        <div className="bg-slate-900/80 rounded-xl p-6 md:p-8 space-y-6">

                            {/* Text Input */}
                            <div className="relative">
                                <textarea
                                    className="w-full min-h-[160px] bg-slate-950/50 text-slate-300 p-4 rounded-xl border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-y placeholder:text-slate-600 focus:outline-none disabled:opacity-50"
                                    placeholder="Paste suspicious article text, tweet, or message here..."
                                    value={text}
                                    onChange={(e) => {
                                        setText(e.target.value);
                                        setFile(null); // Clear file if typing
                                    }}
                                    disabled={isAnalyzing || !!file}
                                />
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4">
                                <div className="h-px bg-slate-800 flex-1"></div>
                                <span className="text-slate-500 text-xs font-mono uppercase">OR UPLOAD EVIDENCE</span>
                                <div className="h-px bg-slate-800 flex-1"></div>
                            </div>

                            {/* File Input Zone */}
                            <div
                                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all 
                  ${file ? 'border-cyan-500/50 bg-cyan-900/10' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'}
                  ${text ? 'opacity-50 pointer-events-none' : ''}
                `}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const f = e.target.files[0];
                                        if (f) {
                                            setFile(f);
                                            setText(''); // Clear text if file selected
                                        }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    disabled={isAnalyzing || !!text}
                                />
                                <div className="flex flex-col items-center gap-3">
                                    {file ? (
                                        <>
                                            <div className="relative w-full h-32 md:h-48 rounded-lg overflow-hidden mb-2">
                                                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex items-center gap-2 text-cyan-400">
                                                <CheckCircle className="w-5 h-5" />
                                                <span className="font-medium text-sm">{file.name}</span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    clearAll();
                                                }}
                                                className="text-xs text-red-400 hover:text-red-300 hover:underline z-10 relative"
                                            >
                                                Remove Image
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="p-4 bg-slate-800 rounded-full">
                                                <Upload className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p className="text-slate-400 font-medium">Drop screenshot or image here</p>
                                            <p className="text-slate-600 text-xs">Supports JPG, PNG, WEBP</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Analyze Button */}
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || (!text && !file)}
                                className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-3
                  ${isAnalyzing
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/20 active:scale-[0.98]'
                                    }
                `}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Zap className="w-5 h-5 animate-pulse" />
                                        Initializing Neural Link...
                                    </>
                                ) : (
                                    <>
                                        <Scan className="w-5 h-5" />
                                        Run Verification
                                    </>
                                )}
                            </button>

                            {error && (
                                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-200">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                        </div>
                    </div>
                </section>

                {/* RESULTS DASHBOARD */}
                <AnimatePresence>
                    {result && !isAnalyzing && (
                        <motion.section
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 100 }}
                            className="grid md:grid-cols-2 gap-6"
                        >
                            {/* Score Card */}
                            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center justify-center">
                                <h2 className="text-slate-400 font-mono uppercase tracking-widest text-xs mb-6">Trustworthiness Score</h2>
                                <TrustScoreGuage score={result.score} />
                            </div>

                            {/* Analysis Details */}
                            <TricksList tricks={result.tricks} />

                            {/* Actions */}
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

export default App;