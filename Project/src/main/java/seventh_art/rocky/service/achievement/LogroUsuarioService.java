package seventh_art.rocky.service.achievement;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import seventh_art.rocky.entity.Logro;
import seventh_art.rocky.entity.LogroUsuario;
import seventh_art.rocky.repository.LogroRepository;
import seventh_art.rocky.repository.LogroUsuarioRepository;
import seventh_art.rocky.repository.PerfilRepository;

@Service
@RequiredArgsConstructor
public class LogroUsuarioService {

    private final LogroUsuarioRepository logroUsuarioRepository;
    private final PerfilRepository perfilRepository;
    private final LogroRepository logroRepository;

    @Transactional(readOnly = true)
    public List<LogroUsuario> findAllByPerfil(Long perfilId) {
        return logroUsuarioRepository.findAllByPerfilId(perfilId);
    }

    @Transactional(readOnly = true)
    public Optional<LogroUsuario> findByPerfilAndLogro(Long perfilId, Long logroId) {
        return logroUsuarioRepository.findByPerfilIdAndLogroId(perfilId, logroId);
    }

    @Transactional
    public LogroUsuario upsertProgreso(Long perfilId, Long logroId, int nuevoProgreso) {

    LogroUsuario logroUsuario = logroUsuarioRepository
            .findByPerfilIdAndLogroId(perfilId, logroId)
            .orElse(null);

    if (logroUsuario == null) {
        logroUsuario = LogroUsuario.builder()
                .perfil(perfilRepository.getReferenceById(perfilId))
                .logro(logroRepository.getReferenceById(logroId))
                .progreso(0)
                .build();
    }


        logroUsuario.setProgreso(nuevoProgreso);

        Logro logro = logroUsuario.getLogro();
        Integer umbral = logro.getUmbral();

        if ((umbral != null) && (nuevoProgreso >= umbral) && (logroUsuario.getOtorgadoEn() == null)) {
            logroUsuario.setOtorgadoEn(LocalDateTime.now());
        }

        return logroUsuarioRepository.save(logroUsuario);
    }

    @Transactional
    public LogroUsuario award(Long perfilId, Long logroId, String meta) {

    LogroUsuario logroUsuario = logroUsuarioRepository
            .findByPerfilIdAndLogroId(perfilId, logroId)
            .orElse(null);

    if (logroUsuario == null) {
        logroUsuario = LogroUsuario.builder()
                .perfil(perfilRepository.getReferenceById(perfilId))
                .logro(logroRepository.getReferenceById(logroId))
                .progreso(0)
                .build();
    }

        if (logroUsuario.getOtorgadoEn() == null) {
            logroUsuario.setOtorgadoEn(LocalDateTime.now());
        }

        // opcional: si tiene umbral, poner progreso = umbral
        // se podria dejar a todos los que usan award sin o con progreso distinto de null

        Integer umbral = logroUsuario.getLogro().getUmbral();
        if (umbral != null && ((logroUsuario.getProgreso() == null) || (logroUsuario.getProgreso() < umbral))) {
            logroUsuario.setProgreso(umbral);
        }


        logroUsuario.setMeta(meta);

        return logroUsuarioRepository.save(logroUsuario);
    }
}
