package com.woori.woori_app.property.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "properties")
public class Property {
    @Id
    private String id;
    private String address;
    private String detail;
    private int rooms;
    private int bathrooms;
    private double area;
    private String dealType;
    private long price;
    private String lessor;
    private String lessorPhone;
    private String lessee;
    private String lesseePhone;
    private String moveInDate;
    private String contractPeriod;
    private double lat;
    private double lng;
}
