package seventh_art.rocky.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 🔓 Desactiva la protección CSRF (solo para pruebas)
                .csrf(csrf -> csrf.disable())
                // 🔓 Permite acceso libre a todos los endpoints /api/**
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/**").permitAll()
                        .anyRequest().permitAll()
                )
                // Configura un esquema básico por si más adelante lo necesitas
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
