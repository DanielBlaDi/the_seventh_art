package seventh_art.rocky;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.context.annotation.Bean;
import seventh_art.rocky.service.UsuarioService;

@SpringBootApplication
public class RockyApplication {

    public static void main(String[] args) {
        SpringApplication.run(RockyApplication.class, args);
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}
