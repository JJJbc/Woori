package com.woori.woori_app.property.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.woori.woori_app.property.domain.Property;

public interface PropertyRepository extends MongoRepository<Property, String> {
    
}
