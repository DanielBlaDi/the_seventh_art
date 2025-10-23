package seventh_art.rocky.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Entity
@Table(
        name = "rutina"
)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rutina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String nombre;

    @NotBlank
    @Column(nullable = true, length = 500)
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "idPerfil",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_rutina_perfil")
    )
    private Perfil idPerfil;
}
