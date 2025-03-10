import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiApp = createApi({
  reducerPath: "/ApiApp",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API}/app`,
    credentials: "include",
  }),
  tagTypes: ["app"],
  endpoints: (builder) => ({
    getApp: builder.query({
      query: () => ({
        url: "/detail-app",
        method: "GET",
      }),
      providesTags: ["app"],
    }),
    editApp: builder.mutation({
      query: (body) => ({
        url: "/edit-app",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["app"],
    }),
    uploadLogo: builder.mutation({
      query: (body) => ({
        url: "/upload-logo",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["app"],
    }),
    addCourier: builder.mutation({
      query: (body) => ({
        url: "/add-courier",
        method: "POST",
        body,
      }),
      invalidatesTags: ["app"],
    }),
    deleteCourier: builder.mutation({
      query: (id) => ({
        url: `/delete-courier/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["app"],
    }),
  }),
});

export const {
  useGetAppQuery,
  useEditAppMutation,
  useAddCourierMutation,
  useDeleteCourierMutation,
  useUploadLogoMutation,
} = ApiApp;
