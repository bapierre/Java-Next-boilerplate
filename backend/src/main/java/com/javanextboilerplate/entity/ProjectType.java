package com.javanextboilerplate.entity;

public enum ProjectType {
    PRODUCT("PRODUCT"),
    PERSONAL_BRAND("PERSONAL_BRAND");

    private final String value;

    ProjectType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ProjectType fromValue(String value) {
        for (ProjectType type : ProjectType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown project type: " + value);
    }
}
