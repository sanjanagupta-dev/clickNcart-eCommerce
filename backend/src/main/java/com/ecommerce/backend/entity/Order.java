package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;

    @Column(columnDefinition = "TEXT")
    private String itemsJson;

    private Double total;

    private String status;

    private LocalDateTime createdAt;
    
    private String paymentMethod;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = "Pending";
    }

    // GETTERS
    public Long getId() { return id; }
    public String getUserEmail() { return userEmail; }
    public String getItemsJson() { return itemsJson; }
    public Double getTotal() { return total; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getPaymentMethod() { return paymentMethod; }

    // SETTERS
    public void setId(Long id) { this.id = id; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public void setItemsJson(String itemsJson) { this.itemsJson = itemsJson; }
    public void setTotal(Double total) { this.total = total; }
    public void setStatus(String status) { this.status = status; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}