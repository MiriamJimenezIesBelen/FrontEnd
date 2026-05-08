export interface Empresa {
  idEmpresa?: number;
  numeroRegistro: string;
  nombre: string;
  sector: string;
  pais: string;
  ciudad: string;
  tamano: string;
  correoContacto: string;

  password?: string;

  rol?: string;
}
