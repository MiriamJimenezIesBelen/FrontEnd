import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InsightsService {

  generar(impactos: any[]): string[] {

    if (!impactos || impactos.length < 2) return [];

    const insights: string[] = [];

    const energia = impactos.map(i => i.energia || 0);
    const agua = impactos.map(i => i.agua || 0);
    const co2 = impactos.map(i => i.co2 || 0);

    // 🔥 comparación primer vs último registro
    const energiaCambio = energia.at(-1) - energia[0];
    const aguaCambio = agua.at(-1) - agua[0];
    const co2Cambio = co2.at(-1) - co2[0];

    // ⚡ Energía
    if (energiaCambio > 0) {
      insights.push('⚡ La energía está aumentando en los últimos registros');
    } else if (energiaCambio < 0) {
      insights.push('⚡ Buen progreso: la energía está bajando');
    }

    // 💧 Agua
    if (aguaCambio > 0) {
      insights.push('💧 El consumo de agua está subiendo');
    } else if (aguaCambio < 0) {
      insights.push('💧 Mejora: estás reduciendo el consumo de agua');
    }

    // 🌫️ CO2
    if (co2Cambio > 0) {
      insights.push('🌫️ Las emisiones de CO₂ están aumentando');
    } else if (co2Cambio < 0) {
      insights.push('🌫️ Buenas noticias: menos emisiones de CO₂');
    }

    // 🧠 insight global
    const mejoras = [energiaCambio, aguaCambio, co2Cambio].filter(x => x < 0).length;

    if (mejoras === 3) {
      insights.push('🌱 Tendencia general positiva en todos los indicadores');
    }

    return insights;
  }
}
