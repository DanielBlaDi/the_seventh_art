package seventh_art.rocky.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "usuario",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_usuario_email", columnNames = "email")
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // puede ser null, revisar por qué no se actualiza automáticamente
    @Column(length = 80)
    private String nombre;

    @Email
    @NotBlank
    @Column(nullable = false, length = 120)
    private String email;

    // Se almacena la contraseña y se encripta con BCrypt
    @NotBlank
    @Column(nullable = false, length = 120)
    private String password;

    @Column(nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @PrePersist
    public void prePersist() {
        this.creadoEn = LocalDateTime.now();
    }
}
