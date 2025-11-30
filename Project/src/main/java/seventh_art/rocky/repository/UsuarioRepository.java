package seventh_art.rocky.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import seventh_art.rocky.entity.Usuario;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Usado por Seguridad, Login, y UsuarioService
    Optional<Usuario> findByEmailIgnoreCase(String email);

    // Usado en validación de registro
    boolean existsByEmailIgnoreCase(String email);

    // Usado ahora por PerfilActualService
    Optional<Usuario> findByEmail(String email);
}
