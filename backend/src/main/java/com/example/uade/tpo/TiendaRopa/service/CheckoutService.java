package com.example.uade.tpo.TiendaRopa.service;

import com.example.uade.tpo.TiendaRopa.controllers.checkout.CheckoutRequest;
import com.example.uade.tpo.TiendaRopa.controllers.checkout.CheckoutResponse;

public interface CheckoutService {
    CheckoutResponse checkout(CheckoutRequest req);
}
