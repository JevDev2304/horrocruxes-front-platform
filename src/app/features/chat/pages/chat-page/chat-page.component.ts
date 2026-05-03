import { Component, OnInit, inject, input, signal } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { ChatSidebarComponent } from '../../components/chat-sidebar/chat-sidebar.component';
import { ChatWindowComponent } from '../../components/chat-window/chat-window.component';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [ChatSidebarComponent, ChatWindowComponent],
  templateUrl: './chat-page.component.html',
})
export class ChatPageComponent implements OnInit {
  private chatService = inject(ChatService);

  chatId      = input<string | undefined>(undefined);
  sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  ngOnInit(): void {
    const id = this.chatId();
    if (id) {
      this.chatService.setActiveChat(id);
    } else {
      const chats = this.chatService.chats();
      if (chats.length > 0) {
        this.chatService.setActiveChat(chats[0].id);
      }
    }
  }
}
