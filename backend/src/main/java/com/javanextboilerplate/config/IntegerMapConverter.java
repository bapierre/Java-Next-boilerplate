package com.javanextboilerplate.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

import java.util.Collections;
import java.util.Map;

@Converter
@Slf4j
public class IntegerMapConverter implements AttributeConverter<Map<String, Integer>, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final TypeReference<Map<String, Integer>> TYPE = new TypeReference<>() {};

    @Override
    public String convertToDatabaseColumn(Map<String, Integer> map) {
        try {
            return MAPPER.writeValueAsString(map == null ? Collections.emptyMap() : map);
        } catch (Exception e) {
            log.error("Failed to serialise integer map", e);
            return "{}";
        }
    }

    @Override
    public Map<String, Integer> convertToEntityAttribute(String json) {
        try {
            return json == null || json.isBlank() ? Collections.emptyMap() : MAPPER.readValue(json, TYPE);
        } catch (Exception e) {
            log.error("Failed to deserialise integer map", e);
            return Collections.emptyMap();
        }
    }
}
