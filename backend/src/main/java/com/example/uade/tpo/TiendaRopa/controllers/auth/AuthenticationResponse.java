package com.example.uade.tpo.TiendaRopa.controllers.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthenticationResponse {
    @JsonProperty("access_token")
    private String accessToken;
}
