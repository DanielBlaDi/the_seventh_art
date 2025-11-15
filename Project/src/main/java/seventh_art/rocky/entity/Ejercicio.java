package seventh_art.rocky.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
