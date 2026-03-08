'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ─── PLATFORM MOCKUP DEFINITIONS ─────────────────────────────────────────────

type Platform = 'FACEBOOK_FEED' | 'INSTAGRAM_STORY' | 'TIKTOK_FEED' | 'LINKEDIN_FEED' | 'GOOGLE_DISPLAY';

interface MockupConfig {
    label: string;
    icon: string;
    containerClass: string;
    imageClass: string;
    aspectRatio: string;
    overlayElement: React.ReactNode;
}

function FacebookMockup({ imageUrl, headline, description }: { imageUrl?: string; headline?: string; description?: string }) {
    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-2xl w-80 font-sans">
            {/* Header */}
            <div className="flex items-center gap-2 p-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">M</div>
                <div>
                    <p className="text-xs font-semibold text-gray-900">Tu Empresa</p>
                    <p className="text-[10px] text-gray-400">Publicidad · 🌐</p>
                </div>
            </div>
            {/* Post text */}
            {description && <p className="px-3 pb-2 text-xs text-gray-700 line-clamp-2">{description}</p>}
            {/* Image */}
            <div className="relative aspect-square bg-gray-100">
                {imageUrl ? <Image src={imageUrl} alt="Ad preview" fill className="object-cover" unoptimized /> : <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-indigo-600" />}
            </div>
            {/* Footer */}
            <div className="p-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-[10px] text-gray-400 uppercase">tudominio.com</p>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{headline ?? 'Tu titular aquí'}</p>
                </div>
                <button className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded font-semibold whitespace-nowrap">Más info</button>
            </div>
        </div>
    );
}

function InstagramStoryMockup({ imageUrl, callToAction }: { imageUrl?: string; callToAction?: string }) {
    return (
        <div className="relative w-64 bg-black rounded-3xl overflow-hidden shadow-2xl" style={{ aspectRatio: '9/16' }}>
            {imageUrl ? (
                <Image src={imageUrl} alt="Story preview" fill className="object-cover" unoptimized />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-violet-700 to-pink-600" />
            )}
            {/* UI Elements */}
            <div className="absolute top-4 left-4 right-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-pink-500 flex-shrink-0" />
                <span className="text-white text-xs font-semibold">Tu Empresa</span>
                <span className="ml-auto text-white text-[10px] opacity-70">Publicidad</span>
            </div>
            <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white text-xs">↑</span>
                </div>
                <span className="text-white text-xs font-medium">{callToAction ?? 'Ver más'}</span>
            </div>
        </div>
    );
}

function TikTokMockup({ imageUrl, headline }: { imageUrl?: string; headline?: string }) {
    return (
        <div className="relative w-64 bg-black rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '9/16' }}>
            {imageUrl ? (
                <Image src={imageUrl} alt="TikTok preview" fill className="object-cover" unoptimized />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
            )}
            {/* Side Actions */}
            <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4">
                {['❤️', '💬', '↗️', '⊕'].map((icon, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <span className="text-lg">{icon}</span>
                        <span className="text-white text-[9px]">{['2.4K', '183', '48', ''][i]}</span>
                    </div>
                ))}
            </div>
            {/* Bottom */}
            <div className="absolute bottom-4 left-3 right-14">
                <p className="text-white text-[10px] font-semibold mb-1">@tuempresa · Publicidad</p>
                <p className="text-white text-xs line-clamp-2 leading-snug">{headline ?? 'Tu mensaje aquí'}</p>
            </div>
            {/* PATROCINADO badge */}
            <div className="absolute top-4 left-3">
                <span className="bg-white/20 text-white text-[9px] px-2 py-0.5 rounded-full">Patrocinado</span>
            </div>
        </div>
    );
}

function LinkedInMockup({ imageUrl, headline }: { imageUrl?: string; headline?: string }) {
    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-2xl w-80 font-sans">
            <div className="flex items-center gap-2 p-3">
                <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-white text-sm font-bold">T</div>
                <div>
                    <p className="text-sm font-semibold text-gray-900">Tu Empresa</p>
                    <p className="text-[10px] text-gray-400">Publicidad · 20.000 seguidores</p>
                </div>
            </div>
            <div className="relative aspect-video bg-gray-100">
                {imageUrl ? <Image src={imageUrl} alt="LinkedIn preview" fill className="object-cover" unoptimized /> : <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-900" />}
            </div>
            <div className="p-3">
                <p className="text-sm font-semibold text-gray-900 line-clamp-2">{headline ?? 'Tu titular profesional aquí'}</p>
                <button className="mt-2 border border-blue-600 text-blue-600 text-xs px-4 py-1.5 rounded-full font-semibold hover:bg-blue-50">Más información</button>
            </div>
        </div>
    );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

interface PlatformPreviewProps {
    imageUrl?: string;
    videoUrl?: string;
    headline?: string;
    description?: string;
    callToAction?: string;
}

const PLATFORMS: { key: Platform; label: string; icon: string }[] = [
    { key: 'FACEBOOK_FEED', label: 'Meta Feed', icon: '📘' },
    { key: 'INSTAGRAM_STORY', label: 'Story/Reel', icon: '📸' },
    { key: 'TIKTOK_FEED', label: 'TikTok', icon: '🎵' },
    { key: 'LINKEDIN_FEED', label: 'LinkedIn', icon: '💼' },
];

export function PlatformPreview({ imageUrl, headline, description, callToAction }: PlatformPreviewProps) {
    const [platform, setPlatform] = useState<Platform>('FACEBOOK_FEED');

    return (
        <div className="space-y-4">
            {/* Platform selector */}
            <div className="flex gap-2 justify-center flex-wrap">
                {PLATFORMS.map((p) => (
                    <button key={p.key} type="button" onClick={() => setPlatform(p.key)}
                        className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5',
                            platform === p.key ? 'border-violet-500 bg-violet-500/20 text-violet-300' : 'border-white/10 text-gray-400 hover:border-white/20')}>
                        <span>{p.icon}</span> {p.label}
                    </button>
                ))}
            </div>

            {/* Mockup */}
            <div className="flex justify-center py-4">
                {platform === 'FACEBOOK_FEED' && <FacebookMockup imageUrl={imageUrl} headline={headline} description={description} />}
                {platform === 'INSTAGRAM_STORY' && <InstagramStoryMockup imageUrl={imageUrl} callToAction={callToAction} />}
                {platform === 'TIKTOK_FEED' && <TikTokMockup imageUrl={imageUrl} headline={headline} />}
                {platform === 'LINKEDIN_FEED' && <LinkedInMockup imageUrl={imageUrl} headline={headline} />}
            </div>

            {/* Note */}
            <p className="text-center text-xs text-gray-600">Preview aproximado. Dimensiones finales validadas al lanzar.</p>
        </div>
    );
}
