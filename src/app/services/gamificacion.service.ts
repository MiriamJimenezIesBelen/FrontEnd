import { Injectable } from '@angular/core';

// Servicio de gamificación (puntos, medallas y niveles)
// Se usa para transformar datos de impacto en progreso tipo juego
@Injectable({
  providedIn: 'root'
})
export class GamificacionService {

  // Calcula puntos totales a partir de los impactos registrados
  calcularPuntos(impactos: any[]): number {

    let puntos = 0;

    impactos.forEach(i => {

      // Energía: cuanto menor consumo, más puntos
      // penaliza consumos altos
      puntos += Math.max(
        0,
        50 - (i.energia / 50)
      );

      // Agua: escala distinta porque el consumo es mayor
      puntos += Math.max(
        0,
        50 - (i.agua / 200)
      );

      // Residuos: penalización por generación alta
      puntos += Math.max(
        0,
        50 - (i.residuos / 10)
      );
    });

    // Redondeo final de puntos
    return Math.round(puntos);
  }

  // Genera lista de medallas según progreso
  obtenerMedallas(
    puntos: number,
    impactos: any[]
  ): string[] {

    const medallas: string[] = [];

    // Medallas por puntuación global
    if (puntos >= 100)
      medallas.push('🌱 Eco Inicial');

    if (puntos >= 300)
      medallas.push('⚡ Eficiente');

    if (puntos >= 600)
      medallas.push('🌍 Sostenible PRO');

    // Medalla por constancia (número de registros)
    if (impactos.length >= 5)
      medallas.push('📊 Constancia');

    // Medalla por eficiencia energética global
    if (
      impactos.every(
        i => i.energia < 1000
      )
    ) {
      medallas.push('⚡ Eficiencia energética');
    }

    return medallas;
  }

  // Devuelve nivel global del jugador
  calcularNivel(puntos: number) {

    if (puntos >= 600)
      return 'Oro';

    if (puntos >= 300)
      return 'Plata';

    return 'Bronce';
  }
}
