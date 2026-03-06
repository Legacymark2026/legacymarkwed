'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Link2,
    Heading2,
    Heading3,
    Heading4
} from 'lucide-react';

interface RichTextEditorProps {
    initialValue: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ initialValue, onChange, placeholder = "Write your content here..." }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false, // Fix SSR hydration mismatch
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2, 3, 4],
                },
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                // Link is now often bundled in some StarterKit or needs to be handled exclusively.
                // Assuming it's bundled based on the duplicate error:
            }),
            // Explicitly load link extension but with a check if we need to remove StarterKit's version. 
            // Actually, if StarterKit throws a duplicate, we should just remove our explicit one, OR disable it in StarterKit.
            // Let's disable it in StarterKit just to be safe, so we can use our custom `Link.configure()`:
            // Oh wait, StarterKit doesn't have Link by default unless they changed it. 
            // WAIT. The error is "Duplicate extension names found: ['link']". It means it's loaded twice.
            // Let's disable it in StarterKit if it exists, or just import it once. Let's just remove our Link.configure and see, or remove the import! 
            // Better: disable it in StarterKit to keep our custom configuration.
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: initialValue,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-gray max-w-none focus:outline-none min-h-[300px] p-4',
            },
        },
    });

    // Note: We use initialValue for the initial content only.
    // The editor manages its own state - no external sync needed.

    if (!editor) {
        return null;
    }

    const toggleLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Enter URL:', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="border border-gray-300 rounded-md overflow-hidden bg-white text-gray-900 focus-within:ring-2 focus-within:ring-black">
            {/* Toolbar */}
            <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''
                        }`}
                    title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''
                        }`}
                    title="Heading 3"
                >
                    <Heading3 className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                    className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('heading', { level: 4 }) ? 'bg-gray-300' : ''
                        }`}
                    title="Heading 4"
                >
                    <Heading4 className="h-4 w-4" />
                </button>

                <div className="w-px bg-gray-300 mx-1" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('bold') ? 'bg-gray-300' : ''
                        }`}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('italic') ? 'bg-gray-300' : ''
                        }`}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </button>

                <div className="w-px bg-gray-300 mx-1" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('bulletList') ? 'bg-gray-300' : ''
                        }`}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('orderedList') ? 'bg-gray-300' : ''
                        }`}
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </button>

                <div className="w-px bg-gray-300 mx-1" />

                <button
                    type="button"
                    onClick={toggleLink}
                    className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('link') ? 'bg-gray-300' : ''
                        }`}
                    title="Insert Link"
                >
                    <Link2 className="h-4 w-4" />
                </button>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />
        </div>
    );
}
