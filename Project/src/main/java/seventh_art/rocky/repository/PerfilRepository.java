package seventh_art.rocky.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import seventh_art.rocky.entity.Perfil;

import java.util.Optional;

@Repository
public interface PerfilRepository extends JpaRepository<Perfil, Long> {

    /**
     * Obtiene el perfil asociado al usuario.
     * El campo mapeado en Perfil es:
     * 
     * @OneToOne(fetch = FetchType.LAZY)
     * @JoinColumn(name = "id_usuario")
     * private Usuario usuario;
     * 
     * Por eso se usa usuario.id en esta consulta.
     */
    Optional<Perfil> findByUsuarioId(Long usuarioId);
}
