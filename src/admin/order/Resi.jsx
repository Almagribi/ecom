import React, { useEffect, useState } from "react";
import { useGiveResiMutation } from "../../api/req/ApiOrder";
import { toast } from "react-toastify";
import { Modal } from "bootstrap";

const Resi = ({ modalId, orderId, close }) => {
  const [resi, setResi] = useState("");

  const [giveResi, { data, isLoading: resiLoad, isSuccess, error, reset }] =
    useGiveResiMutation();

  const resiHandler = () => {
    const data = { resi, id: orderId };

    giveResi(data);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
      setResi("");
      reset();

      const modalElement = document.getElementById("resi");
      if (modalElement) {
        const modalClose = Modal.getInstance(modalElement);
        modalClose?.hide();
      }

      document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
        backdrop.remove();
      });

      document.body.classList.remove("modal-open");

      const openModalButton = document.querySelector(
        '[data-bs-target="#resi"]'
      );
      if (openModalButton) {
        openModalButton.focus();
      }

      close();
    }

    if (error) {
      toast.error(error.data.message);
      reset();
    }
  }, [data, isSuccess, error]);

  return (
    <div
      className="modal fade"
      id={modalId}
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="staticBackdropLabel"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="staticBackdropLabel">
              Resi
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={close}
            ></button>
          </div>
          <div className="modal-body">
            <input
              type="text"
              name="resi"
              className="form-control"
              placeholder="Input Resi"
              value={resi}
              onChange={(e) => setResi(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={close}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={resiLoad}
              onClick={resiHandler}
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resi;
