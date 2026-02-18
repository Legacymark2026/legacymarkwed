"use client";

import { Facebook, Twitter, Linkedin, Share2 } from "lucide-react";
import { motion } from "framer-motion";

export function SocialShare({ url = "", title = "" }) {
    const share = (platform: string) => {
        let shareUrl = "";
        const currentUrl = typeof window !== "undefined" ? window.location.href : url;

        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${currentUrl}&text=${title}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
                break;
        }

        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 z-40"
        >
            <div className="flex flex-col gap-3 p-3 bg-white rounded-full shadow-lg border border-gray-100">
                <button onClick={() => share('twitter')} className="p-2 text-gray-400 hover:text-[#1DA1F2] hover:bg-gray-50 rounded-full transition-all">
                    <Twitter size={20} />
                </button>
                <button onClick={() => share('linkedin')} className="p-2 text-gray-400 hover:text-[#0A66C2] hover:bg-gray-50 rounded-full transition-all">
                    <Linkedin size={20} />
                </button>
                <button onClick={() => share('facebook')} className="p-2 text-gray-400 hover:text-[#1877F2] hover:bg-gray-50 rounded-full transition-all">
                    <Facebook size={20} />
                </button>
                <div className="h-px w-full bg-gray-200 my-1" />
                <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all">
                    <Share2 size={20} />
                </button>
            </div>
        </motion.div>
    );
}
