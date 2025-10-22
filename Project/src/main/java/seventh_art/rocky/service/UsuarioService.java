package seventh_art.rocky.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import seventh_art.rocky.entity.Usuario;
import seventh_art.rocky.repository.UsuarioRepository;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository repo;

    public UsuarioService(UsuarioRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public Usuario crear(Usuario u) {
        if (repo.existsByEmailIgnoreCase(u.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        return repo.save(u);
    }

    public List<Usuario> listar() {
        return repo.findAll();
    }
}
