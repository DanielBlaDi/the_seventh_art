package seventh_art.rocky.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import seventh_art.rocky.entity.Usuario;
import seventh_art.rocky.repository.UsuarioRepository;

@Configuration
public class DataInit {

    @Bean
    CommandLineRunner initUsuarios(UsuarioRepository repo) {
        return args -> {
                repo.deleteAll();
                repo.save(Usuario.builder()
                        .nombre("Valentina")
                        .email("valentina@gmail.com")
                        .password("1234")
                        .build());
                repo.save(Usuario.builder()
                        .nombre("Nicole")
                        .email("nicole@gmail.com")
                        .password("5678")
                        .build());
                repo.save(Usuario.builder()
                        .nombre("Fernanda")
                        .email("fernanda@gmail.com")
                        .password("1111")
                        .build());
                repo.save(Usuario.builder()
                        .nombre("Alejandra")
                        .email("alejandra@gmail.com")
                        .password("7777")
                        .build());
        };
    }
}

