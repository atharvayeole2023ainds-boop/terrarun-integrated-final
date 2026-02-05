// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import activityReducer from './slices/activitySlice';
import territoryReducer from './slices/territorySlice';
import mapReducer from './slices/mapSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    activity: activityReducer,
    territory: territoryReducer,
    map: mapReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;