package com.sports4u.sports4u_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableCaching
public class Sports4uBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(Sports4uBackendApplication.class, args);
	}

}
