package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.AuthResponse;
import com.ecommerce.backend.dto.LoginRequest;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.service.OtpService;
import com.ecommerce.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3001")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private OtpService otpService;

    // Step 1: Send OTP for registration
    @PostMapping("/send-register-otp")
    public String sendRegisterOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        otpService.generateAndSendOtp(email, "register");
        return "OTP sent to " + email;
    }

    // Step 2: Verify OTP and register
    @PostMapping("/verify-register-otp")
    public AuthResponse verifyAndRegister(@RequestBody Map<String, String> body) {
        String otp = body.get("otp");
        String email = body.get("email");
        String password = body.get("password");
        String name = body.get("name");

        if (!otpService.verifyOtp(email, otp)) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password);
        user.setRole("USER");
        userService.register(user);

        return userService.login(email, password);
    }

    // Login
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return userService.login(request.getEmail(), request.getPassword());
    }

    // Step 1: Send OTP for password reset
    @PostMapping("/send-reset-otp")
    public String sendResetOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        // Check if user exists first
        userService.checkEmailExists(email);
        otpService.generateAndSendOtp(email, "reset");
        return "OTP sent to " + email;
    }

    // Step 2: Verify OTP for reset
    @PostMapping("/verify-reset-otp")
    public String verifyResetOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        if (!otpService.verifyOtp(email, otp)) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        return "OTP verified";
    }

    // Step 3: Set new password
    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody LoginRequest request) {
        return userService.resetPassword(request.getEmail(), request.getPassword());
    }

    @GetMapping("/profile")
    public String getProfile() {
        return "Protected profile data";
    }
    
    @PutMapping("/update-profile")
    public User updateProfile(@RequestBody Map<String, String> body,
                               @RequestHeader("Authorization") String authHeader) {
        String email = com.ecommerce.backend.security.JwtUtil.extractEmail(authHeader.substring(7));
        return userService.updateProfile(email, body.get("name"));
    }
}