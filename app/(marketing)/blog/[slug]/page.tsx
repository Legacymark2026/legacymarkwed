import { getPostBySlug, getRelatedPosts } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Tag, Rss, Calendar, Clock } from "lucide-react";
import {
    BlogPostHeader,
    ShareButtons,
    AuthorBio,
    RelatedPosts,
    TableOfContents
} from "@/components/blog/blog-post-components";
import { EngagementBar } from "@/components/blog/blog-engagement";
import { CommentSection } from "@/components/blog/blog-comments";
import { NewsletterPopup, NewsletterInline } from "@/components/blog/newsletter";
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/structured-data";
import { getPostComments, getCommentCount } from "@/actions/blog";
import { BlogContentViewer } from "@/components/blog/blog-content-viewer";

// Calculate reading time (average 200 words per minute)
function calculateReadingTime(content: string): number {
    const text = content.replace(/<[^>]*>/g, ''); // Strip HTML
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
}

// Add IDs to headings for table of contents linking
function addHeadingIds(html: string): string {
    return html.replace(/<h([2-3])([^>]*)>(.*?)<\/h[2-3]>/gi, (match, level, attrs, text) => {
        const cleanText = text.replace(/<[^>]*>/g, '');
        const id = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
    });
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) return { title: 'Post not found' };

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://legacymark.com';
    const postUrl = `${baseUrl}/blog/${slug}`;

    return {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt || `Lee ${post.title} en nuestro blog`,
        keywords: post.tags?.map(t => t.name).join(', '),
        authors: [{ name: post.author?.name || 'LegacyMark' }],
        openGraph: {
            title: post.metaTitle || post.title,
            description: post.metaDescription || post.excerpt || '',
            url: postUrl,
            type: 'article',
            publishedTime: post.createdAt.toISOString(),
            modifiedTime: post.updatedAt.toISOString(),
            authors: [post.author?.name || 'LegacyMark'],
            images: post.coverImage ? [
                {
                    url: post.coverImage,
                    width: 1200,
                    height: 630,
                    alt: post.imageAlt || post.title
                }
            ] : [],
            siteName: 'LegacyMark',
            locale: 'es_ES',
        },
        twitter: {
            card: 'summary_large_image',
            title: post.metaTitle || post.title,
            description: post.metaDescription || post.excerpt || '',
            images: post.coverImage ? [post.coverImage] : [],
        },
        alternates: {
            canonical: post.canonicalUrl || postUrl,
        },
        robots: {
            index: post.published,
            follow: true,
        }
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const categoryIds = post.categories?.map(c => c.id) || [];

    // Safe calls that handle missing tables gracefully
    let relatedPosts: any[] = [];
    let comments: any[] = [];
    let commentCount = 0;

    try {
        [relatedPosts, comments, commentCount] = await Promise.all([
            getRelatedPosts(post.id, categoryIds, 3),
            getPostComments(post.id).catch(() => []),
            getCommentCount(post.id).catch(() => 0)
        ]);
    } catch {
        relatedPosts = await getRelatedPosts(post.id, categoryIds, 3).catch(() => []);
    }

    const readingTime = calculateReadingTime(post.content);
    const processedContent = addHeadingIds(post.content);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://legacymark.com';
    const postUrl = `${baseUrl}/blog/${slug}`;

    return (
        <>
            {/* SEO Structured Data */}
            <ArticleSchema
                title={post.title}
                description={post.metaDescription || post.excerpt || ''}
                url={postUrl}
                imageUrl={post.coverImage || undefined}
                authorName={post.author?.name || 'LegacyMark'}
                publishedDate={post.createdAt.toISOString()}
                modifiedDate={post.updatedAt.toISOString()}
                section={post.categories?.[0]?.name}
                tags={post.tags?.map(t => t.name)}
            />
            <BreadcrumbSchema
                items={[
                    { name: 'Inicio', url: baseUrl },
                    { name: 'Blog', url: `${baseUrl}/blog` },
                    ...(post.categories?.[0] ? [{
                        name: post.categories[0].name,
                        url: `${baseUrl}/blog?category=${post.categories[0].id}`
                    }] : []),
                    { name: post.title, url: postUrl }
                ]}
            />

            <article className="min-h-screen bg-white dark:bg-gray-950">
                {/* Reading Progress Bar - Fixed at top */}
                <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800 z-50">
                    <div
                        id="reading-progress"
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-150"
                        style={{ width: '0%' }}
                    />
                </div>

                {/* Hero Section */}
                <div className="relative pt-24 pb-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                            <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Inicio</Link>
                            <span>/</span>
                            <Link href="/blog" className="hover:text-gray-900 dark:hover:text-white transition-colors">Blog</Link>
                            {post.categories?.[0] && (
                                <>
                                    <span>/</span>
                                    <Link
                                        href={`/blog?category=${post.categories[0].id}`}
                                        className="hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        {post.categories[0].name}
                                    </Link>
                                </>
                            )}
                        </nav>

                        <Link href="/blog">
                            <Button variant="ghost" className="mb-8 -ml-4 pl-2 text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Blog
                            </Button>
                        </Link>

                        <BlogPostHeader
                            title={post.title}
                            createdAt={post.createdAt}
                            authorName={post.author?.name}
                            authorImage={post.author?.image}
                            readingTime={readingTime}
                            categories={post.categories}
                        />

                        {/* Engagement Bar - Mobile */}
                        <div className="mt-8 lg:hidden">
                            <EngagementBar
                                postId={post.id}
                                postSlug={slug}
                                postTitle={post.title}
                                content={post.content}
                            />
                        </div>
                    </div>
                </div>

                {/* Cover Image - Full Width */}
                {post.coverImage && (
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-4 mb-12">
                        <figure className="relative">
                            <div className="aspect-[21/9] w-full relative overflow-hidden rounded-2xl shadow-2xl group">
                                <img
                                    src={post.coverImage}
                                    alt={post.imageAlt || post.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="eager"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                            </div>
                            {post.imageAlt && (
                                <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                                    {post.imageAlt}
                                </figcaption>
                            )}
                        </figure>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
                        {/* Article Content */}
                        <div className="order-2 lg:order-1">
                            {/* Share Buttons - Top */}
                            <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
                                <ShareButtons title={post.title} url={postUrl} />
                            </div>

                            {/* Main Article Content */}
                            <BlogContentViewer content={processedContent} />

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Tag className="h-4 w-4 text-gray-500" />
                                        {post.tags.map((tag) => (
                                            <Link
                                                key={tag.name}
                                                href={`/blog?tag=${encodeURIComponent(tag.name)}`}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                #{tag.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Engagement Bar - Desktop */}
                            <div className="hidden lg:block mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                                <EngagementBar
                                    postId={post.id}
                                    postSlug={slug}
                                    postTitle={post.title}
                                    content={post.content}
                                />
                            </div>

                            {/* Share Buttons - Bottom */}
                            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                                <ShareButtons title={post.title} url={postUrl} />
                            </div>

                            {/* Author Bio */}
                            <div className="mt-12">
                                <AuthorBio
                                    name={post.author?.name || "Autor"}
                                    image={post.author?.image}
                                    bio="Especialista en marketing digital y estrategia de contenidos. Apasionado por ayudar a marcas a crecer en el mundo digital."
                                />
                            </div>

                            {/* Comments Section */}
                            <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800" id="comentarios">
                                <CommentSection
                                    postId={post.id}
                                    initialComments={comments.map((c: any) => ({
                                        id: c.id,
                                        content: c.content,
                                        authorName: c.authorName,
                                        createdAt: c.createdAt,
                                        replies: c.replies?.map((r: any) => ({
                                            id: r.id,
                                            content: r.content,
                                            authorName: r.authorName,
                                            createdAt: r.createdAt
                                        }))
                                    }))}
                                    commentCount={commentCount}
                                />
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside className="order-1 lg:order-2 lg:sticky lg:top-20 lg:self-start space-y-6">
                            {/* Table of Contents */}
                            <TableOfContents content={post.content} />

                            {/* Quick Stats */}
                            <div className="p-5 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl text-white">
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-300">
                                    Información
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-300">Tiempo de lectura</span>
                                        <span className="ml-auto font-medium">{readingTime} min</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-300">Publicado</span>
                                        <span className="ml-auto font-medium">
                                            {new Date(post.createdAt).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Newsletter Inline */}
                            <NewsletterInline />

                            {/* RSS Feed Link */}
                            <Link
                                href="/rss"
                                className="flex items-center gap-2 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-xl text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/50 transition-colors"
                                target="_blank"
                            >
                                <Rss className="h-5 w-5" />
                                <span className="font-medium">Suscribirse vía RSS</span>
                            </Link>
                        </aside>
                    </div>
                </div>

                {/* Related Posts Section */}
                {relatedPosts.length > 0 && (
                    <section className="bg-gray-50 dark:bg-gray-900 py-16 border-t border-gray-200 dark:border-gray-800">
                        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                            <RelatedPosts posts={relatedPosts} />
                        </div>
                    </section>
                )}

                {/* Newsletter Popup */}
                <NewsletterPopup delay={45000} exitIntent={true} />

                {/* Reading Progress Script */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if (typeof window !== 'undefined') {
                                window.addEventListener('scroll', function() {
                                    const article = document.querySelector('article');
                                    const progress = document.getElementById('reading-progress');
                                    if (article && progress) {
                                        const scrollTop = window.scrollY;
                                        const docHeight = article.scrollHeight - window.innerHeight;
                                        const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
                                        progress.style.width = scrollPercent + '%';
                                    }
                                });
                            }
                        `
                    }}
                />
            </article>
        </>
    );
}
