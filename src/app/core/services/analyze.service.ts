import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AnalysisResult,
  AnalyzeErrorResponse,
  AnalyzeJobStatus,
  ErrorTipo,
  IniciarAnalisisResponse,
  ProgresoAnalisis,
} from '../models/analysis.model';

const API_URL = `${environment.apiUrl}/analyze`;
const HISTORIAL_KEY = 'claridad_contrato_historial';
const INTERVALO_POLLING_MS = 1000;

@Injectable({ providedIn: 'root' })
export class AnalyzeService {
  readonly cargando = signal(false);
  readonly progreso = signal<ProgresoAnalisis | null>(null);
  readonly tiempoTranscurridoMs = signal(0);
  readonly resultadoActual = signal<AnalysisResult | null>(null);
  readonly errorActual = signal<ErrorTipo | null>(null);

  constructor(private http: HttpClient) {}

  async analizarArchivo(file: File): Promise<AnalysisResult | null> {
    this.cargando.set(true);
    this.errorActual.set(null);
    this.progreso.set({ etapa: 'extrayendo' });
    this.tiempoTranscurridoMs.set(0);

    const inicio = Date.now();
    const intervaloReloj = setInterval(() => {
      this.tiempoTranscurridoMs.set(Date.now() - inicio);
    }, 1000);

    const formData = new FormData();
    formData.append('archivo', file);

    try {
      const { jobId } = await firstValueFrom(
        this.http.post<IniciarAnalisisResponse>(API_URL, formData),
      );
      const resultado = await this.esperarResultado(jobId);
      this.resultadoActual.set(resultado);
      this.guardarEnHistorial(resultado);
      return resultado;
    } catch (err) {
      this.errorActual.set(this.mapearError(err));
      return null;
    } finally {
      clearInterval(intervaloReloj);
      this.cargando.set(false);
      this.progreso.set(null);
    }
  }

  limpiarError(): void {
    this.errorActual.set(null);
  }

  /** Hace polling del estado del análisis hasta que termine o falle. */
  private async esperarResultado(jobId: string): Promise<AnalysisResult> {
    for (;;) {
      const estado = await firstValueFrom(
        this.http.get<AnalyzeJobStatus>(`${API_URL}/${jobId}`),
      );
      if (estado.estado === 'completado') {
        return estado.resultado;
      }
      this.progreso.set(estado.progreso);
      await this.esperar(INTERVALO_POLLING_MS);
    }
  }

  private esperar(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private mapearError(err: unknown): ErrorTipo {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return 'sin_conexion';
      }
      const body = err.error as AnalyzeErrorResponse | undefined;
      if (body?.error) {
        return body.error;
      }
      if (err.status >= 500) {
        return 'error_servidor';
      }
    }
    return 'error_servidor';
  }

  private guardarEnHistorial(resultado: AnalysisResult): void {
    try {
      const historial = this.obtenerHistorial();
      historial.unshift({
        id: resultado.id,
        filename: resultado.filename,
        uploadedAt: resultado.uploadedAt,
        riskCount: resultado.riskCount,
      });
      localStorage.setItem(HISTORIAL_KEY, JSON.stringify(historial.slice(0, 20)));
    } catch {
      // localStorage puede no estar disponible; el historial es un extra, no algo crítico.
    }
  }

  obtenerHistorial(): Array<{ id: number; filename: string; uploadedAt: string; riskCount: number }> {
    try {
      const raw = localStorage.getItem(HISTORIAL_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
