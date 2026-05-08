package com.impactovisible.controller;

import com.impactovisible.dto.OfertaProveedorDTO;
import com.impactovisible.service.OfertaProveedorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/ofertas")
public class OfertaProveedorController {
    private final OfertaProveedorService service;
    public OfertaProveedorController(OfertaProveedorService service) { this.service = service; }

    @GetMapping("/")
    public ResponseEntity<List<OfertaProveedorDTO>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }
}