package com.example.uade.tpo.TiendaRopa.service;

import com.example.uade.tpo.TiendaRopa.controllers.auth.AuthenticationRequest;
import com.example.uade.tpo.TiendaRopa.controllers.auth.AuthenticationResponse;
import com.example.uade.tpo.TiendaRopa.controllers.auth.RegisterRequest;
import com.example.uade.tpo.TiendaRopa.controllers.config.JwtService;
import com.example.uade.tpo.TiendaRopa.entity.Role;
import com.example.uade.tpo.TiendaRopa.entity.User;
import com.example.uade.tpo.TiendaRopa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        boolean hayUsuarios = repository.count() > 0; // o repository.existsByRole(Role.ADMIN)
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(hayUsuarios ? Role.USER : Role.ADMIN) // <-- PRIMER registro = ADMIN
                .build();

        repository.save(user);
        var jwt = jwtService.generateToken(user);
        return AuthenticationResponse.builder().accessToken(jwt).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        var user = repository.findByEmail(request.getEmail()).orElseThrow();
        var jwt = jwtService.generateToken(user);
        return AuthenticationResponse.builder().accessToken(jwt).build();
    }
}
