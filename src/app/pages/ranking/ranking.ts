import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RankingService } from '../../services/ranking.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ranking.html',
  styleUrl: './ranking.css'
})
export class RankingComponent implements OnInit {

  // Lista completa del ranking
  ranking: any[] = [];

  // Puntuación máxima encontrada
  // se usa para calcular porcentajes de barras
  maxPuntos: number = 1;

  // Inyectamos servicio del ranking
  // y ChangeDetector para refrescar vista manualmente
  constructor(
    private rankingService: RankingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {

    // Al iniciar componente cargamos ranking
    this.cargarRanking();
  }

  cargarRanking() {

    // Pedimos ranking al backend
    this.rankingService.getRanking().subscribe({

      next: (data) => {

        console.log("RANKING BACKEND:", data);

        // Filtramos empresas admin
        // para que no aparezcan en el ranking público
        const filtrado = (data || []).filter(r => {

          // Pasamos nombre a minúsculas
          const nombre = (r.nombre || '')
            .toLowerCase()
            .trim();

          // Excluimos cualquier nombre que contenga "admin"
          return !nombre.includes('admin');
        });

        // Copiamos ranking filtrado
        this.ranking = [...filtrado];

        // Sacamos la puntuación más alta
        // Math.max(...array) obtiene el valor máximo
        this.maxPuntos = this.ranking.length

          ? Math.max(
            ...this.ranking.map(r => r.puntos),
            1
          )

          : 1;

        // Refrescamos vista manualmente
        this.cdr.detectChanges();
      },

      error: (err) => {

        console.error("Error ranking:", err);

        // Si falla dejamos array vacío
        this.ranking = [];
      }
    });
  }

  barraAncho(puntos: number): number {

    // Calcula porcentaje de ancho para barra visual
    // Ejemplo:
    // si max = 500 y tiene 250 -> 50%
    return this.maxPuntos

      ? Math.round((puntos / this.maxPuntos) * 100)

      : 0;
  }

  nivelTexto(puntos: number): string {

    // Devuelve texto según puntuación
    if (puntos >= 500) return '🌟 Élite';

    if (puntos >= 300) return '🟢 Avanzado';

    if (puntos >= 100) return '🟡 Intermedio';

    return '⚪ Inicial';
  }

  nivelClase(puntos: number): string {

    // Devuelve clase CSS según nivel
    if (puntos >= 500) return 'nivel-elite';

    if (puntos >= 300) return 'nivel-avanzado';

    if (puntos >= 100) return 'nivel-intermedio';

    return 'nivel-inicial';
  }

  avatarClase(index: number): string {

    // Cambia estilo del avatar según posición ranking

    // Top 3
    if (index < 3) return 'av-top';

    // Top 7
    if (index < 7) return 'av-mid';

    // Resto
    return 'av-normal';
  }
}
