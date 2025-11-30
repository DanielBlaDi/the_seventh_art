package seventh_art.rocky.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import seventh_art.rocky.dto.MusculoDTO;
import seventh_art.rocky.dto.StatsDTO;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.TipoEjercicio;
import seventh_art.rocky.repository.SetEjercicioRepository;

@Service
public class StatsService {

    private final PerfilActualService perfilActualService;
    private final SetEjercicioRepository setEjercicioRepository;
    private final HistoriaService historiaService;

    public StatsService(PerfilActualService perfilActualService, SetEjercicioRepository setEjercicioRepository, HistoriaService historiaService) {
        this.perfilActualService = perfilActualService;
        this.setEjercicioRepository = setEjercicioRepository;
        this.historiaService = historiaService;
    }
    
    public StatsDTO getStatsUser() {

        Perfil perfil = perfilActualService.getCurrentPerfil();
        // Lógica para obtener las estadísticas del usuario
        // Llamo al repositorio y proceso los datos

        List<Object[]> numSetPorTipoEjercicio = setEjercicioRepository.contarPorTipoMusculo(perfil.getId());

        // Procesar los datos para obtener los totales por tipo de ejercicio
        Map<String, Integer> totalPorTipoEjercicio = getTotalPorTipoEjercicio(numSetPorTipoEjercicio);

        // Calcular los porcentajes por músculo
        List<MusculoDTO> stats = calcularPorcentajes(totalPorTipoEjercicio);

        // Obtener el músculo más trabajado
        TipoEjercicio musculoMasTrabajado = getMusculoMasTrabajado(numSetPorTipoEjercicio);

        //Filtrar cantidad de sets por músculo más trabajado
        int totalSetsMusculoMasTrabajado = calcularTotalSets(perfil.getId(), musculoMasTrabajado);

        // Obtener el tiempo total de entrenamiento
        String tiempoTotalEntrenamiento = historiaService.getTiempoTotalDeEntrenamiento();

        StatsDTO dto = new StatsDTO();
        dto.setFecha(java.time.LocalDate.now());
        dto.setLabels(stats.stream()
                .map(MusculoDTO::getNombreMusculo)
                .toList());
        dto.setValues(stats.stream()
                .map(MusculoDTO::getPorcentaje)
                .toList());
        dto.setMusculos(stats);
        dto.setEjercicioMasTrabajado(musculoMasTrabajado != null ? musculoMasTrabajado.name() : null);
        dto.setTotalSetsdeEjercicioMasTrabajado(totalSetsMusculoMasTrabajado);
        dto.setTotalTiempoEntrenamiento(tiempoTotalEntrenamiento);
        return dto;
    }

    private Map<String, Integer> getTotalPorTipoEjercicio(List<Object[]> data) {
    Map<String, Integer> categorias = new HashMap<>() {{
        put("Pectorales", 0);
        put("Hombros", 0);
        put("Espalda", 0);
        put("Brazos", 0);
        put("Piernas", 0);
        put("Core", 0);
    }};

    for (Object[] row : data) {
        TipoEjercicio musculo = (TipoEjercicio) row[0];
        int cantidad = ((Long) row[1]).intValue();

        switch (musculo) {
            case PECHO_MEDIO, PECHO_SUPERIOR, PECHO_INFERIOR ->
                    categorias.put("Pectorales", categorias.get("Pectorales") + cantidad);

            case DELTOIDE_ANTERIOR, DELTOIDE_LATERAL, DELTOIDE_POSTERIOR ->
                    categorias.put("Hombros", categorias.get("Hombros") + cantidad);

            case DORSALES, TRAPECIO_SUPERIOR, TRAPECIO_INFERIOR, TRAPECIO_MEDIO, ROMBOIDES, ERECTORES_ESPINALES ->
                    categorias.put("Espalda", categorias.get("Espalda") + cantidad);

            case TRICEPS, BICEPS, ANTEBRAZO ->
                    categorias.put("Brazos", categorias.get("Brazos") + cantidad);

            case CUADRICEPS, ISQUIOTIBIALES, GLUTEOS, GEMELOS, ADUCTORES, ABDUCTORES, SOLEO, TIBIAL_ANTERIOR ->
                    categorias.put("Piernas", categorias.get("Piernas") + cantidad);

            case RECTO_ABDOMINAL, OBLICUOS, TRANSVERSO_ABDOMINAL ->
                    categorias.put("Core", categorias.get("Core") + cantidad);
            case OTRO, FULL_BODY, CUELLO  -> {
                // No hacer nada
            }
        }
    }
    return categorias;
}

    private List<MusculoDTO> calcularPorcentajes(Map<String, Integer> totalPorTipoEjercicio) {
        List<MusculoDTO> stats = new ArrayList<>();
        int sumaTotal = totalPorTipoEjercicio.values().stream().mapToInt(Integer::intValue).sum();

        for (Map.Entry<String, Integer> entry : totalPorTipoEjercicio.entrySet()) {
            String nombreMusculo = entry.getKey();
            int total = entry.getValue();
            int porcentaje = sumaTotal == 0 ? 0 : (int) ((total / (double) sumaTotal) * 100);
            stats.add(new MusculoDTO(nombreMusculo, porcentaje));
        }
        return stats;
    }

    private TipoEjercicio getMusculoMasTrabajado(List<Object[]> data) {
        if (data.isEmpty()) {
            return null;
        }
        TipoEjercicio musculoMasTrabajado = null;
        int maxSets = 0;

        for (Object[] row : data) {
            TipoEjercicio musculo = (TipoEjercicio) row[0];
            int cantidad = ((Long) row[1]).intValue();

            if (cantidad > maxSets) {
                maxSets = cantidad;
                musculoMasTrabajado = musculo;
            }
        }
        return musculoMasTrabajado;

    }

    private int calcularTotalSets(long perfilId, TipoEjercicio tipoEjercicio) {
        if (tipoEjercicio == null) {
            return 0;
        }

        System.out.println("Calculando total de sets para el tipo de ejercicio: " + tipoEjercicio);
        System.out.println(setEjercicioRepository.countSetsEjercicioByPerfilIdAndEjercicioTipoEjercicio(perfilId, tipoEjercicio));
        return setEjercicioRepository.countSetsEjercicioByPerfilIdAndEjercicioTipoEjercicio(perfilId, tipoEjercicio);
    }

}
