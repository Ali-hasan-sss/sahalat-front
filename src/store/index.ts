import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import themeReducer from './features/themeSlice';
import languageReducer from './features/languageSlice';
import requestsReducer from './features/requestsSlice';

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      theme: themeReducer,
      language: languageReducer,
      requests: requestsReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
