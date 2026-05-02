import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Character } from '../../shared/models/chat.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CharacterService {
  private http = inject(HttpClient);

  private readonly _characters = signal<Character[]>([]);
  readonly characters = this._characters.asReadonly();

  async load(): Promise<void> {
    const list = await firstValueFrom(
      this.http.get<Character[]>(`${environment.apiUrl}/characters`)
    );
    this._characters.set(list);
  }

  getById(id: string): Character | undefined {
    return this._characters().find((c) => c.id === id);
  }
}
