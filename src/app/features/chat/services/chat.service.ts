import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BackendChatHistoryResponse, BackendChatOut, BackendChatTurnResponse, BackendUserChatsResponse, Chat, HpCharacter, Message } from '../../../shared/models/chat.model';
import { environment } from '../../../../environments/environment';

const CHATS_KEY    = 'hp_chats';
const MESSAGES_KEY = 'hp_messages';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);

  private readonly _chats        = signal<Chat[]>(this.loadChats());
  private readonly _activeChat   = signal<Chat | null>(null);
  private readonly _messages     = signal<Record<string, Message[]>>(this.loadMessages());
  private readonly _sendingChats = signal<Record<string, boolean>>({});

  readonly chats        = this._chats.asReadonly();
  readonly activeChat   = this._activeChat.asReadonly();
  /** Reactive map of chatId → sending state. Use isSending(chatId) in templates. */
  readonly sendingChats = this._sendingChats.asReadonly();
  /** Returns true while the given chat is waiting for a backend response. */
  isSending(chatId: string): boolean {
    return !!this._sendingChats()[chatId];
  }

  readonly sortedChats = computed(() =>
    [...this._chats()].sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    ),
  );

  getMessages(chatId: string): Message[] {
    return this._messages()[chatId] ?? [];
  }

  setActiveChat(chatId: string): void {
    const chat = this._chats().find((c) => c.id === chatId) ?? null;
    this._activeChat.set(chat);
  }

  createChat(character: HpCharacter = 'dumbledore'): Chat {
    const now  = new Date().toISOString();
    const chat: Chat = {
      id:            crypto.randomUUID(),
      title:         'New conversation',
      character,
      createdAt:     now,
      lastMessageAt: now,
    };
    this.persistChats([chat, ...this._chats()]);
    this._activeChat.set(chat);
    return chat;
  }

  clearSession(): void {
    localStorage.removeItem(CHATS_KEY);
    localStorage.removeItem(MESSAGES_KEY);
    this._chats.set([]);
    this._messages.set({});
    this._activeChat.set(null);
  }

  deleteChat(chatId: string): void {
    const chat = this._chats().find(c => c.id === chatId);

    const updated = this._chats().filter((c) => c.id !== chatId);
    this.persistChats(updated);

    if (this._activeChat()?.id === chatId) {
      this._activeChat.set(updated[0] ?? null);
    }

    const msgs = { ...this._messages() };
    delete msgs[chatId];
    this.persistMessages(msgs);

    if (chat?.backendChatId != null) {
      this.http.delete(`${environment.apiUrl}/chat/${chat.backendChatId}`).subscribe({ error: () => {} });
    }
  }

  renameChat(chatId: string, title: string): void {
    const updated = this._chats().map((c) =>
      c.id === chatId ? { ...c, title } : c,
    );
    this.persistChats(updated);
  }

  async sendMessage(chatId: string, content: string): Promise<void> {
    const chat = this._chats().find((c) => c.id === chatId);
    if (!chat) return;

    const userMsg: Message = {
      id:        crypto.randomUUID(),
      chatId,
      role:      'user',
      content,
      createdAt: new Date().toISOString(),
    };
    this.appendMessage(chatId, userMsg);
    this.autoTitle(chatId, content);
    this._sendingChats.update((s) => ({ ...s, [chatId]: true }));

    try {
      const res = await firstValueFrom(
        this.http.post<BackendChatTurnResponse>(
          `${environment.apiUrl}/chat/message`,
          { content, chat_id: chat.backendChatId ?? null, user_id: null, character: chat.character },
        ),
      );

      // Persist backend chat_id for continuity of conversation
      if (!chat.backendChatId) {
        const updated = this._chats().map((c) =>
          c.id === chatId ? { ...c, backendChatId: res.chat_id } : c,
        );
        this.persistChats(updated);
      }

      const botMsg: Message = {
        id:        String(res.assistant_message.id),
        chatId,
        role:      'assistant',
        content:   res.assistant_message.content,
        createdAt: res.assistant_message.created_at,
      };
      this.appendMessage(chatId, botMsg);
    } finally {
      this._sendingChats.update((s) => { const n = { ...s }; delete n[chatId]; return n; });
      this.touchChat(chatId);
    }
  }

  async syncFromBackend(): Promise<void> {
    try {
      const { chats: backendChats } = await firstValueFrom(
        this.http.get<BackendUserChatsResponse>(`${environment.apiUrl}/chat/`)
      );

      if (!backendChats.length) return;

      const existing = this._chats();
      const byBackendId = new Map(
        existing.filter(c => c.backendChatId != null).map(c => [c.backendChatId!, c])
      );

      const mergedChats: Chat[] = [...existing];
      for (const bc of backendChats) {
        if (!byBackendId.has(bc.id)) {
          mergedChats.push({
            id:            crypto.randomUUID(),
            title:         'Conversation',
            character:     bc.character,
            createdAt:     bc.created_at,
            lastMessageAt: bc.created_at,
            backendChatId: bc.id,
          });
        }
      }
      this.persistChats(mergedChats);

      const currentMsgs = this._messages();
      for (const chat of this._chats()) {
        if (!chat.backendChatId) continue;
        if ((currentMsgs[chat.id] ?? []).length > 0) continue;

        try {
          const history = await firstValueFrom(
            this.http.get<BackendChatHistoryResponse>(
              `${environment.apiUrl}/chat/${chat.backendChatId}/history`
            )
          );

          if (!history.messages.length) continue;

          const msgs: Message[] = history.messages.map(m => ({
            id:        String(m.id),
            chatId:    chat.id,
            role:      m.role,
            content:   m.content,
            createdAt: m.created_at,
          }));

          this.persistMessages({ ...this._messages(), [chat.id]: msgs });

          const lastMsg = msgs[msgs.length - 1];
          const firstUserMsg = msgs.find(m => m.role === 'user');
          const updatedChats = this._chats().map(c => {
            if (c.id !== chat.id) return c;
            const title = c.title === 'New conversation' || c.title === 'Conversation'
              ? (firstUserMsg ? firstUserMsg.content.slice(0, 40) : c.title)
              : c.title;
            return { ...c, title, lastMessageAt: lastMsg.createdAt };
          });
          this.persistChats(updatedChats);
        } catch { /* ignore per-chat failures */ }
      }
    } catch { /* ignore if backend unreachable */ }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private appendMessage(chatId: string, msg: Message): void {
    const current = this._messages();
    const updated = { ...current, [chatId]: [...(current[chatId] ?? []), msg] };
    this.persistMessages(updated);
  }

  private autoTitle(chatId: string, content: string): void {
    const chat = this._chats().find((c) => c.id === chatId);
    if (!chat || chat.title !== 'New conversation') return;
    const title = content.length > 40 ? content.slice(0, 37) + '...' : content;
    const updated = this._chats().map((c) => (c.id === chatId ? { ...c, title } : c));
    this.persistChats(updated);
  }

  private touchChat(chatId: string): void {
    const updated = this._chats().map((c) =>
      c.id === chatId ? { ...c, lastMessageAt: new Date().toISOString() } : c,
    );
    this.persistChats(updated);
  }

  private persistChats(chats: Chat[]): void {
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
    this._chats.set(chats);
  }

  private persistMessages(msgs: Record<string, Message[]>): void {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(msgs));
    this._messages.set(msgs);
  }

  private loadChats(): Chat[] {
    try { return JSON.parse(localStorage.getItem(CHATS_KEY) ?? '[]'); } catch { return []; }
  }

  private loadMessages(): Record<string, Message[]> {
    try { return JSON.parse(localStorage.getItem(MESSAGES_KEY) ?? '{}'); } catch { return {}; }
  }
}
