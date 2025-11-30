package seventh_art.rocky.controller.statistics;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import seventh_art.rocky.dto.StatsDTO;
import seventh_art.rocky.service.StatsService;

@Controller
public class StatsController {
    
    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/stats")
    public String showStats(Model model) {
        StatsDTO dto = statsService.getStatsUser();

        model.addAttribute("fecha", dto.getFecha());
        model.addAttribute("labels", dto.getLabels());
        model.addAttribute("values", dto.getValues());
        model.addAttribute("statistics", dto.getMusculos()); // útil para las tarjetas de porcentajes

        return "statistics/stats";
    }
}

