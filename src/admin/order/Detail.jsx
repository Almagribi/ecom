import React, { useEffect } from "react";

const Detail = ({ detail, modalId, setDetail }) => {
  useEffect(() => {
    const openModalButton = document.querySelector(
      `[data-bs-target="#${modalId}"]`
    );
    if (openModalButton) {
      openModalButton.focus();
    }
  });
  return (
    <div
      className="modal fade"
      id={modalId}
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="staticBackdropLabel"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="staticBackdropLabel">
              Kode Transaksi <strong>{detail?.transaction_id}</strong>
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={setDetail}
            ></button>
          </div>
          <div className="modal-body d-flex flex-column gap-2">
            <p className="m-0">Data Penerima</p>
            <div className="table-responsive">
              <table className="table table-border table-striped table-hover">
                <tbody>
                  <tr>
                    <td>Nama Penerima</td>
                    <td>:</td>
                    <td>{detail?.user?.name}</td>
                  </tr>

                  <tr>
                    <td>Phone</td>
                    <td>:</td>
                    <td>{detail?.user?.phone}</td>
                  </tr>

                  <tr>
                    <td>Provinsi / Kota / Kec / Desa</td>
                    <td>:</td>
                    <td>{`${detail?.address?.province}, ${detail?.address?.city}, ${detail?.address?.district}, ${detail?.address?.village}`}</td>
                  </tr>

                  <tr>
                    <td>Alamat</td>
                    <td>:</td>
                    <td>{detail?.address?.detail}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="m-0">Data Produk</p>
            <div className="table-responsive">
              <table className="table table-border table-hover table-striped">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Jumlah</th>
                    <th>Ongkir</th>
                  </tr>
                </thead>
                <tbody>
                  {detail?.product?.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.quantity}</td>
                      <td>{product.shipping}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={setDetail}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
