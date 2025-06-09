package com.woori.woori_app.property.service;

import org.springframework.stereotype.Service;

import com.woori.woori_app.property.domain.Property;
import com.woori.woori_app.property.repository.PropertyRepository;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
public class PropertyService {
    private final PropertyRepository propertyRepository;

    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    public List<Property> getAllProperties() {
        // 예: 정렬, 필터링 등 추가 로직 처리 가능
        return propertyRepository.findAll();
    }

    public Property getPropertyById(String id) {
    return propertyRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));
    }

    public Property createProperty(Property property) {
        // 예: 데이터 검증, 중복 체크 등
        return propertyRepository.save(property);
    }

    public Property updateProperty(String id, Property updated) {
        Property property = getPropertyById(id);
        // 필드 업데이트 로직
        property.setAddress(updated.getAddress());
        // ... 나머지 필드도 업데이트
        return propertyRepository.save(property);
    }

    public void deleteProperty(String id) {
        propertyRepository.deleteById(id);
    }
}
