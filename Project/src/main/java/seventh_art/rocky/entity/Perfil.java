package seventh_art.rocky.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Entity
@Table(
        name = "perfil"
)
@Getter @Setter                        // Genera getters y setters para todos los campos, gracias a Lombok.
@NoArgsConstructor                     // Genera un constructor sin argumentos, gracias a Lombok.
@AllArgsConstructor                    // Genera un constructor con todos los argumentos, gracias a Lombok.
@Builder
public class Perfil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(length = 50)
    private String apellido;

    @Positive @NotBlank
    @Column(nullable = false)
    private Integer edad;
    
    @Enumerated(EnumType.STRING) @NotBlank
    @Column(nullable = false, length = 10)
    private Sexo sexo;

    @Enumerated(EnumType.STRING) @NotBlank
    @Column(nullable = false, length = 30)
    private Objetivo objetivo;

    @NotBlank @Positive
    @Column(nullable = false)
    private Integer rachaDeseada;       // En dias (semanalmente)

    @Positive @NotBlank
    @Column(nullable = false)
    private Integer rachaActual;

    @Positive @NotBlank
    @Column(nullable = false)
    private Float estatura;         // En metros

    @Positive
    @Column(nullable = false)
    private Float imc;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "idUsuario",
            nullable = false,
            unique = true,
            foreignKey = @ForeignKey(name = "fk_perfil_usuario")
    )
    private Usuario idUsuario;

}


