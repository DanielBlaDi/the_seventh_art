package seventh_art.rocky.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.Usuario;

public interface PerfilRepository extends JpaRepository<Perfil, Long> {
    Optional<Perfil> findByUsuarioId(Long usuarioId);

    Optional<Perfil> findByUsuario(Usuario usuario);


}