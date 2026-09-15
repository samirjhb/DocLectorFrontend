import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorTipo } from '../../core/models/analysis.model';

interface ErrorContenido {
  titulo: string;
  mensaje: string;
  icono: string;
  sugerencia: string;
}

const CONTENIDOS: Record<ErrorTipo, ErrorContenido> = {
  formato_no_soportado: {
    titulo: 'Ese formato no lo podemos leer',
    mensaje: 'Solo aceptamos archivos PDF, JPG o PNG.',
    icono: '📄',
    sugerencia: 'Probá subir una foto clara del contrato o el PDF original.',
  },
  archivo_muy_grande: {
    titulo: 'El archivo es muy pesado',
    mensaje: 'El tamaño máximo permitido es de 20 MB.',
    icono: '⚖️',
    sugerencia: 'Intentá comprimir el archivo o sacar una foto con menor resolución.',
  },
  imagen_no_legible: {
    titulo: 'No pudimos leer el texto de la imagen',
    mensaje: 'La imagen está borrosa, oscura o el texto es muy chico.',
    icono: '🔍',
    sugerencia: 'Sacá la foto con buena luz, bien enfocada y que se vea todo el texto.',
  },
  sin_conexion: {
    titulo: 'Sin conexión',
    mensaje: 'No pudimos comunicarnos con el servidor.',
    icono: '📶',
    sugerencia: 'Revisá tu conexión a internet e intentá de nuevo.',
  },
  error_servidor: {
    titulo: 'Algo salió mal de nuestro lado',
    mensaje: 'Tuvimos un problema al procesar el contrato.',
    icono: '⚠️',
    sugerencia: 'Esperá un momento e intentá de nuevo. Si sigue fallando, probá con otro archivo.',
  },
};

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center text-center gap-3 rounded-2xl border border-orange-100 dark:border-orange-900/40 bg-orange-50/60 dark:bg-orange-900/10 p-8 max-w-md mx-auto">
      <span class="text-4xl" aria-hidden="true">{{ contenido().icono }}</span>
      <h3 class="text-lg font-semibold text-stone-800 dark:text-stone-100">{{ contenido().titulo }}</h3>
      <p class="text-stone-600 dark:text-stone-300">{{ contenido().mensaje }}</p>
      <p class="text-sm text-stone-500 dark:text-stone-400">{{ contenido().sugerencia }}</p>
      <button
        *ngIf="mostrarReintentar"
        (click)="reintentar.emit()"
        class="mt-2 rounded-full bg-[#D85A30] px-5 py-2 text-white text-sm font-medium hover:opacity-90 transition"
      >
        Intentar de nuevo
      </button>
    </div>
  `,
})
export class ErrorStateComponent {
  private tipoSignal = signal<ErrorTipo>('error_servidor');

  @Input() set tipo(valor: ErrorTipo) {
    this.tipoSignal.set(valor);
  }

  @Input() mostrarReintentar = true;
  @Output() reintentar = new EventEmitter<void>();

  contenido = computed(() => CONTENIDOS[this.tipoSignal()]);
}
