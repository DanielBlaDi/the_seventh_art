package seventh_art.rocky.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Entity
@Table(
        name = "rutina"
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Set {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private float peso;      // En kilogramos

    @NotBlank
    @Column(nullable = false)
    private int repeticiones;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "idEjericio",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_set_ejercicio")
    )
    private Perfil idEjercicio;

}