package com.example.bookbrow.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/oauth")
@Slf4j
public class OAuthTestController {

    @GetMapping("/test")
    public Map<String, Object> testOAuth(@AuthenticationPrincipal OAuth2User user) {
        Map<String, Object> response = new HashMap<>();
        
        if (user != null) {
            log.info("OAuth test - User authenticated: {}", user);
            response.put("authenticated", true);
            response.put("user", user.getAttributes());
            response.put("email", user.getAttribute("email"));
            response.put("name", user.getAttribute("name"));
            response.put("sub", user.getAttribute("sub"));
        } else {
            log.warn("OAuth test - No authenticated user");
            response.put("authenticated", false);
            response.put("message", "No authenticated user found");
        }
        
        return response;
    }
    
    @GetMapping("/config-check")
    public Map<String, Object> checkConfig() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "OAuth2 configuration is loaded");
        response.put("timestamp", System.currentTimeMillis());
        response.put("note", "This endpoint is always accessible to test if the app is running");
        return response;
    }
}
