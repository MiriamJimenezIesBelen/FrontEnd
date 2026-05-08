package com.impactovisible.controller;

import com.impactovisible.dto.ProveedorDTO;
import com.impactovisible.service.ProveedorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/proveedores")
public class ProveedorController {
    private final ProveedorService service;
    public ProveedorController(ProveedorService service) { this.service = service; }

    @GetMapping("/")
    public ResponseEntity<List<ProveedorDTO>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }
}