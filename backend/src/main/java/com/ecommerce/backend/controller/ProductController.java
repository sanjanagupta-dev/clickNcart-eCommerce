package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.security.JwtUtil;
import com.ecommerce.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private UserRepository userRepository;

    // PUBLIC — anyone can fetch products
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    // ADMIN ONLY — add product
    @PostMapping
    public Product addProduct(@RequestBody Product product,
                               @RequestHeader("Authorization") String authHeader) {
        verifyAdmin(authHeader);
        return productService.addProduct(product);
    }

    // ADMIN ONLY — delete product
    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id,
                                 @RequestHeader("Authorization") String authHeader) {
        verifyAdmin(authHeader);
        productService.deleteProduct(id);
        return "Product deleted";
    }

    private void verifyAdmin(String authHeader) {
        String email = JwtUtil.extractEmail(authHeader.substring(7));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Access denied");
        }
    }
}