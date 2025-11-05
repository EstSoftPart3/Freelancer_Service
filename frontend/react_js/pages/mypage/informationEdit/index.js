import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/axios';
import _ from 'lodash';
import MyPageLayout from '../MyPageLayout';
import PasswordCheck from '@/components/myPage/common/PasswordCheck';
import styles from './InformationEdit.module.css';

export default function InformationEditPage() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [userProfileImageUrl, setUserProfileImageUrl] = useState(null);
  const [hovering, setHovering] = useState(false);
  const profileImageInputRef = useRef(null);

  // 원본 데이터
  const [originalData, setOriginalData] = useState({
    userId: '',
    userPw: '',
    userEmail: '',
    userNm: '',
    userBirthDt: '',
    userGenderNm: '',
    userPhoneNum: '',
    address: '',
    detailAddress: '',
    zonecode: '',
    sigunguCode: '',
    latitude: null,
    longitude: null,
    companyNm: '', // Company용
  });

  // 폼 데이터
  const [form, setForm] = useState({ ...originalData });

  // 이메일 편집용
  const [editEmail, setEditEmail] = useState({
    emailId: '',
    emailDomain: '',
    verificationCode: '',
  });

  // 편집 상태
  const [editing, setEditing] = useState({
    userPw: false,
    userEmail: false,
    userPhoneNum: false,
    address: false,
    userNm: false, // Company용
  });

  // 유효성 검사 상태
  const [passwordError, setPasswordError] = useState('');
  const [passwordValid, setPasswordValid] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [verifycodeError, setVerifycodeError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [phoneValid, setPhoneValid] = useState(false);
  const [nameError, setNameError] = useState('');
  const [nameValid, setNameValid] = useState(false);

  // 비밀번호 확인 후 데이터 로드
  useEffect(() => {
    if (isConfirmed) {
      fetchUserInfo();
    }
  }, [isConfirmed]);

  // 사용자 정보 조회
  const fetchUserInfo = async () => {
    try {
      const response = await api.$get('/mypage/edit/info', null);
      const data = response.output;

      const newData = {
        userId: data.userId,
        userEmail: data.userEmail,
        userPw: '',
        userNm: data.userNm,
        userBirthDt: data.userBirthDt || '',
        userGenderNm: data.userGenderNm || '',
        userPhoneNum: data.userPhoneNum,
        address: data.address,
        detailAddress: data.detailAddress || '',
        zonecode: data.zonecode,
        sigunguCode: data.sigunguCode,
        latitude: data.latitude,
        longitude: data.longitude,
        companyNm: data.companyNm || '',
      };

      setOriginalData(newData);
      setForm(newData);
      setUserProfileImageUrl(data.userProfileImageUrl);
    } catch (err) {
      console.error('정보 조회 실패', err);
      alert('회원 정보를 불러오는데 실패했습니다.');
    }
  };

  // 프로필 이미지 업로드
  const onFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.$post(
        '/mypage/edit/profile-image/update',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 'OK') {
        setUserProfileImageUrl(URL.createObjectURL(file));
        alert('프로필 이미지가 업데이트되었습니다.');
      } else {
        alert('프로필 이미지 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error(error);
      alert('프로필 이미지 업데이트 중 오류가 발생했습니다.');
    }
  };

  // 프로필 이미지 삭제
  const removeProfileImage = async () => {
    try {
      const response = await api.$delete('/mypage/edit/profile-image');
      if (response.status === 'OK') {
        alert('프로필 이미지가 삭제되었습니다.');
        setUserProfileImageUrl(null);
      }
    } catch (error) {
      console.error(error);
      alert('프로필 이미지 삭제에 실패하였습니다.');
    }
  };

  // 비밀번호 유효성 검사
  const validatePasswordCore = async (pw) => {
    setPasswordError('');
    setPasswordValid(false);

    if (!pw) {
      setPasswordError('비밀번호를 입력해주세요.');
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(pw)) {
      setPasswordError('8자 이상, 영문·숫자·특수문자를 조합해 입력해주세요.');
      return;
    }

    try {
      const response = await api.$post('/mypage/edit/check-password', {
        currentPassword: pw,
      });

      if (response.status === 'OK' && response.output === true) {
        setPasswordError('기존 비밀번호와 동일합니다.');
      } else {
        setPasswordValid(true);
        setPasswordError('사용 가능한 비밀번호입니다.');
      }
    } catch (e) {
      setPasswordError('서버 오류가 발생했습니다.');
    }
  };

  // 비밀번호 디바운스
  const validatePassword = _.debounce((pw) => {
    validatePasswordCore(pw);
  }, 400);

  // 비밀번호 입력 핸들러
  const onPasswordInput = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, userPw: value }));
    validatePassword(value);
  };

  // 전화번호 포맷팅
  const formatPhoneNumber = (number) => {
    if (!number) return '';
    const clean = number.replace(/\D/g, '');
    if (clean.length === 11) {
      return clean.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (clean.length === 10) {
      return clean.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
    } else {
      return number;
    }
  };

  // 전화번호 유효성 검사
  const validatePhone = () => {
    setPhoneError('');
    setPhoneValid(false);
    if (!form.userPhoneNum) {
      setPhoneError('휴대폰 번호를 입력해주세요.');
    } else if (!/^\d{10,11}$/.test(form.userPhoneNum)) {
      setPhoneError('올바른 휴대폰 번호 형식이 아닙니다. (하이픈 제외)');
    } else {
      setPhoneError('');
      setPhoneValid(true);
    }
  };

  // 이름 유효성 검사 (Company만)
  const validateName = () => {
    setNameError('');
    setNameValid(false);
    if (!form.userNm) {
      setNameError('이름을 입력해주세요.');
    } else if (form.userNm.length < 2) {
      setNameError('이름은 두 글자 이상 입력해주세요.');
    } else {
      setNameValid(true);
    }
  };

  // 주소 검색 (Daum Postcode API)
  const openPostcode = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('주소 검색 라이브러리를 로드할 수 없습니다.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data) {
        const addr =
          data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;

        setForm((prev) => ({
          ...prev,
          zonecode: data.zonecode,
          address: addr,
          detailAddress: '',
          sigunguCode: data.sigunguCode,
        }));

        // Kakao Maps API로 좌표 변환
        if (window.kakao && window.kakao.maps) {
          const geocoder = new window.kakao.maps.services.Geocoder();
          geocoder.addressSearch(addr, function (result, status) {
            if (status === window.kakao.maps.services.Status.OK) {
              setForm((prev) => ({
                ...prev,
                latitude: result[0].y,
                longitude: result[0].x,
              }));
            } else {
              setForm((prev) => ({
                ...prev,
                latitude: null,
                longitude: null,
              }));
            }
          });
        }
      },
    }).open();
  };

  // 이메일 유효성 검사
  const validateEmail = () => {
    setEmailError('');
    const email = editEmail.emailId + '@' + editEmail.emailDomain;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editEmail.emailId || !editEmail.emailDomain) {
      setEmailError('이메일을 모두 입력하세요.');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('유효한 이메일 형식이 아닙니다.');
      return false;
    }
    return true;
  };

  // 인증 요청
  const sendVerification = async () => {
    if (!validateEmail()) return;

    try {
      const email = editEmail.emailId + '@' + editEmail.emailDomain;
      const response = await api.$post('/email/send-code', { email });

      console.log('인증 이메일 전송 완료', response);
      alert('인증 코드를 전송했습니다. 인증 코드 : ' + response.output.code);
      setIsVerified(false);
    } catch (error) {
      console.error('이메일 인증 요청 실패:', error);
      const message =
        error.response?.data?.message || '이메일 인증 요청에 실패했습니다.';
      alert(message);
    }
  };

  // 인증번호 확인
  const verifyCode = async () => {
    if (!editEmail.verificationCode) {
      setVerifycodeError('인증번호를 입력하세요.');
      return;
    }

    try {
      const email = editEmail.emailId + '@' + editEmail.emailDomain;
      const response = await api.$post('/email/verify-code', {
        email,
        code: editEmail.verificationCode,
      });

      console.log('인증 성공', response);
      alert('이메일 인증에 성공하였습니다.');
      setIsVerified(true);
      setVerifycodeError('');
    } catch (error) {
      console.error('인증 코드 검증 실패:', error);
      setVerifycodeError('인증번호가 일치하지 않습니다.');
      alert('이메일 인증에 실패하였습니다.');
      setIsVerified(false);
    }
  };

  // 편집 모드 토글
  const toggleEdit = (field) => {
    setEditing((prev) => ({ ...prev, [field]: true }));
  };

  // 필드 저장
  const saveField = (field) => {
    if (field === 'userNm' && !nameValid) return;
    if (field === 'userPw' && !passwordValid) return;
    if (field === 'userEmail' && !isVerified) return;
    if (field === 'userPhoneNum' && !phoneValid) return;

    if (field === 'userEmail') {
      setForm((prev) => ({
        ...prev,
        userEmail: `${editEmail.emailId}@${editEmail.emailDomain}`,
      }));
    }

    setEditing((prev) => ({ ...prev, [field]: false }));
  };

  // 필드 취소
  const cancelEdit = (field) => {
    setEditing((prev) => ({ ...prev, [field]: false }));

    if (field === 'address') {
      setForm((prev) => ({
        ...prev,
        address: originalData.address,
        detailAddress: originalData.detailAddress,
        zonecode: originalData.zonecode,
        sigunguCode: originalData.sigunguCode,
        latitude: originalData.latitude,
        longitude: originalData.longitude,
      }));
    } else if (field === 'userEmail') {
      setForm((prev) => ({ ...prev, userEmail: originalData.userEmail }));
      setEditEmail({ emailId: '', emailDomain: '', verificationCode: '' });
    } else if (field === 'userNm') {
      setForm((prev) => ({ ...prev, userNm: originalData.userNm }));
    } else {
      setForm((prev) => ({ ...prev, [field]: originalData[field] }));
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setForm({ ...originalData });
    setEditing({
      userPw: false,
      userEmail: false,
      userPhoneNum: false,
      address: false,
      userNm: false,
    });
  };

  // 폼 변경 여부 확인
  const isFormChanged = () => {
    return (
      form.userPw !== '' ||
      form.userNm !== originalData.userNm ||
      form.userEmail !== originalData.userEmail ||
      form.userPhoneNum !== originalData.userPhoneNum ||
      form.zonecode !== originalData.zonecode ||
      form.address !== originalData.address ||
      form.detailAddress !== originalData.detailAddress ||
      form.sigunguCode !== originalData.sigunguCode ||
      form.latitude !== originalData.latitude ||
      form.longitude !== originalData.longitude
    );
  };

  // 전체 저장
  const saveAll = async (e) => {
    e.preventDefault();

    const isAnyEditing = Object.values(editing).some((v) => v === true);
    if (isAnyEditing) {
      alert('수정 중인 항목을 먼저 저장하거나 취소해주세요.');
      return;
    }

    if (!isFormChanged()) {
      alert('변경된 정보가 없습니다.');
      return;
    }

    const requestBody =
      userType === 'PERSONAL'
        ? {
            personal: {
              userPw: form.userPw || undefined,
              userEmail: form.userEmail,
              userPhoneNum: form.userPhoneNum,
              zonecode: form.zonecode,
              address: form.address,
              detailAddress: form.detailAddress,
              sigunguCode: form.sigunguCode,
              latitude: form.latitude,
              longitude: form.longitude,
            },
          }
        : {
            company: {
              userNm: form.userNm,
              userPw: form.userPw || undefined,
              userEmail: form.userEmail,
              userPhoneNum: form.userPhoneNum,
              zonecode: form.zonecode,
              address: form.address,
              detailAddress: form.detailAddress,
              sigunguCode: form.sigunguCode,
              latitude: form.latitude,
              longitude: form.longitude,
            },
          };

    try {
      const response = await api.$post('/mypage/edit/update', requestBody);

      if (response.status === 'OK') {
        alert(response.message || '회원 정보가 성공적으로 수정되었습니다.');
        await fetchUserInfo();
        resetForm();
      } else {
        alert(response.message || '회원 정보 수정에 실패하였습니다.');
      }
    } catch (err) {
      const status = err.response?.status;
      let errorMessage = '회원 정보 수정에 실패하였습니다.';

      if (status === 400) {
        errorMessage = err.response?.data?.message || '입력값을 확인해주세요.';
      } else if (status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }

      alert(errorMessage);
    }
  };

  // 폼 입력 핸들러
  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // 필드별 유효성 검사
    if (field === 'userPhoneNum') {
      setTimeout(validatePhone, 0);
    } else if (field === 'userNm') {
      setTimeout(validateName, 0);
    }
  };

  return (
    <MyPageLayout>
      <div className={styles.container}>
        {!isConfirmed ? (
          <PasswordCheck onConfirmed={() => setIsConfirmed(true)}>
            <h4 className={styles.title}>회원 정보 수정</h4>
          </PasswordCheck>
        ) : (
          <>
            <div className={styles.header}>
              <h4 className={styles.title}>회원 정보 수정</h4>
            </div>

            {/* 프로필 이미지 */}
            <div className={styles.profileSection}>
              <div
                className={styles.profileWrapper}
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
              >
                <div className={styles.profileImage}>
                  {userProfileImageUrl ? (
                    <img
                      src={userProfileImageUrl}
                      alt="Profile"
                      className={styles.profileImg}
                    />
                  ) : (
                    <div className={styles.profileIcon}>
                      <i
                        className={`fas ${
                          userType === 'COMPANY' ? 'fa-building' : 'fa-user'
                        } text-muted`}
                      ></i>
                    </div>
                  )}
                </div>

                {userProfileImageUrl && hovering && (
                  <button
                    className={styles.deleteButton}
                    onClick={removeProfileImage}
                  >
                    &times;
                  </button>
                )}

                <label htmlFor="profileImage" className={styles.addButton}>
                  <i className="fas fa-camera text-muted"></i>
                  <input
                    ref={profileImageInputRef}
                    type="file"
                    id="profileImage"
                    className={styles.fileInput}
                    onChange={onFileChange}
                    accept="image/*"
                  />
                </label>
              </div>
            </div>

            <form
              onSubmit={saveAll}
              className={styles.form}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
            >
              {/* 아이디 (변경 불가) */}
              <div className={styles.formGroup}>
                <label className={styles.label}>아이디</label>
                <div className={styles.inputWide}>
                  <input
                    className={`${styles.input} ${styles.readonly}`}
                    type="text"
                    value={form.userId}
                    readOnly
                  />
                </div>
              </div>

              {/* 비밀번호 */}
              <div className={styles.formGroup}>
                <label className={styles.label}>비밀번호</label>
                <div className={styles.inputNormal}>
                  {!editing.userPw ? (
                    <input
                      className={styles.input}
                      type="password"
                      value="********"
                      readOnly
                    />
                  ) : (
                    <>
                      <input
                        className={styles.input}
                        type="password"
                        value={form.userPw}
                        onChange={onPasswordInput}
                      />
                      {passwordError && (
                        <div className={styles.error}>{passwordError}</div>
                      )}
                    </>
                  )}
                </div>
                <div className={styles.buttonGroup}>
                  {!editing.userPw ? (
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => toggleEdit('userPw')}
                    >
                      수정
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.confirmBtn}
                        onClick={() => saveField('userPw')}
                        disabled={!passwordValid}
                      >
                        확인
                      </button>
                      <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={() => cancelEdit('userPw')}
                      >
                        취소
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Company: 담당자 이름 / Personal: 이름 (변경 불가) */}
              <div className={styles.formGroup}>
                <label className={styles.label}>이름</label>
                <div className={userType === 'COMPANY' ? styles.inputNormal : styles.inputWide}>
                  {userType === 'PERSONAL' || !editing.userNm ? (
                    <input
                      className={`${styles.input} ${userType === 'PERSONAL' ? styles.readonly : ''}`}
                      type="text"
                      value={form.userNm}
                      readOnly={userType === 'PERSONAL'}
                    />
                  ) : (
                    <>
                      <input
                        className={styles.input}
                        type="text"
                        value={form.userNm}
                        onChange={(e) => handleInputChange('userNm', e.target.value)}
                        placeholder="이름"
                      />
                      {nameError && <div className={styles.error}>{nameError}</div>}
                    </>
                  )}
                </div>
                {userType === 'COMPANY' && (
                  <div className={styles.buttonGroup}>
                    {!editing.userNm ? (
                      <button
                        type="button"
                        className={styles.editBtn}
                        onClick={() => toggleEdit('userNm')}
                      >
                        수정
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={styles.confirmBtn}
                          onClick={() => saveField('userNm')}
                          disabled={!nameValid}
                        >
                          확인
                        </button>
                        <button
                          type="button"
                          className={styles.cancelBtn}
                          onClick={() => cancelEdit('userNm')}
                        >
                          취소
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Personal: 생년월일 + 성별 */}
              {userType === 'PERSONAL' && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>생년월일</label>
                    <div className={styles.inputNormal}>
                      <input
                        className={`${styles.input} ${styles.readonly}`}
                        type="date"
                        value={form.userBirthDt}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>성별</label>
                    <div className={styles.inputNormal}>
                      <input
                        className={`${styles.input} ${styles.readonly}`}
                        type="text"
                        value={form.userGenderNm}
                        readOnly
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Company: 기업명 (변경 불가) */}
              {userType === 'COMPANY' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>기업명</label>
                  <div className={styles.inputWide}>
                    <input
                      className={`${styles.input} ${styles.readonly}`}
                      type="text"
                      value={form.companyNm}
                      readOnly
                    />
                  </div>
                </div>
              )}

              {/* 이메일 */}
              <div className={styles.formGroup}>
                <label className={styles.label}>이메일</label>
                <div className={styles.inputNormal}>
                  {!editing.userEmail ? (
                    <input
                      className={`${styles.input} ${styles.readonly}`}
                      type="email"
                      value={form.userEmail}
                      readOnly
                    />
                  ) : (
                    <>
                      <div className={styles.emailGroup}>
                        <input
                          type="text"
                          value={editEmail.emailId}
                          onChange={(e) =>
                            setEditEmail((prev) => ({ ...prev, emailId: e.target.value }))
                          }
                          className={styles.emailInput}
                          placeholder="이메일 아이디"
                        />
                        <span className={styles.emailAt}>@</span>
                        <input
                          type="text"
                          value={editEmail.emailDomain}
                          onChange={(e) =>
                            setEditEmail((prev) => ({
                              ...prev,
                              emailDomain: e.target.value,
                            }))
                          }
                          list="domain-list"
                          className={styles.emailInput}
                          placeholder="도메인"
                        />
                        <datalist id="domain-list">
                          <option value="naver.com"></option>
                          <option value="gmail.com"></option>
                          <option value="daum.net"></option>
                          <option value="nate.com"></option>
                          <option value="hotmail.com"></option>
                        </datalist>
                        <button
                          type="button"
                          className={styles.verifyBtn}
                          onClick={sendVerification}
                        >
                          인증 요청
                        </button>
                      </div>
                      {emailError && <div className={styles.error}>{emailError}</div>}
                    </>
                  )}
                </div>
                <div className={styles.buttonGroup}>
                  {!editing.userEmail ? (
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => toggleEdit('userEmail')}
                    >
                      수정
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.confirmBtn}
                        onClick={() => saveField('userEmail')}
                        disabled={!isVerified}
                      >
                        확인
                      </button>
                      <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={() => cancelEdit('userEmail')}
                      >
                        취소
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 인증번호 입력 (이메일 편집 중일 때만) */}
              {editing.userEmail && (
                <div className={styles.verificationRow}>
                  <div className={styles.labelSpace}></div>
                  <div className={styles.verificationInput}>
                    <div className={styles.verificationGroup}>
                      {isVerified && (
                        <i
                          className="bi bi-check-circle-fill"
                          style={{ color: '#007bff', marginRight: '0.5rem' }}
                        ></i>
                      )}
                      <input
                        type="text"
                        value={editEmail.verificationCode}
                        onChange={(e) =>
                          setEditEmail((prev) => ({
                            ...prev,
                            verificationCode: e.target.value,
                          }))
                        }
                        className={styles.input}
                        placeholder="인증번호 입력"
                      />
                      <button
                        type="button"
                        className={styles.verifyBtn}
                        onClick={verifyCode}
                      >
                        확인
                      </button>
                    </div>
                    {verifycodeError && (
                      <div className={styles.error}>{verifycodeError}</div>
                    )}
                  </div>
                </div>
              )}

              {/* 휴대폰번호 */}
              <div className={styles.formGroup}>
                <label className={styles.label}>휴대폰번호</label>
                <div className={styles.inputNormal}>
                  {!editing.userPhoneNum ? (
                    <input
                      className={styles.input}
                      type="text"
                      value={formatPhoneNumber(form.userPhoneNum)}
                      readOnly
                    />
                  ) : (
                    <>
                      <input
                        className={styles.input}
                        type="text"
                        value={form.userPhoneNum}
                        onChange={(e) =>
                          handleInputChange('userPhoneNum', e.target.value)
                        }
                      />
                      {phoneError && <div className={styles.error}>{phoneError}</div>}
                    </>
                  )}
                </div>
                <div className={styles.buttonGroup}>
                  {!editing.userPhoneNum ? (
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => toggleEdit('userPhoneNum')}
                    >
                      수정
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.confirmBtn}
                        onClick={() => saveField('userPhoneNum')}
                      >
                        확인
                      </button>
                      <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={() => cancelEdit('userPhoneNum')}
                      >
                        취소
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 주소 */}
              <div className={styles.formGroup}>
                <label className={styles.label}>주소</label>
                <div className={styles.inputNormal}>
                  {!editing.address ? (
                    <input
                      className={styles.input}
                      type="text"
                      value={form.address + ' ' + form.detailAddress}
                      readOnly
                    />
                  ) : (
                    <div className={styles.addressGroup}>
                      <div className={styles.addressMain}>
                        <input
                          className={styles.input}
                          type="text"
                          value={form.address}
                          onClick={openPostcode}
                          placeholder="주소 검색 클릭"
                          readOnly
                        />
                      </div>
                      <div className={styles.addressDetail}>
                        <input
                          className={styles.input}
                          type="text"
                          value={form.detailAddress}
                          onChange={(e) =>
                            handleInputChange('detailAddress', e.target.value)
                          }
                          placeholder="상세주소"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.buttonGroup}>
                  {!editing.address ? (
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => toggleEdit('address')}
                    >
                      수정
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.confirmBtn}
                        onClick={() => saveField('address')}
                      >
                        확인
                      </button>
                      <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={() => cancelEdit('address')}
                      >
                        취소
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 하단 버튼 */}
              <div className={styles.submitGroup}>
                <button type="submit" className={styles.saveBtn}>
                  저장
                </button>
                <button
                  type="button"
                  className={styles.resetBtn}
                  onClick={resetForm}
                >
                  초기화
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </MyPageLayout>
  );
}

