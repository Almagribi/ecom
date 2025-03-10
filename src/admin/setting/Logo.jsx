import React, { useEffect } from "react";
import { useUploadLogoMutation } from "../../api/req/ApiApp";
import { toast } from "react-toastify";

const Logo = ({ logo }) => {
  const [uploadLogo, { data, isSuccess, isLoading, error, reset }] =
    useUploadLogoMutation();

  const fileHandler = (e) => {
    const image = e.target.files[0];
    const form = new FormData();
    form.append("image", image);

    uploadLogo(form);
  };

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
    <div>
      <input
        type="file"
        className="form-control mb-2"
        style={{ width: 250 }}
        onChange={fileHandler}
      />
      <div
        className="rounded overflow-hidden border d-flex align-items-center justify-content-center"
        style={{ height: 200, width: 200 }}
      >
        {isLoading ? (
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <img
            src={logo}
            alt="logo"
            width="100%"
            height="100%"
            style={{ objectFit: "cover" }}
          />
        )}
      </div>
    </div>
  );
};

export default Logo;
