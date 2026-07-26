package com.arcade.backend.security.oauth2;

import com.arcade.backend.role.Role;
import com.arcade.backend.role.RoleRepository;
import com.arcade.backend.user.User;
import com.arcade.backend.user.UserRepository;
import java.util.HashSet;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;

  @Override
  public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
    OAuth2User oauth2User = super.loadUser(userRequest);

    String email = oauth2User.getAttribute("email");
    if (email == null) {
      throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
    }

    Optional<User> userOptional = userRepository.findByEmail(email);
    User user;

    if (userOptional.isPresent()) {
      user = userOptional.get();
      boolean changed = false;
      if (!"GOOGLE".equals(user.getAuthProvider())) {
        user.setAuthProvider("GOOGLE");
        user.setAuthProviderId(oauth2User.getAttribute("sub"));
        changed = true;
      }
      String picture = oauth2User.getAttribute("picture");
      if (picture != null && !picture.equals(user.getAvatar())) {
        user.setAvatar(picture);
        changed = true;
      }
      if (changed) {
        userRepository.save(user);
      }
    } else {
      Role userRole =
          roleRepository
              .findByName("ROLE_USER")
              .orElseGet(
                  () ->
                      roleRepository.save(
                          Role.builder()
                              .name("ROLE_USER")
                              .description("Standard user role")
                              .build()));

      user =
          User.builder()
              .email(email)
              .firstName(oauth2User.getAttribute("given_name"))
              .lastName(oauth2User.getAttribute("family_name"))
              .avatar(oauth2User.getAttribute("picture"))
              .isEmailVerified(true)
              .authProvider("GOOGLE")
              .authProviderId(oauth2User.getAttribute("sub"))
              .roles(new HashSet<>())
              .build();
      user.getRoles().add(userRole);
      user = userRepository.save(user);
    }

    return new CustomOAuth2User(oauth2User, user);
  }
}
