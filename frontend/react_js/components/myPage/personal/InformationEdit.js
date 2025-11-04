import { useState, useEffect, useRef, useCallback } from 'react';
import PasswordCheck from '../common/PasswordCheck';
import { useAlertStore } from '../../../store/alertStore';
import api from '../../../utils/api';
import { debounce } from 'lodash';
import './InformationEdit.css';

const InformationEdit = () => {
  const alertStore = useAlertStore();

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [userProfileImageUrl, setUserProfileImageUrl] = useState(null);
  const [hovering, setHovering] = useState(false);
  const profileImageInput = useRef(null);

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
  });

  // 유효성 검사 및 에러
  const [passwordError, setPasswordError] = useState('');
  const [passwordValid, setPasswordValid] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [verifycodeError, setVerifycodeError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [phoneValid, setPhoneValid] = useState(false);

  // 사용자 정보 조회
  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/mypage/edit/info', null);
      const data = response.output;
      console.log('data', data);

      const newData = {
        userId: data.userId,
        userEmail: data.userEmail,
        userPw: '',
        userNm: data.userNm,
        userBirthDt: data.userBirthDt,
        userGenderNm: data.userGenderNm,
        userPhoneNum: data.userPhoneNum,
        address: data.address,
        detailAddress: data.detailAddress || '',
        zonecode: data.zonecode,
        sigunguCode: data.sigunguCode,
        latitude: data.latitude,
        longitude: data.longitude,
      };

      setOriginalData(newData);
      setForm(newData);
      setUserProfileImageUrl(data.userProfileImageUrl);
    } catch (err) {
      console.error('정보 조회 실패', err);
    }
  };

  // 확인 후 정보 로드
  useEffect(() => {
    if (isConfirmed) {
      fetchUserInfo();
    }
  }, [isConfirmed]);

  // 프로필 이미지 변경
  const onFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/mypage/edit/profile-image/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 'OK') {
        setUserProfileImageUrl(URL.createObjectURL(file));
        alertStore.show('프로필 이미지가 업데이트되었습니다.', 'success');
      } else {
        alertStore.show('프로필 이미지 업데이트에 실패했습니다.', 'danger');
      }
    } catch (error) {
      alertStore.show('프로필 이미지 업데이트 중 오류가 발생했습니다.', 'danger');
      console.error(error);
    }
  };

  // 프로필 이미지 삭제
  const removeProfileImage = async () => {
    try {
      const response = await api.delete('/mypage/edit/profile-image');
      if (response.status === 'OK') {
        alertStore.show('프로필 이미지가 삭제되었습니다.', 'success');
        setUserProfileImageUrl(null);
      }
    } catch (error) {
      alertStore.show('프로필 이미지 삭제에 실패하였습니다.', 'danger');
      console.error(error);
    }
  };

  // 비밀번호 유효성 검사 (Core)
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
      const requestBody = {
        currentPassword: pw,
      };
      const response = await api.post(`/mypage/edit/check-password`, requestBody);
      
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

  // 디바운스 처리된 비밀번호 검사
  const validatePassword = useCallback(
    debounce((pw) => {
      validatePasswordCore(pw);
    }, 400),
    []
  );

  // 비밀번호 입력 핸들러
  const onPasswordInput = (e) => {
    const newPw = e.target.value;
    setForm((prev) => ({ ...prev, userPw: newPw }));
    validatePassword(newPw);
  };

  // 주소 검색 (Daum Postcode API)
  const openPostcode = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        let addr =
          data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;

        setForm((prev) => ({
          ...prev,
          zonecode: data.zonecode,
          address: addr,
          detailAddress: '',
          sigunguCode: data.sigunguCode,
        }));

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

  // 인증번호 유효성 검사
  const validateVerifycode = () => {
    setVerifycodeError('');
    if (!editEmail.verificationCode) {
      setVerifycodeError('인증번호를 입력하세요.');
      return false;
    }
    return true;
  };

  // 인증 요청
  const sendVerification = async () => {
    if (!validateEmail()) return;

    try {
      const email = editEmail.emailId + '@' + editEmail.emailDomain;
      const response = await api.post('/email/send-code', { email });

      console.log('인증 이메일 전송 완료', response);
      alertStore.show(
        '인증 코드를 전송했습니다. 인증 코드 : ' + response.output.code,
        'success'
      );
      setIsVerified(false);
    } catch (error) {
      console.error('이메일 인증 요청 실패:', error);
      const message =
        error.response?.data?.message || '이메일 인증 요청에 실패했습니다.';
      alertStore.show(message, 'danger');
    }
  };

  // 인증번호 확인
  const verifyCode = async () => {
    if (!validateVerifycode()) return;

    try {
      const email = editEmail.emailId + '@' + editEmail.emailDomain;
      const response = await api.post('/email/verify-code', {
        email,
        code: editEmail.verificationCode,
      });
      console.log('인증 성공', response);
      alertStore.show('이메일 인증에 성공하였습니다.', 'info');
      setIsVerified(true);
    } catch (error) {
      console.error('인증 코드 검증 실패:', error);
      setVerifycodeError('인증번호가 일치하지 않습니다.');
      alertStore.show('이메일 인증에 실패하였습니다.', 'danger');
      setIsVerified(false);
    }
  };

  // 전화번호 포맷팅
  const formatPhoneNumber = (number) => {
    const clean = number.replace(/\D/g, '');
    if (clean.length === 11) {
      return clean.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (clean.length === 10) {
      return clean.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
    } else {
      return number;
    }
  };

  // 휴대폰 번호 유효성 검사
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

  // 편집 모드 토글
  const toggleEdit = (field) => {
    setEditing((prev) => ({ ...prev, [field]: true }));
  };

  // 필드 저장
  const saveField = (field) => {
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
    console.log('form', form);
  };

  // 편집 취소
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
      setEditEmail({
        emailId: '',
        emailDomain: '',
        verificationCode: '',
      });
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
    });
  };

  // 폼 변경 여부 확인
  const isFormChanged = () => {
    return (
      form.userPw !== '' ||
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
      alertStore.show('수정 중인 항목을 먼저 저장하거나 취소해주세요.', 'danger');
      return;
    }
    if (!isFormChanged()) {
      alertStore.show('변경된 정보가 없습니다.', 'danger');
      return;
    }

    const requestBody = {
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
    };

    try {
      const response = await api.post('/mypage/edit/update', requestBody);

      if (response.status === 'OK') {
        alertStore.show(
          response.message || '회원 정보가 성공적으로 수정되었습니다.',
          'success'
        );
        await fetchUserInfo();
        resetForm();
      } else {
        alertStore.show(
          response.message || '회원 정보 수정에 실패하였습니다.',
          'danger'
        );
      }
    } catch (err) {
      const status = err.response?.status;
      let errorMessage = '회원 정보 수정에 실패하였습니다.';

      if (status === 400) {
        errorMessage = err.response?.data?.message || '입력값을 확인해주세요.';
      } else if (status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }

      alertStore.show(errorMessage, 'danger');
    }
  };

  // Enter 키 방지
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <section>
      {!isConfirmed ? (
        <PasswordCheck onConfirmed={() => setIsConfirmed(true)}>
          <h4 className="mb-3" style={{ fontSize: '24px' }}>
            회원 정보 수정
          </h4>
        </PasswordCheck>
      ) : (
        <div>
          <div className="overflow-hidden mb-3">
            <h4 className="mb-3" style={{ fontSize: '24px' }}>
              회원 정보 수정
            </h4>
          </div>

          {/* 프로필 이미지 */}
          <div className="text-center mb-4">
            <div
              className="position-relative d-inline-block"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              {/* 프로필 이미지 영역 */}
              <div
                className="rounded-circle overflow-hidden"
                style={{ width: '100px', height: '100px' }}
              >
                {userProfileImageUrl ? (
                  <img
                    src={userProfileImageUrl}
                    alt="Profile Image"
                    className="img-fluid w-100 h-100 object-fit-cover"
                  />
                ) : (
                  <div className="rounded-circle">
                    <i className="fas fa-user text-muted fa-2x"></i>
                  </div>
                )}
              </div>

              {/* X 버튼 (hover 시에만 표시) */}
              {userProfileImageUrl && hovering && (
                <button
                  className="position-absolute"
                  style={{ top: 0, right: 0, zIndex: 10 }}
                  onClick={removeProfileImage}
                >
                  &times;
                </button>
              )}

              {/* 사진 변경 버튼 */}
              <label
                htmlFor="profileImage"
                className="btn btn-light btn-sm position-absolute add"
              >
                <i className="fas fa-camera text-muted"></i>
                <input
                  ref={profileImageInput}
                  type="file"
                  id="profileImage"
                  className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                  title="사진 변경"
                  onChange={onFileChange}
                  accept="image/*"
                />
              </label>
            </div>
          </div>

          <form
            role="form"
            className="needs-validation"
            noValidate
            onSubmit={saveAll}
            onKeyDown={handleKeyDown}
          >
            {/* 아이디 (변경 불가) */}
            <div className="form-group row align-items-center">
              <label className="col-lg-2 col-form-label text-2">아이디</label>
              <div className="col-lg-10">
                <input
                  className="form-control text-3 h-auto py-2 border-0"
                  type="text"
                  name="username"
                  value={form.userId}
                  readOnly
                />
              </div>
            </div>

            {/* 비밀번호 + 수정 버튼 */}
            <div className="form-group row align-items-center">
              <label className="col-lg-2 col-form-label text-2">비밀번호</label>
              <div className="col-lg-7">
                {!editing.userPw ? (
                  <input
                    className="form-control text-3 h-auto py-2"
                    type="password"
                    name="password"
                    readOnly
                    value="********"
                  />
                ) : (
                  <>
                    <input
                      className="form-control text-3 h-auto py-2"
                      type="password"
                      name="password"
                      value={form.userPw}
                      onChange={onPasswordInput}
                    />
                    {passwordError && (
                      <div className="invalid-feedback d-block">
                        {passwordError}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="col-lg-3 text-end">
                {!editing.userPw ? (
                  <button
                    type="button"
                    className="btn btn-light btn-outline"
                    onClick={() => toggleEdit('userPw')}
                  >
                    수정
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary btn-outline me-2"
                      onClick={() => saveField('userPw')}
                      disabled={!passwordValid}
                    >
                      확인
                    </button>
                    <button
                      type="button"
                      className="btn btn-light btn-outline"
                      onClick={() => cancelEdit('userPw')}
                    >
                      취소
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 이름 (변경 불가) */}
            <div className="form-group row align-items-center">
              <label className="col-lg-2 col-form-label text-2">이름</label>
              <div className="col-lg-10">
                <input
                  className="form-control text-3 h-auto py-2 border-0"
                  type="text"
                  name="name"
                  value={form.userNm}
                  readOnly
                />
              </div>
            </div>

            {/* 생년월일 (변경 불가) */}
            <div className="form-group row align-items-center">
              <label className="col-lg-2 col-form-label text-2">생년월일</label>
              <div className="col-lg-7">
                <input
                  className="form-control text-3 h-auto py-2 border-0"
                  type="date"
                  name="dob"
                  readOnly
                  value={form.userBirthDt}
                />
              </div>
            </div>

            {/* 성별 */}
            <div className="form-group row align-items-center">
              <label className="col-lg-2 col-form-label text-2">성별</label>
              <div className="col-lg-7">
                <input
                  className="form-control text-3 h-auto py-2 border-0"
                  name="gender"
                  value={form.userGenderNm}
                  readOnly
                />
              </div>
            </div>

            {/* 이메일 + 수정 버튼 */}
            <div className="form-group row align-items-center">
              <label className="col-lg-2 col-form-label text-2">이메일</label>

              {/* 수정 모드 아닐 때 */}
              {!editing.userEmail ? (
                <div className="col-lg-7">
                  <input
                    className="form-control text-3 h-auto py-2 border-0"
                    type="email"
                    name="email"
                    readOnly
                    value={form.userEmail}
                  />
                </div>
              ) : (
                <div className="col-lg-7">
                  <div className="input-group">
                    <input
                      type="text"
                      value={editEmail.emailId}
                      onChange={(e) =>
                        setEditEmail((prev) => ({ ...prev, emailId: e.target.value }))
                      }
                      className="form-control"
                      placeholder="이메일 아이디"
                    />
                    <span className="input-group-text">@</span>
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
                      className="form-control"
                      placeholder="도메인 입력 또는 선택"
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
                      className="btn btn-primary"
                      onClick={sendVerification}
                    >
                      인증 요청
                    </button>
                  </div>
                  {emailError && (
                    <div className="invalid-feedback d-block">{emailError}</div>
                  )}
                </div>
              )}

              {/* 오른쪽 버튼 영역 */}
              <div className="col-lg-3 text-end">
                {!editing.userEmail ? (
                  <button
                    type="button"
                    className="btn btn-light btn-outline"
                    onClick={() => toggleEdit('userEmail')}
                  >
                    수정
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary btn-outline me-2"
                      onClick={() => saveField('userEmail')}
                      disabled={!isVerified}
                    >
                      확인
                    </button>
                    <button
                      type="button"
                      className="btn btn-light btn-outline"
                      onClick={() => cancelEdit('userEmail')}
                    >
                      취소
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 인증번호 입력 영역 */}
            {editing.userEmail && (
              <div className="row mt-2">
                <div className="col-lg-5"></div>
                <div className="form-group col-lg-4">
                  <div className="input-group text-end">
                    <label className="form-label d-flex align-items-center">
                      {isVerified && (
                        <i
                          className="bi bi-check-circle-fill me-1"
                          style={{ color: '#007bff' }}
                        ></i>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editEmail.verificationCode}
                      onChange={(e) =>
                        setEditEmail((prev) => ({
                          ...prev,
                          verificationCode: e.target.value,
                        }))
                      }
                      className="form-control"
                      placeholder="인증번호 입력"
                    />
                    {verifycodeError && (
                      <div className="invalid-feedback d-block">
                        {verifycodeError}
                      </div>
                    )}
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={verifyCode}
                    >
                      확인
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 휴대폰번호 + 수정 버튼 */}
            <div className="form-group row align-items-center">
              <label className="col-lg-2 col-form-label text-2">휴대폰번호</label>
              <div className="col-lg-7">
                {!editing.userPhoneNum ? (
                  <input
                    className="form-control text-3 h-auto py-2"
                    type="text"
                    name="phone"
                    readOnly
                    value={formatPhoneNumber(form.userPhoneNum)}
                  />
                ) : (
                  <>
                    <input
                      className="form-control text-3 h-auto py-2"
                      type="text"
                      name="phone"
                      value={form.userPhoneNum}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, userPhoneNum: e.target.value }));
                        validatePhone();
                      }}
                    />
                    {phoneError && (
                      <div className="invalid-feedback">{phoneError}</div>
                    )}
                  </>
                )}
              </div>
              <div className="col-lg-3 text-end">
                {!editing.userPhoneNum ? (
                  <button
                    type="button"
                    className="btn btn-light btn-outline"
                    onClick={() => toggleEdit('userPhoneNum')}
                  >
                    수정
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary btn-outline me-2"
                      onClick={() => saveField('userPhoneNum')}
                    >
                      확인
                    </button>
                    <button
                      type="button"
                      className="btn btn-light btn-outline"
                      onClick={() => cancelEdit('userPhoneNum')}
                    >
                      취소
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 주소 + 수정 버튼 */}
            <div className="form-group row align-items-center">
              <label className="col-lg-2 col-form-label text-2">주소</label>

              <div className="col-lg-7">
                {!editing.address ? (
                  <input
                    className="form-control text-3 h-auto py-2"
                    type="text"
                    value={form.address + ' ' + form.detailAddress}
                    readOnly
                  />
                ) : (
                  <div className="row">
                    <div className="col-8 pe-1">
                      <input
                        className="form-control text-3 h-auto py-2"
                        type="text"
                        name="address"
                        value={form.address}
                        onClick={openPostcode}
                        placeholder="주소 검색 클릭"
                        readOnly
                      />
                    </div>
                    <div className="col-4 ps-1">
                      <input
                        className="form-control text-3 h-auto py-2"
                        type="text"
                        name="detailAddress"
                        value={form.detailAddress}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            detailAddress: e.target.value,
                          }))
                        }
                        placeholder="상세주소 입력"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="col-lg-3 text-end">
                {!editing.address ? (
                  <button
                    type="button"
                    className="btn btn-light btn-outline"
                    onClick={() => toggleEdit('address')}
                  >
                    수정
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary btn-outline d-inline-block me-2"
                      onClick={() => saveField('address')}
                    >
                      확인
                    </button>
                    <button
                      type="button"
                      className="btn btn-light btn-outline d-inline-block"
                      onClick={() => cancelEdit('address')}
                    >
                      취소
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="form-group row mt-4">
              <div className="col-lg-12 text-center">
                <button
                  type="submit"
                  className="btn btn-primary btn-modern d-inline-block me-2"
                >
                  저장
                </button>
                <button
                  type="button"
                  className="btn btn-light btn-modern d-inline-block"
                  onClick={resetForm}
                >
                  초기화
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default InformationEdit;

