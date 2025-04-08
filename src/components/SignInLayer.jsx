import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import BZ_Logo from "../assets/logo/BZ_Logo_Security.png";
import Login_Banner from "../assets/logo/qrcode9.png";

const SignInLayer = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Try logging in as an admin
      let response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/admin/login`,
        formData
      );

      if (response.status === 200) {
        const { token, admin } = response.data;
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminId", admin.id);
        localStorage.setItem("companyId", admin.cid);
        // await checkLicenseStatus();
        navigate("/");
        return;
      }
    } catch (adminError) {
      console.warn("Admin login failed, trying user login...");
    }

    try {
      // Try logging in as a user
      let response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/login`,
        formData
      );

      const userRole = response.data.user.role;

      if (userRole === "security") {
        const { token, user } = response.data;
        localStorage.setItem("userToken", token);
        localStorage.setItem("companyId", user.cid);
        navigate("/userDashboard");
        return;
      }
    } catch (userError) {
      console.warn("User login failed, trying department user login...");
    }

    try {
      // Try logging in as a department user
      let response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/deptUser/login`,
        formData
      );

      if (response.status === 200) {
        const { token, user } = response.data;
        localStorage.setItem("deptUserToken", token);
        localStorage.setItem("DeptUserEmail", user.email);
        localStorage.setItem("companyId", user.cid);
        navigate("/deptUserDashboard");
        return;
      }
    } catch (deptUserError) {
      setError("Invalid login credentials. Please try again.");
      console.error(
        "Department user login failed:",
        deptUserError.response.data.error
      );
    }
  };

  return (
    <section className="auth bg-base d-flex flex-wrap">
      <div className="auth-left d-lg-block d-none">
        <div className="d-flex align-items-center flex-column h-100 justify-content-center">
          {/* <img src="https://react.wowdash.wowtheme7.com/assets/images/auth/auth-img.png" alt="Login_Image" /> */}
          <img src={Login_Banner} alt="Login_Image" />
        </div>
      </div>
      <div className="auth-right py-32 px-24 d-flex flex-column justify-content-center">
        <div className="max-w-464-px mx-auto w-100">
          <div>
            <Link className="mb-40 max-w-290-px">
              {/* <img src="assets/images/logo.png" alt="" /> */}
              <img src={BZ_Logo} alt="Security Logo" />
            </Link>
            <h4 className="mb-12">Sign In to your Account</h4>
            <p className="mb-32 text-secondary-light text-lg">
              Welcome back! please enter your detail
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            {/* Display error message if login fails */}
            {error && <p className="text-danger">{error}</p>}

            <div className="icon-field mb-16">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="mage:email" />
              </span>
              <input
                type="email"
                className="form-control h-56-px bg-neutral-50 radius-12"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="position-relative mb-20">
              <div className="icon-field">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="solar:lock-password-outline" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control h-56-px bg-neutral-50 radius-12"
                  id="your-password"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <span
                className="ri-eye-line cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light"
                onClick={togglePasswordVisibility}
                style={{ cursor: "pointer", marginLeft: "10px" }}
              />
            </div>
            <div className="">
              <div className="d-flex justify-content-between gap-2">
                <div className="form-check style-check d-flex align-items-center">
                  <input
                    className="form-check-input border border-neutral-300"
                    type="checkbox"
                    defaultValue=""
                    id="remeber"
                  />
                  <label className="form-check-label" htmlFor="remeber">
                    Remember me{" "}
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-primary-600 fw-medium"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32"
            >
              {" "}
              Sign In
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignInLayer;
