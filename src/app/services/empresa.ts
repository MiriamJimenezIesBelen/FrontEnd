import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empresa } from '../models/empresa.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private url = `${environment.apiUrl}/api/empresas`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  saveEmpresa(empresa: Empresa): Observable<any> {
    return this.http.post(this.url, empresa);
  }

  findAll(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.url, { headers: this.getHeaders() });
  }

  login(correo: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.url}/login`, { correo, password });
  }

  guardarMedicion(datos: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/mediciones`, datos, { headers: this.getHeaders() });
  }

  getMediciones(idEmpresa: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/mediciones/empresa/${idEmpresa}`, { headers: this.getHeaders() });
  }

  updateEmpresa(id: number, empresa: any): Observable<any> {
    return this.http.put(`${this.url}/${id}`, empresa, { headers: this.getHeaders() });
  }

  deleteEmpresa(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`, { headers: this.getHeaders() });
  }
}
