package com.impactovisible.controller;

import com.impactovisible.dto.AccionSostenibilidadDTO;
import com.impactovisible.service.AccionSostenibilidadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/acciones-sostenibilidad")
public class AccionSostenibilidadController {
    private final AccionSostenibilidadService service;
    public AccionSostenibilidadController(AccionSostenibilidadService service) { this.service = service; }

    @GetMapping("/")
    public ResponseEntity<List<AccionSostenibilidadDTO>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }
}