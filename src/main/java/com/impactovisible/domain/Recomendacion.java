package com.impactovisible.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recomendaciones")
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(of = "idRecomendacion")
public class Recomendacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idRecomendacion;

    @Enumerated(EnumType.STRING)
    private TemaRecomendacion tema;

    private String titulo;

    @Enumerated(EnumType.STRING)
    private Dificultad dificultad;

    public enum TemaRecomendacion { energia, agua, residuos, transporte, emisiones }
    public enum Dificultad { baja, media, alta }
}