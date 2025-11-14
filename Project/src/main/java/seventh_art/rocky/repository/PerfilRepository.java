package seventh_art.rocky.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import seventh_art.rocky.entity.Perfil;

import java.util.Optional;

public interface PerfilRepository extends JpaRepository<Perfil, Long> {

}