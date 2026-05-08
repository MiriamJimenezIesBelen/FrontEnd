import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RankingService {

  private url = 'http://localhost:8080/api/ranking';

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

    return this.http.get<any[]>(
      'http://localhost:8080/api/ranking',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
}
