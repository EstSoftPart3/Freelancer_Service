package com.example.demo.domain.banner.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.banner.dto.request.BannerCreateRequest;
import com.example.demo.domain.banner.dto.request.BannerUpdateRequest;
import com.example.demo.domain.banner.dto.response.ActiveBannerResponse;
import com.example.demo.domain.banner.dto.response.BannerResponse;

@Mapper
public interface BannerMapper {

    int insert(
            @Param("request") BannerCreateRequest request,
            @Param("bannerImageFileSq") Long bannerImageFileSq,
            @Param("bannerIsActiveYn") String bannerIsActiveYn,
            @Param("linkTargetBlankYn") String linkTargetBlankYn);

    Long countBanners(@Param("keyword") String keyword);

    List<BannerResponse> findAllBanners(
            @Param("keyword") String keyword,
            @Param("sortField") String sortField,
            @Param("sortOrder") String sortOrder,
            @Param("offset") Long offset,
            @Param("size") Long size);

    BannerResponse selectById(@Param("bannerSq") Long bannerSq);

    List<ActiveBannerResponse> selectActive();

    int update(
            @Param("bannerSq") Long bannerSq,
            @Param("request") BannerUpdateRequest request,
            @Param("bannerImageFileSq") Long bannerImageFileSq,
            @Param("bannerIsActiveYn") String bannerIsActiveYn,
            @Param("linkTargetBlankYn") String linkTargetBlankYn);

    int softDelete(@Param("bannerSq") Long bannerSq);

    int toggleActive(@Param("bannerSq") Long bannerSq);

    /** 노출 종료일이 지난 활성 배너 일괄 비활성 (스케줄러) */
    int deactivateExpired();

    /** FO 배너 클릭 수 +1 */
    int incrementClickCount(@Param("bannerSq") Long bannerSq);
}

/*
 * ========== 학습용 설명 ==========
 *
 * import java.util.List;
 *
 * // org.apache.ibatis = MyBatis (JPA 아님)
 * import org.apache.ibatis.annotations.Mapper;  // Spring Bean 등록, XML과 짝
 * import org.apache.ibatis.annotations.Param;   // XML #{이름} 과 메서드 인자 연결
 *
 * import ... BannerCreateRequest;
 * import ... ActiveBannerResponse;
 * import ... BannerResponse;
 *
 * // CompanyMapper 와 동일: interface 선언만, SQL 은 BannerMapper.xml
 * // Entity 없이 DTO + @Param 으로 DB 접근
 * @Mapper
 * public interface BannerMapper {
 *
 *     // INSERT. 반환 int = 영향받은 행 수
 *     int insert(
 *             @Param("request") BannerCreateRequest request,       // XML #{request.bannerTitle}
 *             @Param("bannerImageFileSq") Long bannerImageFileSq,  // 파일 PK (Service)
 *             @Param("bannerIsActiveYn") String bannerIsActiveYn, // "Y" or "N"
 *             @Param("linkTargetBlankYn") String linkTargetBlankYn);
 *
 *     BannerResponse selectById(@Param("bannerSq") Long bannerSq);
 *
 *     List<ActiveBannerResponse> selectActive();
 * }
 */
