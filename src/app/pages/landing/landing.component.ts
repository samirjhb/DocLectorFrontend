import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnalyzeService } from '../../core/services/analyze.service';
import { ErrorStateComponent } from '../../shared/error-state/error-state.component';
import { ErrorTipo } from '../../core/models/analysis.model';

const TIPOS_ACEPTADOS = ['application/pdf', 'image/jpeg', 'image/png'];
const TAMANO_MAXIMO_BYTES = 20 * 1024 * 1024;

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ErrorStateComponent],
  templateUrl: './landing.component.html',
})
export class LandingComponent {
  readonly arrastrando = signal(false);
  readonly errorLocal = signal<ErrorTipo | null>(null);

  constructor(
    private analyzeService: AnalyzeService,
    private router: Router,
  ) {}

  get cargando() {
    return this.analyzeService.cargando;
  }

  get errorServidor() {
    return this.analyzeService.errorActual;
  }

  get progreso() {
    return this.analyzeService.progreso;
  }

  get tiempoTranscurridoMs() {
    return this.analyzeService.tiempoTranscurridoMs;
  }

  /**
   * Mapea cada etapa a un rango del 0 al 100 para que la barra siempre muestre
   * un porcentaje creciente, aunque la etapa en sí no tenga sub-progreso propio
   * (p.ej. mientras se renderizan las páginas del PDF antes de saber cuántas hay).
   */
  readonly porcentajeProgreso = computed(() => {
    const p = this.progreso();
    if (!p) return 0;
    switch (p.etapa) {
      case 'extrayendo':
        return 5;
      case 'ocr':
        if (p.totalPaginas) {
          const avance = (p.paginaActual ?? 0) / p.totalPaginas;
          return Math.min(90, Math.round(10 + avance * 80));
        }
        return 10;
      case 'detectando':
        return 92;
      case 'guardando':
        return 97;
    }
  });

  readonly tiempoFormateado = computed(() => {
    const totalSeg = Math.floor(this.tiempoTranscurridoMs() / 1000);
    const minutos = Math.floor(totalSeg / 60);
    const segundos = totalSeg % 60;
    return minutos > 0 ? `${minutos}:${segundos.toString().padStart(2, '0')}` : `${segundos}s`;
  });

  readonly etiquetaProgreso = computed(() => {
    const p = this.progreso();
    if (!p) return 'Analizando tu contrato…';
    switch (p.etapa) {
      case 'extrayendo':
        return 'Leyendo el archivo…';
      case 'ocr':
        return p.totalPaginas
          ? `Reconociendo texto de la página ${p.paginaActual ?? 0} de ${p.totalPaginas}…`
          : 'El PDF parece escaneado: preparando reconocimiento de texto (OCR)…';
      case 'detectando':
        return 'Buscando cláusulas de riesgo…';
      case 'guardando':
        return 'Guardando resultado…';
    }
  });

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(true);
  }

  onDragLeave(): void {
    this.arrastrando.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(false);
    const archivo = event.dataTransfer?.files?.[0];
    if (archivo) {
      this.procesarArchivo(archivo);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (archivo) {
      this.procesarArchivo(archivo);
    }
    input.value = '';
  }

  private async procesarArchivo(archivo: File): Promise<void> {
    this.errorLocal.set(null);

    if (!TIPOS_ACEPTADOS.includes(archivo.type)) {
      this.errorLocal.set('formato_no_soportado');
      return;
    }
    if (archivo.size > TAMANO_MAXIMO_BYTES) {
      this.errorLocal.set('archivo_muy_grande');
      return;
    }

    const resultado = await this.analyzeService.analizarArchivo(archivo);
    if (resultado) {
      this.router.navigate(['/resultado']);
    }
  }

  reintentar(): void {
    this.errorLocal.set(null);
    this.analyzeService.limpiarError();
  }
}
