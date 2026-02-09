package com.marketistats.service;

import com.marketistats.config.MailgunConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailgunService {

    private final MailgunConfig config;

    // TODO: Implement Mailgun email forwarding
    // - Send email
    // - Forward replies
    // etc.

    public void forwardEmail(String from, String subject, String body) {
        log.info("Forwarding email from {} to {}", from, config.getForwardRepliesTo());
        // TODO: Implement email forwarding using Mailgun API
    }
}
