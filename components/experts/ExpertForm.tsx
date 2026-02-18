"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/ui/image-upload";
import { SocialLinksInput, type SocialLink } from "@/components/ui/social-links-input";
import { Loader2 } from "lucide-react";

const expertSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters.").max(100, "Name is too long."),
    role: z.string().min(2, "Role is required.").max(100, "Role is too long."),
    bio: z.string().max(500, "Bio must be 500 characters or less.").optional(),
    imageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
    socialLinks: z.array(z.object({
        platform: z.string(),
        url: z.string().url("Must be a valid URL."),
    })).optional(),
    isVisible: z.boolean().default(true),
});

type ExpertFormValues = z.infer<typeof expertSchema>;

interface ExpertFormProps {
    initialData?: ExpertFormValues;
    onSubmit: (data: ExpertFormValues) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

export function ExpertForm({ initialData, onSubmit, onCancel, isLoading }: ExpertFormProps) {
    const form = useForm<ExpertFormValues>({
        resolver: zodResolver(expertSchema) as any,
        defaultValues: initialData || {
            name: "",
            role: "",
            bio: "",
            imageUrl: "",
            socialLinks: [],
            isVisible: true,
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Position / Role</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Head of Strategy" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => {
                        const bioLength = field.value?.length || 0;
                        return (
                            <FormItem>
                                <FormLabel>Short Bio (Optional)</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Brief description..." {...field} rows={4} />
                                </FormControl>
                                <div className="flex justify-between items-center">
                                    <FormMessage />
                                    <span className={`text-xs ${bioLength > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                                        {bioLength}/500
                                    </span>
                                </div>
                            </FormItem>
                        );
                    }}
                />
                <FormField
                    control={form.control}
                    name="socialLinks"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Social Media Links (Optional)</FormLabel>
                            <FormControl>
                                <SocialLinksInput
                                    value={field.value || []}
                                    onChange={field.onChange}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Profile Image</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value ? [field.value] : []}
                                    disabled={isLoading}
                                    onChange={(url) => field.onChange(url)}
                                    onRemove={() => field.onChange("")}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="isVisible"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Visibility</FormLabel>
                                <FormMessage />
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <div className="flex justify-end gap-4 pt-4">
                    <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    );
}
