import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiUser = createApi({
  reducerPath: "/ApiUser",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API}/user`,
    credentials: "include",
  }),
  tagTypes: ["users"],
  endpoints: (builder) => ({
    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/update-profile",
        method: "PUT",
        body,
      }),
    }),
    getUsers: builder.query({
      query: ({ search, page, limit }) => ({
        url: "/get-users",
        method: "GET",
        params: { search, page, limit },
      }),
      providesTags: ["users"],
    }),
    getUser: builder.query({
      query: (id) => ({
        url: `/get-user/${id}`,
        method: "GET",
      }),
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/delete-user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["users"],
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useGetUsersQuery,
  useGetUserQuery,
  useDeleteUserMutation,
} = ApiUser;
