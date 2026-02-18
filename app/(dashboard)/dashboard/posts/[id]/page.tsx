import { PostForm } from "@/components/cms/post-form";
import { getPost } from "@/actions/cms";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
        notFound();
    }

    return <PostForm post={post} />;
}
