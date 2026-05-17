import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ObjetivoESG } from '../models/objetivo-esg.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ObjetivoESGService {

  // URL base del endpoint de objetivos ESG
  private url = `${environment.apiUrl}/api/objetivos`;

  constructor(private http: HttpClient) {}

  // Crear un nuevo objetivo ESG
  crear(obj: ObjetivoESG) {

    const token = localStorage.getItem('token');

    return this.http.post(
      this.url,
      obj,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  // Obtener objetivos por empresa
  porEmpresa(idEmpresa: number) {

    const token = localStorage.getItem('token');

    return this.http.get<ObjetivoESG[]>(
      `${this.url}/${idEmpresa}`,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }
    );
  }

  // Eliminar un objetivo por ID
  eliminar(id: number) {

    const token = localStorage.getItem('token');

    return this.http.delete(
      `${this.url}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
}
