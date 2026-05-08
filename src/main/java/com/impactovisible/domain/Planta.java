package com.impactovisible.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "plantas")
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(of = "codigoPlanta")
public class Planta {

    @Id
    private String codigoPlanta;

    private String nombre;
    private String direccion;

    @ManyToOne
    @JoinColumn(name = "id_empresa")
    private Empresa empresa;
}