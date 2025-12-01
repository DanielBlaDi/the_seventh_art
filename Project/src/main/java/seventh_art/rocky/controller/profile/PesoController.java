package seventh_art.rocky.controller.profile;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import seventh_art.rocky.dto.PesoRegistroDTO;
import seventh_art.rocky.entity.Peso;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.service.peso.PesoService;
import seventh_art.rocky.service.profile.PerfilActualService;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
@RequestMapping("/perfil/peso")
public class PesoController {

    private final PerfilActualService perfilActualService;
    private final PesoService pesoService;

    @GetMapping
    public String verRegistroPeso(Model model) {

        PesoRegistroDTO dto = new PesoRegistroDTO();
        dto.setFecha(LocalDate.now());
        model.addAttribute("pesoRegistroDTO", dto);

        cargarModeloRegistroPeso(model);

        return "home/profile/peso/registro_peso";
    }

    @PostMapping
    public String registrarPeso(
            @Valid @ModelAttribute("pesoRegistroDTO") PesoRegistroDTO dto,
            BindingResult result,
            Model model) {

        if (result.hasErrors()) {
            cargarModeloRegistroPeso(model);
            return "home/profile/peso/registro_peso";
        }

        pesoService.registrarPeso(dto.getPeso(), dto.getFecha());
        return "redirect:/perfil/peso";
    }

    private void cargarModeloRegistroPeso(Model model) {

        Perfil perfil = perfilActualService.getCurrentPerfil();
        List<Peso> pesosOrdenados = pesoService.obtenerPesosOrdenados(perfil);

        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("dd MMM", new Locale("es", "ES"));

        List<String> fechasPeso = pesosOrdenados.stream()
                .map(p -> p.getFecha().toLocalDate().format(formatter))
                .collect(Collectors.toList());

        List<Float> valoresPeso = pesosOrdenados.stream()
                .map(Peso::getValor)
                .collect(Collectors.toList());

        Float pesoActual = pesoService.obtenerPesoActual(perfil);
        Float pesoMinimo = pesoService.obtenerPesoMinimo(perfil);
        Float pesoMaximo = pesoService.obtenerPesoMaximo(perfil);
        Long totalRegistros = pesoService.contarRegistros(perfil);

        Float cambioTotal = null;
        if (!pesosOrdenados.isEmpty() && pesoActual != null) {
            Float primero = pesosOrdenados.get(0).getValor();
            cambioTotal = pesoActual - primero;
        }

        List<Peso> ultimos5 = pesoService.obtenerUltimos5Pesos(perfil);

        model.addAttribute("fechaHoy", LocalDate.now());
        model.addAttribute("fechasPeso", fechasPeso);
        model.addAttribute("valoresPeso", valoresPeso);

        model.addAttribute("pesoActual", pesoActual);
        model.addAttribute("pesoMinimo", pesoMinimo);
        model.addAttribute("pesoMaximo", pesoMaximo);
        model.addAttribute("cambioTotal", cambioTotal);
        model.addAttribute("totalRegistros", totalRegistros);
        model.addAttribute("registrosPeso", ultimos5);
    }
}

