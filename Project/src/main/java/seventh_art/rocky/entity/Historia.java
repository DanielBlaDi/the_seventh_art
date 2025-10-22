package seventh_art.rocky.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "historia"
)

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Historia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Positive
    @Column(nullable = false)
    private String tiempo;              //En segundos

    @Column(nullable = false)
    private LocalDate fecha;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "idRutina",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_historia_rutina")
    )
    private Rutina idRutina;
}
