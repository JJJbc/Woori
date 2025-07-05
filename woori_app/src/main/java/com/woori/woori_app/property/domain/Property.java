package com.woori.woori_app.property.domain;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "properties")
public class Property {
    @Id
    private String id;
    private String address;
    private String detail;
    private String rooms;
    private String bathrooms;
    private String area;
    private String dealType;
    private String price;
    private String lessor;
    private String lessorPhone;
    private String lessee;
    private String lesseePhone;
    private String moveInDate;
    private String contractPeriod;
    private String lat;
    private String lng;
    private String memo;
    
    @CreatedDate
    private LocalDateTime creDate;

    @LastModifiedDate
    private LocalDateTime upDate;
}
