package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public Order placeOrder(String userEmail, String itemsJson, Double total, String paymentMethod) {
        Order order = new Order();
        order.setUserEmail(userEmail);
        order.setItemsJson(itemsJson);
        order.setTotal(total);
        order.setPaymentMethod(paymentMethod);
        // COD stays Pending, Online payment is Confirmed
        order.setStatus("Confirmed");
        return orderRepository.save(order);
    }

    public List<Order> getOrdersByEmail(String userEmail) {
        return orderRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
    }
    
    public Order updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll(
            org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.DESC, "createdAt"
            )
        );
    }
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}