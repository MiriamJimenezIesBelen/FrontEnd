package com.impactovisible.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "maquinas")
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(of = "codigoMaquina")
public class Maquina {

    @Id
    private String codigoMaquina;

    private String nombre;
    private String tipo;

    @ManyToOne
    @JoinColumn(name = "codigo_planta")
    private Planta planta;
}