import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  companyData: {
    companyName: '',
    ceoName: '',
    openDate: '',
    bizNumber: '',
  },
  termsAgreed: false,
};

const companyProfileSlice = createSlice({
  name: 'companyProfile',
  initialState,
  reducers: {
    // 프로필 초기화
    resetProfile: (state) => {
      state.companyData = {
        companyName: '',
        ceoName: '',
        openDate: '',
        bizNumber: '',
      };
      state.termsAgreed = false;
    },
    // 외부에서 인증된 기업 데이터로 업데이트
    setProfile: (state, action) => {
      state.companyData = {
        companyName: action.payload.companyName || '',
        ceoName: action.payload.ceoName || '',
        openDate: action.payload.openDate || '',
        bizNumber: action.payload.bizNumber || '',
      };
      state.termsAgreed = action.payload.termsAgreed ?? false;
    },
    // 개별 필드 업데이트
    updateCompanyField: (state, action) => {
      const { field, value } = action.payload;
      state.companyData[field] = value;
    },
    // 약관 동의 업데이트
    setTermsAgreed: (state, action) => {
      state.termsAgreed = action.payload;
    },
  },
});

export const {
  resetProfile,
  setProfile,
  updateCompanyField,
  setTermsAgreed,
} = companyProfileSlice.actions;

export default companyProfileSlice.reducer;

