package com.impactovisible.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "informes")
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(of = "idInformes")
public class Informe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idInforme;

    private LocalDate periodoInicio;
    private LocalDate periodoFin;

    @ManyToOne
    @JoinColumn(name = "codigo_planta")
    private Planta planta;
}