package com.example.uade.tpo.TiendaRopa.controllers.auth;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password; // siempre creará USER (el rol se ignora acá)
}
