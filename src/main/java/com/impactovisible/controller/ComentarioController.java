package com.impactovisible.controller;

import com.impactovisible.domain.Comentario;
import com.impactovisible.domain.Post;
import com.impactovisible.repository.ComentarioRepository;
import com.impactovisible.repository.PostRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/comentarios")
@CrossOrigin(origins = "http://localhost:4200")
public class ComentarioController {

    private final ComentarioRepository repo;
    private final PostRepository postRepo;

    public ComentarioController(ComentarioRepository repo, PostRepository postRepo) {
        this.repo = repo;
        this.postRepo = postRepo;
    }

    @PostMapping("/{postId}")
    public Comentario addComentario(@PathVariable Long postId,
                                    @RequestBody Comentario comentario) {

        Post post = postRepo.findById(postId).orElseThrow();

        comentario.setPost(post);
        comentario.setFecha(LocalDateTime.now());

        return repo.save(comentario);
    }

    @GetMapping("/{postId}")
    public List<Comentario> getComentarios(@PathVariable Long postId) {
        return repo.findByPostId(postId);
    }
}