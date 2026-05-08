package com.impactovisible.domain;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "objetivos_esg")
public class ObjetivoESG {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private Long idEmpresa;

  private String tipo; // CO2, ENERGIA, AGUA, RESIDUOS

  private Double valorObjetivo;

  private Double valorActual;

  private LocalDate fechaInicio;

  private LocalDate fechaFin;

  private boolean activo = true;
}
