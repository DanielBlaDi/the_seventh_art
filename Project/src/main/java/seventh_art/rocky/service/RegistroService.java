package seventh_art.rocky.service;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import seventh_art.rocky.dto.RegistroDTO;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.Peso;
import seventh_art.rocky.entity.Usuario;
import seventh_art.rocky.repository.PerfilRepository;
import seventh_art.rocky.repository.PesoRepository;
import seventh_art.rocky.repository.UsuarioRepository;

import java.time.LocalDateTime;

@Service
public class RegistroService {

    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final PesoRepository pesoRepository;

    public RegistroService(UsuarioRepository usuarioRepository,
                           PerfilRepository perfilRepository,
                           PesoRepository pesoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.perfilRepository = perfilRepository;
        this.pesoRepository = pesoRepository;
    }

    /**
     * Crea el Perfil y el primer registro de Peso
     * para un usuario que ya está registrado.
     */
    @Transactional
    public void registrarPerfilYPrimerPeso(Long usuarioId, RegistroDTO dto) {

        // 1. Buscar usuario
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado."));

        // 2. Crear y guardar Perfil
        Perfil perfil = new Perfil();
        perfil.setNombre(dto.getNombre());
        perfil.setApellido(dto.getApellido());
        perfil.setEdad(dto.getEdad());
        perfil.setSexo(dto.getSexo());
        perfil.setObjetivo(dto.getObjetivo());

        if (dto.getRachaDeseada() != null) {
            perfil.setRachaDeseada(dto.getRachaDeseada());
        } else {
            perfil.setRachaDeseada(1); // valor por defecto
        }

        perfil.setRachaActual(0);
        perfil.setEstatura(dto.getEstatura());

        // IMPORTANTE: aquí asocio el perfil al usuario (ajusta al nombre real del campo)
        perfil.setUsuario(usuario);

        // Calcular IMC si hay peso y estatura (en METROS)
        if (dto.getPeso() != null && dto.getEstatura() != null && dto.getEstatura() > 0) {
            float estaturaM = dto.getEstatura(); // ya viene en metros desde el form
            float imc = dto.getPeso() / (estaturaM * estaturaM);
            perfil.setImc(imc);
        }

        perfil = perfilRepository.save(perfil);

        // 3. Registrar el primer peso asociado al perfil
        if (dto.getPeso() != null) {
            Peso peso = new Peso();
            peso.setValor(dto.getPeso());
            peso.setFecha(LocalDateTime.now());

            // Asocia el peso al perfil (ajusta al nombre del campo)
            peso.setPerfil(perfil);

            pesoRepository.save(peso);
        }
    }
}
