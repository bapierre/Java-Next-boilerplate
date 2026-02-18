package com.javanextboilerplate.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javanextboilerplate.dto.response.SeoCheckItem;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

import java.util.Collections;
import java.util.List;

@Converter
@Slf4j
public class SeoCheckListConverter implements AttributeConverter<List<SeoCheckItem>, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final TypeReference<List<SeoCheckItem>> TYPE = new TypeReference<>() {};

    @Override
    public String convertToDatabaseColumn(List<SeoCheckItem> checks) {
        try {
            return MAPPER.writeValueAsString(checks == null ? Collections.emptyList() : checks);
        } catch (Exception e) {
            log.error("Failed to serialise SEO checks", e);
            return "[]";
        }
    }

    @Override
    public List<SeoCheckItem> convertToEntityAttribute(String json) {
        try {
            return json == null || json.isBlank() ? Collections.emptyList() : MAPPER.readValue(json, TYPE);
        } catch (Exception e) {
            log.error("Failed to deserialise SEO checks", e);
            return Collections.emptyList();
        }
    }
}
