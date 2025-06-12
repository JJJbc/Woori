package com.woori.woori_app.user.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.Map;

import com.woori.woori_app.user.domain.User;
import com.woori.woori_app.user.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        User user = userRepository.findByUsername(username);
        if (user == null || !user.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 실패");
        }
        return ResponseEntity.ok().body("로그인 성공");
    }
}
