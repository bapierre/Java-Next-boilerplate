package com.marketistats.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class MailgunConfig {

    @Value("${mailgun.api-key}")
    private String apiKey;

    @Value("${mailgun.domain}")
    private String domain;

    @Value("${mailgun.signing-key}")
    private String signingKey;

    @Value("${mailgun.forward-replies-to}")
    private String forwardRepliesTo;
}
