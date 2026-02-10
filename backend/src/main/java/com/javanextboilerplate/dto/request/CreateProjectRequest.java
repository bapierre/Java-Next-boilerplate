package com.javanextboilerplate.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectRequest {

    @NotBlank(message = "Project name is required")
    @Size(max = 255, message = "Name must be 255 characters or less")
    private String name;

    private String description;

    @Size(max = 500, message = "Website URL must be 500 characters or less")
    private String websiteUrl;

    @Size(max = 500, message = "Image URL must be 500 characters or less")
    private String imageUrl;

    @Size(max = 100, message = "Category must be 100 characters or less")
    private String category;

    @Size(max = 50, message = "Type must be 50 characters or less")
    private String type;
}
