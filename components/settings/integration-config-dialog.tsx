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
import { Settings, Loader2 } from "lucide-react";
import { getIntegrationConfig, updateIntegrationConfig, IntegrationConfigData } from "@/actions/integration-config";
import { toast } from "sonner"; // Assuming sonner is used, or alert/console

interface IntegrationConfigDialogProps {
    provider: 'facebook' | 'whatsapp' | 'instagram';
    title: string;
}

export function IntegrationConfigDialog({ provider, title }: IntegrationConfigDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<IntegrationConfigData>({});

    useEffect(() => {
        if (open) {
            setLoading(true);
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
            setOpen(false);
            // toast.success("Configuration saved"); 
        } catch (error) {
            console.error(error);
            // toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Configure</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Configure {title}</DialogTitle>
                    <DialogDescription>
                        Set your API credentials here. These will override environment variables.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        {provider === 'whatsapp' && (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="phoneNumberId" className="text-right">Phone ID</Label>
                                    <Input
                                        id="phoneNumberId"
                                        value={formData.phoneNumberId || ''}
                                        onChange={e => handleChange('phoneNumberId', e.target.value)}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="accessToken" className="text-right">Token</Label>
                                    <Input
                                        id="accessToken"
                                        type="password"
                                        value={formData.accessToken || ''}
                                        onChange={e => handleChange('accessToken', e.target.value)}
                                        className="col-span-3"
                                        placeholder="Permanent Token"
                                    />
                                </div>
                            </>
                        )}

                        {(provider === 'facebook' || provider === 'instagram') && (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="appId" className="text-right">App ID</Label>
                                    <Input
                                        id="appId"
                                        value={formData.appId || ''}
                                        onChange={e => handleChange('appId', e.target.value)}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="pageAccessToken" className="text-right">Page Token</Label>
                                    <Input
                                        id="pageAccessToken"
                                        type="password"
                                        value={formData.accessToken || ''}
                                        onChange={e => handleChange('accessToken', e.target.value)}
                                        className="col-span-3"
                                        placeholder="Long-lived Page Token"
                                    />
                                </div>
                            </>
                        )}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="appSecret" className="text-right">App Secret</Label>
                            <Input
                                id="appSecret"
                                type="password"
                                value={formData.appSecret || ''}
                                onChange={e => handleChange('appSecret', e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="verifyToken" className="text-right">Verify Token</Label>
                            <Input
                                id="verifyToken"
                                value={formData.verifyToken || ''}
                                onChange={e => handleChange('verifyToken', e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button type="submit" onClick={handleSave} disabled={loading || saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
