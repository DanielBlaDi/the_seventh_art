package seventh_art.rocky.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import seventh_art.rocky.entity.Usuario;
import seventh_art.rocky.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
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

    public List<String> ValidarRegistro(Usuario u){
        List<String> errores = new ArrayList<>();
        if (repo.existsByEmailIgnoreCase(u.getEmail())) {
            errores.add("El email ya está registrado");
        }

        // HACE FALTA VALIDAR QUE EL CORREO EXISTE
        // Y ENVIAR EMAIL DE CONFIRMACIÓN

        //--- Validación email ---//
        

        //Metodo para validar la terminación del email
        if (!dominioValido(u.getEmail())){
            errores.add("El dominio del email no es válido");
        }

        //Metodo para validar que el email no esté vacío

        if (!emailNoVacio(u.getEmail())){
            errores.add("El email no puede estar vacío");
        }

        //--- Validación contraseña ---//

        //Metodo para validar que la contraseña no esté vacía
        if (!passwordNoVacio(u.getPassword())){
            errores.add("La contraseña no puede estar vacía");
        }

        //Metodo para validar la longitud mínima de la contraseña
        if (!passwordMinimaLongitud(u.getPassword())){
            errores.add("La contraseña debe tener al menos 8 caracteres");
        }

        //Metodo para validar que la contraseña tenga al menos un número
        if (!passwordTieneNumero(u.getPassword())){
            errores.add("La contraseña debe tener al menos un número");
        }

        //Metodo para validar que la contraseña tenga al menos una letra
        if (!passwordTieneLetra(u.getPassword())){
            errores.add("La contraseña debe tener al menos una letra");
        }

        return errores;
    }

    @Transactional
    public Usuario crear(Usuario u) {

        if (!ValidarRegistro(u).isEmpty()) {
            throw new IllegalArgumentException();
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

    private boolean dominioValido(String email){
        String[] dominios = {
            "gmail.com",
            "hotmail.com",
            "unal.edu.co",
            "outlook.com",
            };
        String dominioEmail = email.substring(email.indexOf("@")+1).toLowerCase();
        for (String dominio: dominios){
            if (dominio.equals(dominioEmail)){
                return true;
            }
        }
        return false;
        }

    private boolean emailNoVacio(String email){
        return email != null && !email.isBlank();
    }

    private boolean passwordNoVacio(String password){
        return password != null && !password.isBlank();
    }

    private boolean passwordMinimaLongitud(String password){
        return password.length() >= 8;
    }

    private boolean passwordTieneNumero(String password){
        for (char c : password.toCharArray()){
            if (Character.isDigit(c)){return true;}
        }
        return false;
    }

    private boolean passwordTieneLetra(String password){
        for (char c : password.toCharArray()){
            if (Character.isLetter(c)){return true;}
        }
        return false;
    }
}



