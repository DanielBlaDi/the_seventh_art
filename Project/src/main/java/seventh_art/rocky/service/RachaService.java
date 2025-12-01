package seventh_art.rocky.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import seventh_art.rocky.entity.Historia;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.repository.HistoriaRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RachaService {

    private final HistoriaRepository historiaRepository;

    public int contarDiasEntrenadosPorSemana(Perfil perfil, LocalDate inicioSemana, LocalDate finSemana) {

        List<Historia> historias = historiaRepository
                .findByFechaBetweenAndRutina_Perfil(inicioSemana, finSemana, perfil);

        if (historias.isEmpty()) {
            return 0;
        }

        return (int) historias.stream()
                .map(Historia::getFecha)
                .distinct()
                .count();
    }
}
