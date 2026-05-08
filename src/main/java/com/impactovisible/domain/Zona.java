package com.impactovisible.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "zonas")
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(of = "codigoZona")
public class Zona {

    @Id
    private String codigoZona;

    private String nombre;

    @ManyToOne
    @JoinColumn(name = "codigo_planta")
    private Planta planta;
}