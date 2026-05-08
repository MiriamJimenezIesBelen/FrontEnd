package com.impactovisible.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LoginResponse {
    private String token;
    private Long idEmpresa;
    private String nombre;
    private String sector;
    private String rol;
}