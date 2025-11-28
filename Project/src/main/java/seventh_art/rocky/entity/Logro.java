package seventh_art.rocky.entity;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "logro"
)

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Logro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 50)
    private String nombre;
    
    @NotBlank
    @Column(nullable = false, length = 100)
    private String descripcion;
    
    
    @ManyToMany
    @JoinTable(
            name = "logro_perfil",
            joinColumns = @JoinColumn(name = "id_logro", nullable = false,
            foreignKey = @ForeignKey(name = "fk_logro_perfil_logro")),
            inverseJoinColumns = @JoinColumn(name = "id_perfil", nullable = false,
            foreignKey = @ForeignKey(name = "fk_logro_perfil_perfil"))
)
@Builder.Default
private Set<Perfil> perfiles = new HashSet<>();

}
