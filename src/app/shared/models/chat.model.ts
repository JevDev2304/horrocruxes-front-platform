export type HpCharacter = string;

export interface Character {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface Chat {
  id: string;
  title: string;
  character: HpCharacter;
  createdAt: string;
  lastMessageAt: string;
  backendChatId?: number;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface BackendMessageOut {
  id: number;
  chat_id: number;
  role: 'user' | 'assistant';
  content: string;
  trace_id: string | null;
  created_at: string;
}

export interface BackendChatTurnResponse {
  chat_id: number;
  user_message: BackendMessageOut;
  assistant_message: BackendMessageOut;
}

export interface BackendChatOut {
  id: number;
  character: string;
  created_at: string;
}

export interface BackendUserChatsResponse {
  chats: BackendChatOut[];
}

export interface BackendChatHistoryResponse {
  chat_id: number;
  messages: BackendMessageOut[];
}
