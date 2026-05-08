package com.impactovisible.controller;

import com.impactovisible.domain.User;
import com.impactovisible.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Endpoint para registrar un nuevo usuario (Inserción)
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        log.info("REST request to register user : {}", user.getUsername());
        User result = userService.save(user);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/")
    public ResponseEntity<List<User>> getAll() {
        return ResponseEntity.ok(userService.findAll());
    }
}