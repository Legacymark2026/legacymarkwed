import { getPosts, deletePost } from "@/actions/cms";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function PostsPage() {
    const posts = await getPosts();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Blog Posts</h1>
                    <p className="text-gray-500 text-sm">Manage your blog content.</p>
                </div>
                <Link href="/dashboard/posts/create">
                    <Button className="flex items-center gap-2">
                        <Plus size={16} /> New Post
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                                    No posts found. Create your first one!
                                </td>
                            </tr>
                        ) : (
                            posts.map((post: any) => (
                                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{post.title}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{post.slug}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{post.author.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{post.author.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.published
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {post.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            {/* Client-side navigation link */}
                                            <Link href={`/dashboard/posts/${post.id}`}>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-black">
                                                    <Edit size={16} />
                                                </Button>
                                            </Link>

                                            {/* Client component wrapper for delete needed? 
                                Actually, can use Server Actions in form for delete button 
                            */}
                                            <form action={async () => {
                                                'use server';
                                                await deletePost(post.id);
                                            }}>
                                                <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-red-600">
                                                    <Trash2 size={16} />
                                                </Button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}

                    </tbody>
                </table>
            </div>
        </div>
    );
}
