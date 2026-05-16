import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GamificacionService {

  calcularPuntos(impactos: any[]): number {
    let puntos = 0;

    impactos.forEach(i => {

      // energía
      puntos += Math.max(0, 50 - (i.energia / 50));

      // agua
      puntos += Math.max(0, 50 - (i.agua / 200));

      // residuos
      puntos += Math.max(0, 50 - (i.residuos / 10));
    });

    return Math.round(puntos);
  }

  obtenerMedallas(puntos: number, impactos: any[]): string[] {
    const medallas: string[] = [];

    if (puntos >= 100) medallas.push('🌱 Eco Inicial');
    if (puntos >= 300) medallas.push('⚡ Eficiente');
    if (puntos >= 600) medallas.push('🌍 Sostenible PRO');

    if (impactos.length >= 5) medallas.push("📊 Constancia");

    if (impactos.every(i => i.energia < 1000)) {
      medallas.push("⚡ Eficiencia energética");
    }

    return medallas;
  }

  calcularNivel(puntos: number) {
    if (puntos >= 600) return 'Oro';
    if (puntos >= 300) return 'Plata';
    return 'Bronce';
  }
}
