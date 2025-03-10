import React, { useEffect, useState } from "react";
import Layout from "../layout/Layout";
import TableComponent from "../table/TableComponent";
import {
  useDeleteUserMutation,
  useGetUserQuery,
  useGetUsersQuery,
} from "../../api/req/ApiUsers";
import { toast } from "react-toastify";
import MetaData from "../../components/meta/MetaData";

const AdminUser = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [id, setId] = useState("");

  const { data: rawData = {} } = useGetUsersQuery({ search, page, limit });
  const { totalUsers, totalPages, users = [] } = rawData;
  const { data: user } = useGetUserQuery(id, { skip: !id });
  const [deleteUser, { data, isSuccess, isLoading, error, reset }] =
    useDeleteUserMutation();

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
      reset();
    }

    if (error) {
      toast.error(error.data.message);
      reset();
    }
  }, [data, isSuccess, error]);

  return (
    <Layout pageName={"Daftar Pengguna"}>
      <MetaData title={"Admin - user"} />
      <TableComponent
        height={"75vh"}
        page={page}
        setPage={(e) => setPage(e)}
        setLimit={(e) => setLimit(e)}
        setSearch={(e) => setSearch(e)}
        totalPages={totalPages}
        totalData={totalUsers}
      >
        <table className="table table-hover table-striped">
          <thead>
            <tr>
              <th className="text-center align-middle">No</th>
              <th className="text-center align-middle">Nama</th>
              <th className="text-center align-middle">Email</th>
              <th className="text-center align-middle">Whatsapp</th>
              <th className="text-center align-middle">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user, i) => (
              <tr key={i}>
                <td className="text-center align-middle">{i + 1}</td>
                <td>{user.name}</td>
                <td className="text-center align-middle">{user.email}</td>
                <td className="text-center align-middle">{user.phone}</td>
                <td className="text-center align-middle">
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => setId(user.id)}
                      data-bs-toggle="modal"
                      data-bs-target="#detailUser"
                    >
                      Detail
                    </button>
                    <button
                      className="btn btn-danger"
                      disabled={isLoading}
                      onClick={() => deleteUser(user.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableComponent>

      <div
        className="modal fade"
        id="detailUser"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="staticBackdropLabel">
                Detail User
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="d-flex flex-column gap-2">
                <div className="table-responsive">
                  <table className="table table-primary">
                    <tbody>
                      <tr className="">
                        <td scope="row">Nama</td>
                        <td>:</td>
                        <td>{user?.name}</td>
                      </tr>
                      <tr className="">
                        <td scope="row">Email</td>
                        <td>:</td>
                        <td>{user?.email}</td>
                      </tr>
                      <tr className="">
                        <td scope="row">Whatsapp</td>
                        <td>:</td>
                        <td>{user?.phone}</td>
                      </tr>
                      <tr className="">
                        <td scope="row">Alamat</td>
                        <td>:</td>
                        <td>
                          {user?.address.province === null ? (
                            "Data Belum Tersedia"
                          ) : (
                            <div className="d-flex flex-column gap-2">
                              <p className="m-0">{`Provinsi ${user?.address.province}, ${user?.address.city} 
                                                  Kec ${user?.address.district}, Desa ${user?.address.village}`}</p>
                              <p className="m-0">{user?.address.detail}</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminUser;
