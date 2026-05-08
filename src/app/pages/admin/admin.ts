import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { EmpresaService } from '../../services/empresa';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {

  usuarios: any[] = [];
  editando: boolean = false;
  mensajeExito: boolean = false;
  empresaEditando: any = {};

  constructor(
    private empresaService: EmpresaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.empresaService.findAll().subscribe({
      next: (data: any[]) => {
        this.usuarios = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar:', err)
    });
  }

  editar(empresa: any) {
    // Copia el objeto para no modificar la tabla directamente
    this.empresaEditando = { ...empresa };
    this.editando = true;
  }

  cancelarEdicion() {
    this.editando = false;
    this.empresaEditando = {};
  }

  guardarEdicion() {
    this.empresaService.updateEmpresa(this.empresaEditando.idEmpresa, this.empresaEditando).subscribe({
      next: (actualizada: any) => {
        // Actualiza en la lista local
        const index = this.usuarios.findIndex(u => u.idEmpresa === actualizada.idEmpresa);
        if (index !== -1) this.usuarios[index] = actualizada;
        this.mensajeExito = true;
        setTimeout(() => {
          this.mensajeExito = false;
          this.editando = false;
          this.empresaEditando = {};
          this.cdr.detectChanges();
        }, 2000);
      },
      error: (err: any) => {
        console.error('Error al actualizar:', err);
        alert('Error al guardar los cambios');
      }
    });
  }

  eliminar(id: number) {
    if (!id || !confirm('¿Seguro que quieres eliminar esta empresa? Esta acción no se puede deshacer.')) return;

    this.empresaService.deleteEmpresa(id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(u => u.idEmpresa !== id);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al eliminar:', err);
        alert('Error al eliminar la empresa');
      }
    });
  }



}
