import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComunidadService } from '../../services/comunidad.service';

@Component({
  selector: 'app-comunidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comunidad.html',
  styleUrl: './comunidad.css'
})
export class ComunidadComponent implements OnInit {

  posts: any[] = [];
  nuevoPost: string = '';
  nuevoTipo: string = 'idea';
  filtroTipo: string = '';
  nombreEmpresa: string = '';

  tipos = [
    { valor: 'idea',     emoji: '💡', label: 'Idea'     },
    { valor: 'pregunta', emoji: '❓', label: 'Pregunta' },
    { valor: 'logro',    emoji: '🏆', label: 'Logro'    }
  ];

  faqs = [
    {
      pregunta: '¿Cómo calculo mi huella de carbono?',
      respuesta: 'Puedes usar nuestra calculadora integrada en la sección "Calculadora". Registra tu consumo eléctrico, combustibles y residuos generados para obtener una estimación de tus emisiones de CO₂.',
      open: false
    },
    {
      pregunta: '¿Qué son los objetivos ESG?',
      respuesta: 'Los objetivos ESG (Ambiental, Social y Gobernanza) son metas que las empresas se fijan para medir su impacto sostenible. En ImpactoVisible puedes definirlos y hacer seguimiento desde la sección "Objetivos".',
      open: false
    },
    {
      pregunta: '¿Cómo mejorar mi índice de sostenibilidad?',
      respuesta: 'El índice se calcula en base a tus consumos registrados. Reducir la energía, agua y CO₂ lo mejora. Consulta el Plan de Acción para ver recomendaciones personalizadas.',
      open: false
    },
    {
      pregunta: '¿Puedo exportar mi informe de sostenibilidad?',
      respuesta: 'Sí, desde la sección "Informe PDF" puedes generar un documento profesional con todos tus datos de impacto ambiental para compartir con clientes o inversores.',
      open: false
    },
    {
      pregunta: '¿Cómo encuentro proveedores sostenibles?',
      respuesta: 'Usa el Buscador de Proveedores para filtrar empresas certificadas con criterios ESG. Puedes filtrar por sector, país y tipo de certificación.',
      open: false
    }
  ];

  constructor(private comunidadService: ComunidadService) {}

  ngOnInit() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.nombreEmpresa = usuario.nombre || 'Empresa';
    this.cargarPosts();
  }

  cargarPosts() {
    const data = localStorage.getItem('posts');
    const raw = data ? JSON.parse(data) : [];
    // Aseguramos que cada post tenga showComments
    this.posts = raw.map((p: any) => ({ ...p, showComments: p.showComments ?? false }));
  }

  publicar() {
    if (!this.nuevoPost.trim()) return;

    const post = {
      id: Date.now(),
      autor: this.nombreEmpresa,
      texto: this.nuevoPost,
      tipo: this.nuevoTipo,
      fecha: new Date(),
      likes: 0,
      comentarios: [],
      showComments: false
    };

    this.posts.unshift(post);
    this.guardar();
    this.nuevoPost = '';
  }

  darLike(post: any) {
    post.likes++;
    this.guardar();
  }

  comentar(post: any, texto: string) {
    if (!texto.trim()) return;
    post.comentarios.push({
      autor: this.nombreEmpresa,
      texto: texto,
      fecha: new Date()
    });
    this.guardar();
  }

  eliminar(post: any) {
    this.posts = this.posts.filter(p => p.id !== post.id);
    this.guardar();
  }

  guardar() {
    localStorage.setItem('posts', JSON.stringify(this.posts));
  }

  tipoLabel(tipo: string): string {
    const t = this.tipos.find(x => x.valor === tipo);
    return t ? `${t.emoji} ${t.label}` : tipo;
  }

  get postsFiltrados() {
    if (!this.filtroTipo) return this.posts;
    return this.posts.filter(p => p.tipo === this.filtroTipo);
  }

  get postsDestacados() {
    return this.posts.filter(p => p.likes >= 3).sort((a, b) => b.likes - a.likes);
  }

  get totalLikes() {
    return this.posts.reduce((sum, p) => sum + p.likes, 0);
  }
}
