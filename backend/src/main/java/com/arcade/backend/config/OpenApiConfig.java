package com.arcade.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI customOpenAPI() {
    return new OpenAPI()
        .info(
            new Info()
                .title("Arcade Backend API")
                .version("v1")
                .description("REST API documentation for the Arcade Backend platform.")
                .contact(new Contact().name("Arcade Dev Team").email("dev@arcade.example.com"))
                .license(new License().name("Proprietary").url("https://arcade.example.com")));
  }
}
