package com.impactovisible.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "proveedores")
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@Builder
@EqualsAndHashCode(of = "registroProveedor")
public class Proveedor {
    @Id
    private String registroProveedor;
    private String nombre;
    private String pais;
}

