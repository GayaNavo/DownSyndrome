// Analysis Result Model
export interface AnalysisResult {
  id: string;
  childId: string;
  facialImageData?: string; // Base64 encoded image or URL
  sdqScores: {
    emotional: number;
    conduct: number;
    hyperactivity: number;
    peer: number;
    prosocial: number;
  };
  totalDifficulty: number;
  percentage: number;
  interpretation: string; // Normal range, borderline, clinical
  createdAt: Date;
  analysisType: 'facial' | 'sdq' | 'combined';
  notes?: string;
  confidence?: number; // Confidence level of the analysis
}

export class AnalysisResultModel {
  static validate(result: AnalysisResult): boolean {
    return (
      !!result.childId &&
      result.sdqScores !== undefined &&
      result.totalDifficulty !== undefined &&
      result.percentage !== undefined &&
      result.createdAt instanceof Date
    );
  }

  static calculateInterpretation(percentage: number): string {
    if (percentage < 15) {
      return 'Within Normal Range';
    } else if (percentage < 20) {
      return 'Borderline Range';
    } else {
      return 'Clinical Range';
    }
  }
}