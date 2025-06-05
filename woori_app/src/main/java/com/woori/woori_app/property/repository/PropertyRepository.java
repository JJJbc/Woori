package com.woori.woori_app.property.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.woori.woori_app.property.domain.Property;

public interface PropertyRepository extends MongoRepository<Property, String> {
    // 필요시 커스텀 쿼리 메소드 추가
}
