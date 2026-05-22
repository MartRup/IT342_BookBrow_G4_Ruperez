package com.example.bookbrow.shared.security;

import com.example.bookbrow.feature.users.entity.User;
import com.example.bookbrow.feature.users.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        log.info("[OAuth2] Authentication success callback triggered");

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        log.info("[OAuth2] OAuth2User principal: {}", oauthUser);
        log.info("[OAuth2] User attributes: {}", oauthUser.getAttributes());

        String email    = oauthUser.getAttribute("email");
        String fullName = oauthUser.getAttribute("name");

        log.info("[OAuth2] Extracted email: {}, fullName: {}", email, fullName);

        if (email == null) {
            log.error("[OAuth2] Google did not return an email address — aborting login");
            getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/login?error=true");
            return;
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            log.info("[OAuth2] New Google user '{}' — saving to Supabase...", email);

            User newUser = User.builder()
                    .email(email)
                    .fullName(fullName != null && !fullName.isBlank() ? fullName : "Google User")
                    .password("OAUTH_" + UUID.randomUUID())
                    .role(User.UserRole.USER)
                    .isActive(true)
                    .build();

            User saved = userRepository.save(newUser);
            log.info("[OAuth2] User saved to Supabase with id={}", saved.getId());
            return saved;
        });

        log.info("[OAuth2] Login success for user id={} email={}", user.getId(), email);

        String token       = jwtService.generateToken(user);
        String redirectUrl = frontendUrl + "/auth/success?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
