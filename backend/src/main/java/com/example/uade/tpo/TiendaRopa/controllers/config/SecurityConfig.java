package com.example.uade.tpo.TiendaRopa.controllers.config;

import com.example.uade.tpo.TiendaRopa.entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

import org.springframework.boot.autoconfigure.security.servlet.PathRequest;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // CORS + CSRF
            .cors(c -> c.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)

            // Stateless + JWT
            .sessionManagement(sm -> sm.sessionCreationPolicy(STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

            // Autorizaciones
            .authorizeHttpRequests(auth -> auth
                // Recursos estáticos (css, js, images en /static, /public, etc.)
                .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()

                // Preflight de CORS
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Auth + errores públicos
                .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
                .requestMatchers("/error/**").permitAll()

                // Catálogo público (GET)
                .requestMatchers(HttpMethod.GET, "/api/productos/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categorias/**").permitAll()

                // Imágenes públicas (GET). Subida de imágenes: SOLO ADMIN
                .requestMatchers(HttpMethod.GET, "/api/images/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/images/**").permitAll()

                // Mutaciones SOLO ADMIN
                .requestMatchers(HttpMethod.POST, "/api/productos/**").hasAuthority(Role.ADMIN.name())
                .requestMatchers(HttpMethod.PUT,  "/api/productos/**").hasAuthority(Role.ADMIN.name())
                .requestMatchers(HttpMethod.DELETE,"/api/productos/**").hasAuthority(Role.ADMIN.name())
                .requestMatchers(HttpMethod.POST, "/api/categorias/**").hasAuthority(Role.ADMIN.name())
                .requestMatchers(HttpMethod.PUT,  "/api/categorias/**").hasAuthority(Role.ADMIN.name())
                .requestMatchers(HttpMethod.DELETE,"/api/categorias/**").hasAuthority(Role.ADMIN.name())

                // Checkout requiere usuario autenticado (USER o ADMIN)
                .requestMatchers("/api/checkout/**").authenticated()

                // Cualquier otra ruta → autenticada
                .anyRequest().authenticated()
            );

        return http.build();
    }

    /**
     * CORS para el dev server de Vite (http://localhost:5173).
     * Ajustá la origin si cambiás el puerto/domino del front.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of(
            "http://localhost:5173"   // Vite
            // Agregá aquí otros orígenes si los necesitás
        ));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setExposedHeaders(List.of("Location")); // útil para 201 Created
        cfg.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
