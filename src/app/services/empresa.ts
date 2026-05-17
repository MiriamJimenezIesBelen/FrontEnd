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
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
    // Usa POST en lugar de DELETE para evitar bloqueos de proxy
    return this.http.post(`${this.url}/${id}/eliminar`, {}, { headers });
  }

  getPlantasByEmpresa(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/${id}/plantas`, { headers: this.getHeaders() });
  }

  getMedicionesByEmpresa(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/mediciones/empresa/${id}`, { headers: this.getHeaders() });
  }

  createEmpresa(empresa: any): Observable<any> {
    return this.http.post<any>(`${this.url}/admin/crear`, empresa, { headers: this.getHeaders() });
  }

  eliminarMedicionPorFecha(idEmpresa: number, fecha: string): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}/api/mediciones/empresa/${idEmpresa}/fecha/${fecha}`,
      { headers: this.getHeaders() }
    );
  }
}
