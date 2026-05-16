package com.ecommerce.backend.controller;

import com.ecommerce.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-order")
    public Map<String, Object> createOrder(@RequestBody Map<String, Object> body,
                               @RequestHeader("Authorization") String authHeader) throws Exception {
        Double amount = Double.parseDouble(body.get("amount").toString());
        return paymentService.createOrder(amount);
    }
}