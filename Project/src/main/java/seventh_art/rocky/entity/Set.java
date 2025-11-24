package seventh_art.rocky.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "sets"
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

    @NotNull
    @Positive
    @Column(nullable = false)
    private Float peso;      // En kilogramos

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer repeticiones;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "id_ejercicio",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_set_ejercicio")
    )
    private Ejercicio ejercicio;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "id_perfil",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_set_perfil")
    )
    private Perfil perfil;

}