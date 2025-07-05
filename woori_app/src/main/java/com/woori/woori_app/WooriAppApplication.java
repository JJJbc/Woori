package com.woori.woori_app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class WooriAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(WooriAppApplication.class, args);
	}

}
