package com.javanextboilerplate.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LinkChannelRequest {
    @NotNull
    private Long channelId;
}
