package com.example.uade.tpo.TiendaRopa.controllers.auth;

import com.example.uade.tpo.TiendaRopa.entity.Role;
import com.example.uade.tpo.TiendaRopa.entity.User;

public record UserProfileResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        Role role
) {
    public static UserProfileResponse from(User user) {
        if (user == null) {
            return null;
        }
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
        );
    }
}
