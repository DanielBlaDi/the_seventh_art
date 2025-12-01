package seventh_art.rocky.service.peso;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.Peso;
import seventh_art.rocky.repository.PesoRepository;
import seventh_art.rocky.service.profile.PerfilActualService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PesoService {

    private final PesoRepository pesoRepository;
    private final PerfilActualService perfilActualService;

    public void registrarPeso(Float valor, LocalDate fecha) {
        Perfil perfil = perfilActualService.getCurrentPerfil();

        LocalDateTime fechaDateTime = (fecha != null)
                ? fecha.atStartOfDay()
                : LocalDateTime.now();

        Peso peso = Peso.builder()
                .valor(valor)
                .fecha(fechaDateTime)
                .perfil(perfil)
                .build();

        pesoRepository.save(peso);
    }

    public Float obtenerPesoActual(Perfil perfil) {
        return pesoRepository.findTopByPerfilOrderByFechaDesc(perfil)
                .map(Peso::getValor)
                .orElse(null);
    }

    public Float obtenerDiferenciaDePeso(Perfil perfil) {
        List<Peso> pesos = pesoRepository.findTop2ByPerfilOrderByFechaDesc(perfil);

        if (pesos.size() < 2) {
            return null;
        }

        Float pesoActual = pesos.get(0).getValor();
        Float pesoAnterior = pesos.get(1).getValor();

        if (pesoAnterior == 0) {
            return null;
        }
        return ((pesoActual - pesoAnterior) / pesoAnterior) * 100f;
    }

    public long contarRegistros(Perfil perfil) {
        return pesoRepository.countByPerfil(perfil);
    }

    public Float obtenerPesoMinimo(Perfil perfil) {
        return pesoRepository.findByPerfilOrderByFechaAsc(perfil).stream()
                .map(Peso::getValor)
                .min(Float::compareTo)
                .orElse(null);
    }

    public Float obtenerPesoMaximo(Perfil perfil) {
        return pesoRepository.findByPerfilOrderByFechaAsc(perfil).stream()
                .map(Peso::getValor)
                .max(Float::compareTo)
                .orElse(null);
    }

    public List<Peso> obtenerPesosOrdenados(Perfil perfil) {
        return pesoRepository.findByPerfilOrderByFechaAsc(perfil);
    }

    public List<Peso> obtenerUltimos5Pesos(Perfil perfil) {
        return pesoRepository.findTop5ByPerfilOrderByFechaDesc(perfil);
    }
}


