package seventh_art.rocky;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import seventh_art.rocky.entity.Usuario;
import seventh_art.rocky.repository.UsuarioRepository;
import seventh_art.rocky.service.UsuarioService;

@ExtendWith(MockitoExtension.class)
public class UsuarioServiceTest {
    @Mock   // Esto simula los objetos reales
    private UsuarioRepository repo;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks    // Inyecta los mocks en esta clase UsuarioService
    private UsuarioService usuarioService;

    // ---------- Helpers ----------

    private Usuario usuarioValido() {
        Usuario u = new Usuario();
        u.setEmail("user@gmail.com");
        u.setPassword("Pass1234");
        return u;
    }

    private Usuario usuarioSinDominioValido() {
        Usuario u = new Usuario();
        u.setEmail("user@pepe.com");
        u.setPassword("Pass1234");
        return u;
    }

    private Usuario usuarioConPasswordNoValida() {
        Usuario u = new Usuario();
        u.setEmail("user@gmail.com");
        u.setPassword("user");
        return u;
    }

    // ---------- Tests de ValidarRegistro ----------
    @DisplayName("ValidarRegistro debería retornar lista vacía cuando el usuario es válido")
    @Test
    void Tast0() {
        Usuario u = usuarioValido();

        when(repo.existsByEmailIgnoreCase(u.getEmail())).thenReturn(false);     //Simula que el email no está registrado | Simula el proceso que hace el repositorio

        //Se evaluan los metodos privados llamados dentro de ValidarRegistro

        List<String> errores = usuarioService.ValidarRegistro(u);

        assertTrue(errores.isEmpty());
    }

    @DisplayName("ValidarRegistro debería agregar error cuando el dominio del email no es válido")
    @Test
    void Test1() {
        Usuario usuario = usuarioSinDominioValido();
        Mockito.when(repo.existsByEmailIgnoreCase(usuario.getEmail())).thenReturn(false);
        List<String> errores = usuarioService.ValidarRegistro(usuario);
        assertFalse(errores.isEmpty());
    }
    

    @DisplayName("ValidarRegistro debería agregar error cuando el email ya esté registrado")    
    @Test
    void Test2() {
        Usuario u = usuarioValido();

        when(repo.existsByEmailIgnoreCase(u.getEmail())).thenReturn(true);

        List<String> errores = usuarioService.ValidarRegistro(u);

        assertFalse(errores.isEmpty());
        assertTrue(errores.contains("El email ya está registrado"));
    }

    @DisplayName("ValidarRegistro debería agregar error cuando el email esté vacío")
    @Test
    void Test3() {
        Usuario u = usuarioValido();
        u.setEmail("");    // Email vacío

        when(repo.existsByEmailIgnoreCase("")).thenReturn(false);

        List<String> errores = usuarioService.ValidarRegistro(u);

        assertFalse(errores.isEmpty());
        assertTrue(errores.contains("El email no puede estar vacío"));
    }

    @DisplayName("ValidarRegistro debería agregar error cuando la password sea debil")
    @Test
    void Test4() {
        Usuario u = usuarioConPasswordNoValida();

        when(repo.existsByEmailIgnoreCase(u.getEmail())).thenReturn(false);

        List<String> errores = usuarioService.ValidarRegistro(u);

        assertFalse(errores.isEmpty());
        assertTrue(errores.contains("La contraseña debe tener al menos 8 caracteres"));
        assertTrue(errores.contains("La contraseña debe tener al menos un número"));
    }

    // ---------- Tests de crear ----------
    @DisplayName("crear() debería guardar el usuario cuando no hay errores de validación")
    @Test
    void Test5() {
        Usuario u = usuarioValido();

        // Spy para controlar ValidarRegistro | Lo que hace spy es que yo pueda controlar u omitir ciertos comportamientos de la clase real
        UsuarioService spyService = Mockito.spy(usuarioService);
        doReturn(Collections.emptyList()).when(spyService).ValidarRegistro(u);  // Le digo practicamente que no hay errores en la validación

        when(passwordEncoder.encode(u.getPassword())).thenReturn("encoded");    // Simula el proceso de encriptación de la contraseña
        when(repo.save(any(Usuario.class))).thenAnswer(invocation -> {          //
            Usuario guardado = invocation.getArgument(0);
            guardado.setId(1L);
            return guardado;
        });

        Usuario resultado = spyService.crear(u);

        assertNotNull(resultado.getId());
        assertEquals("encoded", resultado.getPassword()); 
        verify(repo).save(any(Usuario.class));        // Verifica que el método save haya sido llamado una vez
    }

    @DisplayName("crear() debería lanzar IllegalArgumentException cuando hay errores de validación")
    @Test
    void Test6() {
        Usuario u = usuarioValido();

        UsuarioService spyService = Mockito.spy(usuarioService);
        doReturn(List.of("Error")).when(spyService).ValidarRegistro(u);

        assertThrows(IllegalArgumentException.class, () -> spyService.crear(u));  // Verifica que al llamar a crear se lance una IllegalArgumentException
        verify(repo, never()).save(any());  // Verifica que el método save nunca haya sido llamado
    }
}
