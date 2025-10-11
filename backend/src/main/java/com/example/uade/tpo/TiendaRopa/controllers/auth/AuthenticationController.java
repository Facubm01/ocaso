package com.example.uade.tpo.TiendaRopa.controllers.auth;

import com.example.uade.tpo.TiendaRopa.entity.User;
import com.example.uade.tpo.TiendaRopa.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(UserProfileResponse.from(user));
    }
}
