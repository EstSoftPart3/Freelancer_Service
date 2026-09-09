package com.example.demo.domain.affiliation.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long companyApplicationSq;
    private Long companySq;
    private Long userSq;
    private Long resumeSq;
    private String companyApplicationGreetingTxt;
    private Long companyApplicationStatusCd;
    private String companyApplicationIsDeletedYn;
    private LocalDateTime companyApplicationReadAtDtm;
    private LocalDateTime companyApplicationCreatedAtDtm;
    
}
