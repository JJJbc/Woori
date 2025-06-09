package com.woori.woori_app.property.controller;

import org.springframework.web.bind.annotation.*;

import com.woori.woori_app.property.domain.Property;
import com.woori.woori_app.property.service.PropertyService;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {
    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GetMapping
    public List<Property> getAllProperties() {
        return propertyService.getAllProperties();
    }

    @GetMapping("/{id}")
    public Property getPropertyById(@PathVariable String id) {
        return propertyService.getPropertyById(id);
    }

    @PostMapping
    public Property createProperty(@RequestBody Property property) {
        return propertyService.createProperty(property);
    }

    @PutMapping("/{id}")
    public Property updateProperty(@PathVariable String id, @RequestBody Property property) {
        return propertyService.updateProperty(id, property);
    }

    @DeleteMapping("/{id}")
    public void deleteProperty(@PathVariable String id) {
        propertyService.deleteProperty(id);
    }
}