package com.wifakbank.rh_system.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Sert l'application Angular depuis le JAR.
 *
 * Une route comme /profile ou /admin/users n'existe pas sur le disque :
 * c'est le routeur Angular qui la gère. Sans repli, un accès direct ou un
 * rafraîchissement renverrait 404. On renvoie donc index.html pour toute
 * ressource introuvable, sauf sous /api où les erreurs doivent rester
 * telles quelles (401, 403, 404…).
 */
@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requested = location.createRelative(resourcePath);

                        if (requested.exists() && requested.isReadable()) {
                            return requested;
                        }
                        // Les appels API gardent leur code d'erreur réel.
                        if (resourcePath.startsWith("api/")) {
                            return null;
                        }
                        // Sinon : route Angular.
                        return new ClassPathResource("/static/index.html");
                    }
                });
    }
}
