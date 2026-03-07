'use client';

import { useCampaignWizard } from './wizard-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Link2, Trash2, ExternalLink } from 'lucide-react';
import Image from 'next/image';

const PLATFORM_ICON: Record<string, string> = {
    FACEBOOK_ADS: '📘',
    GOOGLE_ADS: '🔍',
    TIKTOK_ADS: '🎵',
    LINKEDIN_ADS: '💼',
};

const UTM_SOURCE_MAP: Record<string, string> = {
    FACEBOOK_ADS: 'facebook',
    GOOGLE_ADS: 'google',
    TIKTOK_ADS: 'tiktok',
    LINKEDIN_ADS: 'linkedin',
};

export function StepCreative() {
    const { platforms, creative, name, setCreative, addAssetUrl, removeAssetUrl, nextStep, prevStep } =
        useCampaignWizard();

    // Auto-generate UTM params based on campaign name and platforms
    function generateUTMs() {
        const utmCampaign = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const primaryPlatform = platforms[0];
        setCreative({
            utmConfig: {
                source: UTM_SOURCE_MAP[primaryPlatform] ?? 'paid',
                medium: 'cpc',
                campaign: utmCampaign || 'campaign',
            },
        });
    }

    const destinationWithUtm = creative.destinationUrl
        ? `${creative.destinationUrl}?utm_source=${creative.utmConfig.source}&utm_medium=${creative.utmConfig.medium}&utm_campaign=${creative.utmConfig.campaign}${creative.utmConfig.content ? `&utm_content=${creative.utmConfig.content}` : ''}`
        : '';

    const canContinue = creative.headline && creative.destinationUrl;

    return (
        <div className="space-y-8">
            {/* Asset Upload */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-300">Creativos (Imágenes / Videos)</Label>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-violet-500/40 transition-colors">
                    <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Arrastra archivos aquí, o ingresa una URL de asset</p>
                    <div className="flex gap-2 mt-4 max-w-md mx-auto">
                        <Input
                            id="asset-url-input"
                            placeholder="https://cdn.example.com/imagen.jpg"
                            className="bg-white/5 border-white/10 text-white h-10 text-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    addAssetUrl((e.target as HTMLInputElement).value);
                                    (e.target as HTMLInputElement).value = '';
                                }
                            }}
                        />
                        <Button
                            type="button"
                            id="add-asset-url"
                            variant="outline"
                            onClick={(e) => {
                                const input = document.getElementById('asset-url-input') as HTMLInputElement;
                                if (input?.value) { addAssetUrl(input.value); input.value = ''; }
                            }}
                            className="h-10 border-white/10 text-gray-300 hover:bg-white/5"
                        >
                            <Link2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Asset Previews */}
                {creative.assetUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                        {creative.assetUrls.map((url) => (
                            <div key={url} className="relative group rounded-lg overflow-hidden bg-white/5 border border-white/10">
                                <div className="aspect-video relative">
                                    <Image src={url} alt="Asset preview" fill className="object-cover" unoptimized />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeAssetUrl(url)}
                                    className="absolute top-1 right-1 bg-red-500/80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-3 h-3 text-white" />
                                </button>
                                <div className="absolute bottom-1 left-1 flex gap-1">
                                    {platforms.map((p) => (
                                        <span key={p} className="text-xs" title={p}>{PLATFORM_ICON[p]}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Ad Copy */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="ad-headline" className="text-sm font-semibold text-gray-300">
                        Titular <span className="text-red-400">*</span>
                    </Label>
                    <Input
                        id="ad-headline"
                        value={creative.headline ?? ''}
                        onChange={(e) => setCreative({ headline: e.target.value })}
                        placeholder="Ej: Transforma tu negocio hoy"
                        maxLength={40}
                        className="bg-white/5 border-white/10 text-white h-11"
                    />
                    <p className="text-xs text-gray-600 text-right">{creative.headline?.length ?? 0}/40</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ad-cta" className="text-sm font-semibold text-gray-300">Call to Action</Label>
                    <Input
                        id="ad-cta"
                        value={creative.callToAction ?? ''}
                        onChange={(e) => setCreative({ callToAction: e.target.value })}
                        placeholder="Ej: Saber más, Contactar, Empezar"
                        className="bg-white/5 border-white/10 text-white h-11"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="ad-description" className="text-sm font-semibold text-gray-300">Descripción / Texto Principal</Label>
                <Textarea
                    id="ad-description"
                    value={creative.description ?? ''}
                    onChange={(e) => setCreative({ description: e.target.value })}
                    placeholder="Describe tu propuesta de valor..."
                    maxLength={125}
                    className="bg-white/5 border-white/10 text-white resize-none min-h-[80px]"
                />
                <p className="text-xs text-gray-600 text-right">{creative.description?.length ?? 0}/125</p>
            </div>

            {/* Destination URL + UTMs */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-gray-300">
                        URL de Destino <span className="text-red-400">*</span>
                    </Label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={generateUTMs}
                        className="text-xs text-violet-400 hover:text-violet-300 h-auto py-1"
                    >
                        ✨ Auto-generar UTMs
                    </Button>
                </div>
                <Input
                    id="destination-url"
                    value={creative.destinationUrl ?? ''}
                    onChange={(e) => setCreative({ destinationUrl: e.target.value })}
                    placeholder="https://tudominio.com/landing"
                    className="bg-white/5 border-white/10 text-white h-11"
                />

                <div className="grid grid-cols-2 gap-3">
                    {(['source', 'medium', 'campaign', 'content'] as const).map((key) => (
                        <div key={key} className="space-y-1">
                            <Label className="text-xs text-gray-500">utm_{key}</Label>
                            <Input
                                value={creative.utmConfig[key] ?? ''}
                                onChange={(e) => setCreative({ utmConfig: { ...creative.utmConfig, [key]: e.target.value } })}
                                className="bg-white/5 border-white/10 text-white h-9 text-sm"
                            />
                        </div>
                    ))}
                </div>

                {destinationWithUtm && (
                    <div className="flex items-start gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <ExternalLink className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-emerald-300 break-all">{destinationWithUtm}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={prevStep} className="text-gray-400 hover:text-white">
                    ← Atrás
                </Button>
                <Button
                    id="wizard-next-step-4"
                    onClick={nextStep}
                    disabled={!canContinue}
                    className="bg-violet-600 hover:bg-violet-500 text-white px-8 h-11 disabled:opacity-40"
                >
                    Validar →
                </Button>
            </div>
        </div>
    );
}
