"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "@/actions/cms";
import { toast } from "react-hot-toast";

type CategoryWithCount = {
    id: string;
    name: string;
    slug: string;
    _count: {
        posts: number;
    };
};

export function CategoriesClient({ initialCategories }: { initialCategories: CategoryWithCount[] }) {
    const [categories, setCategories] = useState(initialCategories);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
    const [formData, setFormData] = useState({ name: "", slug: "" });
    const [isLoading, setIsLoading] = useState(false);

    const handleOpenModal = (category: CategoryWithCount | null = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, slug: category.slug });
        } else {
            setEditingCategory(null);
            setFormData({ name: "", slug: "" });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: "", slug: "" });
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        setFormData({ name, slug });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (editingCategory) {
                const res = await updateCategory(editingCategory.id, formData);
                if (res.success) {
                    toast.success("Category updated successfully");
                    // Optimistic UI update
                    setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...formData } : c));
                    handleCloseModal();
                } else {
                    toast.error(res.error || "Failed to update category");
                }
            } else {
                const res = await createCategory(formData);
                if (res.success) {
                    toast.success("Category created successfully");
                    // Full refresh would be ideal, but for now just optimistic refresh of the page might happen via server action
                    // To keep it simple, we'll wait for the next fetch or add it locally without ID properly (requires reload)
                    window.location.reload();
                } else {
                    toast.error(res.error || "Failed to create category");
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, postCount: number) => {
        if (postCount > 0) {
            toast.error("Cannot delete a category that has existing posts.");
            return;
        }

        if (confirm("Are you sure you want to delete this category?")) {
            const res = await deleteCategory(id);
            if (res.success) {
                toast.success("Category deleted");
                setCategories(categories.filter(c => c.id !== id));
            } else {
                toast.error(res.error || "Failed to delete");
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-end">
                <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
                    <Plus size={16} /> Add Category
                </Button>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posts</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {categories.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                                No categories. Create your first one.
                            </td>
                        </tr>
                    ) : (
                        categories.map((category) => (
                            <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {category.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {category.slug}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {category._count.posts}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            onClick={() => handleOpenModal(category)}
                                            size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-black"
                                        >
                                            <Edit size={16} />
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(category.id, category._count.posts)}
                                            size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-red-600"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Modal Simple */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">{editingCategory ? "Edit Category" : "New Category"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border rounded-md bg-gray-50"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                                <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save Category"}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
