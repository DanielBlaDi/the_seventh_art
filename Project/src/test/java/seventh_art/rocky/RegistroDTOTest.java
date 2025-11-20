package seventh_art.rocky;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import seventh_art.rocky.entity.Objetivo;
import seventh_art.rocky.entity.Sexo;
import seventh_art.rocky.dto.RegistroDTO;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class RegistroDTOTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private RegistroDTO crearDTOValido() {
        RegistroDTO dto = new RegistroDTO();
        dto.setNombre("Juan");
        dto.setApellido("Perez");
        dto.setEdad(25);
        dto.setSexo(Sexo.MASCULINO);
        dto.setPeso(70.5f);
        dto.setEstatura(1.75f);
        dto.setObjetivo(Objetivo.MANTENERSE_EN_FORMA);
        dto.setRachaDeseada(3);
        return dto;
    }

    @DisplayName("RegistroDTO válido no debe generar violaciones de validación")
    @Test
    void dtoValido_noDebeTenerErrores() {
        // Arrange
        RegistroDTO dto = crearDTOValido();

        // Act
        Set<ConstraintViolation<RegistroDTO>> violaciones = validator.validate(dto);

        // Assert
        assertTrue(violaciones.isEmpty(), "Se esperaban 0 errores de validación");
    }

    @DisplayName("Debe fallar cuando el nombre contiene números")
    @Test
    void nombreConNumeros_debeGenerarErrorDePattern() {

        RegistroDTO dto = crearDTOValido();
        dto.setNombre("Ju4n");

        Set<ConstraintViolation<RegistroDTO>> violaciones = validator.validate(dto);

        assertFalse(violaciones.isEmpty(), "Se esperaban errores de validación");

        boolean tieneErrorNombre = violaciones.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("nombre"));

        assertTrue(tieneErrorNombre, "Se esperaba un error de validación en el campo 'nombre'");
    }

    @DisplayName("Debe fallar cuando la edad es menor al mínimo permitido")
    @Test
    void edadMenorQueMinimo_debeGenerarError() {
        // Arrange
        RegistroDTO dto = crearDTOValido();
        dto.setEdad(10);

        // Act
        Set<ConstraintViolation<RegistroDTO>> violaciones = validator.validate(dto);

        // Assert
        assertFalse(violaciones.isEmpty(), "Se esperaban errores de validación");

        boolean tieneErrorEdad = violaciones.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("edad"));

        assertTrue(tieneErrorEdad, "Se esperaba un error de validación en el campo 'edad'");
    }

    @DisplayName("Debe fallar cuando el peso es menor a 10 kg")
    @Test
    void pesoMenorQueDiez_debeGenerarError() {
        // Arrange
        RegistroDTO dto = crearDTOValido();
        dto.setPeso(9.5f);

        // Act
        Set<ConstraintViolation<RegistroDTO>> violaciones = validator.validate(dto);

        // Assert
        assertFalse(violaciones.isEmpty(), "Se esperaban errores de validación");

        boolean tieneErrorPeso = violaciones.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("peso"));

        assertTrue(tieneErrorPeso, "Se esperaba un error de validación en el campo 'peso'");
    }

    @DisplayName("Debe fallar cuando la estatura es mayor a 2.5 m")
    @Test
    void estaturaMayorQueMaximo_debeGenerarError() {
        // Arrange
        RegistroDTO dto = crearDTOValido();
        dto.setEstatura(2.8f);

        // Act
        Set<ConstraintViolation<RegistroDTO>> violaciones = validator.validate(dto);

        // Assert
        assertFalse(violaciones.isEmpty(), "Se esperaban errores de validación");

        boolean tieneErrorEstatura = violaciones.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("estatura"));

        assertTrue(tieneErrorEstatura, "Se esperaba un error de validación en el campo 'estatura'");
    }

}
