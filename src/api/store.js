import { configureStore } from "@reduxjs/toolkit";
import { ApiProduct } from "./req/ApiProduct";
import { ApiCategory } from "./req/ApiCategory";
import AuthSlice from "./slice/AuthSlice";
import { ApiAuth } from "./req/ApiAuth";
import { ApiUser } from "./req/ApiUsers";
import { ApiAdress } from "./req/ApiAddress";
import { ApiOrder } from "./req/ApiOrder";
import { ApiCart } from "./req/ApiCart";
import { ApiApp } from "./req/ApiApp";

const store = configureStore({
  reducer: {
    auth: AuthSlice,
    [ApiAuth.reducerPath]: ApiAuth.reducer,
    [ApiUser.reducerPath]: ApiUser.reducer,
    [ApiAdress.reducerPath]: ApiAdress.reducer,
    [ApiProduct.reducerPath]: ApiProduct.reducer,
    [ApiCategory.reducerPath]: ApiCategory.reducer,
    [ApiOrder.reducerPath]: ApiOrder.reducer,
    [ApiCart.reducerPath]: ApiCart.reducer,
    [ApiApp.reducerPath]: ApiApp.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      ApiAuth.middleware,
      ApiUser.middleware,
      ApiAdress.middleware,
      ApiProduct.middleware,
      ApiCategory.middleware,
      ApiOrder.middleware,
      ApiCart.middleware,
      ApiApp.middleware,
    ]),
});

export default store;
