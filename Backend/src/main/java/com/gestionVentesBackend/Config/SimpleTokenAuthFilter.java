package com.gestionVentesBackend.Config;

import com.gestionVentesBackend.Model.Employe;
import com.gestionVentesBackend.Model.Investisseur;
import com.gestionVentesBackend.Model.Personne;
import com.gestionVentesBackend.Repository.PersonneRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Filtre d'authentification simple basé sur le token renvoyé par AuthController.
 *
 * Format attendu: "Bearer token_<id>_<timestamp>"
 *
 * Objectif: appliquer un contrôle par rôle UNIQUEMENT sur certains endpoints
 * (ex: ETL upload), sans introduire JWT pour l'instant.
 */
@Component
public class SimpleTokenAuthFilter extends OncePerRequestFilter {

    private static final Pattern TOKEN_PATTERN = Pattern.compile("^token_(\\d+)_\\d+$");

    @Autowired
    private PersonneRepository personneRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Si déjà authentifié, ne pas écraser le contexte
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Matcher matcher = TOKEN_PATTERN.matcher(token);
        if (!matcher.matches()) {
            filterChain.doFilter(request, response);
            return;
        }

        Long personneId;
        try {
            personneId = Long.parseLong(matcher.group(1));
        } catch (NumberFormatException ex) {
            filterChain.doFilter(request, response);
            return;
        }

        Optional<Personne> personneOpt = personneRepository.findById(personneId);
        if (personneOpt.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        Personne personne = personneOpt.get();
        String role = resolveRole(personne);

        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(personne.getEmail(), null, authorities);

        SecurityContextHolder.getContext().setAuthentication(authentication);
        filterChain.doFilter(request, response);
    }

    private String resolveRole(Personne personne) {
        if (personne instanceof Employe employe) {
            String roleName = employe.getRole() != null && employe.getRole().getNameRole() != null
                    ? employe.getRole().getNameRole().toLowerCase()
                    : "vendeur";

            return switch (roleName) {
                case "admin", "administrateur" -> "ADMIN";
                case "analyste" -> "ANALYST";
                case "vendeur" -> "VENDEUR";
                default -> "VENDEUR";
            };
        }

        if (personne instanceof Investisseur) {
            return "INVESTISSEUR";
        }

        return "CLIENT";
    }
}
