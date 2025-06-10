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
}
