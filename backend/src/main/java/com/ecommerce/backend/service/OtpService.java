package com.ecommerce.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender;

    // Store OTPs in memory { email -> otp }
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();

    public void generateAndSendOtp(String email, String purpose) {
        String otp = String.valueOf(100000 + new Random().nextInt(900000));
        otpStore.put(email, otp);

        String subject = purpose.equals("register")
            ? "Click & Cart - Verify Your Email"
            : "Click & Cart - Password Reset OTP";

        String body = purpose.equals("register")
            ? "Welcome to Click & Cart!\n\nYour OTP to verify your email is: " + otp + "\n\nThis OTP is valid for 10 minutes.\n\nDo not share this with anyone."
            : "You requested a password reset on Click & Cart.\n\nYour OTP is: " + otp + "\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, ignore this email.";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    public boolean verifyOtp(String email, String otp) {
        String stored = otpStore.get(email);
        if (stored != null && stored.equals(otp)) {
            otpStore.remove(email); // OTP used, remove it
            return true;
        }
        return false;
    }
}