package seventh_art.rocky.controller.register;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import seventh_art.rocky.dto.RegistroDTO;
import seventh_art.rocky.entity.Objetivo;
import seventh_art.rocky.entity.Sexo;
import seventh_art.rocky.service.RegistroService;

@Controller
public class RegistroController {

    private final RegistroService registroService;

    public RegistroController(RegistroService registroService) {
        this.registroService = registroService;
    }

    // ---- PANTALLA "CUENTA CREADA" ---- //
    @GetMapping("/registro/cuenta-creada")
    public String mostrarCuentaCreada(HttpSession session) {
       // Seguridad básica: debe existir un usuario en proceso de registro
        if (session.getAttribute("usuarioRegistroId") == null) {
            return "redirect:/registro";
        }

        // Mostrar la vista de cuenta creada
        return "register/cuenta-creada";
    }

    // ---- PASO 2: DATOS PERSONALES ---- //
    @GetMapping("/registro/paso2")
    public String mostrarPaso2(HttpSession session) {
        // Seguridad básica: debe existir un usuario en proceso de registro
        if (session.getAttribute("usuarioRegistroId") == null) {
            return "redirect:/registro";
        }
        return "auth/register-step2"; // tu vista de paso 2
    }

    @PostMapping("/registro/paso2")
    public String procesarPaso2(@RequestParam String nombre,
                                @RequestParam String apellido,
                                @RequestParam Integer edad,
                                @RequestParam String sexo,
                                @RequestParam Float peso,
                                @RequestParam Float estatura,
                                HttpSession session) {

        // Recuperar DTO de sesión o crearlo nuevo
        RegistroDTO dto = (RegistroDTO) session.getAttribute("registroDTO");
        if (dto == null) {
            dto = new RegistroDTO();
        }

        dto.setNombre(nombre);
        dto.setApellido(apellido);
        dto.setEdad(edad);
        dto.setSexo(Sexo.valueOf(sexo));  // "M" / "F" según tu enum
        dto.setPeso(peso);
        dto.setEstatura(estatura);        // viene en metros desde el form

        // Guardar en sesión
        session.setAttribute("registroDTO", dto);

        return "redirect:/registro/paso3";
    }

    // ---- PASO 3: OBJETIVO Y DÍAS POR SEMANA ---- //
    @GetMapping("/registro/paso3")
    public String mostrarPaso3(HttpSession session, Model model) {
        if (session.getAttribute("usuarioRegistroId") == null) {
            return "redirect:/registro";
        }
        if (session.getAttribute("registroDTO") == null) {
            return "redirect:/registro/paso2";
        }
        return "auth/register-step3"; // tu vista de paso 3
    }

    @PostMapping("/registro/paso3")
    public String procesarPaso3(@RequestParam String objetivo,
                                @RequestParam Integer diasSemana,
                                HttpSession session) {

        Long usuarioId = (Long) session.getAttribute("usuarioRegistroId");
        RegistroDTO dto = (RegistroDTO) session.getAttribute("registroDTO");

        if (usuarioId == null || dto == null) {
            return "redirect:/registro";
        }

        dto.setObjetivo(Objetivo.valueOf(objetivo)); // SUBIR/BAJAR/MANTENER
        dto.setRachaDeseada(diasSemana);             // mapeamos meta semanal

        // Crear Perfil + primer Peso
        registroService.registrarPerfilYPrimerPeso(usuarioId, dto);

        // Limpiar datos de sesión del flujo de registro
        session.removeAttribute("usuarioRegistroId");
        session.removeAttribute("registroDTO");

        // Redirigir a donde quieras que llegue el usuario ya registrado
        return "redirect:/principal_home";
    }
}
