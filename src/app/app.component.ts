import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CharacterService } from './core/services/character.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private characterService = inject(CharacterService);

  async ngOnInit(): Promise<void> {
    await this.characterService.load();
  }
}
