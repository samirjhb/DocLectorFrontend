export type NivelRiesgo = 'alto' | 'advertencia';

export interface ClausulaDetectada {
  id: string;
  categoria: string;
  nivel: NivelRiesgo;
  textoEncontrado: string;
  explicacion: string;
  inicio: number;
  fin: number;
}

export interface AnalysisResult {
  id: number;
  filename: string;
  uploadedAt: string;
  rawText: string;
  riskCount: number;
  detectedClauses: ClausulaDetectada[];
}

export type ErrorTipo =
  | 'formato_no_soportado'
  | 'archivo_muy_grande'
  | 'imagen_no_legible'
  | 'sin_conexion'
  | 'error_servidor';

export interface AnalyzeErrorResponse {
  error: ErrorTipo;
  mensaje: string;
}

export type EtapaAnalisis = 'extrayendo' | 'ocr' | 'detectando' | 'guardando';

export interface ProgresoAnalisis {
  etapa: EtapaAnalisis;
  paginaActual?: number;
  totalPaginas?: number;
}

export interface IniciarAnalisisResponse {
  jobId: string;
}

export type AnalyzeJobStatus =
  | { estado: 'procesando'; progreso: ProgresoAnalisis }
  | { estado: 'completado'; resultado: AnalysisResult };
