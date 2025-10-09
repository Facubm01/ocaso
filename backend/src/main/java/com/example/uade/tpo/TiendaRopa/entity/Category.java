package com.example.uade.tpo.TiendaRopa.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "categorias")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Column(nullable = false, unique = true, length = 80)
    private String nombre;

    @OneToMany(mappedBy = "categoria", fetch = FetchType.LAZY)
    private List<Producto> productos;

    public Category() {}

    public Category(String nombre) {
        this.nombre = nombre;
    }
}
