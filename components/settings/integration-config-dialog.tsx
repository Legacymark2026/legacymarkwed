'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
    Globe
} from "lucide-react";
import { getIntegrationConfig, updateIntegrationConfig, IntegrationConfigData } from "@/actions/integration-config";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface IntegrationConfigDialogProps {
    provider: 'facebook' | 'whatsapp' | 'instagram';
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

    // Brand Colors
    const brandColor = provider === 'whatsapp' ? 'text-green-600' : 'text-blue-600';
    const brandBg = provider === 'whatsapp' ? 'bg-green-50' : 'bg-blue-50';
    const brandRing = provider === 'whatsapp' ? 'focus-visible:ring-green-500' : 'focus-visible:ring-blue-500';

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
                <Button variant="outline" size="sm" className={cn("gap-2 border-dashed transition-all hover:border-solid", brandBg, "border-opacity-50 hover:bg-opacity-100")}>
                    <Settings className={cn("h-4 w-4", brandColor)} />
                    <span className={cn("font-medium", brandColor)}>Configure</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white/95 backdrop-blur-xl border border-gray-100 shadow-2xl">
                {/* Header with Brand Gradient */}
                <div className={cn("px-6 py-6 border-b", provider === 'whatsapp' ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-blue-50 to-indigo-50')}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl font-bold tracking-tight">
                            <div className={cn("p-2 rounded-xl bg-white shadow-sm", brandColor)}>
                                {provider === 'whatsapp' ? <Smartphone className="h-6 w-6" /> : <Globe className="h-6 w-6" />}
                            </div>
                            Configure {title}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 mt-1.5 ml-1">
                            Manage API credentials and webhook secrets securely.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-6 py-6 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className={cn("h-10 w-10 animate-spin", brandColor)} />
                            <p className="text-sm text-gray-400 font-medium">Loading configuration...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Provider Specific Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <Hash className="h-3 w-3" />
                                        Identity & Access
                                    </h4>
                                    <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-500 font-medium">
                                        Required
                                    </Badge>
                                </div>

                                {provider === 'whatsapp' ? (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="phoneNumberId" className="text-xs font-semibold text-gray-600">
                                                Phone Number ID
                                            </Label>
                                            <div className="relative">
                                                <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="phoneNumberId"
                                                    value={formData.phoneNumberId || ''}
                                                    onChange={e => handleChange('phoneNumberId', e.target.value)}
                                                    className={cn("pl-9 h-10 transition-all bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white", brandRing)}
                                                    placeholder="e.g., 1083921..."
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="accessToken" className="text-xs font-semibold text-gray-600">
                                                Permanent Access Token
                                            </Label>
                                            <div className="relative group">
                                                <Key className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-hover:text-gray-500 transition-colors" />
                                                <Input
                                                    id="accessToken"
                                                    type={showToken ? "text" : "password"}
                                                    value={formData.accessToken || ''}
                                                    onChange={e => handleChange('accessToken', e.target.value)}
                                                    className={cn("pl-9 pr-20 h-10 transition-all bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white font-mono text-sm", brandRing)}
                                                    placeholder="EAAG..."
                                                />
                                                <div className="absolute right-2 top-2 flex gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-gray-400 hover:text-gray-600"
                                                        onClick={() => setShowToken(!showToken)}
                                                    >
                                                        {showToken ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-gray-400">Generate this in Meta Business Manager under System Users.</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="appId" className="text-xs font-semibold text-gray-600">
                                                App ID
                                            </Label>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="appId"
                                                    value={formData.appId || ''}
                                                    onChange={e => handleChange('appId', e.target.value)}
                                                    className={cn("pl-9 h-10 transition-all bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white", brandRing)}
                                                    placeholder="e.g., 81293..."
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="pageAccessToken" className="text-xs font-semibold text-gray-600">
                                                Page Access Token
                                            </Label>
                                            <div className="relative group">
                                                <Key className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-hover:text-gray-500 transition-colors" />
                                                <Input
                                                    id="pageAccessToken"
                                                    type={showPageToken ? "text" : "password"}
                                                    value={formData.accessToken || ''}
                                                    onChange={e => handleChange('accessToken', e.target.value)}
                                                    className={cn("pl-9 pr-20 h-10 transition-all bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white font-mono text-sm", brandRing)}
                                                    placeholder="EAAG..."
                                                />
                                                <div className="absolute right-2 top-2 flex gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-gray-400 hover:text-gray-600"
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

                            {/* Security Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <Lock className="h-3 w-3" />
                                        Security & Webhook
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
                                        <Label htmlFor="appSecret" className="text-xs font-semibold text-gray-600">
                                            App Secret
                                        </Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-hover:text-gray-500 transition-colors" />
                                            <Input
                                                id="appSecret"
                                                type={showSecret ? "text" : "password"}
                                                value={formData.appSecret || ''}
                                                onChange={e => handleChange('appSecret', e.target.value)}
                                                className={cn("pl-9 pr-8 h-10 transition-all bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white font-mono text-sm", brandRing)}
                                                placeholder="••••••••"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-1 top-1 h-8 w-8 text-gray-400 hover:text-gray-600"
                                                onClick={() => setShowSecret(!showSecret)}
                                            >
                                                {showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="verifyToken" className="text-xs font-semibold text-gray-600">
                                            Verify Token
                                        </Label>
                                        <div className="relative group">
                                            <Check className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-hover:text-gray-500 transition-colors" />
                                            <Input
                                                id="verifyToken"
                                                value={formData.verifyToken || ''}
                                                onChange={e => handleChange('verifyToken', e.target.value)}
                                                className={cn("pl-9 pr-8 h-10 transition-all bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white font-mono text-sm", brandRing)}
                                                placeholder="random-string"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-1 top-1 h-8 w-8 text-gray-400 hover:text-gray-600"
                                                onClick={() => copyToClipboard(formData.verifyToken)}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving} className="text-gray-500 hover:text-gray-700">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading || saving}
                        className={cn("px-6 min-w-[120px] shadow-lg hover:shadow-xl transition-all", provider === 'whatsapp' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white')}
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
