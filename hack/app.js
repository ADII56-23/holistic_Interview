const { useState, useEffect, useRef, useLayoutEffect } = React;

// --- CONFIG & CONSTANTS ---
const MODES = {
    TUTOR: { id: 'tutor', icon: 'graduation-cap', label: 'AI Tutor' },
    EXPLORER: { id: 'explorer', icon: 'compass', label: 'Pro Explorer' },
    PRACTICE: { id: 'practice', icon: 'dumbell', label: 'Practice Lab' },
    BUILD: { id: 'build', icon: 'hammer', label: 'Project Builder' }
};

const LEVELS = ['Beginner', 'Intermediate', 'Expert'];
const OPENAI_KEY = 'YOUR_OPENAI_API_KEY'; // Replace with your actual key or use an environment variable

// --- COMPONENTS ---

const Icon = ({ name, size = 18, className = "" }) => {
    return <i data-lucide={name} style={{ width: size, height: size }} className={className}></i>;
};

const LearnFlowApp = () => {
    // --- STATE ---
    const [isOnboarded, setIsOnboarded] = useState(localStorage.getItem('lf_onboarded') === 'true');
    const [mode, setMode] = useState(MODES.TUTOR.id); // tutor, explorer, practice, build
    const [theme, setTheme] = useState(localStorage.getItem('lf_theme') || 'dark');
    const [userLevel, setUserLevel] = useState(localStorage.getItem('lf_level') || 'Beginner');

    // Chat & Intelligence
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);

    // Workspace & Files
    const [code, setCode] = useState("// Write your code here...\nconsole.log('Hello LearnFlow!');");
    const [files, setFiles] = useState(['main.js', 'styles.css', 'app.py']);
    const [activeFile, setActiveFile] = useState('main.js');
    const fileInputRef = useRef(null);

    // Persistence & Stats
    const [stats, setStats] = useState(JSON.parse(localStorage.getItem('lf_stats') || '{"xp":0, "streak":1}'));
    const [flashcards, setFlashcards] = useState(JSON.parse(localStorage.getItem('lf_cards') || '[]'));
    const [history, setHistory] = useState(JSON.parse(localStorage.getItem('lf_history') || '[]'));

    const scrollRef = useRef(null);

    // --- EFFECTS ---
    useEffect(() => {
        lucide.createIcons();
        if (messages.length) scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        // Initialize Mermaid
        mermaid.initialize({ startOnLoad: true, theme: theme === 'dark' ? 'dark' : 'default' });
    }, [messages, mode, theme]);

    useEffect(() => {
        document.documentElement.className = theme;
        localStorage.setItem('lf_theme', theme);
        localStorage.setItem('lf_level', userLevel);
        localStorage.setItem('lf_onboarded', isOnboarded);
    }, [theme, userLevel, isOnboarded]);

    // --- LOGIC ---
    const callAI = async (prompt, contextMessages = []) => {
        const systemPrompts = {
            tutor: `You are LearnFlow Tutor. Level: ${userLevel}. Explain concepts clearly. Use Markdown. If a process is described, wrap mermaid code in \`\`\`mermaid blocks.`,
            explorer: `You are LearnFlow Explorer. Analyze prompts deeply. Summarize complex topics. Level: ${userLevel}.`,
            practice: `You are LearnFlow Coach. Generate quiz questions or flashcards based on the user's topic. Format: [Q] ... [A] ...`,
            build: `You are LearnFlow Architect. Guide the user step-by-step to build this project. Suggest code snippets.`
        };

        try {
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: systemPrompts[mode] },
                        ...contextMessages, // Include history for context if needed
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7
                })
            });
            const data = await res.json();
            return data.choices[0].message.content;
        } catch (e) {
            return "⚠️ AI Service Error: " + e.message;
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = { id: Date.now(), role: 'user', content: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput("");
        setIsThinking(true);

        // XP Gain
        setStats(s => ({ ...s, xp: s.xp + 10 }));
        localStorage.setItem('lf_stats', JSON.stringify({ ...stats, xp: stats.xp + 10 }));

        try {
            const context = messages.slice(-4).map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }));
            const aiResponse = await callAI(input, context);
            const aiMsg = { id: Date.now() + 1, role: 'ai', content: aiResponse };

            // Logic to catch flashcard generation
            if (aiResponse.includes('[Q]') && aiResponse.includes('[A]')) {
                const qaPairs = aiResponse.match(/\[Q\](.*?)\s*\[A\](.*?)(?=\[Q\]|$)/gs);
                if (qaPairs) {
                    const newCards = qaPairs.map(p => {
                        const [, q, a] = p.match(/\[Q\](.*?)\s*\[A\](.*)/s) || [];
                        return { id: Date.now() + Math.random(), q: q.trim(), a: a.trim(), reviews: 0 };
                    });
                    setFlashcards(prev => {
                        const combined = [...prev, ...newCards];
                        localStorage.setItem('lf_cards', JSON.stringify(combined));
                        return combined;
                    });
                }
            }

            const finalMessages = [...newMessages, aiMsg];
            setMessages(finalMessages);
            localStorage.setItem('lf_history', JSON.stringify(finalMessages.slice(-20))); // Save last 20

            setTimeout(() => {
                mermaid.contentLoaded();
                Prism.highlightAll();
            }, 500);
        } catch (e) {
            console.error(e);
        } finally {
            setIsThinking(false);
        }
    };

    const handleExport = () => {
        const text = messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n\n');
        const blob = new Blob([text], { type: 'text/markdown' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `LearnFlow_Session_${new Date().toISOString().slice(0, 10)}.md`;
        a.click();
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Simulating extraction
        const sysMsg = { id: Date.now(), role: 'ai', content: `📄 **Analyzed ${file.name}**\n\nI've extracted the key points from this document. What would you like to know about it?` };
        setMessages(p => [...p, sysMsg]);
    };

    // --- RENDER ---
    if (!isOnboarded) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-dark p-8">
                <div className="max-w-xl w-full glass p-10 rounded-3xl space-y-8 animate-fade-in text-center shadow-2xl">
                    <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary animate-pulse">
                        <Icon name="brain-circuit" size={48} />
                    </div>
                    <div>
                        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-2">LearnFlow AI</h1>
                        <p className="text-slate-400 text-lg">Master any skill 10x faster.</p>
                    </div>

                    <div className="space-y-4 text-left">
                        <label className="text-sm uppercase tracking-wider font-bold text-slate-500">Select Your Level</label>
                        <div className="grid grid-cols-3 gap-4">
                            {LEVELS.map(l => (
                                <button key={l} onClick={() => setUserLevel(l)}
                                    className={`p-5 rounded-2xl border transition-all font-semibold ${userLevel === l ? 'border-primary bg-primary/10 text-white shadow-glow' : 'border-slate-700 hover:bg-slate-800 text-slate-400'}`}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={() => setIsOnboarded(true)} className="w-full py-5 bg-primary hover:bg-indigo-500 text-white rounded-2xl font-bold text-xl shadow-glow transition-all flex items-center justify-center gap-3">
                        Start Journey <Icon name="arrow-right" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-300 ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-dark text-slate-200'}`}>

            {/* SIDEBAR */}
            <aside className={`w-20 md:w-72 flex-shrink-0 flex flex-col border-r ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800 bg-dark-card'}`}>
                <div className="p-6 md:p-8 flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                        <Icon name="zap" size={24} />
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-xl font-bold leading-none">LearnFlow</h1>
                        <span className="text-xs text-slate-500 font-medium">Pro Assistant</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-3">
                    {Object.values(MODES).map(m => (
                        <button key={m.id} onClick={() => setMode(m.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${mode === m.id ? 'bg-primary text-white shadow-glow' : 'hover:bg-slate-800/10 text-slate-500'}`}>
                            <Icon name={m.icon} />
                            <span className="font-bold hidden md:block">{m.label}</span>
                            {mode === m.id && <div className="ml-auto w-2 h-2 bg-white rounded-full hidden md:block animate-pulse"></div>}
                        </button>
                    ))}
                </nav>

                <div className="p-6 mt-auto space-y-4">
                    <div className={`p-5 rounded-2xl ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'} hidden md:block border border-inherit`}>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold uppercase text-slate-500">Daily XP</span>
                            <span className="text-xs font-black text-primary">{stats.xp} / 100</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-400/20 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${Math.min(stats.xp, 100)}%` }}></div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="flex-1 flex items-center justify-center p-3 rounded-xl hover:bg-slate-800/10 transition-all border border-inherit">
                            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
                        </button>
                        <button onClick={handleExport} title="Export Session" className="flex-1 flex items-center justify-center p-3 rounded-xl hover:bg-slate-800/10 transition-all border border-inherit text-primary">
                            <Icon name="download" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col relative min-w-0">
                <header className={`h-20 flex items-center justify-between px-8 border-b ${theme === 'light' ? 'border-slate-200 bg-white/80' : 'border-slate-800 bg-dark/80'} backdrop-blur-md z-10`}>
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold capitalize tracking-tight">{MODES[mode.toUpperCase()].label}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${theme === 'light' ? 'border-slate-300 bg-slate-100' : 'border-slate-700 bg-slate-800'} text-slate-500`}>
                            {userLevel}
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setMessages([])} className="p-2.5 rounded-xl hover:bg-slate-500/10 text-slate-400 hover:text-red-400 transition-all" title="Clear Chat">
                            <Icon name="trash-2" />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shadow-lg">RV</div>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 flex flex-col">
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-40 animate-fade-in">
                                    <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                        <Icon name="sparkles" size={40} className="text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Ready to transform?</h3>
                                    <p className="text-slate-400 max-w-sm text-center mb-8">Ask me anything, upload a document, or start a project.</p>
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {['Analyze my code', 'React Hooks Guide', 'Generate Flashcards'].map(S => (
                                            <button key={S} onClick={() => setInput(S)} className="px-5 py-2.5 rounded-full border border-slate-600 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all text-sm font-medium">{S}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map(m => (
                                <div key={m.id} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'} animate-slide-up`}>
                                    <div className={`max-w-[80%] p-8 rounded-[2rem] shadow-sm relative group ${m.role === 'ai' ? (theme === 'light' ? 'bg-white text-slate-800' : 'glass-strong text-slate-200 border-white/5') : 'bg-primary text-white shadow-glow'}`}>
                                        <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br/>').replace(/```mermaid([\s\S]*?)```/g, '<div class="mermaid">$1</div>') }}></div>
                                        <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 text-xs font-bold text-slate-500 left-4">
                                            <span>{new Date(m.id).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isThinking && (
                                <div className="flex justify-start">
                                    <div className={`px-8 py-6 rounded-[2rem] ${theme === 'light' ? 'bg-white' : 'glass-strong'}`}>
                                        <div className="flex gap-2.5">
                                            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"></div>
                                            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce delay-75"></div>
                                            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce delay-150"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef}></div>
                        </div>

                        <div className="p-8 pt-0">
                            <div className={`p-3 pr-4 rounded-[2.5rem] flex items-end gap-3 ${theme === 'light' ? 'bg-white shadow-2xl border-slate-200' : 'glass shadow-glow border-white/10'} border-2 transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10`}>
                                <div className="flex flex-col gap-1 pb-1 pl-1">
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                                    <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full hover:bg-slate-500/10 text-slate-400 hover:text-primary transition-all" title="Upload Document"><Icon name="paperclip" /></button>
                                </div>
                                <textarea
                                    className="flex-1 bg-transparent border-none outline-none py-4 px-2 font-medium max-h-32 resize-none custom-scrollbar placeholder:text-slate-500"
                                    placeholder="Type your question..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                                    rows={1}
                                />
                                <button onClick={handleSend} disabled={!input.trim() || isThinking} className="p-4 mb-1 bg-primary text-white rounded-full hover:scale-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-glow">
                                    <Icon name="arrow-up" strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <aside className={`w-[400px] border-l flex flex-col ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-dark/30'}`}>
                        <div className="p-6 border-b border-inherit bg-inherit/50 backdrop-blur">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><Icon name="terminal-square" size={14} className="text-primary" /> Code Sandbox</h3>
                            <div className="flex gap-2 mb-4">
                                {files.map(f => (
                                    <button key={f} onClick={() => setActiveFile(f)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeFile === f ? 'bg-primary/20 text-primary border border-primary/20' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
                                        {f}
                                    </button>
                                ))}
                            </div>
                            <div className={`rounded-xl overflow-hidden border ${theme === 'light' ? 'border-slate-300 bg-white' : 'border-slate-700 bg-[#0b101b]'}`}>
                                <textarea
                                    className="w-full h-64 p-5 bg-transparent text-xs font-mono outline-none resize-none leading-relaxed text-slate-300"
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    spellCheck="false"
                                ></textarea>
                                <div className="flex justify-between items-center p-3 bg-inherit border-t border-inherit">
                                    <span className="text-[10px] uppercase font-bold text-slate-500">JavaScript</span>
                                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold">
                                        <Icon name="play" size={12} /> Run
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-8 overflow-y-auto">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2"><Icon name="library" size={14} className="text-secondary" /> Library</h3>
                            <div className="space-y-4">
                                <div onClick={() => { setMode(MODES.PRACTICE.id); setInput("Show my active flashcard deck"); handleSend(); }} className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-dark-card border-slate-700/50'} hover:border-primary/50 transition-all cursor-pointer group shadow-sm`}>
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="p-2.5 bg-pink-500/10 text-pink-500 rounded-xl"><Icon name="layers" size={20} /></div>
                                        <span className="text-xs font-bold text-slate-500 bg-slate-800/50 px-2 py-1 rounded">{flashcards.length} Cards</span>
                                    </div>
                                    <h4 className="font-bold text-lg">Flashcards</h4>
                                    <p className="text-xs text-slate-500 mt-1">Spaced repetition deck.</p>
                                </div>
                                <div onClick={() => { setMode(MODES.EXPLORER.id); setInput("Generate a comprehensive cheat sheet for the current topic"); handleSend(); }} className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-dark-card border-slate-700/50'} hover:border-primary/50 transition-all cursor-pointer group shadow-sm`}>
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl"><Icon name="book-open" size={20} /></div>
                                        <div className="p-1 px-2 bg-primary/20 text-primary text-[10px] font-black rounded uppercase tracking-tighter">NEW</div>
                                    </div>
                                    <h4 className="font-bold text-lg">Smart Sheets</h4>
                                    <p className="text-xs text-slate-500 mt-1">AI-generated summaries.</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<LearnFlowApp />);
