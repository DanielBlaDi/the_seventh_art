package seventh_art.rocky.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import seventh_art.rocky.repository.UsuarioRepository;
//import seventh_art.rocky.service.auth.GoogleOAuth2UserService;
import seventh_art.rocky.service.auth.GoogleOidcUserService;

@Configuration
public class SecurityConfig {

    //private final GoogleOAuth2UserService googleOAuth2UserService;
    private final GoogleOidcUserService googleOidcUserService;

    public SecurityConfig(GoogleOidcUserService googleOidcUserService) {
        this.googleOidcUserService = googleOidcUserService;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"))
                .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login", "/registro", "/css/**", "/js/**", "/images/**", "/api/public/**").permitAll() // Rutas públicas: Añadir todas las rutas necesarias
                .requestMatchers(HttpMethod.POST, "/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/registro").permitAll()
                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                .requestMatchers("/api/**").permitAll()
                .anyRequest().authenticated()
                )
                .oauth2Login(oauth -> oauth
                    .loginPage("/login")                      // desde dónde se inicia el login
                    .userInfoEndpoint(ui -> ui.oidcUserService(googleOidcUserService)) // servicio para cargar el usuario desde Google
                    .defaultSuccessUrl("/home/prueba", true) // la vista a donde se dirige tras login Google
                    .failureUrl("/login?error")             // FALTA CREAR LA VISTA DE ERROR
                )
                .logout(logout -> logout
                    .logoutUrl("/logout")
                    .logoutSuccessUrl("/login")
                    .invalidateHttpSession(true)
                    .deleteCookies("JSESSIONID")            // Eliminar la cookie de sesión del usuario en el navegador
                );
        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService(UsuarioRepository repo) {
        return username -> repo.findByEmailIgnoreCase(username)
            .map(UsuarioPrincipal::new)
            .orElseThrow(() -> new UsernameNotFoundException("No existe: " + username));
    }
    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService uds, PasswordEncoder enc) {
        var p = new DaoAuthenticationProvider();
        p.setUserDetailsService(uds);
        p.setPasswordEncoder(enc);
        return p;
    }
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }
}
