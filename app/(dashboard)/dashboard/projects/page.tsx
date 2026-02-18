import { getProjects, getProjectCategories, deleteProject, updateProjectsStatus } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Star, Search, Filter, ExternalLink } from "lucide-react";
import { ProjectList } from "@/components/cms/project-list";
import { revalidatePath } from "next/cache";

interface SearchParams {
    search?: string;
    category?: string;
    status?: string;
}

export default async function ProjectsPage({
    searchParams
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const [projects, categories] = await Promise.all([
        getProjects({
            search: params.search,
            categoryId: params.category,
            status: params.status
        }),
        getProjectCategories()
    ]);

    const statusColors: Record<string, string> = {
        draft: 'bg-yellow-100 text-yellow-800',
        published: 'bg-green-100 text-green-800',
        scheduled: 'bg-blue-100 text-blue-800',
        archived: 'bg-gray-100 text-gray-600'
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Portfolio Projects</h1>
                    <p className="text-gray-500 text-sm">Showcase your best work with detailed case studies.</p>
                </div>
                <Link href="/dashboard/projects/create">
                    <Button className="flex items-center gap-2">
                        <Plus size={16} /> New Project
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <form className="flex flex-wrap gap-4 items-end">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="search"
                                defaultValue={params.search || ''}
                                placeholder="Search projects..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="w-[180px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            name="category"
                            defaultValue={params.category || ''}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat: any) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="w-[150px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            name="status"
                            defaultValue={params.status || ''}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            <option value="">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <Button type="submit" variant="outline" className="flex items-center gap-2">
                        <Filter size={16} /> Apply
                    </Button>

                    {(params.search || params.category || params.status) && (
                        <Link href="/dashboard/projects">
                            <Button type="button" variant="ghost" className="text-gray-500">
                                Clear
                            </Button>
                        </Link>
                    )}
                </form>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-2xl font-bold">{projects.length}</p>
                    <p className="text-sm text-gray-500">Total Projects</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-2xl font-bold text-green-600">
                        {projects.filter((p: any) => p.status === 'published').length}
                    </p>
                    <p className="text-sm text-gray-500">Published</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-2xl font-bold text-yellow-600">
                        {projects.filter((p: any) => p.status === 'draft').length}
                    </p>
                    <p className="text-sm text-gray-500">Drafts</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-2xl font-bold text-purple-600">
                        {projects.filter((p: any) => p.featured).length}
                    </p>
                    <p className="text-sm text-gray-500">Featured</p>
                </div>
            </div>

            {/* Projects Table Component */}
            <ProjectList projects={projects} categories={categories} />
        </div>
    );
}
