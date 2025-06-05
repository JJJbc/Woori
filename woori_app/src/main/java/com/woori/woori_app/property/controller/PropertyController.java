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
    public List<Property> getAll() {
        return propertyService.findAll();
    }

    @PostMapping
    public Property create(@RequestBody Property property) {
        return propertyService.save(property);
    }

    // 필요시 상세조회, 수정, 삭제 등 추가
}