"use client";

import { useRef } from "react";
import { ContentImageLightbox } from "@/components/ui/lightbox";

interface BlogContentViewerProps {
    content: string;
}

export function BlogContentViewer({ content }: BlogContentViewerProps) {
    const contentRef = useRef<HTMLDivElement>(null);

    return (
        <div className="relative">
            <div
                ref={contentRef}
                className="prose prose-lg prose-gray dark:prose-invert max-w-none
                    prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold prose-headings:scroll-mt-20
                    prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                    prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
                    prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
                    prose-ul:list-disc prose-ul:pl-6 prose-ul:my-6
                    prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-6
                    prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:mb-3 prose-li:leading-relaxed
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-950/30 prose-blockquote:rounded-r-lg prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-4 prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
                    prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                    prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-6 prose-pre:overflow-x-auto
                    prose-img:rounded-xl prose-img:shadow-lg prose-img:mx-auto prose-img:cursor-zoom-in"
                dangerouslySetInnerHTML={{ __html: content }}
            />
            <ContentImageLightbox contentRef={contentRef} />
        </div>
    );
}
