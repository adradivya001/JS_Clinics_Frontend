import React, { useState, KeyboardEvent } from 'react';
import { Send, X } from 'lucide-react';

interface InputAreaProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-4 border-t border-brand-border bg-brand-surface">
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask the assistant..."
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-brand-bg border border-brand-border focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all text-sm text-brand-textPrimary placeholder:text-brand-textSecondary disabled:opacity-50 disabled:cursor-not-allowed"
                    autoFocus
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 p-2 rounded-lg bg-brand-primary text-brand-bg hover:bg-brand-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={16} className={isLoading ? 'opacity-50' : ''} />
                </button>
            </div>
        </div>
    );
};
