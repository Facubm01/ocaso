package com.example.uade.tpo.TiendaRopa.controllers.productos;

import java.util.List;

import com.example.uade.tpo.TiendaRopa.controllers.talleStock.TalleStockDTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProductoUpdateRequest {

    @NotBlank(message = "El nombre es obligatorio")
    public String nombre;

    @Positive(message = "El precio debe ser mayor a 0")
    public double precio;

    @Min(0) @Max(90)
    public Integer descuentoPct;  // opcional; si viene null => 0

    public Integer getDescuentoPct() { return descuentoPct; }


    @NotNull(message = "categoriaId es obligatorio")
    public Long categoriaId;

    @Size(max = 1000, message = "La descripción no puede superar los 1000 caracteres")
    public String descripcion;

    public Long imageId;  // opcional

    private List<Long> imageIds;   // NUEVO: galería


    @NotNull @Size(min = 1)
    private List<@NotNull TalleStockDTO> talles;

}
