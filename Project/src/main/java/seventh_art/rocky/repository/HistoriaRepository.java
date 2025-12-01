package seventh_art.rocky.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import seventh_art.rocky.entity.Historia;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.Rutina;

import java.time.LocalDate;
import java.util.List;

public interface HistoriaRepository extends JpaRepository<Historia, Long> {

    boolean existsByRutina(Rutina rutina);

    List<Historia> findTop3ByRutina_PerfilOrderByFechaDesc(Perfil perfil);

    // Todas las historias del perfil, más nuevas primero
    List<Historia> findByRutina_Perfil_IdOrderByFechaDesc(Long perfilId);

    // Historias del perfil desde cierta fecha (para days_active_N)
    List<Historia> findByRutina_Perfil_IdAndFechaGreaterThanEqual(
            Long perfilId,
            LocalDate fechaDesde
    );
}
