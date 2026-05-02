import { Component, inject, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Message } from '../../../../shared/models/chat.model';
import { CharacterService } from '../../../../core/services/character.service';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div
      class="flex items-end gap-2 animate-slide-up"
      [class.flex-row-reverse]="message().role === 'user'"
    >
      <!-- Avatar (solo bot) -->
      @if (message().role === 'assistant') {
        <div class="w-8 h-8 rounded-full bg-hp-border/60 flex-shrink-0 mb-0.5 overflow-hidden">
          <img [src]="characterIcon()" [alt]="character()" class="w-full h-full object-cover" />
        </div>
      }

      <!-- Burbuja -->
      <div
        class="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
        [class.bg-hp-gold]="message().role === 'user'"
        [class.text-hp-dark]="message().role === 'user'"
        [class.rounded-br-sm]="message().role === 'user'"
        [class.font-medium]="message().role === 'user'"
        [class.bg-hp-surface]="message().role === 'assistant'"
        [class.border]="message().role === 'assistant'"
        [class.border-hp-border]="message().role === 'assistant'"
        [class.text-gray-100]="message().role === 'assistant'"
        [class.rounded-bl-sm]="message().role === 'assistant'"
      >
        {{ mainText() }}

        @if (sources().length > 0) {
          <div class="mt-3 pt-3 border-t border-hp-border/50">
            <p class="text-[10px] text-hp-muted font-heading tracking-wider uppercase mb-1.5">📚 Sources</p>
            @for (source of sources(); track source) {
              <p class="text-[10px] text-hp-muted/70 leading-relaxed">• {{ source }}</p>
            }
          </div>
        }

        <p
          class="text-[10px] mt-2 opacity-60"
          [class.text-right]="message().role === 'user'"
        >
          {{ formatTime(message().createdAt) }}
        </p>
      </div>
    </div>
  `,
})
export class MessageBubbleComponent {
  private characterService = inject(CharacterService);

  message   = input.required<Message>();
  character = input.required<string>();

  characterIcon(): string {
    return this.characterService.getById(this.character())?.icon ?? 'wand-sparkles';
  }

  mainText(): string {
    const content = this.message().content;
    const idx = content.indexOf('\n\n📚 Sources');
    return idx !== -1 ? content.slice(0, idx).trim() : content;
  }

  sources(): string[] {
    const content = this.message().content;
    const idx = content.indexOf('\n\n📚 Sources');
    if (idx === -1) return [];
    return content
      .slice(idx)
      .split('\n')
      .filter(l => l.trim().startsWith('•'))
      .map(l => l.trim().replace(/^•\s*/, ''));
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }
}
