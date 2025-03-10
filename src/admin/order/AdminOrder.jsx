import React, { useEffect, useState } from "react";
import Layout from "../layout/Layout";
import TableComponent from "../table/TableComponent";
import {
  useCancelMutation,
  useConfirmMutation,
  useGetOrdersQuery,
} from "../../api/req/ApiOrder";
import Resi from "./Resi";
import Detail from "./Detail";
import { toast } from "react-toastify";
import MetaData from "../../components/meta/MetaData";

const AdminOrder = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState({});
  const [id, setId] = useState("");

  const { data: rawData = {}, isLoading } = useGetOrdersQuery({
    search,
    page,
    limit,
  });
  const { orders = [], totalData, totalPages } = rawData;
  const [confirm, { data, isSuccess, isLoading: confirmLoad, error, reset }] =
    useConfirmMutation();
  const [
    cancle,
    {
      data: cMsg,
      isSuccess: cSuccess,
      isLoading: cLoad,
      error: cError,
      reset: cReset,
    },
  ] = useCancelMutation();

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

  useEffect(() => {
    if (cSuccess) {
      toast.success(cMsg.message);
      cReset();
    }

    if (cError) {
      toast.error(cMsg.data.message);
      cReset();
    }
  }, [cSuccess, cError, cMsg]);

  console.log(orders);
  return (
    <Layout pageName={"Pesanan"}>
      <MetaData title={"Admin - Pesanan"} />
      <TableComponent
        height={"75vh"}
        page={page}
        setPage={setPage}
        setLimit={setLimit}
        setSearch={setSearch}
        totalData={totalData}
        totalPages={totalPages}
      >
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th className="text-center">No</th>
              <th className="text-center">Kode Transaksi</th>
              <th className="text-center">User</th>
              <th className="text-center">Produk</th>
              <th className="text-center">Jumlah</th>
              <th className="text-center">Status Pembayaran</th>
              <th className="text-center">Status Pesanan</th>
              <th className="text-center">Resi</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order, i) => (
              <tr key={i}>
                <td className="text-center align-middle">
                  {(page - 1) * limit + i + 1}
                </td>
                <td className="text-center align-middle">
                  {order.transaction_id}
                </td>
                <td className="align-middle">{order.user?.name}</td>
                <td className="align-middle">
                  {order.product?.map((item) => (
                    <p key={item.id} className="m-0">
                      {item.name}
                    </p>
                  ))}
                </td>
                <td className="text-center align-middle">
                  {order.product?.map((item) => (
                    <p key={item.id} className="m-0">
                      {item.quantity}
                    </p>
                  ))}
                </td>
                <td className="text-center align-middle">
                  {order.transaction_status}
                </td>
                <td className="text-center align-middle">
                  {order.status_order}
                </td>
                <td className="text-center align-middle">
                  {order.resi ? order.resi : "Data belum tersedia"}
                </td>
                <td>
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-primary"
                      disabled={
                        confirmLoad ||
                        order.status_order === "cancel" ||
                        order.status_order === "shipping"
                      }
                      onClick={() => confirm(order.id)}
                    >
                      Konfrimasi
                    </button>
                    <button
                      className="btn btn-info"
                      data-bs-toggle="modal"
                      data-bs-target="#detail"
                      onClick={() => setDetail(order)}
                    >
                      Detail
                    </button>
                    <button
                      className="btn btn-warning"
                      data-bs-toggle="modal"
                      data-bs-target="#resi"
                      onClick={() => setId(order.id)}
                    >
                      Resi
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableComponent>

      {/* Detail Order */}
      <Detail
        detail={detail}
        modalId={"detail"}
        setDetail={() => setDetail({})}
      />

      {/* Resi */}
      <Resi modalId={"resi"} orderId={id} close={() => setId("")} />
    </Layout>
  );
};

export default AdminOrder;
