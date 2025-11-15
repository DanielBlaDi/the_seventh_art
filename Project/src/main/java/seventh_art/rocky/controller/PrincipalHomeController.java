package seventh_art.rocky.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PrincipalHomeController {

    @GetMapping("/principal_home")
    public String mostrarPrincipalHome() {
        return "home/principal_home"; // busca templates/home/principal_home.html
    }
}
