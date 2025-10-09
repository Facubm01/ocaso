package com.example.uade.tpo.TiendaRopa.controllers.talleStock;

import com.example.uade.tpo.TiendaRopa.entity.Talle;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class TalleStockDTO {
    @NotNull public Talle talle;
    @Min(0) public int stock;
}
