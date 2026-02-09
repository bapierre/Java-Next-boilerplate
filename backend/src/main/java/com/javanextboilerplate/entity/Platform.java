package com.javanextboilerplate.entity;

public enum Platform {
    TIKTOK("tiktok"),
    INSTAGRAM("instagram"),
    YOUTUBE("youtube");

    private final String value;

    Platform(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Platform fromValue(String value) {
        for (Platform platform : Platform.values()) {
            if (platform.value.equalsIgnoreCase(value)) {
                return platform;
            }
        }
        throw new IllegalArgumentException("Unknown platform: " + value);
    }
}
