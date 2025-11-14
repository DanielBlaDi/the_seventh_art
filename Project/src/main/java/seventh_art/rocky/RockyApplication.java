package seventh_art.rocky;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class RockyApplication {

    public static void main(String[] args) {
        SpringApplication.run(RockyApplication.class, args);
    }

    //Utilizamos BCrypt para el hash de las contraseñas | No se puede poner en SecurityConfig porque se crea un ciclo de dependencias
    @Bean
    PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }
}
