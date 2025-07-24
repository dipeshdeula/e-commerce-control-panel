import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authSlice from './slices/authSlice';
import dashboardSlice from './slices/dashboardSlice';
import userSlice from './slices/userSlice';
import categorySlice from './slices/categorySlice';
import productSlice from './slices/productSlice';
import orderSlice from './slices/orderSlice';
import paymentSlice from './slices/paymentSlice';
import storeSlice from './slices/storeSlice';
import companySlice from './slices/companySlice';
import billingSlice from './slices/billingSlice';
import transactionSlice from './slices/transactionSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    dashboard: dashboardSlice,
    users: userSlice,
    categories: categorySlice,
    products: productSlice,
    orders: orderSlice,
    payments: paymentSlice,
    stores: storeSlice,
    company: companySlice,
    billing: billingSlice,
    transactions: transactionSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for better TypeScript support
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;