import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ComunidadService {

  // URL base del backend
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Obtiene todos los posts de la comunidad
  getPosts() {
    return this.http.get<any[]>(
      `${this.api}/api/posts`
    );
  }

  // Crea un nuevo post
  crearPost(post: any) {
    return this.http.post(
      `${this.api}/api/posts`,
      post
    );
  }

  // Da like a un post concreto
  likePost(id: number) {
    return this.http.post(
      `${this.api}/posts/${id}/like`,
      {}
    );
  }

  // Añade un comentario a un post
  addComentario(postId: number, comentario: any) {
    return this.http.post(
      `${this.api}/posts/${postId}/comentarios`,
      comentario
    );
  }

  // Obtiene comentarios de un post
  getComentarios(postId: number) {
    return this.http.get<any[]>(
      `${this.api}/api/comentarios/${postId}`
    );
  }

  // Elimina un post
  deletePost(id: number) {
    return this.http.delete(
      `${this.api}/posts/${id}`
    );
  }
}
