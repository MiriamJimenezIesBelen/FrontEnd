package com.impactovisible.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "empresas")
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@Builder
@ToString(exclude = "plantas")
@EqualsAndHashCode(of = "idEmpresa")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEmpresa;

    @JsonProperty("numeroRegistro")
    private String numeroRegistro;
    private String nombre;

    private String password;

    private String sector;
    private String pais;
    private String ciudad;

    @Enumerated(EnumType.STRING)
    private Tamano tamano;

    @JsonProperty("correoContacto")
    private String correoContacto;

    @Enumerated(EnumType.STRING)
    private Rol rol;

    @OneToMany(mappedBy = "empresa")
    private List<Planta> plantas;

    public enum Tamano { pequena, mediana, grande }

    public enum Rol {
        USER,
        ADMIN
    }
}