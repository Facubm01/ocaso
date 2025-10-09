// src/main/java/com/example/uade/tpo/TiendaRopa/controllers/CheckoutController.java
package com.example.uade.tpo.TiendaRopa.controllers.checkout;

import com.example.uade.tpo.TiendaRopa.service.CheckoutService;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CheckoutController {

    @Autowired
    private CheckoutService checkoutService;

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> checkout(@Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(checkoutService.checkout(request));
    }
}
