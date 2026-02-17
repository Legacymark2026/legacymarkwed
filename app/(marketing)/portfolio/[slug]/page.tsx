import { getProjectBySlug } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const project = await getProjectBySlug(slug);

    if (!project) {
        notFound();
    }

    return (
        <article className="min-h-screen bg-white pt-24 pb-12">
            {/* Header / Hero */}
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mb-12">
                <Link href="/portfolio">
                    <Button variant="ghost" className="mb-6 -ml-4 pl-2 text-gray-500 hover:text-black">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Portfolio
                    </Button>
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        {project.client && (
                            <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 mb-4 tracking-wider uppercase">
                                {project.client}
                            </span>
                        )}
                        <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl mb-4">{project.title}</h1>
                        <p className="text-xl text-gray-600 max-w-2xl">{project.description}</p>
                    </div>
                    {/* Optional: Add CTA or metadata here */}
                </div>
            </div>

            {/* Cover Image */}
            {project.coverImage && (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
                    <div className="aspect-[21/9] w-full relative overflow-hidden rounded-2xl bg-gray-100 shadow-md">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${project.coverImage})` }}
                        />
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 prose prose-lg prose-gray">
                {project.content ? (
                    <div className="whitespace-pre-wrap leading-relaxed text-gray-700">{project.content}</div>
                ) : (
                    <p className="italic text-gray-500">Detalles del caso de estudio próximamente...</p>
                )}
            </div>
        </article>
    );
}
