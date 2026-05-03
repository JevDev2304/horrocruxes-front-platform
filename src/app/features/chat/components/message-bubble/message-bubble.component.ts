import { Component, inject, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Message } from '../../../../shared/models/chat.model';
import { CharacterService } from '../../../../core/services/character.service';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [LucideAngularModule],
  host: { class: 'block' },
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
        class="relative max-w-[85%] sm:max-w-[75%] px-3 pt-2 pb-1.5 rounded-2xl text-sm leading-relaxed"
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
        <!-- Spacer invisible al final del texto para que la hora no tape el contenido -->
        <span>{{ mainText() }}<span class="invisible text-[10px] pl-8">{{ formatTime(message().createdAt) }}</span></span>

        @if (sources().length > 0) {
          <div class="mt-2 pt-2 border-t border-hp-border/50">
            <p class="text-[10px] text-hp-muted font-heading tracking-wider uppercase mb-1.5">📚 Sources</p>
            @for (source of sources(); track source) {
              <p class="text-[10px] text-hp-muted/70 leading-relaxed">• {{ source }}</p>
            }
          </div>
        }

        <!-- Hora flotando abajo a la derecha -->
        <span class="absolute bottom-1.5 right-2.5 text-[10px] opacity-50 leading-none">
          {{ formatTime(message().createdAt) }}
        </span>
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
