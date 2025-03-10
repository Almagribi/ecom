import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiAdress = createApi({
  reducerPath: "/ApiAdress",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API}/address`,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getCities: builder.mutation({
      query: (city) => ({
        url: `/get-cities/${city}`,
        method: "GET",
      }),
    }),
    addAddress: builder.mutation({
      query: (body) => ({
        url: "/add",
        method: "POST",
        body,
      }),
    }),
    getShippingCost: builder.mutation({
      query: ({ courier, weight, destination }) => ({
        url: "/cost",
        method: "GET",
        params: { courier, weight, destination },
      }),
    }),
  }),
});

export const {
  useGetCitiesMutation,
  useAddAddressMutation,
  useGetShippingCostMutation,
} = ApiAdress;
