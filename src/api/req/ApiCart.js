import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiCart = createApi({
  reducerPath: "/ApiCart",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API}/cart`,
    credentials: "include",
  }),
  tagTypes: ["cart"],
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => ({
        url: "/get-cart",
        method: "GET",
      }),
      providesTags: ["cart"],
    }),
    addCart: builder.mutation({
      query: (body) => ({
        url: "/add-cart",
        method: "POST",
        body,
      }),
      invalidatesTags: ["cart"],
    }),
    deleteCart: builder.mutation({
      query: (id) => ({
        url: `/delete-cart/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["cart"],
    }),
  }),
});

export const { useGetCartQuery, useAddCartMutation, useDeleteCartMutation } =
  ApiCart;
