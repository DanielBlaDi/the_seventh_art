package seventh_art.rocky.service;

import java.util.List;

import org.springframework.stereotype.Service;

import seventh_art.rocky.dto.MusculoDTO;
import seventh_art.rocky.dto.StatsDTO;
import seventh_art.rocky.entity.Perfil;

@Service
public class StatsService {

    private final PerfilActualService perfilActualService;

    public StatsService(PerfilActualService perfilActualService) {
        this.perfilActualService = perfilActualService;
    }
    
    public StatsDTO getStatsUser() {

        Perfil perfil = perfilActualService.getCurrentPerfil();
        // Lógica para obtener las estadísticas del usuario
        // Llamo al repositorio y proceso los datos

        // List<String> labels = stats.stream()
        //         .map(MusculoEstadisticaDTO::getNombreMusculo)
        //         .toList();

        // List<Integer> values = stats.stream()
        //         .map(MusculoEstadisticaDTO::getPorcentaje)
        //         .toList();

        StatsDTO dto = new StatsDTO();
        dto.setFecha(java.time.LocalDate.now());
        dto.setLabels(List.of("Bíceps", "Tríceps", "Pecho", "Espalda", "Piernas", "Gemelos")); // Ejemplo estático
        dto.setValues(List.of(25, 30, 20, 25, 50, 10)); // Ejemplo estático
        dto.setMusculos(List.of(
            new MusculoDTO("Bíceps", 25),
            new MusculoDTO("Tríceps", 30),
            new MusculoDTO("Pecho", 20),
            new MusculoDTO("Piernas", 50),
            new MusculoDTO("Espalda", 25),
            new MusculoDTO("Gemelos", 10)
        ));

        return dto;
    }
}
