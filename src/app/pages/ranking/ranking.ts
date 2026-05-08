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

  ranking: any[] = [];
  maxPuntos: number = 1;

  constructor(
    private rankingService: RankingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarRanking();
  }

  cargarRanking() {
    this.rankingService.getRanking().subscribe({
      next: (data) => {

        console.log("RANKING BACKEND:", data);

        // ❌ quitar admin del ranking
        const filtrado = (data || []).filter(r => {
          const nombre = (r.nombre || '').toLowerCase().trim();

          return !nombre.includes('admin');
        });

        this.ranking = [...filtrado];

        this.maxPuntos = this.ranking.length
          ? Math.max(...this.ranking.map(r => r.puntos), 1)
          : 1;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error("Error ranking:", err);
        this.ranking = [];
      }
    });
  }

  barraAncho(puntos: number): number {
    return this.maxPuntos ? Math.round((puntos / this.maxPuntos) * 100) : 0;
  }

  nivelTexto(puntos: number): string {
    if (puntos >= 500) return '🌟 Élite';
    if (puntos >= 300) return '🟢 Avanzado';
    if (puntos >= 100) return '🟡 Intermedio';
    return '⚪ Inicial';
  }

  nivelClase(puntos: number): string {
    if (puntos >= 500) return 'nivel-elite';
    if (puntos >= 300) return 'nivel-avanzado';
    if (puntos >= 100) return 'nivel-intermedio';
    return 'nivel-inicial';
  }

  avatarClase(index: number): string {
    if (index < 3) return 'av-top';
    if (index < 7) return 'av-mid';
    return 'av-normal';
  }
}
