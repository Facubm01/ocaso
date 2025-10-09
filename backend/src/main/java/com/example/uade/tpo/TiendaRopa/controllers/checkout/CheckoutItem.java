package com.example.uade.tpo.TiendaRopa.controllers.checkout;

import com.example.uade.tpo.TiendaRopa.entity.Talle;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CheckoutItem(
        @NotNull Long productoId,
        @NotNull Talle talle,
        @Min(1) int cantidad
) {}
