package com.spotify.My_music.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.spotify.My_music.entity.User;
import com.spotify.My_music.repository.UserRepository;

import java.util.Optional;

@Component
public class AdminUserSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.password}")
    private String adminPassword;

    public AdminUserSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        Optional<User> adminOpt = userRepository.findByUsername("hareeshvar");
        if (adminOpt.isEmpty()) {
            System.out.println("Seeding default admin user: hareeshvar");
            User admin = new User();
            admin.setUsername("hareeshvar");
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println("Default admin user hareeshvar seeded successfully.");
        } else {
            System.out.println("Admin user hareeshvar already exists. Updating password to match current environment configuration.");
            User admin = adminOpt.get();
            admin.setPassword(passwordEncoder.encode(adminPassword));
            userRepository.save(admin);
            System.out.println("Admin user hareeshvar password updated successfully.");
        }
    }
}
