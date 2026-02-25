import { PostForm } from "@/components/cms/post-form";
import { getAllCategories, getAllTags } from "@/actions/blog";

export default async function CreatePostPage() {
    // Pre-carga en servidor — cero fetch client-side al montar
    const [categories, tags] = await Promise.all([
        getAllCategories(),
        getAllTags(),
    ]);

    const availableCategories = categories.map((c) => ({ id: c.id, name: c.name }));
    const availableTags = tags.map((t) => t.name);

    return (
        <PostForm
            availableCategories={availableCategories}
            availableTags={availableTags}
        />
    );
}
