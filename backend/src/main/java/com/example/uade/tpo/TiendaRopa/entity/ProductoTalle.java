package com.example.uade.tpo.TiendaRopa.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
@Entity
@Table(name = "producto_talles")
public class ProductoTalle {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    private Talle talle;

    @Min(0)
    @Column(nullable = false)
    private int stock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;
}
