package com.impactovisible.controller;

import com.impactovisible.domain.Post;
import com.impactovisible.service.PostService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:4200")
public class PostController {

    private final PostService service;

    public PostController(PostService service) {
        this.service = service;
    }

    @GetMapping
    public List<Post> getAll() {
        return service.findAll();
    }

    @PostMapping
    public Post create(@RequestBody Post post) {
        return service.create(post);
    }

    @PutMapping("/{id}/like")
    public Post like(@PathVariable Long id) {
        return service.like(id);
    }
}