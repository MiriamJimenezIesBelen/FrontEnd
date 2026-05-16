import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RankingService {
  private url = `${environment.apiUrl}/api/ranking`;

  constructor(private http: HttpClient) {}

  guardarPuntuacion(nombre: string, puntos: number) {
    const ranking = JSON.parse(localStorage.getItem('ranking') || '[]');
    const existente = ranking.find((r: any) => r.nombre === nombre);
    if (existente) {
      existente.puntos = puntos;
    } else {
      ranking.push({ nombre, puntos });
    }
    localStorage.setItem('ranking', JSON.stringify(ranking));
  }

  obtenerRanking() {
    const ranking = JSON.parse(localStorage.getItem('ranking') || '[]');
    return ranking.sort((a: any, b: any) => b.puntos - a.puntos);
  }

  getRanking() {
    const token = localStorage.getItem('token');
    return this.http.get<any[]>(this.url, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }



  guardarPuntuacionBackend(nombre: string, puntos: number) {
    const token = localStorage.getItem('token');
    return this.http.post(this.url, { nombre, puntos }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
