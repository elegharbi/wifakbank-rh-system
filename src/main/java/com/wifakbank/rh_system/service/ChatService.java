package com.wifakbank.rh_system.service;

import com.wifakbank.rh_system.repository.SystemConfigRepository;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Service
public class ChatService {

    private final SystemConfigRepository systemConfigRepository;

    public ChatService(SystemConfigRepository systemConfigRepository) {
        this.systemConfigRepository = systemConfigRepository;
    }

    private final String API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3";
    private final RestTemplate restTemplate = new RestTemplate();

    public String getAIResponse(String userMessage) {
        String token = systemConfigRepository.findByConfigKey("HF_TOKEN")
                        .map(c -> c.getConfigValue())
                        .orElse(null);

        if (token == null || token.isEmpty()) {
            return "DÃ©solÃ©, le jeton API Hugging Face n'est pas configurÃ© en base de donnÃ©es.";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        Map<String, Object> body = new HashMap<>();
        body.put("inputs", "[INST] " + userMessage + " [/INST]");
        
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("max_new_tokens", 250);
        parameters.put("return_full_text", false);
        body.put("parameters", parameters);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<List> response = restTemplate.postForEntity(API_URL, entity, List.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, String> res = (Map<String, String>) response.getBody().get(0);
                return res.get("generated_text").trim();
            }
        } catch (Exception e) {
            System.err.println("Erreur de l'API IA : " + e.getMessage());
            
            // MODE DÉMO (Fallback) : Si l'API externe échoue (ex: pas d'internet ou proxy bloquant)
            String msg = userMessage.toLowerCase();
            if (msg.contains("bonjour") || msg.contains("salut")) {
                return "Bonjour ! Je suis l'assistant RH virtuel de Wifak Bank. Comment puis-je vous aider aujourd'hui ?";
            } else if (msg.contains("congé") || msg.contains("conge") || msg.contains("vacance")) {
                return "Pour demander un congé, veuillez vous rendre dans la rubrique 'Demande de congé' de votre espace. Remplissez le formulaire avec vos dates, et votre manager recevra une notification pour validation.";
            } else if (msg.contains("salaire") || msg.contains("paie") || msg.contains("fiche")) {
                return "Vos fiches de paie sont disponibles dans votre profil. Si vous avez une question spécifique sur votre rémunération, je vous conseille de contacter directement le département RH.";
            } else if (msg.contains("recrutement") || msg.contains("offre") || msg.contains("emploi")) {
                return "Wifak Bank recrute activement ! Vous pouvez consulter toutes nos offres d'emploi dans la rubrique 'Offres d'emploi' et postuler directement en ligne.";
            }
            return "En tant qu'assistant virtuel Wifak Bank, je suis là pour vous aider avec vos congés, vos fiches de paie ou vos informations RH. Que souhaitez-vous savoir ?";
        }

        return "Je n'ai pas pu obtenir de rÃ©ponse de l'IA pour le moment.";
    }
}

