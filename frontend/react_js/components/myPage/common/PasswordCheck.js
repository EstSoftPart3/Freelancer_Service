import React, { useState } from 'react';
import { api } from '@/lib/axios';
import { useAlertStore } from '@/store/alertStore';
import styles from './PasswordCheck.module.css';

/**
 * Props
 * - onConfirmed: () => void  // 비밀번호 확인 성공 시 호출되는 콜백
 * - children: ReactNode      // slot 역할 (헤더 등)
 */
export default function PasswordCheck({ onConfirmed, children }) {
  const alertStore = useAlertStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    setError(''); // 에러 초기화

    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      const requestBody = {
        currentPassword: password,
      };

      // API 호출 - 토큰이 자동으로 포함됩니다
      const response = await api.$post('/mypage/edit/check-password', requestBody);

      if (response.status === 'OK' && response.output === true) {
        // 비밀번호 일치
        alertStore.show('비밀번호가 확인되었습니다.', 'success');
        onConfirmed?.();
      } else {
        // 비밀번호 불일치
        setError(response.message || '비밀번호가 일치하지 않습니다.');
      }
    } catch (e) {
      console.error('비밀번호 확인 실패:', e);
      const errorMsg = e?.response?.data?.message || '서버와 통신 중 오류가 발생했습니다.';
      setError(errorMsg);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        {children}
      </div>
      <div className={styles.titleSection}>
        <i className="fas fa-lock me-2"></i>
        <p className={styles.subtitle}>비밀번호 확인</p>
      </div>

      <form onSubmit={handleCheck} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            비밀번호
            <span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <div className={styles.passwordInputGroup}>
              <i className="fas fa-key"></i>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.passwordInput}
                type="password"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
            {error && (
              <div className={styles.errorMessage}>
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
              </div>
            )}
          </div>
        </div>
        <div className={styles.submitSection}>
          <button type="submit" className={styles.submitBtn}>
            <i className="fas fa-check me-2"></i>
            확인
          </button>
        </div>
      </form>
    </div>
  );
}

