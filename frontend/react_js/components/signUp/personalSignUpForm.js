import { useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { api } from "@/lib/axios";
import { useAlert } from "@/contexts/AlertContext";
import "./personalSignUpForm.css";

export default function PersonalSignUpForm({ onSubmit }) {
  const { showAlert } = useAlert();

  // -------------------- form state --------------------
  const [form, setForm] = useState({
    id: "",
    password: "",
    confirmPassword: "",
    name: "",
    dob: null, // Date 객체
    gender: "",
    phone: "",
    emailId: "",
    emailDomain: "",
    verificationCode: "",
    terms: false,
    postcode: "",
    sigunguCode: "",
    address: "",
    addressDetail: "",
    latitude: "",
    longitude: "",
    typeCode: 301, // 개인
    signupTypeCode: 204, // 이메일
  });

  // -------------------- UI/valid/error state --------------------
  const [idError, setIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [dobError, setDobError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [verifycodeError, setVerifycodeError] = useState("");
  const [termsError, setTermsError] = useState("");

  const [idValid, setIdValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
  const [nameValid, setNameValid] = useState(false);
  const [dobValid, setDobValid] = useState(false);
  const [genderValid, setGenderValid] = useState(false);
  const [phoneValid, setPhoneValid] = useState(false);
  const [addressValid, setAddressValid] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [verifyCodeValid, setVerifyCodeValid] = useState(false);
  const [termsValid, setTermsValid] = useState(false);

  const [selectedDomain, setSelectedDomain] = useState("");
  const [isCustomDomain, setIsCustomDomain] = useState(false);

  // -------------------- helpers --------------------
  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  // -------------------- ID: validate core (async) --------------------
  const validateIdCore = async (id) => {
    setIdError("");
    setIdValid(false);

    if (!id) {
      setIdError("아이디를 입력해주세요.");
      return;
    }
    if (!/^[a-zA-Z0-9]{5,20}$/.test(id)) {
      setIdError("영문 또는 숫자 5~20자로 입력해주세요.");
      return;
    }

    try {
      const res = await api.$get(`/check-id?userId=${id}`);
      if (res) {
        setIdError("이미 사용 중인 아이디입니다.");
        setIdValid(false);
      } else {
        setIdValid(true);
      }
    } catch {
      setIdError("서버 오류가 발생했습니다.");
      setIdValid(false);
    }
  };

  // 디바운스 래핑 (메모이즈)
  const debouncedValidateId = useMemo(
    () => debounce((id) => validateIdCore(id), 500),
    []
  );

  useEffect(() => () => debouncedValidateId.cancel(), [debouncedValidateId]);

  const onIdChange = (e) => {
    const val = e.target.value;
    updateForm({ id: val });
    debouncedValidateId(val);
  };

  // -------------------- Password --------------------
  const validatePassword = () => {
    setPasswordError("");
    setPasswordValid(false);
    if (!form.password) {
      setPasswordError("비밀번호를 입력해주세요.");
    } else if (
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(form.password)
    ) {
      setPasswordError("8자 이상, 영문·숫자·특수문자를 조합해 입력해주세요.");
    } else {
      setPasswordValid(true);
    }
  };

  const validateConfirmPassword = () => {
    setConfirmPasswordError("");
    setConfirmPasswordValid(false);
    if (!form.confirmPassword) {
      setConfirmPasswordError("비밀번호 확인을 입력해주세요.");
    } else if (form.confirmPassword !== form.password) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setConfirmPasswordValid(true);
    }
  };

  // -------------------- Name --------------------
  const validateName = () => {
    setNameError("");
    setNameValid(false);
    if (!form.name) {
      setNameError("이름을 입력해주세요.");
    } else if (form.name.length < 2) {
      setNameError("이름은 두 글자 이상 입력해주세요.");
    } else {
      setNameValid(true);
    }
  };

  // -------------------- DOB --------------------
  const validateDob = () => {
    setDobError("");
    setDobValid(false);
    if (!form.dob) {
      setDobError("생년월일을 입력해주세요.");
    } else {
      setDobValid(true);
    }
  };

  // -------------------- Gender --------------------
  const validateGender = () => {
    setGenderError("");
    setGenderValid(false);
    if (!form.gender) {
      setGenderError("성별을 선택해주세요.");
    } else {
      setGenderValid(true);
    }
  };

  // -------------------- Phone --------------------
  const validatePhone = () => {
    setPhoneError("");
    setPhoneValid(false);
    if (!form.phone) {
      setPhoneError("휴대폰 번호를 입력해주세요.");
    } else if (!/^\d{10,11}$/.test(form.phone)) {
      setPhoneError("올바른 휴대폰 번호 형식이 아닙니다. (하이픈 제외)");
    } else {
      setPhoneValid(true);
    }
  };

  // -------------------- Address --------------------
  const validateAddress = () => {
    setAddressError("");
    setAddressValid(false);
    if (!form.address) {
      setAddressError("주소를 입력해주세요.");
    } else {
      setAddressValid(true);
    }
  };

  // Vue의 watch(form.address) 대체
  useEffect(() => {
    validateAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.address]);

  // 다음 주소 API
  const openPostcode = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        const addr = data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
        updateForm({
          postcode: data.zonecode,
          address: addr,
          addressDetail: "",
          sigunguCode: data.sigunguCode,
        });

        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(addr, function (result, status) {
          if (status === window.kakao.maps.services.Status.OK) {
            updateForm({
              latitude: result[0].y,
              longitude: result[0].x,
            });
          } else {
            updateForm({ latitude: null, longitude: null });
          }
        });
      },
    }).open();
  };

  // Kakao/Daum 스크립트 로드 (mounted)
  useEffect(() => {
    if (!window.daum) {
      console.warn("❌ Daum 우편번호 API가 로드되지 않았습니다.");
    }

    if (!window.kakao || !window.kakao.maps) {
      const kakaoScript = document.createElement("script");
      kakaoScript.src =
        "https://dapi.kakao.com/v2/maps/sdk.js?appkey=90610faa13d02b09f83a700d0885a872&libraries=services";
      kakaoScript.async = true;

      kakaoScript.onload = () => {
        if (window.kakao && window.kakao.maps) {
          console.log("✅ Kakao 지도 API 로드됨");
        } else {
          console.error("❌ Kakao 지도 API 로드 실패");
        }
      };

      kakaoScript.onerror = () => console.error("❌ Kakao 지도 API 스크립트 로드 실패");
      document.head.appendChild(kakaoScript);
    } else {
      console.log("✅ Kakao 지도 API가 이미 로드됨");
    }
  }, []);

  // -------------------- Email --------------------
  const handleDomainChange = (e) => {
    const v = e.target.value;
    setSelectedDomain(v);

    if (v === "custom") {
      updateForm({ emailDomain: "" });
      setIsCustomDomain(true);
    } else {
      updateForm({ emailDomain: v });
      setIsCustomDomain(false);
    }
    validateEmail();
  };

  const validateEmail = () => {
    setEmailError("");
    setEmailValid(false);

    const domain = isCustomDomain ? form.emailDomain : selectedDomain;
    const fullEmail = `${form.emailId}@${domain || ""}`;

    if (!form.emailId) {
      setEmailError("이메일 아이디를 입력해주세요.");
    } else if (isCustomDomain && !form.emailDomain) {
      setEmailError("도메인을 입력해주세요.");
    } else if (!/\S+@\S+\.\S+/.test(fullEmail)) {
      setEmailError("올바른 이메일 주소 형식이 아닙니다.");
    } else {
      setEmailValid(true);
    }
  };

  const sendVerification = async () => {
    const domain = isCustomDomain ? form.emailDomain : selectedDomain;
    const email = `${form.emailId}@${domain}`;

    try {
      const response = await api.$post("/email/send-code", { email });
      console.log("인증 이메일 전송 완료", response);
      showAlert(`인증 코드를 전송했습니다. 인증 코드: ${response?.output?.code}`, 'info');
    } catch (error) {
      const message =
        error.response?.data?.message || "이메일 인증 요청에 실패했습니다.";
      setEmailValid(false);
      setEmailError(message);
      showAlert(message, 'danger');
    }
  };

  const verifyCode = async () => {
    setVerifycodeError("");
    setVerifyCodeValid(false);

    const domain = isCustomDomain ? form.emailDomain : selectedDomain;
    const email = `${form.emailId}@${domain}`;
    const code = form.verificationCode;

    if (!code) {
      setVerifycodeError("인증번호를 입력하세요.");
      return;
    }

    try {
      await api.$post("/email/verify-code", { email, code });
      showAlert("이메일 인증에 성공하였습니다.", 'success');
      setVerifyCodeValid(true);
    } catch {
      setVerifycodeError("인증번호가 일치하지 않습니다.");
      showAlert("이메일 인증에 실패하였습니다.", 'danger');
      setVerifyCodeValid(false);
    }
  };

  // -------------------- Terms --------------------
  const validateTerms = () => {
    setTermsError("");
    setTermsValid(false);
    if (!form.terms) {
      setTermsError("필수 약관에 동의해주세요.");
    } else {
      setTermsValid(true);
    }
  };

  // -------------------- submit(all) --------------------
  const validateAll = async () => {
    await validateIdCore(form.id);
    validatePassword();
    validateConfirmPassword();
    validateName();
    validateDob();
    validateGender();
    validatePhone();
    validateAddress();
    validateEmail();
    validateTerms();

    const isFormValid =
      idValid &&
      passwordValid &&
      confirmPasswordValid &&
      nameValid &&
      dobValid &&
      genderValid &&
      phoneValid &&
      addressValid &&
      emailValid &&
      verifyCodeValid &&
      termsValid;

    if (isFormValid) {
      onSubmit?.({ ...form });
    } else {
      console.warn("❌ 유효성 검사 실패. 폼 제출 불가.");
      showAlert("모든 필드를 올바르게 입력해주세요.", 'danger');
    }
  };

  // -------------------- JSX --------------------
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        validateAll();
      }}
    >
      {/* 아이디 */}
      <div className="row">
        <div className="form-group col-lg-6">
          <label className="form-label">
            아이디
            {idValid && (
              <i
                className="bi bi-check-circle-fill ms-1"
                style={{ color: "#007bff" }}
              />
            )}
          </label>
          <input
            type="text"
            value={form.id}
            className="form-control form-control-lg"
            onChange={onIdChange}
          />
          {idError && <div className="invalid-feedback">{idError}</div>}
        </div>
      </div>

      {/* 비밀번호 */}
      <div className="row">
        <div className="form-group col-lg-6">
          <label className="form-label">
            비밀번호
            {passwordValid && (
              <i
                className="bi bi-check-circle-fill ms-1"
                style={{ color: "#007bff" }}
              />
            )}
          </label>
          <input
            type="password"
            value={form.password}
            className="form-control form-control-lg"
            onChange={(e) => {
              updateForm({ password: e.target.value });
              validatePassword();
            }}
          />
          {passwordError && (
            <div className="invalid-feedback">{passwordError}</div>
          )}
        </div>
        <div className="form-group col-lg-6">
          <label className="form-label">
            비밀번호 확인
            {confirmPasswordValid && (
              <i
                className="bi bi-check-circle-fill ms-1"
                style={{ color: "#007bff" }}
              />
            )}
          </label>
          <input
            type="password"
            value={form.confirmPassword}
            className="form-control form-control-lg"
            onChange={(e) => {
              updateForm({ confirmPassword: e.target.value });
              if (passwordValid) validateConfirmPassword();
            }}
          />
          {confirmPasswordError && (
            <div className="invalid-feedback">{confirmPasswordError}</div>
          )}
        </div>
      </div>

      {/* 이름 */}
      <div className="row">
        <div className="form-group col-lg-6">
          <label className="form-label">
            이름
            {nameValid && (
              <i
                className="bi bi-check-circle-fill ms-1"
                style={{ color: "#007bff" }}
              />
            )}
          </label>
          <input
            type="text"
            value={form.name}
            className="form-control form-control-lg"
            onChange={(e) => {
              updateForm({ name: e.target.value });
              validateName();
            }}
          />
          {nameError && <div className="invalid-feedback">{nameError}</div>}
        </div>
      </div>

      {/* 생년월일 / 성별 */}
      <div className="row">
        <div className="form-group col-lg-8">
          <label className="form-label">
            생년월일
            {dobValid && (
              <i
                className="bi bi-check-circle-fill ms-1"
                style={{ color: "#007bff" }}
              />
            )}
          </label>
          <div className="datepicker-wrapper">
            <DatePicker
              selected={form.dob}
              onChange={(date) => {
                updateForm({ dob: date });
                validateDob();
              }}
              locale={ko}
              dateFormat="yyyy-MM-dd"
              maxDate={new Date()}
              placeholderText="생년월일을 선택하세요"
              className="form-control form-control-lg"
            />
            <i className="fas fa-calendar datepicker-icon"></i>
          </div>
          {dobError && <div className="invalid-feedback">{dobError}</div>}
        </div>
        <div className="form-group col-lg-4">
          <label className="form-label">
            성별
            {genderValid && (
              <i
                className="bi bi-check-circle-fill ms-1"
                style={{ color: "#007bff" }}
              />
            )}
          </label>
          <select
            value={form.gender}
            className="form-control form-control-lg"
            onChange={(e) => {
              updateForm({ gender: e.target.value });
              validateGender();
            }}
          >
            <option value="" disabled>
              성별
            </option>
            <option value="101">남성</option>
            <option value="102">여성</option>
          </select>
          {genderError && <div className="invalid-feedback">{genderError}</div>}
        </div>
      </div>

      {/* 휴대폰 */}
      <div className="row">
        <div className="form-group col-lg-6">
          <label className="form-label">
            휴대폰 번호
            {phoneValid && (
              <i
                className="bi bi-check-circle-fill ms-1"
                style={{ color: "#007bff" }}
              />
            )}
          </label>
          <input
            type="text"
            value={form.phone}
            className="form-control form-control-lg"
            onChange={(e) => {
              updateForm({ phone: e.target.value });
              validatePhone();
            }}
          />
          {phoneError && <div className="invalid-feedback">{phoneError}</div>}
        </div>
      </div>

      {/* 주소 */}
      <div className="row">
        <div className="form-group col-lg-7 mb-2">
          <label className="form-label">
            주소
            {addressValid && (
              <i
                className="bi bi-check-circle-fill ms-1"
                style={{ color: "#007bff" }}
              />
            )}
          </label>
          <input
            type="text"
            value={form.address}
            className="form-control form-control-lg"
            placeholder="주소를 검색하세요"
            readOnly
            onClick={openPostcode}
            onInput={validateAddress}
          />
          {addressError && (
            <div className="invalid-feedback">{addressError}</div>
          )}
        </div>
        <div className="form-group col-lg-5">
          <label className="form-label">상세 주소</label>
          <input
            type="text"
            value={form.addressDetail}
            className="form-control form-control-lg"
            onChange={(e) => updateForm({ addressDetail: e.target.value })}
          />
        </div>
      </div>

      {/* 이메일 */}
      <div className="row">
        <div className="form-group col-lg-12">
          <label className="form-label">
            이메일 주소
            {emailValid && (
              <i
                className="bi bi-check-circle-fill ms-1"
                style={{ color: "#007bff" }}
              />
            )}
          </label>
          <div className="input-group">
            <input
              type="text"
              value={form.emailId}
              className="form-control form-control-lg"
              onChange={(e) => {
                updateForm({ emailId: e.target.value });
                validateEmail();
              }}
              placeholder="이메일 아이디"
            />
            <span className="input-group-text">@</span>

            {/* 도메인 입력 */}
            <input
              type="text"
              value={form.emailDomain}
              readOnly={!isCustomDomain}
              className="form-control form-control-lg"
              onChange={(e) => {
                updateForm({ emailDomain: e.target.value });
                validateEmail();
              }}
              placeholder="도메인 입력"
            />

            {/* 셀렉트 박스 */}
            <select
              value={selectedDomain}
              onChange={handleDomainChange}
              className="form-control form-control-lg"
            >
              <option value="" disabled>
                선택하세요
              </option>
              <option value="naver.com">naver.com</option>
              <option value="gmail.com">gmail.com</option>
              <option value="daum.net">daum.net</option>
              <option value="nate.com">nate.com</option>
              <option value="hotmail.com">hotmail.com</option>
              <option value="custom">직접입력</option>
            </select>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={sendVerification}
            >
              인증 요청
            </button>
          </div>
          {emailError && <div className="invalid-feedback">{emailError}</div>}
        </div>
      </div>

      {/* 인증번호 */}
      <div className="row">
        <div className="form-group col-lg-8">
          <label className="form-label">
            인증번호
            {verifyCodeValid && (
              <i
                className="bi bi-check-circle-fill ms-1"
                style={{ color: "#007bff" }}
              />
            )}
          </label>
          <div className="input-group">
            <input
              type="text"
              value={form.verificationCode}
              className="form-control form-control-lg"
              onChange={(e) => {
                updateForm({ verificationCode: e.target.value });
                setVerifycodeError("");
              }}
            />
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={verifyCode}
            >
              확인
            </button>
          </div>
          {verifycodeError && (
            <div className="invalid-feedback">{verifycodeError}</div>
          )}
        </div>
      </div>

      {/* 약관 */}
      <div className="row">
        <div className="form-group col">
          <div className="form-check">
            <input
              type="checkbox"
              checked={form.terms}
              id="terms"
              className="form-check-input"
              onChange={(e) => {
                updateForm({ terms: e.target.checked });
                validateTerms();
              }}
            />
            <label htmlFor="terms" className="form-check-label me-1">
              약관에 동의합니다.
            </label>
            <a 
              className="font-primary" 
              style={{ cursor: 'pointer' }}
              onClick={() => showAlert("약관 모달 열기 (구현 예정)", 'info')}
            >
              이용약관
            </a>
          </div>
          {termsError && <div className="invalid-feedback">{termsError}</div>}
        </div>
      </div>

      {/* 제출 */}
      <div className="row">
        <div className="form-group col text-6">
          <input
            type="submit"
            value="회원가입"
            className="btn btn-primary btn-modern w-100"
          />
        </div>
      </div>

      {/* 스타일 대응용 (scoped 대체) */}
      <style jsx>{`
        select.form-control, select.form-control-lg {
          line-height: 1.6;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          height: auto;
        }
        .invalid-feedback {
          color: #dc3545;
          display: block;
        }
        .datepicker-wrapper {
          position: relative;
        }
        .datepicker-icon {
          position: absolute;
          top: 50%;
          right: 1rem;
          transform: translateY(-50%);
          color: #adb5bd;
          pointer-events: none;
        }
      `}</style>
    </form>
  );
}
