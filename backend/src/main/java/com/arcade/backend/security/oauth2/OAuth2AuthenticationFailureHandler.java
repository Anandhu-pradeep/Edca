package com.arcade.backend.security.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

  @Value("${app.oauth2.authorized-redirect-uris:http://localhost:3000/sign}")
  private String redirectUri;

  @Override
  public void onAuthenticationFailure(
      HttpServletRequest request, HttpServletResponse response, AuthenticationException exception)
      throws IOException, ServletException {
    String targetRedirectUri = CookieUtils.getCookie(request, HttpCookieOAuth2AuthorizationRequestRepository.REDIRECT_URI_PARAM_COOKIE_NAME)
        .map(jakarta.servlet.http.Cookie::getValue)
        .orElse(redirectUri);
        
    // Fallback logic if redirectUri is just localhost but the request is coming from production
    if (targetRedirectUri.contains("localhost")) {
      String origin = request.getHeader("Origin");
      String referer = request.getHeader("Referer");
      if ((origin != null && origin.contains("edca.anandhupradeep.com")) || 
          (referer != null && referer.contains("edca.anandhupradeep.com"))) {
        targetRedirectUri = "https://edca.anandhupradeep.com/sign";
      } else if ("api.anandhupradeep.com".equals(request.getServerName())) {
        targetRedirectUri = "https://edca.anandhupradeep.com/sign";
      }
    } else {
      // Ensure failure goes to sign-in page if not explicitly set
      targetRedirectUri = targetRedirectUri.replace("/oauth2/redirect", "/sign");
    }

    String targetUrl =
        UriComponentsBuilder.fromUriString(targetRedirectUri)
            .queryParam("error", exception.getLocalizedMessage())
            .build()
            .toUriString();

    getRedirectStrategy().sendRedirect(request, response, targetUrl);
  }
}
