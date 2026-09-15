import { Injectable, effect, signal } from '@angular/core';

export type Tema = 'claro' | 'oscuro';

const STORAGE_KEY = 'claridad-contrato-tema';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly tema = signal<Tema>(this.temaInicial());

  constructor() {
    effect(() => {
      const oscuro = this.tema() === 'oscuro';
      document.documentElement.classList.toggle('dark', oscuro);
      try {
        localStorage.setItem(STORAGE_KEY, this.tema());
      } catch {
        // localStorage no disponible (modo privado, etc.) — se ignora
      }
    });
  }

  alternar(): void {
    this.tema.set(this.tema() === 'oscuro' ? 'claro' : 'oscuro');
  }

  private temaInicial(): Tema {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado === 'claro' || guardado === 'oscuro') return guardado;
    } catch {
      // localStorage no disponible — seguimos con la preferencia del sistema
    }
    const prefiereOscuro = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefiereOscuro ? 'oscuro' : 'claro';
  }
}
