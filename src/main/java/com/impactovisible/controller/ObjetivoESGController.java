package com.impactovisible.controller;

import com.impactovisible.domain.ObjetivoESG;
import com.impactovisible.service.ObjetivoESGService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/objetivos")
@CrossOrigin
public class ObjetivoESGController {

  @Autowired
  private ObjetivoESGService service;

  @PostMapping
  public ObjetivoESG crear(@RequestBody ObjetivoESG obj) {
    return service.crear(obj);
  }

  @GetMapping("/{idEmpresa}")
  public List<ObjetivoESG> obtener(@PathVariable Long idEmpresa) {
    return service.porEmpresa(idEmpresa);
  }
}
