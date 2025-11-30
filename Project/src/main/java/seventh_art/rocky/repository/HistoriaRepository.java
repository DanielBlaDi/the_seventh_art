package seventh_art.rocky.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import seventh_art.rocky.entity.Historia;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.Rutina;

import java.util.List;
import java.util.OptionalLong;

public interface HistoriaRepository extends JpaRepository<Historia, Long> {

    boolean existsByRutina(Rutina rutina);

    List<Historia> findTop3ByRutina_PerfilOrderByFechaDesc(Perfil perfil);

    // Está en segundos
    // Suma la duración de todas las historias asociadas al perfil dado
    @Query("""
        SELECT SUM(h.tiempo)
        FROM Historia h
        WHERE h.rutina.perfil = :perfil
    """)
    Long sumTiempoByRutina_Perfil(Perfil perfil);

}
