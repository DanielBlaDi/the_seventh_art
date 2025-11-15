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

    @Transactional
    public void registrarNuevoUsuario(RegistroDTO dto) {

        // 1. Validaciones de negocio
        if (usuarioRepository.existsByEmailIgnoreCase(dto.getEmail())) {
            throw new IllegalArgumentException("El correo ya está registrado.");
        }

        if (!dto.getPassword().equals(dto.getPassword2())) {
            throw new IllegalArgumentException("Las contraseñas no coinciden.");
        }

        // 2. Crear y guardar Usuario
        Usuario usuario = new Usuario();
        usuario.setEmail(dto.getEmail().toLowerCase().trim());
        usuario.setPassword(dto.getPassword());

        usuario = usuarioRepository.save(usuario);

        Perfil perfil = new Perfil();
        perfil.setNombre(dto.getNombre());
        perfil.setApellido(dto.getApellido());
        perfil.setEdad(dto.getEdad());
        perfil.setSexo(dto.getSexo());
        perfil.setObjetivo(dto.getObjetivo());

        // !!!!!
        if (dto.getRachaDeseada() != null && !dto.getRachaDeseada().isBlank()) {
            perfil.setRachaDeseada(Integer.parseInt(dto.getRachaDeseada()));
        } else {
            perfil.setRachaDeseada(1); // valor por defecto
        }

        perfil.setRachaActual(0);           // se arranca con 0
        perfil.setEstatura(dto.getEstatura());

        // Calcular IMC si hay peso y estatura
        if (dto.getPeso() != null && dto.getEstatura() != null && dto.getEstatura() > 0) {
            // si estatura está en cm (ej: 170), convertimos a metros
            float estaturaM = dto.getEstatura() / 100f;
            float imc = dto.getPeso() / (estaturaM * estaturaM);
            perfil.setImc(imc);
        }

        perfil.setIdUsuario(usuario);

        perfil = perfilRepository.save(perfil);

        if (dto.getPeso() != null) {
            Peso peso = new Peso();
            peso.setValor(dto.getPeso());
            peso.setFecha(LocalDateTime.now());
            peso.setIdPerfil(perfil);
            pesoRepository.save(peso);
        }
    }
}
