package com.woori.woori_app.property.service;

import org.springframework.stereotype.Service;

import com.woori.woori_app.property.domain.Property;
import com.woori.woori_app.property.repository.PropertyRepository;

import java.util.List;

@Service
public class PropertyService {
    private final PropertyRepository propertyRepository;

    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    public List<Property> findAll() {
        return propertyRepository.findAll();
    }

    public Property save(Property property) {
        return propertyRepository.save(property);
    }

    // 필요시 추가 메소드 구현
}
