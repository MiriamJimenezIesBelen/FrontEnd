package com.impactovisible.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Comentario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String autor;

    private String texto;

    private LocalDateTime fecha;

    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;
}