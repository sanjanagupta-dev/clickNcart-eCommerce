package com.ecommerce.backend.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public Map<String, Object> createOrder(Double amount) throws RazorpayException {
        RazorpayClient client = new RazorpayClient(keyId, keySecret);

        JSONObject options = new JSONObject();
        options.put("amount", (int)(amount * 100));
        options.put("currency", "INR");
        options.put("receipt", "order_" + System.currentTimeMillis());
        options.put("payment_capture", 1);

        com.razorpay.Order order = client.orders.create(options);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.get("id").toString());
        response.put("amount", amount);
        response.put("keyId", keyId);
        return response;
    }
}