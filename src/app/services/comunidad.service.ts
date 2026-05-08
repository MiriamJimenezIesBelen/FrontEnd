import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ComunidadService {

  constructor(private http: HttpClient) {}

  getPosts() {
    return this.http.get<any[]>('/api/posts');
  }

  crearPost(post: any) {
    return this.http.post('/api/posts', post);
  }

  likePost(id: number) {
    return this.http.post(`http://localhost:8080/posts/${id}/like`, {});
  }

  addComentario(postId: number, comentario: any) {
    return this.http.post(`http://localhost:8080/posts/${postId}/comentarios`, comentario);
  }

  getComentarios(postId: number) {
    return this.http.get<any[]>(`/api/comentarios/${postId}`);
  }

  deletePost(id: number) {
    return this.http.delete(`http://localhost:8080/posts/${id}`);
  }
}
