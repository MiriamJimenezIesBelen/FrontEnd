import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ComunidadService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPosts() {
    return this.http.get<any[]>(`${this.api}/api/posts`);
  }

  crearPost(post: any) {
    return this.http.post(`${this.api}/api/posts`, post);
  }

  likePost(id: number) {
    return this.http.post(`${this.api}/posts/${id}/like`, {});
  }

  addComentario(postId: number, comentario: any) {
    return this.http.post(`${this.api}/posts/${postId}/comentarios`, comentario);
  }

  getComentarios(postId: number) {
    return this.http.get<any[]>(`${this.api}/api/comentarios/${postId}`);
  }

  deletePost(id: number) {
    return this.http.delete(`${this.api}/posts/${id}`);
  }
}
