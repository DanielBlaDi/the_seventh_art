package seventh_art.rocky.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import seventh_art.rocky.entity.Historia;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.Rutina;

import java.time.LocalDate;
import java.util.List;
import java.util.OptionalLong;

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
    // Está en segundos
    // Suma la duración de todas las historias asociadas al perfil dado
    @Query("""
        SELECT SUM(h.tiempo)
        FROM Historia h
        WHERE h.rutina.perfil = :perfil
    """)
    Long sumTiempoByRutina_Perfil(Perfil perfil);

    // Contar la cantidad de historias asociadas a un perfil
    int countByRutina_Perfil(Perfil perfil);

    List<Historia> findByFechaBetweenAndRutina_Perfil(LocalDate startDate, LocalDate endDate, Perfil perfil);

}
