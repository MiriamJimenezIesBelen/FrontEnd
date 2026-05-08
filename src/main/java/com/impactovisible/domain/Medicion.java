package com.impactovisible.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "mediciones")
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(of = "codigoMedicion")
public class Medicion {

    @Id
    private String codigoMedicion;

    private LocalDate fecha;

    @Enumerated(EnumType.STRING)
    private TipoMedicion tipo;

    private BigDecimal valor;

    @ManyToOne
    @JoinColumn(name = "codigo_planta")
    private Planta planta;

    public enum TipoMedicion { electricidad, gas, agua, materia_prima, residuo, emision }
}