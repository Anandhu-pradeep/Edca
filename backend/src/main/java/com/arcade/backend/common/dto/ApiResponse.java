package com.arcade.backend.common.dto;

import java.time.ZonedDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ApiResponse<T> {
    @Builder.Default
    private ZonedDateTime timestamp = ZonedDateTime.now();
    private int status;
    private String code;
    private String message;
    private String path;
    private T data;
}
