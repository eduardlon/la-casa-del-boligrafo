import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Mic, MicOff, Loader2, Sparkles } from 'lucide-react';

interface ChatMessage {
    role: 'user' | 'ai';
    text: string;
}

const formatMessage = (text: string) => {
    return text
        .replace(/\n/g, '<br/>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/•/g, '&bull;');
};

export const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'ai', text: '¡Hola! 👋 Soy **Diamant AI**, tu asistente.\n\nPuedo ayudarte con:\n• **Buscar** productos: "busca bolígrafos"\n• **Crear** productos: "crea un bolígrafo ref BOL-001 precio 5000"\n• **Editar** stock: "actualiza stock de BOL-001 a 50"\n• **Editar** precio: "cambia precio de BOL-001 a 8000"\n• **Eliminar**: "elimina producto BOL-001"\n\nEscribe o usa el micrófono 🎤' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        return () => stopVoice();
    }, []);

    const handleSend = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isLoading) return;

        setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: trimmed, history: messages })
            });
            const data = await res.json();
            const responseText = data.response || data.error || 'Sin respuesta del servidor.';
            setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Error de conexión. Verifica que el servidor esté corriendo.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    // ═══════════════════════════════════════════════════════
    //  VOZ ROBUSTA - MediaRecorder + Groq Audio
    //  Graba audio, detecta silencios, y envía a Whisper
    // ═══════════════════════════════════════════════════════

    const resetSilenceTimer = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
            console.log("Silencio detectado, deteniendo grabación automáticamente...");
            stopVoice();
        }, 3000); // 3 seconds of silence
    };

    const processAudioLevel = () => {
        if (!analyserRef.current || !dataArrayRef.current || !isListening) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);

        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
            sum += dataArrayRef.current[i];
        }
        const average = sum / dataArrayRef.current.length;

        if (average > 10) {
            resetSilenceTimer();
        }

        animationFrameRef.current = requestAnimationFrame(processAudioLevel);
    };

    const startVoice = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            // Configurar AudioContext para detección de silencios
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            const bufferLength = analyserRef.current.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);
            source.connect(analyserRef.current);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(t => t.stop());

                if (audioContextRef.current) {
                    audioContextRef.current.close();
                    audioContextRef.current = null;
                }
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
                if (silenceTimerRef.current) {
                    clearTimeout(silenceTimerRef.current);
                }

                setIsListening(false);
                if (audioBlob.size > 0) {
                    await handleVoiceSubmit(audioBlob);
                }
            };

            mediaRecorder.start();
            setIsListening(true);
            setMessages(prev => [...prev, { role: 'ai', text: '🎤 Escuchando... habla ahora.' }]);

            // Iniciar detección de silenico
            resetSilenceTimer();
            processAudioLevel();

        } catch (error) {
            console.error('Microphone error:', error);
            setIsListening(false);
            setMessages(prev => [...prev, { role: 'ai', text: '⚠️ No se pudo acceder al micrófono. Verifica los permisos de tu navegador.' }]);
        }
    };

    const handleVoiceSubmit = async (audioBlob: Blob) => {
        setIsLoading(true);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64data = reader.result;

                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        audio: base64data,
                        audioMimeType: 'audio/webm',
                        history: messages
                    })
                });

                const data = await res.json();
                const responseText = data.response || data.error || 'Sin respuesta del servidor.';
                setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
                setIsLoading(false);
            };
        } catch (error) {
            console.error("Error sending voice:", error);
            setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Error al procesar el audio.' }]);
            setIsLoading(false);
        }
    };

    const stopVoice = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setIsListening(false);
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }
    };

    const toggleVoice = () => {
        if (isListening) {
            stopVoice();
        } else {
            startVoice();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="bg-white border border-neutral-200 shadow-2xl rounded-2xl w-[340px] sm:w-[400px] h-[520px] flex flex-col mb-4 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-neutral-900 text-white p-4 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                                    <Sparkles size={16} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm leading-tight">Diamant AI</h3>
                                    <p className="text-[10px] text-neutral-400">Asistente Inteligente</p>
                                </div>
                            </div>
                            <button onClick={() => { setIsOpen(false); stopVoice(); }} className="text-neutral-400 hover:text-white transition-colors p-1">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-neutral-50/50">
                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-neutral-900 text-white rounded-br-sm'
                                        : 'bg-white border border-neutral-200 text-neutral-700 rounded-bl-sm'
                                        }`}>
                                        <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} />
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-neutral-200 rounded-2xl rounded-bl-sm px-5 py-3 shadow-sm flex items-center gap-2">
                                        <Loader2 className="animate-spin text-neutral-500" size={14} />
                                        <span className="text-xs text-neutral-400">Procesando...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-white border-t border-neutral-100 shrink-0">
                            {isListening && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2 pb-2 mb-2 border-b border-red-100"
                                >
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                    <span className="text-xs text-red-600 font-medium">Grabando voz... habla ahora</span>
                                </motion.div>
                            )}

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleVoice}
                                    disabled={isLoading}
                                    className={`p-2.5 rounded-full transition-all flex-shrink-0 flex items-center justify-center relative ${isListening
                                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 disabled:opacity-40'
                                        }`}
                                    title={isListening ? "Detener" : "Hablar"}
                                >
                                    {isListening ? (
                                        <>
                                            <MicOff size={16} />
                                            <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-40" />
                                        </>
                                    ) : (
                                        <Mic size={16} />
                                    )}
                                </button>

                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading && !isListening && input.trim()) handleSend(input); }}
                                    placeholder={isListening ? "Escuchando..." : "Escribe un comando..."}
                                    disabled={isLoading}
                                    readOnly={isListening}
                                    className={`flex-1 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${isListening
                                        ? 'bg-red-50 border border-red-200 ring-2 ring-red-300 text-red-700 font-medium'
                                        : 'bg-neutral-100 focus:bg-white focus:ring-neutral-900'
                                        } disabled:opacity-50`}
                                />

                                <button
                                    onClick={() => handleSend(input)}
                                    disabled={!input.trim() || isLoading || isListening}
                                    className="p-2.5 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-md"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-neutral-900 shadow-xl shadow-neutral-900/20 text-white rounded-full flex items-center justify-center z-50 hover:bg-neutral-800 transition-colors"
                >
                    <MessageSquare size={22} />
                </motion.button>
            )}
        </div>
    );
};
