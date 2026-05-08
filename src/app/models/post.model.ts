export interface Post {
  id?: number;
  autor: string;
  texto: string;
  tipo: 'pregunta' | 'idea' | 'logro';
  fecha?: string;
  likes?: number;
  comentarios?: Comentario[];
}

export interface Comentario {
  autor: string;
  texto: string;
  fecha?: string;
}
