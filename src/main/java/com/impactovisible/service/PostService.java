package com.impactovisible.service;

import com.impactovisible.domain.Post;
import com.impactovisible.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PostService {

    private final PostRepository repo;

    public PostService(PostRepository repo) {
        this.repo = repo;
    }

    public List<Post> findAll() {
        return repo.findAll();
    }

    public Post create(Post post) {
        post.setFecha(LocalDateTime.now());
        post.setLikes(0);
        return repo.save(post);
    }

    public Post like(Long id) {
        Post post = repo.findById(id).orElseThrow();
        post.setLikes(post.getLikes() + 1);
        return repo.save(post);
    }
}