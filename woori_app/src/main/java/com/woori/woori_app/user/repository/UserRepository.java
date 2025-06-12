package com.woori.woori_app.user.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.woori.woori_app.user.domain.User;

public interface UserRepository extends MongoRepository<User, String> {
    User findByUsername(String username);
}
