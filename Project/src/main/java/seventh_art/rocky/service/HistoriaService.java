package seventh_art.rocky.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import seventh_art.rocky.dto.ActividadRecienteDTO;
import seventh_art.rocky.entity.Historia;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.repository.HistoriaRepository;

import java.time.Duration;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.OptionalLong;

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

    public String getTiempoTotalDeEntrenamiento(){
        Perfil perfil = perfilActualService.getCurrentPerfil();
        Long segundosOpt = historiaRepository.sumTiempoByRutina_Perfil(perfil);
        if (segundosOpt == null){
            return "00:00:00";
        }
        long segundos = segundosOpt;
        Duration d = Duration.ofSeconds(segundos);

        String texto = String.format("%02d:%02d:%02d",
                d.toHours(),
                d.toMinutesPart(),
                d.toSecondsPart());

        return texto;
    }

    public int getCantidadDeSesionesTotales(){
        Perfil perfil = perfilActualService.getCurrentPerfil();
        return historiaRepository.countByRutina_Perfil(perfil);
    }


}
