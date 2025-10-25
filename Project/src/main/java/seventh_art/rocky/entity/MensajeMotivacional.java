package seventh_art.rocky.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(
        name = "mensaje_motivacional"
)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MensajeMotivacional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 500)
    private String descripcion;

    @ManyToOne
    @JoinColumn(
            name = "idPerfil",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_mensaje_motivacional_perfil")
    )
    private Perfil idPerfil;
}
