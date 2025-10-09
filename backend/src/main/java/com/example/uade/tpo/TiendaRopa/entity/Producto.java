package com.example.uade.tpo.TiendaRopa.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
@Entity
@Table(name = "productos")
public class Producto {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre del producto es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;

    @Positive(message = "El precio debe ser mayor a 0")
    @Column(nullable = false)
    private double precio;

    // descuento en porcentaje (0-90). Si es null, tratálo como 0.
    @Min(0) @Max(90)
    @Column(nullable = false)
    private Integer descuentoPct = 0;

    @Column(length = 2000)
    private String descripcion;

    // NUEVO: referencia a la imagen guardada en back (tabla images)
    @Column(name = "image_id")
    private Long imageId;   // ← reemplaza a imagenUrl

            // Producto.java
    @ElementCollection
    @CollectionTable(name = "producto_image_ids", joinColumns = @JoinColumn(name = "producto_id"))
    @Column(name = "image_id")
    private List<Long> imageIds = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Category categoria;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductoTalle> talles = new ArrayList<>();


    public Producto() {}

    @Transient
    public int getStockTotal() {
        return talles == null ? 0 : talles.stream().mapToInt(ProductoTalle::getStock).sum();
    }
}
