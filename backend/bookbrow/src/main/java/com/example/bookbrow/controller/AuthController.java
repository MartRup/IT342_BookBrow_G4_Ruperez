package com.example.bookbrow.controller;

import com.example.bookbrow.dto.AuthResponse;
import com.example.bookbrow.dto.LoginRequest;
import com.example.bookbrow.dto.RegisterRequest;
import com.example.bookbrow.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import java.net.URLEncoder;
import java.io.UnsupportedEncodingException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/google/success")
    public ResponseEntity<AuthResponse> googleLoginSuccess(OAuth2AuthenticationToken authentication) {
        AuthResponse response = authService.authenticateWithGoogle(authentication);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/google/failure")
    public ResponseEntity<String> googleLoginFailure() {
        return ResponseEntity.badRequest().body("Google authentication failed");
    }
}
