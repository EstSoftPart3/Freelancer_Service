import { configureStore } from '@reduxjs/toolkit';
import companyProfileReducer from './slices/companyProfileSlice';

export const store = configureStore({
  reducer: {
    companyProfile: companyProfileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

