// Defines the structure of a chat message in the internal assistant
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    isError?: boolean;
}
