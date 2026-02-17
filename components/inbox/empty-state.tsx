
import { MessageSquareDashed } from 'lucide-react';

export function EmptyState({ title = "No conversation selected", description = "Choose a conversation from the sidebar to start chatting." }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50/50">
            <div className="w-24 h-24 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                    <MessageSquareDashed size={40} className="text-gray-300" />
                </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
