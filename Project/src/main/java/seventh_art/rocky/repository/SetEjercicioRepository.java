package seventh_art.rocky.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import seventh_art.rocky.entity.SetEjercicio;
import seventh_art.rocky.entity.TipoEjercicio;


public interface SetEjercicioRepository extends JpaRepository<SetEjercicio, Long> {

    @Query("""
        SELECT e.tipoEjercicio, COUNT(s.id)
        FROM SetEjercicio s
        JOIN s.ejercicio e
        WHERE s.perfil.id = :idPerfil
        GROUP BY e.tipoEjercicio
    """)
    List<Object[]> contarPorTipoMusculo(Long idPerfil);

    // Contar la cantidad de sets por TIPO de ejercicio para un perfil dado, no por ejercicio específico
    int countSetsEjercicioByPerfilIdAndEjercicioTipoEjercicio(Long perfilId, TipoEjercicio tipoEjercicio);
    

}
