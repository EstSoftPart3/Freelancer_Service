import React, { useState } from 'react';
import './PasswordCheck.css';

/**
 * Props
 * - onConfirmed: () => void  // 비밀번호 확인 성공 시 호출되는 콜백
 * - children: ReactNode      // slot 역할 (헤더 등)
 * - api?: object            // axios 인스턴스 (선택)
 */
export default function PasswordCheck({ onConfirmed, children, api }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const getAccessTokenFromCookie = () => {
    const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  const handleCheck = async (e) => {
    e.preventDefault();
    setError(''); // 에러 초기화

    try {
      const requestBody = {
        currentPassword: password,
      };

      const token = getAccessTokenFromCookie();

      if (api) {
        // axios 인스턴스를 주입받은 경우
        const response = await api.$post('/mypage/edit/check-password', requestBody, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
          withCredentials: true,
        });

        if (response.status === 'OK' && response.output === true) {
          // 비밀번호 일치
          onConfirmed?.();
        } else {
          // 비밀번호 불일치
          setError(response.message || '비밀번호가 일치하지 않습니다.');
        }
      } else {
        // fetch 기본 구현
        const response = await fetch('/api/mypage/edit/check-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          credentials: 'include',
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (response.ok && data.status === 'OK' && data.output === true) {
          // 비밀번호 일치
          onConfirmed?.();
        } else {
          // 비밀번호 불일치
          setError(data.message || '비밀번호가 일치하지 않습니다.');
        }
      }
    } catch (e) {
      setError('서버와 통신 중 오류가 발생했습니다.');
      console.error(e);
    }
  };

  return (
    <div>
      <div className="overflow-hidden mb-3">
        {children}
        {/* <h2 className="font-weight-normal text-7 mb-0">회원 정보 수정</h2> */}
      </div>
      <div className="overflow-hidden mb-4 pb-3">
        <p className="mb-0">비밀번호 확인</p>
      </div>

      <form
        onSubmit={handleCheck}
        className="needs-validation"
        noValidate
      >
        <div className="form-group row">
          <label className="col-lg-3 col-form-label form-control-label line-height-9 pt-2 text-2 required">
            비밀번호
          </label>
          <div className="col-lg-9">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control text-3 h-auto py-2"
              type="password"
              required
            />
            <div className="invalid-feedback text-primary" style={{ display: 'block' }}>
              {error}
            </div>
          </div>
        </div>
        <div className="form-group row">
          <div className="form-group col-lg-9"></div>
          <div className="form-group col-lg-3">
            <input
              type="submit"
              value="확인"
              className="btn btn-primary btn-modern float-end"
            />
          </div>
        </div>
      </form>
    </div>
  );
}

