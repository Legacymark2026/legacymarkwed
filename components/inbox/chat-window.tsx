'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Send, Paperclip, Smile, Image as ImageIcon,
    Phone, Video, MoreHorizontal, Check, CheckCheck,
    Reply, Forward, Trash2, Copy, Clock, Sparkles, Download, Timer
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
import { Mic, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

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

    const [showBackgroundAlert, setShowBackgroundAlert] = useState(false);

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
        const content = isRecording ? "🎤 Voice Message (0:14)" : newItem;

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

                    <Button variant="ghost" size="icon" className="hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors hidden sm:flex" onClick={() => toast.info('Starting voice call...')}>
                        <Phone size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors hidden sm:flex" onClick={() => toast.info('Starting video call...')}>
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
                                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

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
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-white shadow-sm hover:bg-gray-50 border border-gray-100 text-gray-500">
                                                <Trash2 size={12} />
                                            </Button>
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-11 w-11 shrink-0 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 border-gray-200">
                                <PlusIcon size={20} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48 p-2">
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                                <ImageIcon size={16} className="text-purple-500" /> Image
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                                <Paperclip size={16} className="text-blue-500" /> Document
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>


                    {/* Input Container */}
                    <div className={cn(
                        "flex-1 relative border rounded-xl transition-all flex items-end p-1",
                        isPrivateNote
                            ? "bg-amber-50/50 border-amber-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20"
                            : "bg-gray-50 border-gray-200 hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10"
                    )}>

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
                            disabled={(!newItem.trim() && !isRecording) || isSending}
                            className={cn(
                                "h-11 px-4 shrink-0 rounded-l-xl rounded-r-none transition-all border-r border-white/20",
                                (newItem.trim() || isRecording)
                                    ? (isPrivateNote ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white")
                                    : "bg-gray-100 text-gray-300 shadow-none"
                            )}
                        >
                            <Send size={18} className={cn("transition-transform", (newItem.trim() || isRecording) ? "translate-x-0.5 mr-1" : "")} />
                            <span className="font-semibold text-sm">{isPrivateNote ? 'Save' : 'Send'}</span>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    disabled={(!newItem.trim() && !isRecording) || isSending}
                                    className={cn(
                                        "h-11 w-8 px-0 shrink-0 rounded-l-none rounded-r-xl transition-all shadow-none",
                                        (newItem.trim() || isRecording)
                                            ? (isPrivateNote ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white")
                                            : "bg-gray-100 text-gray-300 shadow-none border-l border-gray-200"
                                    )}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem className="gap-2"><Clock size={14} className="text-blue-500" /> Send Later...</DropdownMenuItem>
                                <DropdownMenuItem className="gap-2"><CheckCheck size={14} className="text-green-500" /> Send & Mark Resolved</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="text-[10px] text-center text-gray-400 mt-2 font-medium">
                    Powered by <span className="text-indigo-500">LegacyMark OmniChannel</span>
                </div>
            </div>
        </div >
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
    )
}
