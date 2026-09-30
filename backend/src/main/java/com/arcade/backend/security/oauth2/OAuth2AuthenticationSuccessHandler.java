package com.arcade.backend.security.oauth2;

import com.arcade.backend.audit.service.AuditService;
import com.arcade.backend.auth.service.RefreshTokenService;
import com.arcade.backend.auth.service.SessionService;
import com.arcade.backend.security.CustomUserDetails;
import com.arcade.backend.security.jwt.JwtService;
import com.arcade.backend.user.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

  private final JwtService jwtService;
  private final RefreshTokenService refreshTokenService;
  private final SessionService sessionService;
  private final AuditService auditService;
  private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

  @Value("${app.oauth2.authorized-redirect-uris:http://localhost:3000/oauth2/redirect}")
  private String redirectUri;

  @Override
  public void onAuthenticationSuccess(
      HttpServletRequest request, HttpServletResponse response, Authentication authentication)
      throws IOException, ServletException {

    String targetUrl = determineTargetUrl(request, response, authentication);

    if (response.isCommitted()) {
      logger.debug("Response has already been committed. Unable to redirect to " + targetUrl);
      return;
    }

    httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
    getRedirectStrategy().sendRedirect(request, response, targetUrl);
  }

  @Override
  protected String determineTargetUrl(
      HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
    CustomOAuth2User oauth2User = (CustomOAuth2User) authentication.getPrincipal();
    User user = oauth2User.getDbUser();

    CustomUserDetails userDetails = new CustomUserDetails(user);
    String accessToken = jwtService.generateToken(userDetails);

    String ipAddress = request.getRemoteAddr();
    String userAgent = request.getHeader("User-Agent");
    UUID familyId = UUID.randomUUID();

    String rawRefreshToken = refreshTokenService.createRefreshToken(user, familyId, ipAddress);
    sessionService.createSession(user, familyId, ipAddress, userAgent);

    auditService.logSecurityEvent(
        user, "LOGIN_SUCCESS_OAUTH2", "User logged in via Google", ipAddress);

    String targetRedirectUri = CookieUtils.getCookie(request, HttpCookieOAuth2AuthorizationRequestRepository.REDIRECT_URI_PARAM_COOKIE_NAME)
        .map(jakarta.servlet.http.Cookie::getValue)
        .orElse(redirectUri);

    // Fallback logic if redirectUri is just localhost but the request is coming from production
    if (targetRedirectUri.contains("localhost")) {
      String origin = request.getHeader("Origin");
      String referer = request.getHeader("Referer");
      if ((origin != null && origin.contains("edca.anandhupradeep.com")) || 
          (referer != null && referer.contains("edca.anandhupradeep.com"))) {
        targetRedirectUri = "https://edca.anandhupradeep.com/oauth2/redirect";
      } else if ("api.anandhupradeep.com".equals(request.getServerName())) {
        targetRedirectUri = "https://edca.anandhupradeep.com/oauth2/redirect";
      }
    }

    return UriComponentsBuilder.fromUriString(targetRedirectUri)
        .queryParam("token", accessToken)
        .queryParam("refreshToken", rawRefreshToken)
        .build()
        .toUriString();
  }
}
