'use client';

import { useState } from 'react';
import { Plus, X, GripVertical, ImageIcon } from 'lucide-react';

interface GalleryImage {
    url: string;
    alt?: string;
    caption?: string;
}

interface GalleryManagerProps {
    images: GalleryImage[];
    onChange: (images: GalleryImage[]) => void;
    maxImages?: number;
}

export function GalleryManager({
    images,
    onChange,
    maxImages = 10
}: GalleryManagerProps) {
    const [newUrl, setNewUrl] = useState('');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const addImage = () => {
        if (!newUrl.trim() || images.length >= maxImages) return;

        try {
            new URL(newUrl); // Validate URL
            onChange([...images, { url: newUrl.trim(), alt: '', caption: '' }]);
            setNewUrl('');
        } catch {
            // Invalid URL - don't add
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onChange(newImages);
    };

    const updateImage = (index: number, updates: Partial<GalleryImage>) => {
        const newImages = [...images];
        newImages[index] = { ...newImages[index], ...updates };
        onChange(newImages);
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newImages = [...images];
        const [removed] = newImages.splice(draggedIndex, 1);
        newImages.splice(index, 0, removed);
        onChange(newImages);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    Gallery Images
                </label>
                <span className="text-xs text-gray-400">
                    {images.length}/{maxImages} images
                </span>
            </div>

            {/* Image list */}
            <div className="space-y-3">
                {images.map((image, index) => (
                    <div
                        key={index}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 ${draggedIndex === index ? 'opacity-50' : ''
                            }`}
                    >
                        {/* Drag handle */}
                        <div className="cursor-grab pt-1 text-gray-400 hover:text-gray-600">
                            <GripVertical className="h-5 w-5" />
                        </div>

                        {/* Image preview */}
                        <div className="relative w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {image.url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={image.url}
                                    alt={image.alt || `Gallery image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* Image details */}
                        <div className="flex-1 space-y-2">
                            <input
                                type="text"
                                value={image.url}
                                onChange={(e) => updateImage(index, { url: e.target.value })}
                                placeholder="Image URL"
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                            />
                            <input
                                type="text"
                                value={image.alt || ''}
                                onChange={(e) => updateImage(index, { alt: e.target.value })}
                                placeholder="Alt text (for SEO)"
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                            />
                            <input
                                type="text"
                                value={image.caption || ''}
                                onChange={(e) => updateImage(index, { caption: e.target.value })}
                                placeholder="Caption (optional)"
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                            />
                        </div>

                        {/* Remove button */}
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add new image */}
            {images.length < maxImages && (
                <div className="flex gap-2">
                    <input
                        type="url"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="Paste image URL..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addImage();
                            }
                        }}
                    />
                    <button
                        type="button"
                        onClick={addImage}
                        disabled={!newUrl.trim()}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add
                    </button>
                </div>
            )}

            {images.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <ImageIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No gallery images yet</p>
                    <p className="text-xs text-gray-400">Add image URLs above to build your gallery</p>
                </div>
            )}
        </div>
    );
}
