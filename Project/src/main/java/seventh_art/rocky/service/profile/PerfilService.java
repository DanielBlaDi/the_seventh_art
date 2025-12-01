package seventh_art.rocky.service.profile;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import seventh_art.rocky.dto.PerfilEdicionDTO;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.repository.PerfilRepository;

@Service
@RequiredArgsConstructor
public class PerfilService {

    private final PerfilActualService perfilActualService;
    private final PerfilRepository perfilRepository;

    public void actualizarPerfilActual(PerfilEdicionDTO dto) {
        // Miramos que el user este autenticado y obtenemos su perfil
        Perfil perfil = perfilActualService.getCurrentPerfil();

        // Se actualizan los campos de el perfil
        perfil.setNombre(dto.getNombre());
        perfil.setApellido(dto.getApellido());
        perfil.setEdad(dto.getEdad());
        perfil.setEstatura(dto.getEstatura());
        perfil.setObjetivo(dto.getObjetivo());
        perfil.setRachaDeseada(dto.getRachaDeseada());

        // 3. Se guarda en la db
        perfilRepository.save(perfil);
    }
}
