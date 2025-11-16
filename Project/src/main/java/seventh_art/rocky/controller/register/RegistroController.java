package seventh_art.rocky.controller.register;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
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
    public String mostrarPaso2(HttpSession session, Model model) {

        if (session.getAttribute("usuarioRegistroId") == null) {
            return "redirect:/registro";
        }

        // Si no hay DTO en sesión, crear uno vacío
        if (!model.containsAttribute("registroDTO")) {
            RegistroDTO dto = (RegistroDTO) session.getAttribute("registroDTO");
            if (dto == null) dto = new RegistroDTO();
            model.addAttribute("registroDTO", dto);
        }

        return "auth/register-step2";
    }

    @PostMapping("/registro/paso2")
    public String procesarPaso2(
            @Valid @ModelAttribute("registroDTO") RegistroDTO dto,
            org.springframework.validation.BindingResult result,
            HttpSession session) {

        // Si hay errores de validación, volvemos al formulario del paso 2
        if (result.hasErrors()) {
            return "auth/register-step2";
        }

        // Si todo es válido, guardamos el DTO en la sesión
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
        return "redirect:/registro/registro-exitoso";

    }

    @GetMapping("/registro/registro-exitoso")
    public String mostrarRegistroExitoso() {
        return "register/registro-exitoso"; // tu vista de registro exitoso
    }
}
