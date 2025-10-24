package seventh_art.rocky.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "ejercicio")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Ejercicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @NotBlank
    @Column(nullable = false, length = 200)
    private String descripcion;

    @Column(unique = true, length = 500)
    private String imagenUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_ejercicio", nullable = false, length = 50)
    private TipoEjercicio tipoEjercicio;
}
