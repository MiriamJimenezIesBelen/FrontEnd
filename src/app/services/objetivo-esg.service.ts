import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ObjetivoESG } from '../models/objetivo-esg.model';

@Injectable({
  providedIn: 'root'
})
export class ObjetivoESGService {

  private url = 'http://localhost:8080/api/objetivos';

  constructor(private http: HttpClient) {}

  crear(obj: ObjetivoESG) {
    const token = localStorage.getItem('token');

    return this.http.post(this.url, obj, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  porEmpresa(idEmpresa: number) {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<ObjetivoESG[]>(
      `${this.url}/${idEmpresa}`,
      { headers }
    );
  }

  eliminar(id: number) {
    const token = localStorage.getItem('token');

    console.log('TOKEN DELETE:', token);

    return this.http.delete(`${this.url}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }


}
