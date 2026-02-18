'use client';

import { Calendar, Clock, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BlogPostHeaderProps {
    title: string;
    createdAt: Date;
    authorName?: string | null;
    authorImage?: string | null;
    readingTime: number;
    categories?: { id: string; name: string }[];
}

export function BlogPostHeader({
    title,
    createdAt,
    authorName,
    authorImage,
    readingTime,
    categories
}: BlogPostHeaderProps) {
    return (
        <div className="space-y-6">
            {/* Categories */}
            {categories && categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <span
                            key={category.id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100"
                        >
                            {category.name}
                        </span>
                    ))}
                </div>
            )}

            {/* Title */}
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-tight">
                {title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
                {/* Author */}
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                        {authorImage ? (
                            <img src={authorImage} alt={authorName || "Author"} className="h-full w-full object-cover" />
                        ) : (
                            authorName?.charAt(0)?.toUpperCase() || "A"
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{authorName || "Autor"}</p>
                    </div>
                </div>

                <span className="text-gray-300">|</span>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={new Date(createdAt).toISOString()}>
                        {new Date(createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </time>
                </div>

                <span className="text-gray-300">|</span>

                {/* Reading Time */}
                <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{readingTime} min de lectura</span>
                </div>
            </div>
        </div>
    );
}

interface ShareButtonsProps {
    title: string;
    url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Compartir:
            </span>
            <div className="flex items-center gap-2">
                <a
                    href={shareLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    aria-label="Compartir en Facebook"
                >
                    <Facebook className="h-4 w-4" />
                </a>
                <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-sky-100 hover:text-sky-500 transition-colors"
                    aria-label="Compartir en Twitter"
                >
                    <Twitter className="h-4 w-4" />
                </a>
                <a
                    href={shareLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    aria-label="Compartir en LinkedIn"
                >
                    <Linkedin className="h-4 w-4" />
                </a>
                <button
                    onClick={copyToClipboard}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600 transition-colors"
                    aria-label="Copiar enlace"
                >
                    <LinkIcon className="h-4 w-4" />
                </button>
                {copied && (
                    <span className="text-xs text-green-600 font-medium animate-pulse">¡Copiado!</span>
                )}
            </div>
        </div>
    );
}

interface AuthorBioProps {
    name: string;
    image?: string | null;
    bio?: string | null;
}

export function AuthorBio({ name, image, bio }: AuthorBioProps) {
    return (
        <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
            <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                {image ? (
                    <img src={image} alt={name} className="h-full w-full object-cover" />
                ) : (
                    name?.charAt(0)?.toUpperCase() || "A"
                )}
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">Escrito por</p>
                <h3 className="text-lg font-bold text-gray-900">{name}</h3>
                {bio && (
                    <p className="mt-2 text-gray-600 text-sm leading-relaxed">{bio}</p>
                )}
            </div>
        </div>
    );
}

interface RelatedPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    coverImage?: string | null;
}

interface RelatedPostsProps {
    posts: RelatedPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
    if (!posts || posts.length === 0) return null;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Artículos Relacionados</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                    <a
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="group block overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
                            <div
                                className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                style={{
                                    backgroundImage: `url(${post.coverImage || 'https://images.unsplash.com/photo-1432821596592-e2c18b781492?q=80&w=400&auto=format&fit=crop'})`
                                }}
                            />
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">
                                {post.title}
                            </h3>
                            {post.excerpt && (
                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                            )}
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}

interface TableOfContentsProps {
    content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
    // Extract headings from HTML content
    const headingRegex = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi;
    const headings: { level: number; text: string; id: string }[] = [];

    let match;
    while ((match = headingRegex.exec(content)) !== null) {
        const level = parseInt(match[1]);
        const text = match[2].replace(/<[^>]*>/g, ''); // Strip HTML tags
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        headings.push({ level, text, id });
    }

    if (headings.length < 2) return null;

    return (
        <nav className="p-5 bg-gray-50 rounded-xl border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                En este artículo
            </h2>
            <ul className="space-y-2">
                {headings.map((heading, index) => (
                    <li
                        key={index}
                        className={heading.level === 3 ? 'ml-4' : ''}
                    >
                        <a
                            href={`#${heading.id}`}
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors block py-1"
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
