package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;
    @Autowired
    private com.ecommerce.backend.repository.UserRepository userRepository;
    @Autowired
    private com.ecommerce.backend.repository.OrderRepository orderRepository;

    @PostMapping("/place")
    public Order placeOrder(@RequestBody Map<String, Object> body,
                             @RequestHeader("Authorization") String authHeader) {
        String userEmail = com.ecommerce.backend.security.JwtUtil.extractEmail(
            authHeader.substring(7)
        );
        String itemsJson = body.get("itemsJson").toString();
        Double total = Double.parseDouble(body.get("total").toString());
        String paymentMethod = body.getOrDefault("paymentMethod", "COD").toString();
        return orderService.placeOrder(userEmail, itemsJson, total, paymentMethod);
    }

    @GetMapping("/my")
    public List<Order> getMyOrders(@RequestHeader("Authorization") String authHeader) {
        String userEmail = com.ecommerce.backend.security.JwtUtil.extractEmail(
            authHeader.substring(7)
        );
        return orderService.getOrdersByEmail(userEmail);
    }
    
    @PutMapping("/{id}/status")
    public Order updateStatus(@PathVariable Long id,
                               @RequestBody Map<String, String> body,
                               @RequestHeader("Authorization") String authHeader) {
        String email = com.ecommerce.backend.security.JwtUtil.extractEmail(authHeader.substring(7));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Access denied");
        }
        String status = body.get("status");
        return orderService.updateOrderStatus(id, status);
    }
    
    @GetMapping("/all")
    public List<Order> getAllOrders(@RequestHeader("Authorization") String authHeader) {
        String email = com.ecommerce.backend.security.JwtUtil.extractEmail(authHeader.substring(7));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Access denied");
        }
        return orderService.getAllOrders();
    }
    @DeleteMapping("/{id}/cancel")
    public String cancelOrder(@PathVariable Long id,
                              @RequestHeader("Authorization") String authHeader) {
        String email = com.ecommerce.backend.security.JwtUtil.extractEmail(authHeader.substring(7));
        // verify this order belongs to this user
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getUserEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }
        orderService.deleteOrder(id);
        return "Order cancelled";
    }
}