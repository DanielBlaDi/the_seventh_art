package seventh_art.rocky.entity;

import java.time.LocalDateTime;

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
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "logro_usuario",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_logro_usuario_perfil_logro",
            columnNames = { "id_perfil", "id_logro" }
        )
    }
)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogroUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer progreso;

    @Column(name = "otorgado_en")
    private LocalDateTime otorgadoEn;

    @Column(length = 1000)
    private String meta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "id_perfil",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_logro_usuario_perfil")
    )
    private Perfil perfil;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "id_logro",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_logro_usuario_logro")
    )
    private Logro logro;


}
