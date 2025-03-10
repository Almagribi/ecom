import React, { useEffect, useState } from "react";
import { useDeleteImageMutation } from "../../api/req/ApiProduct";
import { toast } from "react-toastify";
import { Modal } from "bootstrap";

const Images = ({ images, close }) => {
  const [id, setId] = useState("");
  const [deleteImage, { data, isSuccess, isLoading, error, reset }] =
    useDeleteImageMutation();

  useEffect(() => {
    const carousel = document.getElementById("carouselExampleControls");

    const handleSlideChange = (e) => {
      const activeIndex = e.to;
      setId(images[activeIndex]?.id);

      console.log(`Acitive id ${images[activeIndex]?.id}`);
    };

    carousel?.addEventListener("slid.bs.carousel", handleSlideChange);

    return () => {
      carousel?.removeEventListener("slid.bs.carousel", handleSlideChange);
    };
  }, [images]);

  useEffect(() => {
    if (images.length > 0) {
      setId(images[0]?.id);
    }
  }, [images]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
      setId("");
      reset();

      const modalElement = document.getElementById("images");
      if (modalElement) {
        const modalClose = Modal.getInstance(modalElement);
        modalClose?.hide();
      }

      document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
        backdrop.remove();
      });

      document.body.classList.remove("modal-open");

      const openModalButton = document.querySelector(
        '[data-bs-target="#images"]'
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
  }, [isSuccess, data, error, reset]);

  return (
    <div
      className="modal fade"
      id="images"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="staticBackdropLabel"
    >
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="staticBackdropLabel">
              Jumlah Gambar <span>{images?.length}</span>
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div
              id="carouselExampleControls"
              className="carousel slide"
              data-bs-interval="false"
            >
              <div className="carousel-inner">
                {images.length > 0 &&
                  images?.map((img, i) => (
                    <div
                      key={i}
                      className={`carousel-item ${i === 0 ? "active" : ""}`}
                    >
                      <img
                        src={img.link}
                        className="d-block w-100"
                        alt="Img"
                        height={400}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  ))}
              </div>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#carouselExampleControls"
                data-bs-slide="prev"
              >
                <span
                  className="carousel-control-prev-icon"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#carouselExampleControls"
                data-bs-slide="next"
              >
                <span
                  className="carousel-control-next-icon"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden">Next</span>
              </button>
            </div>
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
              className="btn btn-danger"
              disabled={isLoading}
              onClick={() => deleteImage(id)}
            >
              {isLoading ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Images;
