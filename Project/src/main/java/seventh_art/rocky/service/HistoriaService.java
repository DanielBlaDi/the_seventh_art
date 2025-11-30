package seventh_art.rocky.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import seventh_art.rocky.dto.ActividadRecienteDTO;
import seventh_art.rocky.entity.Historia;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.repository.HistoriaRepository;
import seventh_art.rocky.service.profile.PerfilActualService;


import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoriaService {

    private final HistoriaRepository historiaRepository;
    private final PerfilActualService perfilActualService;

    public List<ActividadRecienteDTO> listarRutinasActuales(){

        Perfil perfil = perfilActualService.getCurrentPerfil();

        List<Historia> historias = historiaRepository
                .findTop3ByRutina_PerfilOrderByFechaDesc(perfil);

        LocalDate ahora = LocalDate.now();

        return historias.stream().map(
                h -> {
                    String nombre = h.getRutina().getNombre();
                    String tiempoRelativo = formatoTiempoRelativo(h.getFecha(), ahora);
                    String duracion = aFormatoHoraMinuto(h.getTiempo());

                    return new ActividadRecienteDTO(nombre, tiempoRelativo, duracion);
                }).toList();

    }

    private String formatoTiempoRelativo(LocalDate fecha, LocalDate fechaActual){

        long dias = ChronoUnit.DAYS.between(fecha,fechaActual);

        if (dias == 0){
            return "Hoy";
        }else if (dias == 1){
            return "Ayer";
        }else {
            return "Hace" + dias + "días";
        }
    }

    private String aFormatoHoraMinuto(Long segundos){

        if (segundos == 0){
            return "--:--";
        }

        long horas = segundos / 3600;
        long minutos = (segundos % 3600) / 60;

        return String.format("%02d:%02d", horas, minutos);
    }
}
