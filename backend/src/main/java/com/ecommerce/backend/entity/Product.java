package com.ecommerce.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Double price;
    private Double oldPrice;
    private String img;

    @Column(name = "type")
    private String type;

    @Column(name = "`group`")
    private String group;

    private String tag;
    private String descr;

    public Long getId() { return id; }
    public String getName() { return name; }
    public Double getPrice() { return price; }
    public Double getOldPrice() { return oldPrice; }
    public String getImg() { return img; }
    public String getType() { return type; }
    public String getGroup() { return group; }
    public String getTag() { return tag; }
    public String getDescr() { return descr; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setPrice(Double price) { this.price = price; }
    public void setOldPrice(Double oldPrice) { this.oldPrice = oldPrice; }
    public void setImg(String img) { this.img = img; }
    public void setType(String type) { this.type = type; }
    public void setGroup(String group) { this.group = group; }
    public void setTag(String tag) { this.tag = tag; }
    public void setDescr(String descr) { this.descr = descr; }
}