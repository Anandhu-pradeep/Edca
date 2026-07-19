package com.arcade.backend.security.oauth2;

import com.arcade.backend.user.User;
import java.util.Collection;
import java.util.Map;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

public class CustomOAuth2User implements OAuth2User {

    private final OAuth2User oauth2User;
    private final User dbUser;

    public CustomOAuth2User(OAuth2User oauth2User, User dbUser) {
        this.oauth2User = oauth2User;
        this.dbUser = dbUser;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return oauth2User.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return oauth2User.getAuthorities(); // Maybe return dbUser's authorities here instead
    }

    @Override
    public String getName() {
        return oauth2User.getAttribute("name");
    }

    public String getEmail() {
        return oauth2User.getAttribute("email");
    }
    
    public User getDbUser() {
        return dbUser;
    }
}
