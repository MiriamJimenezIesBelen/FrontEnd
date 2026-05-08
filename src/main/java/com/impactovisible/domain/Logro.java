package com.impactovisible.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "logros")
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(of = "codigoLogro")
public class Logro {

    @Id
    private String codigoLogro;

    private String titulo;

    @ManyToOne
    @JoinColumn(name = "codigo_planta")
    private Planta planta;
}