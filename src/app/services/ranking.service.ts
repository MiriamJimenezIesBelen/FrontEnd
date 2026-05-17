import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RankingService {

  // URL del backend para ranking
  private url = `${environment.apiUrl}/api/ranking`;

  constructor(private http: HttpClient) {}

  // Guarda puntuación en localStorage (modo offline o demo)
  guardarPuntuacion(nombre: string, puntos: number) {

    const ranking =
      JSON.parse(localStorage.getItem('ranking') || '[]');

    // Busca si el usuario ya existe
    const existente = ranking.find(
      (r: any) => r.nombre === nombre
    );

    // Si existe actualiza puntos
    if (existente) {
      existente.puntos = puntos;

    } else {
      // Si no existe lo añade
      ranking.push({ nombre, puntos });
    }

    localStorage.setItem(
      'ranking',
      JSON.stringify(ranking)
    );
  }

  // Devuelve ranking local ordenado
  obtenerRanking() {

    const ranking =
      JSON.parse(localStorage.getItem('ranking') || '[]');

    return ranking.sort(
      (a: any, b: any) => b.puntos - a.puntos
    );
  }

  // Obtiene ranking desde backend
  getRanking() {

    const token = localStorage.getItem('token');

    return this.http.get<any[]>(
      this.url,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  // Guarda puntuación en backend
  guardarPuntuacionBackend(
    nombre: string,
    puntos: number
  ) {

    const token = localStorage.getItem('token');

    return this.http.post(
      this.url,
      { nombre, puntos },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
}
