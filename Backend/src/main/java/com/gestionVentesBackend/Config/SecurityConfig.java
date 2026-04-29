import org.springframework.beans.factory.annotation.Value;
package com.gestionVentesBackend.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {


    private final SimpleTokenAuthFilter simpleTokenAuthFilter;

    public SecurityConfig(SimpleTokenAuthFilter simpleTokenAuthFilter) {
        this.simpleTokenAuthFilter = simpleTokenAuthFilter;
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                // Endpoints publics
                .requestMatchers("/api/auth/**").permitAll()

                // ETL: réservé à l'analyste (ANALYST ou ANALYSTE)
                .requestMatchers("/api/etl/**").hasAnyRole("ANALYST", "ANALYSTE", "ADMIN")

                // CRUD produit réservé à ADMIN + VENDEUR
                .requestMatchers(HttpMethod.POST, "/produits/**").hasAnyRole("ADMIN", "VENDEUR")
                .requestMatchers(HttpMethod.PUT, "/produits/**").hasAnyRole("ADMIN", "VENDEUR")
                .requestMatchers(HttpMethod.DELETE, "/produits/**").hasAnyRole("ADMIN", "VENDEUR")
                // Rating de produit: accessible aux clients
                .requestMatchers(HttpMethod.PATCH, "/produits/*/rating").hasAnyRole("ADMIN", "VENDEUR", "CLIENT")

                // Création de vente: ADMIN, VENDEUR et CLIENT
                .requestMatchers(HttpMethod.POST, "/ventes/**").hasAnyRole("ADMIN", "VENDEUR", "CLIENT")
                // Modification/Suppression de vente: réservé à ADMIN + VENDEUR
                .requestMatchers(HttpMethod.PUT, "/ventes/**").hasAnyRole("ADMIN", "VENDEUR")
                .requestMatchers(HttpMethod.DELETE, "/ventes/**").hasAnyRole("ADMIN", "VENDEUR")

                // Le reste reste accessible (mode dev)
                .anyRequest().permitAll()
            );

        http.addFilterBefore(simpleTokenAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Value("${app.cors.origins}")
    private String[] allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}