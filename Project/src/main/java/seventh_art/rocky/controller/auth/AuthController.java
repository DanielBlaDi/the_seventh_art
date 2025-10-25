package seventh_art.rocky.controller.auth;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class AuthController {
    @GetMapping("/login")
    public String loginForm() {
        return "auth/login"; // Muestra la vista
    }


}
