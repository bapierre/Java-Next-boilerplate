package com.javanextboilerplate.entity;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;

@Data
public class UtmClickDailyId implements Serializable {
    private Long utmLinkId;
    private LocalDate date;
}
