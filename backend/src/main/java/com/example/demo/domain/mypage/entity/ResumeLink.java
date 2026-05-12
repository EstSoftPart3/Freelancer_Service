package com.example.demo.domain.mypage.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name= "TBL_RESUME_LINK_S")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeLink {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "resume_link_sq")
	private Long resumeLinkSq;
	
	@Column(name = "resume_sq")
	private Long resumeSq;
	
	@Column(name = "link_url")
	private String linkUrl;
}
