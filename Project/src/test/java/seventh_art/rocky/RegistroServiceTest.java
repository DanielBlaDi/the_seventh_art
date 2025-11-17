package seventh_art.rocky;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import seventh_art.rocky.dto.RegistroDTO;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.Peso;
import seventh_art.rocky.entity.Sexo;
import seventh_art.rocky.entity.Usuario;
import seventh_art.rocky.repository.PerfilRepository;
import seventh_art.rocky.repository.PesoRepository;
import seventh_art.rocky.repository.UsuarioRepository;
import seventh_art.rocky.service.RegistroService;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegistroServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PerfilRepository perfilRepository;

    @Mock
    private PesoRepository pesoRepository;

    @InjectMocks
    private RegistroService registroService;

    // Helper: DTO base válido que iremos modificando según el caso
    private RegistroDTO crearDTOBasico() {
        RegistroDTO dto = new RegistroDTO();
        dto.setNombre("Juan");
        dto.setApellido("Perez");
        dto.setEdad(25);
        dto.setSexo(Sexo.MASCULINO);
        dto.setPeso(70.0f);
        dto.setEstatura(1.75f);
        // Paso 3
        dto.setObjetivo(null);      // opcional
        dto.setRachaDeseada(4);     // supongamos que el usuario elige 4 días
        return dto;
    }

    @Test
    @DisplayName("Debe lanzar IllegalArgumentException cuando el usuario no existe")
    void registrarPerfilYPrimerPeso_usuarioNoEncontrado() {
        // Arrange
        Long usuarioId = 1L;
        RegistroDTO dto = crearDTOBasico();

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.empty());

        // Act + Assert
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> registroService.registrarPerfilYPrimerPeso(usuarioId, dto)
        );
        assertEquals("Usuario no encontrado.", ex.getMessage());

        // Verificar que NO se intentó guardar perfil ni peso
        verify(perfilRepository, never()).save(any(Perfil.class));
        verify(pesoRepository, never()).save(any(Peso.class));
    }

    @Test
    @DisplayName("Debe crear Perfil e IMC y registrar primer Peso cuando hay peso y estatura")
    void registrarPerfilYPrimerPeso_conPesoYEstatura_creaPerfilYPesoConIMC() {
        // Arrange
        Long usuarioId = 1L;
        Usuario usuario = new Usuario();
        usuario.setId(usuarioId);

        RegistroDTO dto = crearDTOBasico(); // con peso y estatura válidos

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        // Devolvemos el mismo perfil que recibimos en save
        when(perfilRepository.save(any(Perfil.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        registroService.registrarPerfilYPrimerPeso(usuarioId, dto);

        // Assert Perfil
        ArgumentCaptor<Perfil> perfilCaptor = ArgumentCaptor.forClass(Perfil.class);
        verify(perfilRepository).save(perfilCaptor.capture());
        Perfil perfilGuardado = perfilCaptor.getValue();

        assertEquals(dto.getNombre(), perfilGuardado.getNombre());
        assertEquals(dto.getApellido(), perfilGuardado.getApellido());
        assertEquals(dto.getEdad(), perfilGuardado.getEdad());
        assertEquals(dto.getSexo(), perfilGuardado.getSexo());
        assertEquals(dto.getObjetivo(), perfilGuardado.getObjetivo());
        assertEquals(dto.getRachaDeseada(), perfilGuardado.getRachaDeseada());
        assertEquals(0, perfilGuardado.getRachaActual());
        assertEquals(dto.getEstatura(), perfilGuardado.getEstatura());
        assertEquals(usuario, perfilGuardado.getUsuario());

        // IMC esperado
        float expectedImc = dto.getPeso() / (dto.getEstatura() * dto.getEstatura());
        // Ajusta el delta según el tipo de imc (float/Float)
        assertEquals(expectedImc, perfilGuardado.getImc(), 0.0001f);

        // Assert Peso
        ArgumentCaptor<Peso> pesoCaptor = ArgumentCaptor.forClass(Peso.class);
        verify(pesoRepository).save(pesoCaptor.capture());
        Peso pesoGuardado = pesoCaptor.getValue();

        assertEquals(dto.getPeso(), pesoGuardado.getValor());
        assertEquals(perfilGuardado, pesoGuardado.getPerfil());
        assertNotNull(pesoGuardado.getFecha());
    }

    @Test
    @DisplayName("Debe usar rachaDeseada=1 por defecto y NO registrar Peso cuando dto.peso es null")
    void registrarPerfilYPrimerPeso_sinPeso_usaRachaPorDefectoYNoCreaPeso() {
        // Arrange
        Long usuarioId = 2L;
        Usuario usuario = new Usuario();
        usuario.setId(usuarioId);

        RegistroDTO dto = crearDTOBasico();
        dto.setPeso(null);          // sin peso
        dto.setRachaDeseada(null);  // para que use el valor por defecto 1

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(perfilRepository.save(any(Perfil.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        registroService.registrarPerfilYPrimerPeso(usuarioId, dto);

        // Assert Perfil
        ArgumentCaptor<Perfil> perfilCaptor = ArgumentCaptor.forClass(Perfil.class);
        verify(perfilRepository).save(perfilCaptor.capture());
        Perfil perfilGuardado = perfilCaptor.getValue();

        assertEquals(1, perfilGuardado.getRachaDeseada());   // valor por defecto
        assertEquals(0, perfilGuardado.getRachaActual());
        assertEquals(usuario, perfilGuardado.getUsuario());

        // Sin peso => no se debe guardar registro de Peso
        verify(pesoRepository, never()).save(any(Peso.class));

        // Sin peso => no se debería calcular IMC
        // Ajusta esto según el tipo de imc en tu entidad Perfil (Float vs float)
        assertNull(perfilGuardado.getImc(), "Sin peso, el IMC debería quedar null");
    }
}
