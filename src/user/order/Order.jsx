import React, { useState } from "react";
import Layout from "../layout/Layout";
import { useGetOrdersQuery } from "../../api/req/ApiOrder";
import MetaData from "../../components/meta/MetaData";

const Order = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data: rawData = [], isLoading } = useGetOrdersQuery({
    page,
    limit,
    search,
  });
  const { orders = [], totalData, totalPages } = rawData;

  console.log(orders);

  const next = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const previous = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  return (
    <Layout>
      <MetaData title={"Transaksi"} />
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom bg-white border p-2 rounded shadow">
        <h1 className="h2">Transaksi</h1>
      </div>

      <div className="d-flex justify-content-between mb-2 p-2 bg-white rounded shadow">
        <input
          type="text"
          name="search"
          id="search"
          className="form-control"
          placeholder="Kode Transaksi"
          style={{ width: 300 }}
          value={search || ""}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="d-flex gap-2">
          <select
            name="limit"
            id="limit"
            className="form-select"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          >
            <option value="" hidden>
              --Tampilkan Data--
            </option>
            <option value={10}>10</option>

            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>

          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              disabled={isLoading || page === 1}
              onClick={previous}
            >
              <i className="bi bi-chevron-double-left"></i>
            </button>

            <button
              className="btn btn-primary"
              disabled={isLoading || page === totalPages}
              onClick={next}
            >
              <i className="bi bi-chevron-double-right"></i>
            </button>
          </div>
        </div>
      </div>

      {orders?.length > 0 ? (
        orders?.map((order) => (
          <div
            key={order.id}
            className="bg-white p-2 border shadow rounded orverflow-auto mb-2"
          >
            <div className="border rounded p-2 d-flex flex-column gap-2 flex-wrap">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex gap-2">
                  <i className="bi bi-bag-check"></i>
                  <p className="m-0">
                    Belanja{" "}
                    <span>
                      {new Date(order.createdat).toLocaleDateString("id-iD")}
                    </span>
                  </p>
                </div>

                <button
                  className="btn btn-success"
                  data-bs-toggle="modal"
                  data-bs-target="#detail"
                >
                  <i className="bi bi-three-dots-vertical"></i>
                </button>
              </div>
              <p className="m-0">
                No Resi:{" "}
                <strong>
                  {order.resi ? order.resi : "Data belum tersedia"}
                </strong>
              </p>
              <div className="row g-2">
                <div className="col-lg-10 col-12">
                  {order?.product?.map((product) => (
                    <div key={product.id}>
                      <p className="m-0 h6">{product.name}</p>
                      <p className="m-0">{`${
                        product.quantity
                      } x Rp ${parseFloat(product.price).toLocaleString(
                        "id-ID"
                      )} = 
                      Rp ${parseFloat(
                        product.quantity * product.price
                      ).toLocaleString("id-ID")}`}</p>
                      <hr />
                    </div>
                  ))}
                </div>
                <div className="col-lg-2 col-12">
                  <p className="m-0 text-center">Total Belanja</p>
                  <p className="m-0 text-center fw-bold">
                    {parseFloat(order.gross_amount).toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="m-0 h4 text-info">Belanja Yuk!!</p>
      )}

      <div
        className="modal fade"
        id="detail"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Alamat Pengiriman
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">...</div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button type="button" className="btn btn-primary">
                Understood
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Order;
