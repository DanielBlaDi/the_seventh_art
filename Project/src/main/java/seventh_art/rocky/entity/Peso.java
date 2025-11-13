package seventh_art.rocky.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "peso"
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Peso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Positive @NotBlank
    @Column(nullable = false)
    private Float valor;         // En kilogramos

    @PastOrPresent @NotBlank
    @Column(nullable = false)
    private LocalDateTime fecha;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "idPerfil",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_peso_perfil")
    )
    private Perfil idPerfil;

    public void weightDate() {
        this.fecha = LocalDateTime.now();
    }

}
