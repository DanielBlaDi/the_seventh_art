package seventh_art.rocky.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import seventh_art.rocky.entity.Usuario;
import seventh_art.rocky.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;
import java.util.UUID;

@Service
public class UsuarioService {

    private final UsuarioRepository repo;
    private final PasswordEncoder passwordEncoder;
    

    public UsuarioService(UsuarioRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> listar() {
        return repo.findAll();
    }
//---------- AUTENTICACIÓN DE USUARIOS -----------//

    // Verificar las credenciales de un usuario

    public boolean login(String email, String password){
        return repo.findByEmailIgnoreCase(email)
                .map(u -> passwordEncoder.matches(password, u.getPassword()))
                .orElse(false);
    }


//--------- REGISTRO DE USUARIOS -----------//

    // Crear un nuevo usuario en la base de datos

    @Transactional
    public Usuario crear(Usuario u) {
        if (repo.existsByEmailIgnoreCase(u.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        // HACE FALTA VALIDAR QUE EL CORREO EXISTE
        // Y ENVIAR EMAIL DE CONFIRMACIÓN

        if (u.getEmail() == null || u.getEmail().isBlank()) {
            throw new IllegalArgumentException("El email no puede estar vacío");
        }

    
        // Encripta la contraseña antes de guardarla
        u.setPassword(passwordEncoder.encode(u.getPassword()));
        return repo.save(u);
    }

    // Registrar un usuario que se autentica vía Google si no existe

    @Transactional
    public Usuario registrarGoogleUsuarioSiNoExiste(String email) {
        if (repo.existsByEmailIgnoreCase(email)) {
            return repo.findByEmailIgnoreCase(email).get();
        } else {
            Usuario usuario = new Usuario();
            usuario.setEmail(email);
            String randomPassword = UUID.randomUUID().toString();
            usuario.setNombre(null); //Quitar cuando se cambie la base de datos
            usuario.setPassword(passwordEncoder.encode(randomPassword));  //Podría ser null si no se usa contraseña
            System.out.println("Registrando nuevo usuario Google con email: " + email);
            return repo.save(usuario);
        }
    }

}
