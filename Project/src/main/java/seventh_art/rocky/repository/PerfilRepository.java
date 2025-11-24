package seventh_art.rocky.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.Usuario;

import java.util.Optional;

public interface PerfilRepository extends JpaRepository<Perfil, Long> {

    Optional<Perfil> findByUsuario(Usuario usuario);

    // o si prefieres por id:
    Optional<Perfil> findByUsuario_Id(Long usuarioId);

}