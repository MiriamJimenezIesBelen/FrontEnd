package com.impactovisible.domain;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "ofertas_proveedor")
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@Builder
public class OfertaProveedor {
    @Id
    private String idOferta;
    private String productoServicio;

    @ManyToOne
    @JoinColumn(name = "registro_proveedor")
    private Proveedor proveedor;
}