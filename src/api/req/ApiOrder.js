import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiOrder = createApi({
  reducerPath: "/ApiOrder",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API}/order`,
    credentials: "include",
  }),
  tagTypes: ["order"],
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (body) => ({
        url: "/create-order",
        method: "POST",
        body,
      }),
      invalidatesTags: ["order"],
    }),
    getOrders: builder.query({
      query: ({ search, page, limit }) => ({
        url: "/get-orders",
        method: "GET",
        params: { search, page, limit },
      }),
      providesTags: ["order"],
    }),
    giveResi: builder.mutation({
      query: (body) => ({
        url: `/give-resi`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["order"],
    }),
    confirm: builder.mutation({
      query: (id) => ({
        url: `/confirm/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["order"],
    }),
    cancel: builder.mutation({
      query: (id) => ({
        url: `/cancel/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["order"],
    }),
    getProfit: builder.query({
      query: ({ page, limit, search }) => ({
        url: "/get-profit",
        method: "GET",
        params: { page, limit, search },
      }),
    }),
    getSummary: builder.query({
      query: () => ({
        url: "/order-summary",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGiveResiMutation,
  useConfirmMutation,
  useCancelMutation,
  useGetProfitQuery,
  useGetSummaryQuery,
} = ApiOrder;
