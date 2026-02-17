"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, FileText, Calendar, User } from "lucide-react";

interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    coverImage?: string | null;
    createdAt: string | Date;
    author?: { name: string | null } | null;
}

interface LatestPostsProps {
    posts: Post[];
}

export function LatestPosts({ posts }: LatestPostsProps) {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="bg-slate-50 py-24 border-t border-gray-200 relative">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="mb-16 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200 bg-white shadow-sm text-teal-700 text-xs font-mono mb-4 uppercase tracking-widest">
                            <FileText size={12} />
                            Intelligence Feed
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Reportes de <span className="text-teal-600">Inteligencia</span></h2>
                        <p className="mt-2 text-lg text-slate-600 font-medium">Análisis táctico de tendencias y tecnología.</p>
                    </div>
                    <Link href="/blog">
                        <Button variant="outline" className="text-slate-700 border-gray-200 hover:bg-white hover:text-teal-600 hover:shadow-md">
                            Acceder a la Base de Datos
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {posts.map((post, index) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300 hover:-translate-y-1"
                        >
                            <Link href={`/blog/${post.slug}`} className="block overflow-hidden aspect-[16/9] relative">
                                <div
                                    className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-100"
                                    style={{ backgroundImage: `url(${post.coverImage || 'https://images.unsplash.com/photo-1432821596592-e2c18b781492?q=80&w=2070&auto=format&fit=crop'})` }}
                                />
                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors" />
                            </Link>

                            <div className="flex flex-1 flex-col p-6">
                                <div className="mb-4 flex items-center gap-4 text-xs font-mono text-teal-600/80 uppercase tracking-wide">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString()}</span>
                                    {post.author?.name && (
                                        <span className="flex items-center gap-1"><User size={12} /> {post.author.name}</span>
                                    )}
                                </div>

                                <h3 className="mb-3 text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors leading-tight">
                                    <Link href={`/blog/${post.slug}`}>
                                        {post.title}
                                    </Link>
                                </h3>

                                <p className="mb-6 flex-1 text-gray-500 line-clamp-3 text-sm leading-relaxed">
                                    {post.excerpt || "Contenido clasificado. Requiere acceso de nivel 1 para visualizar el resumen completo."}
                                </p>

                                <Link href={`/blog/${post.slug}`} className="inline-flex items-center font-bold text-teal-600 hover:text-teal-700 transition-colors text-sm uppercase tracking-wider">
                                    Leer Informe <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
