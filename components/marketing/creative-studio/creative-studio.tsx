'use client';

import { useState } from 'react';
import { ImageGenerator } from './image-generator';
import { VideoGenerator } from './video-generator';
import { CopyGenerator } from './copy-generator';
import { LayerEditor } from './layer-editor';
import { AssetGallery } from './asset-gallery';
import { PlatformPreview } from './platform-preview';
import { BrandKitPanel } from './brand-kit-panel';
import { ABTestDashboard } from './ab-test-dashboard';
import { CreativeInsights } from './creative-insights';
import { DriveImporter } from './drive-importer';
import { useCampaignWizard } from '@/components/marketing/campaign-wizard/wizard-store';
import {
    Sparkles, Upload, Layers, Eye, Image as ImageIcon, Video, Type,
    ChevronRight, Wand2, Palette, BarChart3, TrendingUp, FolderOpen,
    FlaskConical
} from 'lucide-react';
import { cn } from '@/lib/utils';

type MainTab = 'AI' | 'MANUAL' | 'LAYER' | 'PREVIEW' | 'BRAND' | 'ABTEST' | 'INSIGHTS';
type AISubTab = 'IMAGE' | 'VIDEO' | 'COPY';

interface CreativeStudioProps {
    campaignId?: string;
    abTestId?: string;
}

export function CreativeStudio({ campaignId, abTestId }: CreativeStudioProps) {
    const [mainTab, setMainTab] = useState<MainTab>('AI');
    const [aiSubTab, setAISubTab] = useState<AISubTab>('IMAGE');
    const [previewImageUrl, setPreviewImageUrl] = useState<string | undefined>();
    const [previewHeadline, setPreviewHeadline] = useState<string | undefined>();
    const [layerBaseImage, setLayerBaseImage] = useState<string | undefined>();

    const { creative, platforms } = useCampaignWizard();
    const wizardAssets = creative.assetUrls;
    const primaryPlatform = platforms[0] ?? 'FACEBOOK_ADS';

    function handleImageGenerated(url: string) {
        setPreviewImageUrl(url);
        setLayerBaseImage(url);
    }

    function handleCopyApplied(_platform: string, copy: Record<string, unknown>) {
        setPreviewHeadline(String(copy.headline ?? copy.intro ?? ''));
    }

    const MAIN_TABS = [
        { key: 'AI' as const, icon: <Sparkles className="w-4 h-4" />, label: 'Generación IA' },
        { key: 'MANUAL' as const, icon: <Upload className="w-4 h-4" />, label: 'Galería / Upload' },
        { key: 'LAYER' as const, icon: <Layers className="w-4 h-4" />, label: 'Editor de Capas' },
        { key: 'PREVIEW' as const, icon: <Eye className="w-4 h-4" />, label: 'Preview' },
        { key: 'BRAND' as const, icon: <Palette className="w-4 h-4" />, label: 'Brand Kit' },
        { key: 'ABTEST' as const, icon: <FlaskConical className="w-4 h-4" />, label: 'A/B Tests' },
        { key: 'INSIGHTS' as const, icon: <TrendingUp className="w-4 h-4" />, label: 'Insights' },
    ];

    const AI_SUBTABS = [
        { key: 'IMAGE' as const, icon: <ImageIcon className="w-3.5 h-3.5" />, label: 'Imagen' },
        { key: 'VIDEO' as const, icon: <Video className="w-3.5 h-3.5" />, label: 'Video' },
        { key: 'COPY' as const, icon: <Type className="w-3.5 h-3.5" />, label: 'Copywriting' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a12] text-white">
            {/* ── Header ── */}
            <div className="border-b border-white/8 bg-[#0d0d1a]/80 backdrop-blur-xl sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                            <Wand2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight">Creative Studio</h1>
                            <p className="text-xs text-gray-500">Powered by Gemini Imagen 3 + Veo 2</p>
                        </div>
                    </div>
                    {campaignId && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Vinculado a campaña
                            {wizardAssets.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded-full">
                                    {wizardAssets.length} assets añadidos
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Main tabs — scrollable on small screens */}
                <div className="max-w-7xl mx-auto px-6 flex gap-0 overflow-x-auto pb-0 scrollbar-hide">
                    {MAIN_TABS.map((tab) => (
                        <button key={tab.key} id={`creative-tab-${tab.key.toLowerCase()}`} type="button"
                            onClick={() => setMainTab(tab.key)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all shrink-0',
                                mainTab === tab.key
                                    ? 'border-violet-500 text-violet-300'
                                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-white/20'
                            )}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* ── AI Generation ── */}
                {mainTab === 'AI' && (
                    <div className="space-y-6">
                        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 gap-1 max-w-sm">
                            {AI_SUBTABS.map((sub) => (
                                <button key={sub.key} id={`ai-subtab-${sub.key.toLowerCase()}`} type="button"
                                    onClick={() => setAISubTab(sub.key)}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
                                        aiSubTab === sub.key ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30' : 'text-gray-400 hover:text-gray-200'
                                    )}>
                                    {sub.icon} {sub.label}
                                </button>
                            ))}
                        </div>

                        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
                            {aiSubTab === 'IMAGE' && (
                                <>
                                    <div className="flex items-center gap-2 mb-6">
                                        <ImageIcon className="w-5 h-5 text-violet-400" />
                                        <h2 className="font-semibold text-white">Generación de Imagen</h2>
                                        <span className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/30">Gemini Imagen 3</span>
                                    </div>
                                    <ImageGenerator campaignId={campaignId} onAssetGenerated={handleImageGenerated} />
                                </>
                            )}
                            {aiSubTab === 'VIDEO' && (
                                <>
                                    <div className="flex items-center gap-2 mb-6">
                                        <Video className="w-5 h-5 text-pink-400" />
                                        <h2 className="font-semibold text-white">Generación de Video</h2>
                                        <span className="text-xs px-2 py-0.5 bg-pink-500/20 text-pink-300 rounded-full border border-pink-500/30">Veo 2</span>
                                    </div>
                                    <VideoGenerator campaignId={campaignId} platform={primaryPlatform} />
                                </>
                            )}
                            {aiSubTab === 'COPY' && (
                                <>
                                    <div className="flex items-center gap-2 mb-6">
                                        <Type className="w-5 h-5 text-emerald-400" />
                                        <h2 className="font-semibold text-white">Generador de Copy</h2>
                                        <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">Gemini Flash</span>
                                    </div>
                                    <CopyGenerator campaignId={campaignId} defaultPlatform={primaryPlatform} onCopyApplied={handleCopyApplied} />
                                </>
                            )}
                        </div>

                        {previewImageUrl && (
                            <button type="button" onClick={() => setMainTab('PREVIEW')}
                                className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors group">
                                <Eye className="w-4 h-4" /> Ver preview en plataforma
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>
                )}

                {/* ── Gallery / Upload ── */}
                {mainTab === 'MANUAL' && (
                    <div className="space-y-6">
                        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Upload className="w-5 h-5 text-blue-400" />
                                <h2 className="font-semibold text-white">Galería de Assets</h2>
                            </div>
                            <AssetGallery campaignId={campaignId}
                                onAssetSelected={(asset) => { setPreviewImageUrl(asset.url); setLayerBaseImage(asset.url); }}
                                showUpload={!!campaignId} />
                        </div>

                        {/* Google Drive importer */}
                        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <FolderOpen className="w-5 h-5 text-yellow-400" />
                                <h2 className="font-semibold text-white">Importar desde Google Drive / URL</h2>
                            </div>
                            <DriveImporter onImport={(urls) => urls.forEach((url) => setPreviewImageUrl(url))} />
                        </div>
                    </div>
                )}

                {/* ── Layer Editor ── */}
                {mainTab === 'LAYER' && (
                    <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Layers className="w-5 h-5 text-orange-400" />
                            <h2 className="font-semibold text-white">Editor de Capas</h2>
                            <span className="text-xs text-gray-500">Logo · CTA · Texto Legal · Overlays</span>
                        </div>
                        {!layerBaseImage && (
                            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                <p className="text-amber-300 text-xs">💡 Genera o selecciona una imagen primero como base del editor.</p>
                            </div>
                        )}
                        <LayerEditor baseImageUrl={layerBaseImage} onExport={(dataUrl) => setPreviewImageUrl(dataUrl)} />
                    </div>
                )}

                {/* ── Preview ── */}
                {mainTab === 'PREVIEW' && (
                    <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Eye className="w-5 h-5 text-cyan-400" />
                            <h2 className="font-semibold text-white">Preview Interactivo en Plataforma</h2>
                            <span className="text-xs px-2 py-0.5 bg-cyan-500/15 text-cyan-400 rounded-full border border-cyan-500/20">Animado</span>
                        </div>
                        {!previewImageUrl && (
                            <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <p className="text-blue-300 text-sm">Genera una imagen con IA o selecciona un asset de la galería.</p>
                            </div>
                        )}
                        <PlatformPreview imageUrl={previewImageUrl} headline={previewHeadline} />
                    </div>
                )}

                {/* ── Brand Kit ── */}
                {mainTab === 'BRAND' && (
                    <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
                        <BrandKitPanel onSaved={() => null} />
                    </div>
                )}

                {/* ── A/B Tests ── */}
                {mainTab === 'ABTEST' && (
                    <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <FlaskConical className="w-5 h-5 text-violet-400" />
                            <h2 className="font-semibold text-white">Dashboard A/B Tests</h2>
                        </div>
                        {abTestId ? (
                            <ABTestDashboard abTestId={abTestId} />
                        ) : (
                            <div className="text-center py-16">
                                <FlaskConical className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">Selecciona un A/B Test para ver sus métricas.</p>
                                <p className="text-gray-600 text-xs mt-1">
                                    Crea tests desde la galería de assets seleccionando 2+ creativos.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Insights ── */}
                {mainTab === 'INSIGHTS' && (
                    <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
                        <CreativeInsights />
                    </div>
                )}
            </div>
        </div>
    );
}
