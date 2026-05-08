package com.impactovisible.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EmpresaDTO {
    private Long idEmpresa;
    private String numeroRegistro;
    private String nombre;

    private String password;

    private String sector;
    private String pais;
    private String ciudad;
    private String tamano;
    private String correoContacto;

    private String rol;
}