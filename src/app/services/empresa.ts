import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empresa } from '../models/empresa.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmpresaService {

  // URL base del módulo empresas
  private url = `${environment.apiUrl}/api/empresas`;

  constructor(private http: HttpClient) {}

  // Construye headers con token si existe
  private getHeaders(): HttpHeaders {

    const token = localStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',

      // Si hay token lo añade como Bearer
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Crear empresa
  saveEmpresa(empresa: Empresa): Observable<any> {
    return this.http.post(this.url, empresa);
  }

  // Obtener todas las empresas
  findAll(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(
      this.url,
      { headers: this.getHeaders() }
    );
  }

  // Login de empresa
  login(correo: string, password: string): Observable<any> {
    return this.http.post<any>(
      `${this.url}/login`,
      { correo, password }
    );
  }

  // Guardar medición ESG/impacto
  guardarMedicion(datos: any): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/api/mediciones`,
      datos,
      { headers: this.getHeaders() }
    );
  }

  // Obtener mediciones de una empresa
  getMediciones(idEmpresa: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiUrl}/api/mediciones/empresa/${idEmpresa}`,
      { headers: this.getHeaders() }
    );
  }

  // Actualizar empresa
  updateEmpresa(id: number, empresa: any): Observable<any> {
    return this.http.put(
      `${this.url}/${id}`,
      empresa,
      { headers: this.getHeaders() }
    );
  }

  // Eliminar empresa (usa POST en backend por proxy)
  deleteEmpresa(id: number): Observable<any> {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });

    return this.http.post(
      `${this.url}/${id}/eliminar`,
      {},
      { headers }
    );
  }

  // Obtener plantas de una empresa
  getPlantasByEmpresa(id: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.url}/${id}/plantas`,
      { headers: this.getHeaders() }
    );
  }

  // Otra forma de obtener mediciones (duplicado funcional)
  getMedicionesByEmpresa(id: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiUrl}/api/mediciones/empresa/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // Crear empresa desde panel admin
  createEmpresa(empresa: any): Observable<any> {
    return this.http.post(
      `${this.url}/admin/crear`,
      empresa,
      { headers: this.getHeaders() }
    );
  }

  // Eliminar medición por fecha concreta
  eliminarMedicionPorFecha(
    idEmpresa: number,
    fecha: string
  ): Observable<any> {

    return this.http.delete(
      `${environment.apiUrl}/api/mediciones/empresa/${idEmpresa}/fecha/${fecha}`,
      { headers: this.getHeaders() }
    );
  }
}
