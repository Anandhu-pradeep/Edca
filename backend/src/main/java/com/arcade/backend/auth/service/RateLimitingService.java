package com.arcade.backend.auth.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class RateLimitingService {

  private final Map<String, List<Instant>> requestTimestamps = new ConcurrentHashMap<>();

  /**
   * Enforces a 60-second cooldown interval and a maximum of 5 attempts per hour per key.
   *
   * @param key Unique identifier (e.g., email or IP prefix)
   */
  public synchronized void enforceRateLimit(String key) {
    if (key == null || key.isEmpty()) {
      return;
    }
    Instant now = Instant.now();
    Instant oneHourAgo = now.minusSeconds(3600);

    List<Instant> timestamps = requestTimestamps.computeIfAbsent(key, k -> new ArrayList<>());
    timestamps.removeIf(t -> t.isBefore(oneHourAgo));

    if (!timestamps.isEmpty()) {
      Instant lastRequest = timestamps.get(timestamps.size() - 1);
      if (lastRequest.plusSeconds(60).isAfter(now)) {
        throw new SecurityException(
            "Please wait at least 60 seconds before requesting another verification code.");
      }
    }

    if (timestamps.size() >= 5) {
      throw new SecurityException(
          "Rate limit exceeded. You can request a maximum of 5 verification codes per hour.");
    }

    timestamps.add(now);
  }
}
