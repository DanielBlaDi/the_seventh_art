package seventh_art.rocky.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.Rutina;

import java.util.List;

public interface RutinaRepository extends JpaRepository<Rutina, Long> {

    List<Rutina> findByPerfilOrderByIdDesc(Perfil perfil);

}
