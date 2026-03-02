'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Send, Paperclip, Smile, Image as ImageIcon,
    Phone, Video, MoreHorizontal, Check, CheckCheck,
    Reply, Forward, Trash2, Copy, Clock, Sparkles, Download, Timer, Volume2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { sendMessage, updateConversationStatus } from '@/actions/inbox';
import { ChannelIcon } from './channel-icon';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { QuickReplies } from './quick-replies';
import { useInboxShortcuts } from '@/hooks/use-inbox-shortcuts';
import { Mic, CheckCircle2, Maximize2, Minimize2, MonitorUp, UserPlus, MicOff, VideoOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

function AudioPlayer({ durationText }: { durationText: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error(e));
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
    };

    return (
        <div className="flex items-center gap-2 min-w-[200px]">
            <audio
                ref={audioRef}
                src="https://actions.google.com/sounds/v1/water/glass_water_pour.ogg"
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => { setIsPlaying(false); setProgress(0); }}
            />
            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shrink-0 bg-white/20 hover:bg-white/30 text-current mix-blend-luminosity" onClick={togglePlay}>
                {isPlaying ? <Timer width="14" height="14" /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>}
            </Button>
            <div className="flex-1 h-1.5 bg-black/10 rounded-full relative overflow-hidden cursor-pointer" onClick={(e) => {
                if (audioRef.current && audioRef.current.duration) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const per = (e.clientX - rect.left) / rect.width;
                    audioRef.current.currentTime = per * audioRef.current.duration;
                    setProgress(per * 100);
                }
            }}>
                <div className="absolute left-0 top-0 h-full bg-current rounded-full transition-all duration-75" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono opacity-80">{durationText}</span>
                <Button variant="ghost" size="sm" className="h-5 px-1 text-[10px] font-bold rounded bg-black/5 hover:bg-black/10 text-current ml-1" onClick={(e) => {
                    if (!audioRef.current) return;
                    const btn = e.currentTarget;
                    if (btn.textContent === '1x') { btn.textContent = '1.5x'; audioRef.current.playbackRate = 1.5; }
                    else if (btn.textContent === '1.5x') { btn.textContent = '2x'; audioRef.current.playbackRate = 2; }
                    else { btn.textContent = '1x'; audioRef.current.playbackRate = 1; }
                }}>1x</Button>
            </div>
        </div>
    );
}

export function ChatWindow({ conversation, messages: initialMessages, currentUserId }: any) {
    const [messages, setMessages] = useState(initialMessages);
    const [newItem, setNewItem] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [showQuickReplies, setShowQuickReplies] = useState(false);
    const [isRecording, setIsRecording] = useState(false); // Visual state for Voice Note
    const [isTyping, setIsTyping] = useState(false); // Simulated typing state
    const [isPrivateNote, setIsPrivateNote] = useState(false); // Internal Private Notes Toggle
    const isAdmin = true; // Simulate Admin check for deletion

    const [showBackgroundAlert, setShowBackgroundAlert] = useState(false);

    // Call UI State
    const [activeCall, setActiveCall] = useState<'video' | 'audio' | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [recordDuration, setRecordDuration] = useState(0);
    const [isCallMinimized, setIsCallMinimized] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isSharingScreen, setIsSharingScreen] = useState(false);
    const [showAddParticipant, setShowAddParticipant] = useState(false);
    const [newParticipant, setNewParticipant] = useState('');

    // Advanced Chat Features State
    const [pendingFiles, setPendingFiles] = useState<{ name: string, type: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showSendLaterModal, setShowSendLaterModal] = useState(false);
    const [sendLaterDate, setSendLaterDate] = useState('');

    // Effect for call duration
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeCall) {
            interval = setInterval(() => setCallDuration(p => p + 1), 1000);
        } else {
            setCallDuration(0);
        }
        return () => clearInterval(interval);
    }, [activeCall]);

    // Effect for record duration
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            interval = setInterval(() => setRecordDuration(p => p + 1), 1000);
        } else {
            setRecordDuration(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Simulate typing effect for demo
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 3000);
        }, 2000);

        // Simulate a background message arriving from another channel
        const alertTimer = setTimeout(() => {
            setShowBackgroundAlert(true);
            setTimeout(() => setShowBackgroundAlert(false), 5000); // hide after 5s
        }, 4000);

        return () => {
            clearTimeout(timer);
            clearTimeout(alertTimer);
        }
    }, []);

    // Shortcuts
    useInboxShortcuts({
        onSend: () => handleSend(),
        onEscape: () => setShowQuickReplies(false),
        onQuickReply: () => {
            setNewItem(prev => prev + '/');
            setShowQuickReplies(true);
            textareaRef.current?.focus();
        }
    });

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Auto-resize textarea
    const adjustHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    };

    const handleSend = async () => {
        if (!newItem.trim() && !isRecording) return; // Allow sending if recording (mock)

        setIsSending(true);
        const content = isRecording ? `🎤 Nota de Voz (${formatDuration(recordDuration)})` : newItem;

        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            content: content,
            direction: isPrivateNote ? 'INTERNAL' : 'OUTBOUND',
            status: 'SENT',
            createdAt: new Date(),
            senderId: currentUserId
        };

        setMessages((prev: any) => [...prev, optimisticMsg]);
        setNewItem('');
        setShowQuickReplies(false);
        setIsRecording(false);
        setIsPrivateNote(false);
        setPendingFiles([]); // Clear pending files
        if (textareaRef.current) textareaRef.current.style.height = '44px'; // Reset height

        // Call Server Action
        await sendMessage(conversation.id, content, currentUserId);
        setIsSending(false);
    };

    const handleQuickReplySelect = (content: string) => {
        setNewItem(content);
        setShowQuickReplies(false);
        if (textareaRef.current) textareaRef.current.focus();
        // optionally auto-send or just fill
    };

    const handleCloseDeal = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        // In real app, call action to update status to WON
    };

    return (
        <div className="flex flex-col h-full bg-[#f8f9fa]">
            {/* Header - Glassmorphism touch */}
            <div className="h-[72px] px-6 border-b border-gray-200 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                            {conversation.lead?.name?.substring(0, 2).toUpperCase() || 'UN'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                            <ChannelIcon channel={conversation.channel} className="text-xs" />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="font-bold text-gray-900 text-sm md:text-base">{conversation.lead?.name || 'Unknown Lead'}</h2>
                            <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-1 cursor-default" title="AI Sentiment Analysis: Positive">
                                😊 Positive
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-medium">{conversation.channel}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Active
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 mx-1"></span>

                            {/* Analytics Phase 6 */}
                            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded" title="First Response Time">
                                <Timer size={10} className="text-slate-400" /> FRT: 3m
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded" title="Total Resolution Time">
                                <Clock size={10} className="text-slate-400" /> TRT: 45m
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-gray-500">
                    {/* Status Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className={cn(
                                "h-8 border-dashed gap-2 font-medium",
                                conversation.status === 'OPEN' ? "text-green-600 border-green-200 bg-green-50" : "text-gray-500"
                            )}>
                                {conversation.status === 'OPEN' ? <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> : <span className="w-2 h-2 rounded-full bg-gray-300" />}
                                {conversation.status}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateConversationStatus(conversation.id, 'OPEN')}>Mark as Open</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateConversationStatus(conversation.id, 'CLOSED')}>Mark as Closed</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateConversationStatus(conversation.id, 'SNOOZED')}>Snooze</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="w-px h-6 bg-gray-200 mx-2 hidden sm:block"></div>

                    <Button variant="ghost" size="icon" className="hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors hidden sm:flex" onClick={() => setActiveCall('audio')}>
                        <Phone size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors hidden sm:flex" onClick={() => setActiveCall('video')}>
                        <Video size={18} />
                    </Button>
                    <div className="w-px h-6 bg-gray-200 mx-2 hidden sm:block"></div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:text-gray-900 rounded-full">
                                <MoreHorizontal size={20} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => toast.info('Opening contact details...')}>View Contact Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success('Pinned to top')}>Pin to Top</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateConversationStatus(conversation.id, 'SNOOZED')}>Snooze Conversation</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-indigo-600 focus:text-indigo-600" onClick={() => toast.success('Transcript exported as PDF')}>
                                <Download size={14} /> Export Transcript
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-amber-600 focus:text-amber-600" onClick={() => toast.warning('Conversation marked as spam')}>Mark as Spam</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => {
                                updateConversationStatus(conversation.id, 'CLOSED');
                                handleCloseDeal();
                            }}>Close Conversation</DropdownMenuItem>
                            {isAdmin && (
                                <>
                                    <div className="h-px bg-gray-200 my-1" />
                                    <DropdownMenuItem className="text-red-700 bg-red-50 focus:text-white focus:bg-red-600 font-bold gap-2" onClick={() => toast.success('Chat deleted permanently')}>
                                        <Trash2 size={14} /> Delete Chat (Admin)
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Floating Background Notification Bubble */}
            <AnimatePresence>
                {showBackgroundAlert && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition-colors border border-slate-700"
                    >
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold text-xs ring-2 ring-slate-900">
                                WA
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-slate-900"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-100">Nuevo mensaje de WhatsApp</span>
                            <span className="text-[11px] text-slate-300">Carlos Díaz: "¡Listo, gracias!"</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Call Overlay */}
            <AnimatePresence>
                {activeCall && !isCallMinimized && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-white p-6"
                    >
                        {/* Top Bar for Call */}
                        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
                            <div className="flex items-center gap-2 bg-red-500/20 text-red-100 px-3 py-1.5 rounded-full border border-red-500/30">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
                                <span className="text-xs font-bold tracking-widest">REC</span>
                            </div>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setIsCallMinimized(true)}>
                                <Minimize2 size={20} />
                            </Button>
                        </div>

                        {activeCall === 'video' ? (
                            <div className="w-full max-w-4xl flex-1 flex gap-4 mt-12 mb-8">
                                {/* Agent Camera */}
                                <div className="flex-1 rounded-2xl bg-black border border-slate-700 overflow-hidden relative shadow-2xl">
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        {isVideoOff ? (
                                            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold">AG</div>
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-t from-slate-900 to-slate-800 flex items-center justify-center">
                                                <span className="text-slate-500 font-medium">Camera Active</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-lg text-sm font-medium">Tú (Agente)</div>
                                    {isMuted && <div className="absolute top-4 right-4 bg-red-500 p-1.5 rounded-full"><MicOff size={16} /></div>}
                                </div>
                                {/* Client Camera */}
                                <div className="flex-1 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden relative shadow-2xl">
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
                                        <div className="w-32 h-32 rounded-full bg-indigo-500/20 flex items-center justify-center text-5xl font-bold text-indigo-200">
                                            {conversation.lead?.name?.substring(0, 2).toUpperCase() || 'UN'}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-lg text-sm font-medium">{conversation.lead?.name || 'Cliente'}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative mb-8 mt-12">
                                <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" style={{ animationDuration: '3s' }}></div>
                                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-6xl font-bold shadow-2xl ring-4 ring-indigo-500/30 relative z-10">
                                    {conversation.lead?.name?.substring(0, 2).toUpperCase() || 'UN'}
                                </div>
                            </div>
                        )}

                        {activeCall === 'audio' && (
                            <h2 className="text-3xl font-bold mb-2">{conversation.lead?.name || 'Unknown Lead'}</h2>
                        )}
                        <p className="text-slate-300 font-mono text-xl mb-12 flex items-center gap-3 bg-slate-800/50 px-4 py-1.5 rounded-full">
                            {formatDuration(callDuration)}
                        </p>

                        <div className="flex items-center gap-4 bg-slate-800/80 backdrop-blur p-4 rounded-3xl border border-slate-700">
                            <Button variant="outline" size="icon" className={cn("w-14 h-14 rounded-full border-transparent transition-all", isMuted ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-slate-700 hover:bg-slate-600 text-white")} onClick={() => setIsMuted(!isMuted)}>
                                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                            </Button>

                            {activeCall === 'video' && (
                                <Button variant="outline" size="icon" className={cn("w-14 h-14 rounded-full border-transparent transition-all", isVideoOff ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-slate-700 hover:bg-slate-600 text-white")} onClick={() => setIsVideoOff(!isVideoOff)}>
                                    {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                                </Button>
                            )}

                            <Button variant="outline" size="icon" className={cn("w-14 h-14 rounded-full border-transparent transition-all", isSharingScreen ? "bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-slate-700 hover:bg-slate-600 text-white")} onClick={() => setIsSharingScreen(!isSharingScreen)}>
                                <MonitorUp className="w-6 h-6" />
                            </Button>

                            <Button variant="primary" size="icon" className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 mx-2" onClick={() => {
                                setActiveCall(null);
                                setIsCallMinimized(false);
                                setIsSharingScreen(false);
                                setMessages((prev: any) => [...prev, {
                                    id: 'call-' + Date.now(),
                                    content: `📞 ${activeCall === 'video' ? 'Video' : ''} Llamada finalizada (${formatDuration(callDuration)})`,
                                    direction: 'INTERNAL',
                                    status: 'SENT',
                                    createdAt: new Date(),
                                    senderId: currentUserId
                                }]);
                            }}>
                                <Phone className="w-7 h-7 rotate-[135deg]" />
                            </Button>

                            <Button variant="outline" size="icon" className="w-14 h-14 rounded-full border-transparent bg-slate-700 hover:bg-slate-600 text-white" onClick={() => setShowAddParticipant(true)}>
                                <UserPlus className="w-6 h-6" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Minimized Call Widget (PIP) */}
            <AnimatePresence>
                {activeCall && isCallMinimized && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="absolute bottom-24 right-6 z-50 bg-slate-900 text-white p-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700 cursor-move"
                        drag
                        dragMomentum={false}
                    >
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold">
                                {conversation.lead?.name?.substring(0, 2).toUpperCase() || 'UN'}
                            </div>
                            <div className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full animate-pulse border-2 border-slate-900"></div>
                        </div>
                        <div className="flex flex-col flex-1 min-w-[100px]">
                            <span className="text-sm font-semibold truncate">{conversation.lead?.name || 'Llamada Activa'}</span>
                            <span className="text-xs text-indigo-300 font-mono">{formatDuration(callDuration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-800 text-slate-300" onClick={() => setIsCallMinimized(false)}>
                                <Maximize2 size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" className={cn("h-8 w-8 rounded-full hover:bg-slate-800", isMuted ? "text-red-400" : "text-slate-300")} onClick={() => setIsMuted(!isMuted)}>
                                {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-500/20 text-red-500 bg-red-500/10" onClick={() => {
                                setActiveCall(null);
                                setIsCallMinimized(false);
                            }}>
                                <Phone className="w-4 h-4 rotate-[135deg]" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6"
                style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #f0f4f8 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            >
                {/* Date Separator (Example) */}
                <div className="flex justify-center mb-6">
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">
                        Today
                    </span>
                </div>

                <AnimatePresence initial={false}>
                    {messages.map((msg: any) => {
                        const isMe = msg.direction === 'OUTBOUND';
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                    "flex w-full group",
                                    isMe ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className={cn(
                                    "flex flex-col gap-1 max-w-[85%] md:max-w-[70%]",
                                    isMe ? "items-end" : "items-start"
                                )}>
                                    {!isMe && (
                                        <span className="text-[11px] text-gray-500 ml-1 mb-0.5 font-medium">{conversation.lead?.name?.split(' ')[0]}</span>
                                    )}

                                    <div className={cn(
                                        "px-5 py-3 text-sm shadow-sm relative group transition-all hover:shadow-md",
                                        isMe
                                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-sm"
                                            : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-sm"
                                    )}>
                                        {msg.content.startsWith('🎤 Nota de Voz') ? (
                                            <AudioPlayer durationText={msg.content.split('(')[1]?.replace(')', '') || '0:00'} />
                                        ) : (
                                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        )}

                                        <div className={cn(
                                            "text-[10px] mt-1.5 flex items-center gap-1.5 opacity-80",
                                            isMe ? "justify-end text-blue-100" : "justify-start text-gray-400"
                                        )}>
                                            {format(new Date(msg.createdAt), 'h:mm a')}
                                            {isMe && (
                                                <span>
                                                    {msg.status === 'READ' ? <CheckCheck size={13} className="text-blue-200" /> : <Check size={13} />}
                                                </span>
                                            )}
                                        </div>

                                        {/* Action Hover (Reply/Delete) */}
                                        <div className={cn(
                                            "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1",
                                            isMe ? "-left-16" : "-right-16"
                                        )}>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-white shadow-sm hover:bg-gray-50 border border-gray-100 text-gray-500">
                                                <Reply size={12} />
                                            </Button>
                                            {isAdmin && (
                                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-white shadow-sm hover:bg-red-50 hover:text-red-500 border border-gray-100 text-gray-500" onClick={() => setMessages((prev: any) => prev.filter((m: any) => m.id !== msg.id))}>
                                                    <Trash2 size={12} />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                    {/* Typing Indicator */}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-start w-full"
                        >
                            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.05)] z-20">
                <div className="flex gap-2 items-end max-w-4xl mx-auto">

                    {/* Attachments */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        onChange={(e) => {
                            if (e.target.files) {
                                const newFiles = Array.from(e.target.files).map(f => ({ name: f.name, type: f.type }));
                                setPendingFiles(prev => [...prev, ...newFiles]);
                            }
                        }}
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-11 w-11 shrink-0 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 border-gray-200">
                                <PlusIcon size={20} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48 p-2">
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <ImageIcon size={16} className="text-purple-500" /> Image
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <Paperclip size={16} className="text-blue-500" /> Document
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>


                    {/* Input Container */}
                    <div className={cn(
                        "flex-1 relative border rounded-xl transition-all flex flex-col p-1",
                        isPrivateNote
                            ? "bg-amber-50/50 border-amber-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20"
                            : "bg-gray-50 border-gray-200 hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10"
                    )}>

                        {/* Pending Attachments UI */}
                        {pendingFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2 px-3 pt-2">
                                {pendingFiles.map((file, idx) => (
                                    <div key={idx} className="bg-white border top-2 border-gray-200 rounded-lg px-2 py-1 text-xs flex items-center gap-2 shadow-sm animate-in zoom-in-95">
                                        {file.type.includes('image') ? <ImageIcon size={12} className="text-purple-500" /> : <Paperclip size={12} className="text-blue-500" />}
                                        <span className="max-w-[100px] truncate font-medium text-gray-700">{file.name}</span>
                                        <button className="text-gray-400 hover:text-red-500" onClick={() => setPendingFiles(prev => prev.filter((_, i) => i !== idx))}><X size={12} /></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Private Note Toggle Label */}
                        {isPrivateNote && (
                            <div className="absolute -top-3 left-4 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 shadow-sm z-10 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Internal Note
                            </div>
                        )}

                        {/* Quick Replies Popover */}
                        {showQuickReplies && (
                            <div className="absolute bottom-full left-0 mb-2 z-50">
                                <QuickReplies
                                    query={newItem}
                                    onSelect={handleQuickReplySelect}
                                />
                            </div>
                        )}

                        {/* AI Copilot Action Bar */}
                        <div className="absolute bottom-full right-0 mb-2 z-40 hidden md:flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 p-1.5 rounded-2xl shadow-lg border border-indigo-400">
                            <span className="text-[10px] text-indigo-100 font-bold px-1.5 flex items-center gap-1">
                                <Sparkles size={10} className="text-amber-300" /> COPILOT
                            </span>
                            <div className="w-px h-3 bg-indigo-400/50"></div>
                            <button className="text-[10px] font-medium text-white hover:bg-white/20 px-2 py-0.5 rounded-full transition-colors" onClick={(e) => { e.preventDefault(); toast.success('AI: Resumen copiado al portapapeles'); }}>Resumir Chat</button>
                            <button className="text-[10px] font-medium text-white hover:bg-white/20 px-2 py-0.5 rounded-full transition-colors" onClick={(e) => { e.preventDefault(); toast.loading('IA Mejorando tono...', { duration: 1500 }); setTimeout(() => setNewItem('Hola! Excelente día. ¿En qué puedo apoyarte hoy?'), 1500); }}>Mejorar Tono</button>
                            <button className="text-[10px] font-medium text-white hover:bg-white/20 px-2 py-0.5 rounded-full transition-colors" onClick={(e) => { e.preventDefault(); toast.loading('IA Sugiriendo respuesta...', { duration: 1500 }); setTimeout(() => setNewItem('Te enviaré la información de inmediato.'), 1500); }}>Sugerir Respuesta</button>
                        </div>

                        {/* Audio Recording UI or Textarea */}
                        {isRecording ? (
                            <div className="w-full bg-red-50/80 border border-red-100 rounded-xl py-2.5 px-4 min-h-[44px] flex items-center justify-between shadow-inner">
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-red-500 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                                    <span className="text-red-600 font-mono font-bold text-base">{formatDuration(recordDuration)}</span>
                                    <span className="text-red-500/80 text-sm hidden sm:inline ml-2 font-medium">Grabando audio...</span>
                                </div>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-100/50 h-8 font-semibold" onClick={() => { setIsRecording(false); setRecordDuration(0); toast.info('Grabación cancelada'); }}>
                                    Cancelar
                                </Button>
                            </div>
                        ) : (
                            <textarea
                                ref={textareaRef}
                                value={newItem}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setNewItem(val);
                                    if (val.endsWith('/')) setShowQuickReplies(true);
                                    else if (!val.includes('/')) setShowQuickReplies(false); // simple check
                                    adjustHeight();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Type your message..."
                                className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none py-3 px-3 min-h-[44px] max-h-32 text-gray-800 placeholder:text-gray-400"
                                rows={1}
                            />
                        )}

                        {/* Rich Text Toolbar (Phase 3) */}
                        <div className="flex pb-2 pr-1 gap-1 items-center border-t border-gray-100 pt-1 mx-2">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-800 rounded">
                                <span className="font-bold text-xs">B</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-800 rounded">
                                <span className="italic text-xs font-serif">I</span>
                            </Button>
                            <div className="w-px h-3 bg-gray-200 mx-1"></div>

                            {/* Private Note Toggle */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsPrivateNote(!isPrivateNote)}
                                className={cn(
                                    "h-6 px-2 text-[10px] font-bold rounded transiton-colors",
                                    isPrivateNote ? "bg-amber-200 text-amber-900 hover:bg-amber-300" : "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                                )}
                            >
                                /Note
                            </Button>

                            <div className="flex-1"></div>

                            {/* Voice Note Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setIsRecording(!isRecording);
                                    if (!isRecording) toast.success('Grabando nota de voz...');
                                    else toast.info('Grabación cancelada');
                                }}
                                className={cn(
                                    "h-8 w-8 rounded-lg transition-all",
                                    isRecording ? "text-red-500 bg-red-50 animate-pulse" : "text-gray-400 hover:text-red-500"
                                )}
                            >
                                <Mic size={isRecording ? 20 : 18} />
                            </Button>
                        </div>
                    </div>

                    <div className="flex shadow-md rounded-xl">
                        <Button
                            onClick={handleSend}
                            disabled={(!newItem.trim() && !isRecording && pendingFiles.length === 0) || isSending}
                            className={cn(
                                "h-11 px-4 shrink-0 rounded-l-xl rounded-r-none transition-all border-r border-white/20",
                                (newItem.trim() || isRecording || pendingFiles.length > 0)
                                    ? (isPrivateNote ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white")
                                    : "bg-gray-100 text-gray-300 shadow-none"
                            )}
                        >
                            <Send size={18} className={cn("transition-transform", (newItem.trim() || isRecording || pendingFiles.length > 0) ? "translate-x-0.5 mr-1" : "")} />
                            <span className="font-semibold text-sm">{isPrivateNote ? 'Save' : 'Send'}</span>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    disabled={(!newItem.trim() && !isRecording && pendingFiles.length === 0) || isSending}
                                    className={cn(
                                        "h-11 w-8 px-0 shrink-0 rounded-l-none rounded-r-xl transition-all shadow-none",
                                        (newItem.trim() || isRecording || pendingFiles.length > 0)
                                            ? (isPrivateNote ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white")
                                            : "bg-gray-100 text-gray-300 shadow-none border-l border-gray-200"
                                    )}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem className="gap-2" onClick={() => setShowSendLaterModal(true)}><Clock size={14} className="text-blue-500" /> Send Later...</DropdownMenuItem>
                                <DropdownMenuItem className="gap-2" onClick={() => {
                                    handleSend();
                                    handleCloseDeal();
                                    updateConversationStatus(conversation.id, 'CLOSED');
                                }}><CheckCheck size={14} className="text-green-500" /> Send & Mark Resolved</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="text-[10px] text-center text-gray-400 mt-2 font-medium">
                    Powered by <span className="text-indigo-500">LegacyMark OmniChannel</span>
                </div>
            </div>

            {/* Send Later Modal Simulation */}
            {showSendLaterModal && (
                <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50 text-blue-900">
                            <h3 className="font-bold flex items-center gap-2"><Clock size={16} /> Schedule Message</h3>
                            <button onClick={() => setShowSendLaterModal(false)} className="text-blue-400 hover:text-blue-600"><X size={16} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500">Select Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full border-gray-200 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={sendLaterDate}
                                    onChange={(e) => setSendLaterDate(e.target.value)}
                                />
                            </div>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => {
                                if (!sendLaterDate) {
                                    toast.error('Please select a date');
                                    return;
                                }
                                toast.success(`Message scheduled for ${new Date(sendLaterDate).toLocaleString()}`);
                                setShowSendLaterModal(false);
                                setNewItem('');
                                setPendingFiles([]);
                            }}>Schedule Send</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Participant Modal Simulation */}
            {showAddParticipant && (
                <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-indigo-50 text-indigo-900">
                            <h3 className="font-bold flex items-center gap-2"><UserPlus size={16} /> Añadir Participante</h3>
                            <button onClick={() => setShowAddParticipant(false)} className="text-indigo-400 hover:text-indigo-600"><X size={16} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500">Nombre o Correo del Agente</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Juan Pérez"
                                    className="w-full border-gray-200 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    value={newParticipant}
                                    onChange={(e) => setNewParticipant(e.target.value)}
                                />
                            </div>
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                                if (!newParticipant) {
                                    toast.error('Ingresa un nombre');
                                    return;
                                }
                                toast.success(`${newParticipant} invocado a la llamada`);
                                setShowAddParticipant(false);
                                setNewParticipant('');
                            }}>Invitar a la llamada</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function PlusIcon({ size, className }: any) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 5v14M5 12h14" />
        </svg>
    );
}
