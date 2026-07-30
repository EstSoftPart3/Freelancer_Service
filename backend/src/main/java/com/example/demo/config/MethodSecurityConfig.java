package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

/**
 * {@code @PreAuthorize} 를 활성화한다.
 *
 * <p>
 * 지금까지 관리자 보호는 <b>URL 패턴 하나에만</b> 의존했다 —
 * {@code SecurityConfigProd} 의 {@code requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")}.
 * 그래서 새 관리자 API 가 {@code /admin} 밖 경로로 만들어지는 순간(예: {@code /management/...},
 * {@code /internal/...}) 아무 보호도 받지 못한다. 실수 한 번이 곧 무방비다.
 * </p>
 *
 * <p>
 * 컨트롤러 클래스에 붙은 {@code @PreAuthorize("hasAuthority('ROLE_ADMIN')")} 가 두 번째 자물쇠가 된다.
 * URL 을 어디로 옮기든 따라다니고, 경로 매칭 실수와 무관하게 걸린다.
 * </p>
 *
 * <p>
 * <b>dev 프로파일에도 적용된다.</b> {@code SecurityConfigDev} 는 {@code anyRequest().permitAll()} 이지만
 * 메서드 보안은 그와 별개로 동작한다. BO 는 어차피 관리자 토큰으로 호출하므로 정상 동작하고,
 * 오히려 "dev 에서는 통과하는데 운영에서만 403" 같은 어긋남이 사라진다.
 * </p>
 */
@Configuration
@EnableMethodSecurity
public class MethodSecurityConfig {
}
