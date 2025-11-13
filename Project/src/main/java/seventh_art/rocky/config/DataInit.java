package seventh_art.rocky.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import seventh_art.rocky.repository.UsuarioRepository;

@Configuration
public class DataInit {

    @Bean
    CommandLineRunner initUsuarios(UsuarioRepository repo) {
        return args -> {
        };
    }
}

