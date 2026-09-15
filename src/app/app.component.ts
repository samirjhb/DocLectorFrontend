import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <button
      type="button"
      (click)="theme.alternar()"
      class="fixed top-4 right-4 z-50 h-10 w-10 rounded-full border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-200 flex items-center justify-center shadow-sm hover:opacity-90 transition-colors"
      [attr.aria-label]="theme.tema() === 'oscuro' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    >
      <span aria-hidden="true">{{ theme.tema() === 'oscuro' ? '☀️' : '🌙' }}</span>
    </button>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  title = 'ClaridadContrato';
  protected theme = inject(ThemeService);
}
