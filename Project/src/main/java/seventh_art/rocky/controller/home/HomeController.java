package seventh_art.rocky.controller.home;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class HomeController {

    @GetMapping({"/home"})
    public String home() {
        return "home/index"; // busca templates/home/index.html
    }
}

