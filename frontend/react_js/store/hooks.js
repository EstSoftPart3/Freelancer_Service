import { useDispatch, useSelector } from 'react-redux';

// 타입이 지정된 hook들 (TypeScript 사용 시 유용)
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// 회사 프로필 관련 커스텀 hook
export const useCompanyProfile = () => {
  const dispatch = useAppDispatch();
  const companyProfile = useAppSelector((state) => state.companyProfile);

  return {
    companyData: companyProfile.companyData,
    termsAgreed: companyProfile.termsAgreed,
    dispatch,
  };
};

