import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { api } from '@/lib/axios';
import { useAlert } from '@/contexts/AlertContext';
import { useCompanyProfile } from '@/store/hooks';
import { resetProfile, setProfile } from '@/store/slices/companyProfileSlice';
import debounce from 'lodash/debounce';
import './companySignUpFrom.css';

export default function CompanySignUpForm() {
  const { showAlert } = useAlert();
  const dispatch = useDispatch();
  const { companyData, termsAgreed } = useCompanyProfile();

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {/* 아이디 */}
      <div className="row">
        <div className="form-group col-lg-6">
          <label className="form-label">
            아이디
            <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>
          </label>
          <input
            type="text"
            className="form-control form-control-lg"
          />
          <div className="invalid-feedback">에러 메시지</div>
        </div>
      </div>

      {/* 비밀번호 */}
      <div className="row">
        <div className="form-group col-lg-6">
          <label className="form-label">
            비밀번호
            <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>
          </label>
          <input
            type="password"
            className="form-control form-control-lg"
          />
          <div className="invalid-feedback">에러 메시지</div>
        </div>
        <div className="form-group col-lg-6">
          <label className="form-label">
            비밀번호 확인
            <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>
          </label>
          <input
            type="password"
            className="form-control form-control-lg"
          />
          <div className="invalid-feedback">에러 메시지</div>
        </div>
      </div>

      {/* 담당자 이름 */}
      <div className="row">
        <div className="form-group col-lg-6">
          <label className="form-label">
            담당자 이름
            <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>
          </label>
          <input
            type="text"
            className="form-control form-control-lg"
          />
          <div className="invalid-feedback">에러 메시지</div>
        </div>
      </div>

      {/* 휴대폰 */}
      <div className="row">
        <div className="form-group col-lg-6">
          <label className="form-label">
            휴대폰 번호
            <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>
          </label>
          <input
            type="text"
            className="form-control form-control-lg"
          />
          <div className="invalid-feedback">에러 메시지</div>
        </div>
      </div>

      {/* 기업명 */}
      <div className="row">
        <div className="form-group col-lg-6">
          <label className="form-label">
            기업명
            <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>
          </label>
          <input
            type="text"
            className="form-control form-control-lg"
            readOnly
          />
        </div>
        <div className="invalid-feedback">에러 메시지</div>
        <div className="form-group col-lg-6">
          <label className="form-label">
            사업자 번호
            <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>
          </label>
          <input
            type="text"
            className="form-control form-control-lg"
          />
        </div>
      </div>

      {/* 회사 주소 */}
      <div className="row">
        <div className="form-group col-lg-7 mb-2">
          <label className="form-label">
            회사 주소
            <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>
          </label>
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="주소를 검색하세요"
            readOnly
          />
          <div className="invalid-feedback">에러 메시지</div>
        </div>

        <div className="form-group col-lg-5">
          <label className="form-label">상세 주소</label>
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder=""
          />
        </div>
      </div>

      {/* 이메일 */}
      <div className="row">
        <div className="form-group col-lg-12">
          <label className="form-label">
            이메일 주소
            <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>
          </label>
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="이메일 아이디"
            />
            <span className="input-group-text">@</span>

            {/* 도메인 입력 인풋 */}
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="도메인 입력"
            />

            {/* 셀렉트 박스 */}
            <select className="form-control form-control-lg">
              <option disabled value="">선택하세요</option>
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
            >
              인증 요청
            </button>
          </div>
          <div className="invalid-feedback">에러 메시지</div>
        </div>
      </div>

      {/* 인증번호 */}
      <div className="row">
        <div className="form-group col-lg-8">
          <label className="form-label">
            인증번호
            <i className="bi bi-check-circle-fill ms-1" style={{ color: '#007bff' }}></i>
          </label>
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-lg"
            />
            <button
              type="button"
              className="btn btn-primary btn-lg"
            >
              확인
            </button>
          </div>
          <div className="invalid-feedback">에러 메시지</div>
        </div>
      </div>

      {/* 약관 동의 */}
      <div className="row">
        <div className="form-group col">
          <div className="form-check">
            <input
              type="checkbox"
              id="terms"
              className="form-check-input"
            />
            <label htmlFor="terms" className="form-check-label me-1">
              약관에 동의합니다.
            </label>
            <a className="font-primary" style={{ cursor: 'pointer' }}>이용약관</a>
          </div>
          <div className="invalid-feedback">에러 메시지</div>
        </div>
      </div>

      {/* 회원가입 버튼 */}
      <div className="row">
        <div className="form-group col text-6">
          <input
            type="submit"
            value="회원가입"
            className="btn btn-primary btn-modern w-100"
          />
        </div>
      </div>
    </form>
  )
}

