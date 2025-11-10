package seventh_art.rocky.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import seventh_art.rocky.entity.Usuario;
import seventh_art.rocky.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository repo;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Usuario crear(Usuario u) {
        if (repo.existsByEmailIgnoreCase(u.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        // Encripta la contraseña antes de guardarla
        u.setPassword(passwordEncoder.encode(u.getPassword()));
        return repo.save(u);
    }

    public boolean login(String email, String password){
        return repo.findByEmailIgnoreCase(email)
                .map(u -> passwordEncoder.matches(password, u.getPassword()))
                .orElse(false);
    }

    public List<Usuario> listar() {
        return repo.findAll();
    }
}
