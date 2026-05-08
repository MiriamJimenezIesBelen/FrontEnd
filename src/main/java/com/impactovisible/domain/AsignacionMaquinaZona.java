package com.impactovisible.domain;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "asignacion_maquina_zona")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AsignacionMaquinaZona {
    @Id
    private String codigoAsignacion;

    @ManyToOne
    @JoinColumn(name = "codigo_maquina")
    private Maquina maquina;

    @ManyToOne
    @JoinColumn(name = "codigo_zona")
    private Zona zona;
}