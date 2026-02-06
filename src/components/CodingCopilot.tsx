import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import {
  Terminal as TerminalIcon,
  Send,
  Play,
  Sparkles,
  Settings,
  ChevronDown,
  Code2,
  FileCode,
  Layout,
  User,
  Bot,
  Loader2,
  Trash2,
  Maximize2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface CodingCopilotProps {
  onBack: () => void;
  role: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}


const CodingCopilot: React.FC<CodingCopilotProps> = ({ onBack, role }) => {
  const [language, setLanguage] = useState<'java' | 'python' | 'c'>('python');
  const [code, setCode] = useState(getDefaultCode('python'));
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Copilot. I can help you debug, explain logic, or write code for your " + role + " interview. What's on your mind?",
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [output, setOutput] = useState<string[]>(['Welcome to the integrated terminal.', 'Python 3.10.0 ready.']);
  const [isRunning, setIsRunning] = useState(false);
  const [execStatus, setExecStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [stdin, setStdin] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  function getDefaultCode(lang: string) {
    switch (lang) {
      case 'java':
        return 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.print("Enter your name: ");\n        String name = scanner.nextLine();\n        System.out.println("Hello " + name + "! Welcome to the Java IDE.");\n    }\n}';
      case 'c':
        return '#include <stdio.h>\n\nint main() {\n    char name[100];\n    printf("Enter your name: ");\n    scanf("%s", name);\n    printf("Hello %s! Welcome to the C IDE.\\n", name);\n    return 0;\n}';
      default:
        return `n = int(input("Enter number: "))
original = n
reverse = 0

while n > 0:
    digit = n % 10
    reverse = reverse * 10 + digit
    n = n // 10

if reverse == original:
    print("palindrome")
else:
    print("not palindrome")`;
    }
  }

  const runCode = async () => {
    setIsRunning(true);
    setExecStatus('idle');
    setOutput(prev => [...prev, `> Executing main.${language === 'python' ? 'py' : language === 'java' ? 'java' : 'c'}...`]);

    const versionMap = {
      python: '3.10.0',
      java: '15.0.2',
      c: '10.2.0'
    };

    try {
      const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
        language: language,
        version: versionMap[language],
        files: [{ content: code }],
        stdin: stdin
      });

      const { run } = response.data;
      if (run.stderr) {
        setOutput(prev => [...prev, run.stderr]);
        setExecStatus('error');
      } else {
        const lines = (run.stdout || 'Process finished with no output.').split('\n');
        setOutput(prev => [...prev, ...lines.filter((l: string) => l !== '')]);
        setExecStatus('success');
      }
    } catch (error) {
      setOutput(prev => [...prev, 'Error: Could not connect to the execution server.']);
      setExecStatus('error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/ide/chat', {
        role,
        language,
        code,
        chat_input: chatInput,
        history: messages.slice(1).map(m => ({
          role: m.role,
          content: m.content
        }))
      });

      const text = response.data.response;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: text,
        timestamp: new Date()
      }]);
    } catch (error: any) {
      console.error("IDE Chat Error:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to my brain right now. Please make sure the backend server is running!",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-slate-300 overflow-hidden select-none">
      {/* VS Code Style Header/Menu */}
      <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4 h-full">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-400">Coding Copilot - {role}</span>
          </div>
          <div className="h-4 w-px bg-[#30363d]"></div>

          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1 bg-[#21262d] border border-[#30363d] rounded text-[11px] font-bold text-slate-300 hover:bg-[#30363d] transition-all">
              {language === 'java' && <FileCode className="w-3.5 h-3.5 text-orange-400" />}
              {language === 'python' && <Code2 className="w-3.5 h-3.5 text-blue-400" />}
              {language === 'c' && <TerminalIcon className="w-3.5 h-3.5 text-slate-400" />}
              <span className="capitalize">{language === 'c' ? 'C Language' : language}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-36 bg-[#161b22] border border-[#30363d] rounded shadow-2xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-[100] p-1">
              {(['python', 'java', 'c'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setCode(getDefaultCode(lang));
                  }}
                  className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-[#21262d] rounded text-[11px] font-medium text-slate-400 hover:text-white transition-colors text-left"
                >
                  {lang === 'python' && <Code2 className="w-3 h-3 text-blue-400" />}
                  {lang === 'java' && <FileCode className="w-3 h-3 text-orange-400" />}
                  {lang === 'c' && <TerminalIcon className="w-3 h-3 text-slate-400" />}
                  <span className="capitalize">{lang === 'c' ? 'C Language' : lang}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runCode}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-1 rounded text-xs font-bold transition-all active:scale-95 ${isRunning ? 'bg-slate-700 text-slate-400' : 'bg-[#238636] text-white hover:bg-[#2ea043]'
              }`}
          >
            {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
            {isRunning ? 'Running...' : 'Run'}
          </button>
          <div className="h-4 w-px bg-[#30363d]"></div>
          <button onClick={onBack} className="text-[11px] font-bold text-slate-500 hover:text-slate-300 transition-colors">
            Exit
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Section: Editor & Terminal */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0d1117]">
          {/* Tabs for Editor */}
          <div className="h-9 bg-[#0d1117] flex items-center border-b border-[#30363d]">
            <div className="px-4 h-full flex items-center gap-2 bg-[#161b22] border-r border-[#30363d] text-[11px] border-t-2 border-t-[#f78166] text-slate-200">
              {language === 'java' && <FileCode className="w-3 h-3 text-orange-400" />}
              {language === 'python' && <Code2 className="w-3 h-3 text-blue-400" />}
              {language === 'c' && <TerminalIcon className="w-3 h-3 text-slate-400" />}
              main.{language === 'python' ? 'py' : language === 'java' ? 'java' : 'c'}
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language === 'c' ? 'c' : language === 'java' ? 'java' : 'python'}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: 14,
                fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                roundedSelection: true,
                automaticLayout: true,
                padding: { top: 12 },
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible',
                  useShadows: false,
                  verticalScrollbarSize: 10,
                  horizontalScrollbarSize: 10
                }
              }}
            />
          </div>

          {/* Terminal Area */}
          <div className="h-1/3 min-h-[150px] bg-[#010409] border-t border-[#30363d] flex flex-col">
            <div className="h-9 bg-[#161b22] px-4 flex items-center justify-between border-b border-[#30363d]">
              <div className="flex items-center gap-6 h-full">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest border-b-2 border-white/40 h-full flex items-center">Terminal</span>
                <span className="text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest cursor-pointer h-full flex items-center">Output</span>
                <span className="text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest cursor-pointer h-full flex items-center">Debug Console</span>
              </div>
              <div className="flex items-center gap-4">
                {execStatus === 'success' && (
                  <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase tracking-wider animate-fade-in">
                    <CheckCircle2 className="w-3 h-3" />
                    Success
                  </div>
                )}
                {execStatus === 'error' && (
                  <div className="flex items-center gap-1.5 text-red-400 text-[10px] font-bold uppercase tracking-wider animate-fade-in">
                    <XCircle className="w-3 h-3" />
                    Error
                  </div>
                )}
                <Trash2 className="w-3 h-3 text-slate-500 cursor-pointer hover:text-slate-300" onClick={() => { setOutput(['Terminal cleared.']); setExecStatus('idle'); }} />
                <Maximize2 className="w-3 h-3 text-slate-500 cursor-pointer hover:text-slate-300" />
              </div>
            </div>
            <div className="flex-1 p-4 font-mono text-[13px] overflow-y-auto custom-scrollbar bg-black/20">
              <div className="flex flex-col gap-1">
                {output.map((line, i) => (
                  <div key={i} className={`flex gap-3 leading-relaxed ${line.startsWith('>') ? 'text-blue-400 font-bold' : 'text-slate-300'}`}>
                    {line}
                  </div>
                ))}

                {/* Simulated Input Line */}
                <div className="flex items-start gap-2 mt-2">
                  <span className="text-[#2ea043] font-bold mt-1">➜</span>
                  <div className="flex flex-col flex-1 gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">stdin</span>
                      <span className="text-slate-600 text-[10px]">(Ctrl+Enter to Run)</span>
                    </div>
                    <textarea
                      value={stdin}
                      onChange={(e) => setStdin(e.target.value)}
                      placeholder="Enter values (one per line)..."
                      className="w-full bg-slate-900/50 border border-[#30363d] rounded p-2 text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 min-h-[80px] transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          e.preventDefault();
                          runCode();
                        }
                      }}
                    />
                  </div>
                </div>
                <div ref={terminalEndRef} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: AI Sidebar */}
        <div className="w-[350px] bg-[#161b22] border-l border-[#30363d] flex flex-col">
          <div className="h-9 px-4 flex items-center justify-between border-b border-[#30363d] bg-[#0d1117]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] font-bold text-slate-200">AI COPILOT</span>
            </div>
            <Settings className="w-3 h-3 text-slate-500 cursor-pointer" />
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'itmes-start' : 'items-start'}`}>
                <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-[#21262d] text-slate-300' : 'bg-blue-600/20 text-blue-400'
                  }`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {msg.role === 'user' ? 'You' : 'Copilot'}
                    </span>
                    <span className="text-[9px] text-slate-600">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={`text-[12px] leading-relaxed break-words ${msg.role === 'user' ? 'text-slate-300' : 'text-slate-100 font-medium'
                    }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 animate-pulse">
                <div className="w-6 h-6 rounded bg-blue-600/20 flex items-center justify-center text-blue-400">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-2 bg-[#21262d] rounded w-1/4"></div>
                  <div className="h-3 bg-[#21262d] rounded w-full"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-[#30363d] bg-[#0d1117]/50">
            <div className="relative group">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask me about your code..."
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 pr-10 text-[12px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-blue-500/50 transition-all resize-none min-h-[40px] max-h-[120px]"
                rows={1}
                style={{ height: 'auto' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isTyping}
                className="absolute right-2 bottom-3 p-1.5 text-slate-500 hover:text-blue-400 disabled:opacity-30 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-600 font-medium">
              <span>Shift+Enter for new line</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                Gemini 1.5 Pro
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingCopilot;
