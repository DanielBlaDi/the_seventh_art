package seventh_art.rocky.entity;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @NotBlank
    @Column(nullable = false, length = 50)
    private String apellido;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer edad;
    
    @NotNull
    @Enumerated(EnumType.STRING) 
    @Column(nullable = false, length = 10)
    private Sexo sexo;

    @NotNull
    @Enumerated(EnumType.STRING) 
    @Column(nullable = false, length = 30)
    private Objetivo objetivo;


    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer rachaDeseada;       // En dias (semanalmente)

    @NotNull
    @Min(0)
    @Column(nullable = false)
    private Integer rachaActual;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Float estatura;         // En metros

    @NotNull
    @Positive
    @Column(nullable = false)
    private Float imc;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "id_usuario",
            nullable = false,
            unique = true,
            foreignKey = @ForeignKey(name = "fk_perfil_usuario")
    )
    private Usuario usuario;
    // ===== ManyToMany con Logro (lado inverso) =====
    @ManyToMany(mappedBy = "perfiles")
    @Builder.Default
    private Set<Logro> logros = new HashSet<>();

}


