import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import notesSlice from './slices/notesSlice';
import subscriptionSlice from './slices/subscriptionSlice';

const store = configureStore({
  reducer: {
    auth: authSlice,
    notes: notesSlice,
    subscription: subscriptionSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;