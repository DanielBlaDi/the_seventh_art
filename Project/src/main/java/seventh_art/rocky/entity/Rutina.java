package seventh_art.rocky.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    @Column(nullable = false, length = 500)
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "id_perfil",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_rutina_perfil")
    )
    private Perfil perfil;

    @ManyToMany
    @JoinTable(
            name = "rutina_ejercicio",
            joinColumns = @JoinColumn(name = "id_rutina",
            foreignKey = @ForeignKey(name = "fk_rutina_ejercicio_rutina")
            ),
            inverseJoinColumns = @JoinColumn(name = "id_ejercicio",
            foreignKey = @ForeignKey(name = "fk_rutina_ejercicio_ejercicio")
            )
    )
    @Builder.Default
    private List<Ejercicio> ejercicios = new ArrayList<>();
}

