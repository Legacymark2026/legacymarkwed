import { Button } from "@/components/ui/button";
import { getAllPosts } from "@/lib/data";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function BlogPage() {
    const posts = await getAllPosts();

    return (
        <div className="min-h-screen bg-white pt-24 pb-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-black mb-4">Blog & Recursos</h1>
                    <p className="text-xl text-gray-600">Insights sobre marketing, diseño y tecnología.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <article key={post.id} className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md h-full">
                            <div className="aspect-video w-full bg-gray-100 relative overflow-hidden group">
                                <Link href={`/blog/${post.slug}`} className="block h-full w-full">
                                    <div
                                        className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                        style={{ backgroundImage: `url(${post.coverImage || 'https://images.unsplash.com/photo-1432821596592-e2c18b781492?q=80&w=2070&auto=format&fit=crop'})` }}
                                    />
                                </Link>
                            </div>
                            <div className="flex flex-1 flex-col p-6">
                                <div className="mb-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
                                    {/* Categoría o Fecha */}
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-black group-hover:text-blue-600 transition-colors">
                                    <Link href={`/blog/${post.slug}`}>
                                        {post.title}
                                    </Link>
                                </h3>
                                <p className="flex-1 text-sm text-gray-600 line-clamp-3 mb-4">
                                    {post.excerpt || "Sin resumen disponible."}
                                </p>
                                <Link href={`/blog/${post.slug}`}>
                                    <Button variant="ghost" className="-ml-4 justify-start text-black hover:text-blue-600 hover:bg-gray-50 p-2">
                                        Leer más <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </article>
                    ))}
                    {posts.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No hay publicaciones todavía.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
