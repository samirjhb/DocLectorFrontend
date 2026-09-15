import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnalyzeService } from '../../core/services/analyze.service';
import { ClausulaDetectada } from '../../core/models/analysis.model';

interface Segmento {
  texto: string;
  clausula: ClausulaDetectada | null;
}

@Component({
  selector: 'app-resultado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resultado.component.html',
})
export class ResultadoComponent {
  constructor(
    private analyzeService: AnalyzeService,
    private router: Router,
  ) {}

  get resultado() {
    return this.analyzeService.resultadoActual;
  }

  readonly segmentos = computed<Segmento[]>(() => {
    const resultado = this.resultado();
    if (!resultado) return [];

    const texto = resultado.rawText;
    const clausulas = [...resultado.detectedClauses].sort((a, b) => a.inicio - b.inicio);

    const segmentos: Segmento[] = [];
    let cursor = 0;

    for (const clausula of clausulas) {
      if (clausula.inicio < cursor) continue; // evita solapamientos
      if (clausula.inicio > cursor) {
        segmentos.push({ texto: texto.slice(cursor, clausula.inicio), clausula: null });
      }
      segmentos.push({ texto: texto.slice(clausula.inicio, clausula.fin), clausula });
      cursor = clausula.fin;
    }
    if (cursor < texto.length) {
      segmentos.push({ texto: texto.slice(cursor), clausula: null });
    }
    return segmentos;
  });

  readonly clausulasAlto = computed(() =>
    (this.resultado()?.detectedClauses ?? []).filter((c) => c.nivel === 'alto'),
  );

  readonly clausulasAdvertencia = computed(() =>
    (this.resultado()?.detectedClauses ?? []).filter((c) => c.nivel === 'advertencia'),
  );

  volver(): void {
    this.router.navigate(['/']);
  }
}
