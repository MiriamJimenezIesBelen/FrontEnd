package com.impactovisible.controller;

import com.impactovisible.dto.InformeDTO;
import com.impactovisible.service.InformeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/informes")
public class InformeController {
    private final InformeService service;
    public InformeController(InformeService service) { this.service = service; }

    @GetMapping("/")
    public ResponseEntity<List<InformeDTO>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }
}