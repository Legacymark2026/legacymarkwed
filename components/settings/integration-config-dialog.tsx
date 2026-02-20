'use client';

// ... imports provided in previous view_file ... 
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Settings,
    Loader2,
    Eye,
    EyeOff,
    Check,
    Key,
    Lock,
    Hash,
    Copy,
    Info,
    Smartphone,
    Globe,
    Shield,
    Activity
} from "lucide-react";
import { getIntegrationConfig, updateIntegrationConfig, IntegrationConfigData } from "@/actions/integration-config";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface IntegrationConfigDialogProps {
    provider: 'facebook' | 'whatsapp' | 'instagram' | 'google-analytics' | 'google-tag-manager' | 'facebook-pixel' | 'hotjar';
    title: string;
}

export function IntegrationConfigDialog({ provider, title }: IntegrationConfigDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState<IntegrationConfigData>({});

    // Visibility toggles
    const [showToken, setShowToken] = useState(false);
    const [showPageToken, setShowPageToken] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [showPrivateKey, setShowPrivateKey] = useState(false);

    // Brand Colors & Gradients
    const isWhatsapp = provider === 'whatsapp';
    const isGoogle = provider === 'google-analytics' || provider === 'google-tag-manager';
    const isMeta = provider === 'facebook' || provider === 'instagram' || provider === 'facebook-pixel';
    const isHotjar = provider === 'hotjar';

    let brandColor = 'text-gray-600';
    let brandBg = 'bg-gray-50';
    let brandBorder = 'border-gray-100';
    let brandRing = 'focus-visible:ring-gray-500';
    let brandGradient = 'bg-gradient-to-r from-gray-50 via-gray-100 to-white';

    if (isWhatsapp) {
        brandColor = 'text-emerald-600';
        brandBg = 'bg-emerald-50';
        brandBorder = 'border-emerald-100';
        brandRing = 'focus-visible:ring-emerald-500';
        brandGradient = 'bg-gradient-to-r from-emerald-50 via-green-50 to-white';
    } else if (isGoogle) {
        brandColor = provider === 'google-tag-manager' ? 'text-blue-600' : 'text-orange-600';
        brandBg = provider === 'google-tag-manager' ? 'bg-blue-50' : 'bg-orange-50';
        brandBorder = provider === 'google-tag-manager' ? 'border-blue-100' : 'border-orange-100';
        brandRing = provider === 'google-tag-manager' ? 'focus-visible:ring-blue-500' : 'focus-visible:ring-orange-500';
        brandGradient = provider === 'google-tag-manager'
            ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-white'
            : 'bg-gradient-to-r from-orange-50 via-amber-50 to-white';
    } else if (isMeta) {
        brandColor = 'text-blue-600';
        brandBg = 'bg-blue-50';
        brandBorder = 'border-blue-100';
        brandRing = 'focus-visible:ring-blue-500';
        brandGradient = 'bg-gradient-to-r from-blue-50 via-indigo-50 to-white';
    } else if (isHotjar) {
        brandColor = 'text-rose-600';
        brandBg = 'bg-rose-50';
        brandBorder = 'border-rose-100';
        brandRing = 'focus-visible:ring-rose-500';
        brandGradient = 'bg-gradient-to-r from-rose-50 via-red-50 to-white';
    }

    useEffect(() => {
        if (open) {
            setLoading(true);
            setSuccess(false);
            getIntegrationConfig(provider)
                .then(data => {
                    if (data) setFormData(data);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [open, provider]);

    const handleChange = (field: keyof IntegrationConfigData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateIntegrationConfig(provider, formData);
            setSuccess(true);
            toast.success(`${title} configuration saved successfully`);
            setTimeout(() => {
                setOpen(false);
                setSuccess(false);
            }, 1000);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save configuration");
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = (text?: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className={cn("gap-2 border transition-all hover:bg-opacity-100", brandBg, brandBorder, "bg-opacity-50")}>
                    <Settings className={cn("h-4 w-4", brandColor)} />
                    <span className={cn("font-medium", brandColor)}>Configure</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white/80 backdrop-blur-xl border border-gray-200 shadow-2xl">
                {/* Header with Brand Gradient */}
                <div className={cn("px-6 py-6 border-b", brandGradient)}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl font-bold tracking-tight text-gray-900">
                            <div className={cn("p-2 rounded-xl bg-white shadow-sm ring-1 ring-inset", brandBorder)}>
                                {isWhatsapp ? <Smartphone className={cn("h-6 w-6", brandColor)} /> :
                                    isGoogle ? <Globe className={cn("h-6 w-6", brandColor)} /> :
                                        isHotjar ? <Activity className={cn("h-6 w-6", brandColor)} /> :
                                            <Globe className={cn("h-6 w-6", brandColor)} />}
                            </div>
                            Configure {title}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 mt-1.5 flex items-center gap-1.5">
                            <Shield className="h-3 w-3" /> Securely manage API credentials
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className={cn("h-10 w-10 animate-spin", brandColor)} />
                            <p className="text-sm text-gray-400 font-medium">Loading credentials...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Provider Specific Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Hash className="h-3 w-3" />
                                        Identity & Access
                                    </h4>
                                    <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 pointer-events-none">
                                        Required
                                    </Badge>
                                </div>

                                {provider === 'google-analytics' ? (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="propertyId" className="text-xs font-semibold text-gray-700">
                                                GA4 Property ID
                                            </Label>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="propertyId"
                                                    value={formData.propertyId || ''}
                                                    onChange={e => handleChange('propertyId', e.target.value)}
                                                    className={cn("pl-9 h-10 transition-all bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white focus:bg-white", brandRing)}
                                                    placeholder="e.g., 345678901"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="clientEmail" className="text-xs font-semibold text-gray-700">
                                                Service Account Email
                                            </Label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="clientEmail"
                                                    value={formData.clientEmail || ''}
                                                    onChange={e => handleChange('clientEmail', e.target.value)}
                                                    className={cn("pl-9 h-10 transition-all bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white focus:bg-white", brandRing)}
                                                    placeholder="service-account@project.iam.gserviceaccount.com"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="privateKey" className="text-xs font-semibold text-gray-700">
                                                Private Key
                                            </Label>
                                            <div className="relative group">
                                                <Key className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-hover:text-gray-500 transition-colors" />
                                                <Input
                                                    id="privateKey"
                                                    type={showPrivateKey ? "text" : "password"}
                                                    value={formData.privateKey || ''}
                                                    onChange={e => handleChange('privateKey', e.target.value)}
                                                    className={cn("pl-9 pr-20 h-10 transition-all bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white font-mono text-xs focus:bg-white", brandRing)}
                                                    placeholder="-----BEGIN PRIVATE KEY-----..."
                                                />
                                                <div className="absolute right-2 top-2 flex gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-gray-400 hover:text-gray-600 rounded-md"
                                                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                                                    >
                                                        {showPrivateKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : provider === 'google-tag-manager' ? (
                                    <div className="grid gap-2">
                                        <Label htmlFor="containerId" className="text-xs font-semibold text-gray-700">
                                            GTM Container ID
                                        </Label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="containerId"
                                                value={formData.containerId || ''}
                                                onChange={e => handleChange('containerId', e.target.value)}
                                                className={cn("pl-9 h-10 transition-all bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white focus:bg-white", brandRing)}
                                                placeholder="e.g., GTM-XXXXXXX"
                                            />
                                        </div>
                                    </div>
                                ) : provider === 'facebook-pixel' ? (
                                    <div className="grid gap-2">
                                        <Label htmlFor="pixelId" className="text-xs font-semibold text-gray-700">
                                            Pixel ID
                                        </Label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="pixelId"
                                                value={formData.pixelId || ''}
                                                onChange={e => handleChange('pixelId', e.target.value)}
                                                className={cn("pl-9 h-10 transition-all bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white focus:bg-white", brandRing)}
                                                placeholder="e.g., 123456789012345"
                                            />
                                        </div>
                                    </div>
                                ) : provider === 'hotjar' ? (
                                    <div className="grid gap-2">
                                        <Label htmlFor="siteId" className="text-xs font-semibold text-gray-700">
                                            Site ID
                                        </Label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="siteId"
                                                value={formData.siteId || ''}
                                                onChange={e => handleChange('siteId', e.target.value)}
                                                className={cn("pl-9 h-10 transition-all bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white focus:bg-white", brandRing)}
                                                placeholder="e.g., 1234567"
                                            />
                                        </div>
                                    </div>
                                ) : isWhatsapp ? (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="phoneNumberId" className="text-xs font-semibold text-gray-700">
                                                Phone Number ID
                                            </Label>
                                            <div className="relative">
                                                <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="phoneNumberId"
                                                    value={formData.phoneNumberId || ''}
                                                    onChange={e => handleChange('phoneNumberId', e.target.value)}
                                                    className={cn("pl-9 h-10 transition-all bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white focus:bg-white", brandRing)}
                                                    placeholder="e.g., 1083921..."
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="accessToken" className="text-xs font-semibold text-gray-700">
                                                Permanent Access Token
                                            </Label>
                                            <div className="relative group">
                                                <Key className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-hover:text-gray-500 transition-colors" />
                                                <Input
                                                    id="accessToken"
                                                    type={showToken ? "text" : "password"}
                                                    value={formData.accessToken || ''}
                                                    onChange={e => handleChange('accessToken', e.target.value)}
                                                    className={cn("pl-9 pr-20 h-10 transition-all bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white font-mono text-sm focus:bg-white", brandRing)}
                                                    placeholder="EAAG..."
                                                />
                                                <div className="absolute right-2 top-2 flex gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-gray-400 hover:text-gray-600 rounded-md"
                                                        onClick={() => setShowToken(!showToken)}
                                                    >
                                                        {showToken ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                <Info className="h-3 w-3" />
                                                Generate this in Meta Business Manager under System Users.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="appId" className="text-xs font-semibold text-gray-700">
                                                App ID
                                            </Label>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="appId"
                                                    value={formData.appId || ''}
                                                    onChange={e => handleChange('appId', e.target.value)}
                                                    className={cn("pl-9 h-10 transition-all bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white focus:bg-white", brandRing)}
                                                    placeholder="e.g., 81293..."
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="pageAccessToken" className="text-xs font-semibold text-gray-700">
                                                Page Access Token
                                            </Label>
                                            <div className="relative group">
                                                <Key className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-hover:text-gray-500 transition-colors" />
                                                <Input
                                                    id="pageAccessToken"
                                                    type={showPageToken ? "text" : "password"}
                                                    value={formData.accessToken || ''}
                                                    onChange={e => handleChange('accessToken', e.target.value)}
                                                    className={cn("pl-9 pr-20 h-10 transition-all bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white font-mono text-sm focus:bg-white", brandRing)}
                                                    placeholder="EAAG..."
                                                />
                                                <div className="absolute right-2 top-2 flex gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-gray-400 hover:text-gray-600 rounded-md"
                                                        onClick={() => setShowPageToken(!showPageToken)}
                                                    >
                                                        {showPageToken ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <Separator className="bg-gray-100" />

                            {/* Security Section - Only for Meta Apps (FB, Insta) */}
                            {(provider === 'facebook' || provider === 'instagram') && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <Lock className="h-3 w-3" />
                                            Security & Webhooks
                                        </h4>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="h-3.5 w-3.5 text-gray-300 hover:text-gray-500 transition-colors" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Used to verify incoming requests from Meta.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="appSecret" className="text-xs font-semibold text-gray-700">
                                                App Secret
                                            </Label>
                                            <div className="relative group">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-hover:text-gray-500 transition-colors" />
                                                <Input
                                                    id="appSecret"
                                                    type={showSecret ? "text" : "password"}
                                                    value={formData.appSecret || ''}
                                                    onChange={e => handleChange('appSecret', e.target.value)}
                                                    className={cn("pl-9 pr-8 h-10 transition-all bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white font-mono text-sm focus:bg-white", brandRing)}
                                                    placeholder="••••••••"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-1 top-1 h-8 w-8 text-gray-400 hover:text-gray-600 rounded-md"
                                                    onClick={() => setShowSecret(!showSecret)}
                                                >
                                                    {showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="verifyToken" className="text-xs font-semibold text-gray-700">
                                                Verify Token
                                            </Label>
                                            <div className="relative group">
                                                <Check className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-hover:text-gray-500 transition-colors" />
                                                <Input
                                                    id="verifyToken"
                                                    value={formData.verifyToken || ''}
                                                    onChange={e => handleChange('verifyToken', e.target.value)}
                                                    className={cn("pl-9 pr-8 h-10 transition-all bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white font-mono text-sm focus:bg-white", brandRing)}
                                                    placeholder="random-string"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-1 top-1 h-8 w-8 text-gray-400 hover:text-gray-600 rounded-md"
                                                    onClick={() => copyToClipboard(formData.verifyToken)}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3 items-center">
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving} className="text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading || saving}
                        className={cn("px-6 min-w-[140px] shadow-lg hover:shadow-xl transition-all font-semibold text-white",
                            isWhatsapp ? 'bg-emerald-600 hover:bg-emerald-700' :
                                isGoogle ? (provider === 'google-tag-manager' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700') :
                                    isHotjar ? 'bg-rose-600 hover:bg-rose-700' :
                                        'bg-blue-600 hover:bg-blue-700'
                        )}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : success ? (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Saved!
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
