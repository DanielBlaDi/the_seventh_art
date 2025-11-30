package seventh_art.rocky.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import seventh_art.rocky.entity.Historia;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.Rutina;

import java.util.List;

public interface HistoriaRepository extends JpaRepository<Historia, Long> {

    boolean existsByRutina(Rutina rutina);

    List<Historia> findTop3ByRutina_PerfilOrderByFechaDesc(Perfil perfil);

}
