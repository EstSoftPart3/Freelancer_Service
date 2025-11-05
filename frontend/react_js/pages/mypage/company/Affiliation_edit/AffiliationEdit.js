import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/axios';
import _ from 'lodash';
import MyPageLayout from '../../MyPageLayout';
import './AffiliationEdit.module.css';

const AffiliationEdit = () => {
  // Refs
  const profileImageInputRef = useRef(null);

  // State 관리
  const [companyProfileImageUrl, setCompanyProfileImageUrl] = useState(null);
  const [hovering, setHovering] = useState(false);
  const [error, setError] = useState(null);

  // 원본 데이터
  const [originalData, setOriginalData] = useState({
    companyIsRecruitingYn: '',
    companyCeoNm: '',
    companyNm: '',
    companyOpenDt: '',
    companyUrl: '',
    userPhoneNum: '',
    address: '',
    detailAddress: '',
    zonecode: '',
    sigunguCode: '',
    latitude: null,
    longitude: null,
    companyGreetingTxt: '',
  });

  const [originalTagNm, setOriginalTagNm] = useState([]);
  const [editTagNm, setEditTagNm] = useState([]);

  // 폼 데이터
  const [form, setForm] = useState({ ...originalData });

  // 편집 상태
  const [editing, setEditing] = useState({
    userPhoneNum: false,
    address: false,
    companyUrl: false,
    companyGreetingTxt: false,
    tagNm: false,
  });

  // 유효성 검사 상태
  const [urlError, setUrlError] = useState('');
  const [urlValid, setUrlValid] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [phoneValid, setPhoneValid] = useState(false);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchAffiliationInfo();
  }, []);

  // 소속 정보 조회
  const fetchAffiliationInfo = async () => {
    try {
      const response = await api.$get('/mypage/edit/affiliation/info');
      const data = response.output;
      console.log('data', data);

      const newData = {
        companyIsRecruitingYn: data.companyIsRecruitingYn,
        companyCeoNm: data.companyCeoNm,
        companyNm: data.companyNm,
        companyOpenDt: data.companyOpenDt,
        companyUrl: data.companyUrl,
        userPhoneNum: data.userPhoneNum,
        address: data.address,
        detailAddress: data.detailAddress || '',
        zonecode: data.zonecode,
        sigunguCode: data.sigunguCode,
        latitude: data.latitude,
        longitude: data.longitude,
        companyGreetingTxt: data.companyGreetingTxt,
      };

      setOriginalData(newData);
      setForm(newData);
      setCompanyProfileImageUrl(data.companyProfileImageUrl);
      setOriginalTagNm([...data.tagNm]);
      setEditTagNm(_.cloneDeep(data.tagNm));
    } catch (err) {
      console.error('정보 조회 실패', err);
      setError(err.message);
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
        '/mypage/edit/affiliation/profile-image/update',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 'OK') {
        setCompanyProfileImageUrl(URL.createObjectURL(file));
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
      const response = await api.$delete(
        '/mypage/edit/affiliation/profile-image'
      );
      if (response.status === 'OK') {
        alert('프로필 이미지가 삭제되었습니다.');
        setCompanyProfileImageUrl(null);
      }
    } catch (error) {
      console.error(error);
      alert('프로필 이미지 삭제에 실패하였습니다.');
    }
  };

  // 모집 여부 체크박스 변경
  const onCheckboxChange = async (event) => {
    const isChecked = event.target.checked;
    const newValue = isChecked ? 'Y' : 'N';
    
    setForm((prev) => ({
      ...prev,
      companyIsRecruitingYn: newValue,
    }));

    if (!isChecked) {
      try {
        const response = await api.$post(
          '/mypage/edit/affiliation/recruiting/cancel'
        );
        await fetchAffiliationInfo();
        alert(response.message);
      } catch (error) {
        alert(
          error.response?.data?.message ||
            '모집 상태 해제 중 오류가 발생했습니다.'
        );
      }
    }
  };

  // URL 유효성 검사
  const validateUrl = () => {
    const url = (form.companyUrl ?? '').trim();
    if (!url) {
      setUrlError('URL을 입력해주세요.');
      setUrlValid(false);
      return;
    }

    const pattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-./?%&=]*)?$/;
    if (!pattern.test(url)) {
      setUrlError('유효한 URL 형식이 아닙니다.');
      setUrlValid(false);
    } else {
      setUrlError('');
      setUrlValid(true);
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

  // 태그 추가
  const addNTag = (tag) => {
    if (tag && tag.trim() && !editTagNm.includes(tag.trim())) {
      setEditTagNm((prev) => [...prev, tag.trim()]);
    }
  };

  // 태그 삭제
  const removeNTag = (tag) => {
    setEditTagNm((prev) => prev.filter((el) => el !== tag));
  };

  // 편집 모드 토글
  const toggleEdit = (field) => {
    setEditing((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  // 필드 저장
  const saveField = (field) => {
    if (field === 'userPhoneNum' && !phoneValid) return;
    if (field === 'companyUrl' && !urlValid) return;

    setEditing((prev) => ({
      ...prev,
      [field]: false,
    }));
    console.log('form', form);
  };

  // 필드 취소
  const cancelEdit = (field) => {
    setEditing((prev) => ({
      ...prev,
      [field]: false,
    }));

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
    } else if (field === 'tagNm') {
      setEditTagNm(_.cloneDeep(originalTagNm));
    } else {
      setForm((prev) => ({
        ...prev,
        [field]: originalData[field],
      }));
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setForm({ ...originalData });
    setEditing({
      userPhoneNum: false,
      address: false,
      companyUrl: false,
      companyGreetingTxt: false,
      tagNm: false,
    });
    setEditTagNm(_.cloneDeep(originalTagNm));
  };

  // 폼 변경 여부 확인
  const isFormChanged = () => {
    return (
      form.userPhoneNum !== originalData.userPhoneNum ||
      form.companyUrl !== originalData.companyUrl ||
      form.zonecode !== originalData.zonecode ||
      form.address !== originalData.address ||
      form.detailAddress !== originalData.detailAddress ||
      form.sigunguCode !== originalData.sigunguCode ||
      form.latitude !== originalData.latitude ||
      form.longitude !== originalData.longitude ||
      form.companyIsRecruitingYn !== originalData.companyIsRecruitingYn ||
      form.companyGreetingTxt !== originalData.companyGreetingTxt ||
      !_.isEqual(editTagNm, originalTagNm)
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

    const requestBody = {
      userPhoneNum: form.userPhoneNum,
      companyUrl: form.companyUrl,
      zonecode: form.zonecode,
      address: form.address,
      detailAddress: form.detailAddress,
      sigunguCode: form.sigunguCode,
      latitude: form.latitude,
      longitude: form.longitude,
      companyGreetingTxt: form.companyGreetingTxt,
      tagNm: [...editTagNm],
      companyIsRecruitingYn: form.companyIsRecruitingYn,
    };

    console.log('requestBody', requestBody);

    try {
      const response = await api.$post(
        '/mypage/edit/affiliation/update',
        requestBody
      );

      if (response.status === 'OK') {
        alert(
          response.message || '소속 정보가 성공적으로 수정되었습니다.'
        );
        await fetchAffiliationInfo();
        resetForm();
      } else {
        alert(response.message || '수정에 실패했습니다.');
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
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 필드별 유효성 검사 트리거
    if (field === 'companyUrl') {
      setTimeout(validateUrl, 0);
    } else if (field === 'userPhoneNum') {
      setTimeout(validatePhone, 0);
    }
  };

  const isDisabled = form.companyIsRecruitingYn !== 'Y';

  return (
    <MyPageLayout userType="COMPANY">
      <div className="affiliation-edit-container">
      <div className="overflow-hidden mb-3">
        <h4 className="mb-3" style={{ fontSize: '24px' }}>
          소속 정보 수정
        </h4>
      </div>

      {/* 프로필 이미지 */}
      <div className={`text-center mb-4 ${isDisabled ? 'disabled-form' : ''}`}>
        <div
          className="position-relative d-inline-block"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {/* 프로필 이미지 영역 */}
          <div className="rounded-circle overflow-hidden profile-image-wrapper">
            {companyProfileImageUrl ? (
              <img
                src={companyProfileImageUrl}
                alt="Profile Image"
                className="img-fluid object-fit-cover"
              />
            ) : (
              <div className="rounded-circle">
                <i className="fas fa-building text-muted"></i>
              </div>
            )}
          </div>

          {/* X 버튼 (hover 시에만 표시) */}
          {companyProfileImageUrl && hovering && (
            <button
              className="position-absolute delete-button"
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
              ref={profileImageInputRef}
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

      {/* 소속 모집 여부 체크박스 */}
      <div className="form-group row align-items-center">
        <label className="col-lg-2 col-form-label text-2">소속 모집 여부</label>
        <div className="col-lg-10">
          <input
            type="checkbox"
            name="recruiting"
            id="recruiting"
            className="form-check-input"
            checked={form.companyIsRecruitingYn === 'Y'}
            onChange={onCheckboxChange}
          />
          <label htmlFor="recruiting" className="form-check-label text-dark text-3">
            모집중
          </label>
        </div>
      </div>

      <form
        role="form"
        className={`needs-validation ${isDisabled ? 'disabled-form' : ''}`}
        noValidate
        onSubmit={saveAll}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.preventDefault();
        }}
      >
        {/* 대표자 이름 (변경 불가) */}
        <div className="form-group row align-items-center">
          <label className="col-lg-2 col-form-label text-2">대표자 이름</label>
          <div className="col-lg-10">
            <input
              className="form-control text-3 h-auto py-2 border-0"
              type="text"
              name="CompanyCeoName"
              value={form.companyCeoNm}
              readOnly
            />
          </div>
        </div>

        {/* 기업 이름 (변경 불가) */}
        <div className="form-group row align-items-center">
          <label className="col-lg-2 col-form-label text-2">기업명</label>
          <div className="col-lg-10">
            <input
              className="form-control text-3 h-auto py-2 border-0"
              type="text"
              name="companyName"
              value={form.companyNm}
              readOnly
            />
          </div>
        </div>

        {/* 개업일자 (변경 불가) */}
        <div className="form-group row align-items-center">
          <label className="col-lg-2 col-form-label text-2">개업일자</label>
          <div className="col-lg-10">
            <input
              className="form-control text-3 h-auto py-2 border-0"
              type="text"
              name="openDate"
              value={form.companyOpenDt}
              readOnly
            />
          </div>
        </div>

        {/* 기업 URL */}
        <div className="form-group row align-items-center">
          <label className="col-lg-2 col-form-label text-2">기업 URL</label>
          <div className="col-lg-7">
            {!editing.companyUrl ? (
              <input
                className="form-control text-3 h-auto py-2 border-0"
                type="text"
                name="name"
                value={form.companyUrl}
                placeholder="기업 URL을 입력하세요."
                readOnly
              />
            ) : (
              <>
                <input
                  className="form-control text-3 h-auto py-2"
                  type="text"
                  name="name"
                  value={form.companyUrl}
                  placeholder="기업 URL을 입력하세요."
                  onChange={(e) =>
                    handleInputChange('companyUrl', e.target.value)
                  }
                />
                {urlError && (
                  <div className="invalid-feedback d-block">{urlError}</div>
                )}
              </>
            )}
          </div>
          <div className="col-lg-3 text-end">
            {!editing.companyUrl ? (
              <button
                type="button"
                className="btn btn-light btn-outline"
                onClick={() => toggleEdit('companyUrl')}
              >
                수정
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-outline d-inline-block me-2"
                  onClick={() => saveField('companyUrl')}
                  disabled={!urlValid}
                >
                  확인
                </button>
                <button
                  type="button"
                  className="btn btn-light btn-outline d-inline-block"
                  onClick={() => cancelEdit('companyUrl')}
                >
                  취소
                </button>
              </>
            )}
          </div>
        </div>

        {/* 대표 번호 */}
        <div className="form-group row align-items-center">
          <label className="col-lg-2 col-form-label text-2">대표번호</label>
          <div className="col-lg-7">
            {!editing.userPhoneNum ? (
              <input
                className="form-control text-3 h-auto py-2 border-0"
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
                  onChange={(e) =>
                    handleInputChange('userPhoneNum', e.target.value)
                  }
                />
                {phoneError && (
                  <div className="invalid-feedback d-block">{phoneError}</div>
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
                  disabled={!phoneValid}
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

        {/* 주소 */}
        <div className="form-group row align-items-center">
          <label className="col-lg-2 col-form-label text-2">주소</label>
          <div className="col-lg-7">
            {!editing.address ? (
              <input
                className="form-control text-3 h-auto py-2 border-0"
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
                      handleInputChange('detailAddress', e.target.value)
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

        {/* 모집 내용 */}
        <div className="form-group row align-items-center">
          <label className="col-lg-2 col-form-label text-2">모집 내용</label>
          <div className="col-lg-7 position-relative">
            {!editing.companyGreetingTxt ? (
              <div className="form-control text-3 h-auto py-2 border-0 recruitment-content">
                {form.companyGreetingTxt}
              </div>
            ) : (
              <textarea
                value={form.companyGreetingTxt}
                onChange={(e) =>
                  handleInputChange('companyGreetingTxt', e.target.value)
                }
                className="form-control text-3 h-auto py-2"
                rows="4"
              ></textarea>
            )}
          </div>
          <div className="col-lg-3 text-end">
            {!editing.companyGreetingTxt ? (
              <button
                type="button"
                className="btn btn-light btn-outline"
                onClick={() => toggleEdit('companyGreetingTxt')}
              >
                수정
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-outline d-inline-block me-2"
                  onClick={() => saveField('companyGreetingTxt')}
                >
                  확인
                </button>
                <button
                  type="button"
                  className="btn btn-light btn-outline d-inline-block"
                  onClick={() => cancelEdit('companyGreetingTxt')}
                >
                  취소
                </button>
              </>
            )}
          </div>
        </div>

        {/* 태그 */}
        <div className="form-group row align-items-center">
          <label className="col-lg-2 col-form-label text-2">태그</label>
          <div
            className="col-lg-7 d-flex flex-wrap gap-2"
            style={{ alignItems: 'center' }}
          >
            {editTagNm.map((tag, index) => (
              <a
                key={index}
                className="btn btn-rounded btn-3d btn-light btn-sm d-flex align-items-center px-3 py-2 tag-item"
              >
                {tag}
                {editing.tagNm && (
                  <i
                    className="fas fa-times ms-2"
                    onClick={() => removeNTag(tag)}
                  ></i>
                )}
              </a>
            ))}
          </div>
          <div className="col-lg-3 text-end">
            {!editing.tagNm ? (
              <button
                type="button"
                className="btn btn-light btn-outline"
                onClick={() => toggleEdit('tagNm')}
              >
                수정
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-outline me-2"
                  onClick={() => saveField('tagNm')}
                >
                  확인
                </button>
                <button
                  type="button"
                  className="btn btn-light btn-outline"
                  onClick={() => cancelEdit('tagNm')}
                >
                  취소
                </button>
              </>
            )}
          </div>
        </div>

        {/* 태그 입력 영역 */}
        {editing.tagNm && (
          <div className="row mt-2">
            <div className="col-lg-2"></div>
            <div className="form-group col-lg-7">
              <div className="input-group text-end">
                <input
                  type="text"
                  className="form-control text-3 h-auto py-2"
                  placeholder="태그를 입력하세요."
                  id="tagInput"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addNTag(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

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
    </MyPageLayout>
  );
};

export default AffiliationEdit;

