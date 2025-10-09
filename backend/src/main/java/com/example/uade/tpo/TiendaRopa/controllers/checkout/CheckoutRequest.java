package com.example.uade.tpo.TiendaRopa.controllers.checkout;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CheckoutRequest(@NotEmpty List<CheckoutItem> items) {
    
}
