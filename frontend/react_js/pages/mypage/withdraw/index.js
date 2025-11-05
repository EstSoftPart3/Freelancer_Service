import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/lib/axios';
import MyPageLayout from '../MyPageLayout';
import PasswordCheck from '@/components/myPage/common/PasswordCheck';
import styles from './Withdraw.module.css';

export default function WithdrawPage() {
  const router = useRouter();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [userId, setUserId] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [agreeCheck, setAgreeCheck] = useState(false);
  const [isInvalidUserId, setIsInvalidUserId] = useState(false);
  const [isInvalidApplicantName, setIsInvalidApplicantName] = useState(false);
  const [isInvalidAgreeCheck, setIsInvalidAgreeCheck] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // 유효성 검사
    const invalidUserId = !userId.trim();
    const invalidApplicantName = !applicantName.trim();
    const invalidAgreeCheck = !agreeCheck;

    setIsInvalidUserId(invalidUserId);
    setIsInvalidApplicantName(invalidApplicantName);
    setIsInvalidAgreeCheck(invalidAgreeCheck);

    if (invalidUserId || invalidApplicantName || invalidAgreeCheck) {
      return;
    }

    // 탈퇴 확인 모달
    const confirmed = window.confirm(
      '정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
    );

    if (!confirmed) return;

    try {
      const response = await api.$post('/mypage/withdraw', {
        userId: userId,
        userNm: applicantName,
      });

      if (response.status === 'OK') {
        // localStorage 클리어
        localStorage.clear();
        
        alert(response.message || '회원 탈퇴가 완료되었습니다.');
        router.push('/');
      } else {
        alert(response.message || '회원 탈퇴에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원 탈퇴 실패:', error);
      alert('서버 오류로 인해 탈퇴 처리에 실패했습니다.');
    }
  };

  return (
    <MyPageLayout>
      <div className={styles.container}>
        {!isConfirmed ? (
          <PasswordCheck onConfirmed={() => setIsConfirmed(true)}>
            <h4 className={styles.title}>회원 탈퇴</h4>
          </PasswordCheck>
        ) : (
          <>
            <div className={styles.header}>
              <h4 className={styles.title}>회원 탈퇴</h4>
            </div>

            <form
              onSubmit={handleSubmit}
              className={styles.form}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
            >
              {/* 탈퇴 유의사항 */}
              <div className={styles.formGroup}>
                <label className={styles.label}>회원 탈퇴 안내</label>
                <div className={styles.inputWide}>
                  <textarea
                    className={styles.notice}
                    rows="8"
                    readOnly
                    value={`※ 회원 탈퇴 전 꼭 확인해주세요.

1. 탈퇴 시 해당 계정으로 등록된 모든 정보는 삭제되며, 복구가 불가능합니다.
2. 탈퇴 후에는 동일한 아이디로 재가입이 제한될 수 있습니다.
3. 작성하신 게시물, 댓글 등 일부 콘텐츠는 탈퇴 후에도 사이트에 남아있을 수 있습니다.
4. 유료 서비스 이용 중 탈퇴할 경우, 잔여 이용 기간에 대한 보상 또는 환불은 제공되지 않습니다.

위의 내용을 충분히 확인하신 후 탈퇴를 진행해 주세요.`}
                  />
                </div>
              </div>

              {/* 아이디 입력 */}
              <div className={styles.formGroup}>
                <label className={`${styles.label} ${styles.required}`}>
                  아이디
                </label>
                <div className={styles.inputWide}>
                  <input
                    className={styles.input}
                    type="text"
                    value={userId}
                    onChange={(e) => {
                      setUserId(e.target.value);
                      setIsInvalidUserId(false);
                    }}
                  />
                  {isInvalidUserId && (
                    <div className={styles.errorDanger}>
                      아이디를 입력해 주세요.
                    </div>
                  )}
                </div>
              </div>

              {/* 탈퇴 신청자 입력 */}
              <div className={styles.formGroup}>
                <label className={`${styles.label} ${styles.required}`}>
                  탈퇴 신청자
                </label>
                <div className={styles.inputWide}>
                  <input
                    className={styles.input}
                    type="text"
                    value={applicantName}
                    onChange={(e) => {
                      setApplicantName(e.target.value);
                      setIsInvalidApplicantName(false);
                    }}
                  />
                  {isInvalidApplicantName && (
                    <div className={styles.errorDanger}>
                      탈퇴 신청자명을 입력해 주세요.
                    </div>
                  )}
                </div>
              </div>

              {/* 체크박스 */}
              <div className={styles.checkboxGroup}>
                <div className={styles.checkboxWrapper}>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    id="agreeCheck"
                    checked={agreeCheck}
                    onChange={(e) => {
                      setAgreeCheck(e.target.checked);
                      setIsInvalidAgreeCheck(false);
                    }}
                  />
                  <label className={styles.checkboxLabel} htmlFor="agreeCheck">
                    회원 탈퇴 안내 사항을 모두 읽었으며, 이에 동의합니다.
                  </label>
                </div>
                {isInvalidAgreeCheck && (
                  <div className={`${styles.errorDanger} ${styles.checkboxError}`}>
                    안내 사항에 동의해야 탈퇴가 가능합니다.
                  </div>
                )}
              </div>

              {/* 탈퇴하기 버튼 */}
              <div className={styles.submitGroup}>
                <button type="submit" className={styles.withdrawBtn}>
                  탈퇴하기
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </MyPageLayout>
  );
}

