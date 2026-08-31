package com.wifakbank.rh_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(scanBasePackages = "com.wifakbank.rh_system")
@EnableAsync
public class RhSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(RhSystemApplication.class, args);
	}
}
