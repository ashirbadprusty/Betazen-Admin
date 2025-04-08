import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Login_Banner from "../assets/logo/img1.png";

const ForgotPasswordLayer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setEmail(e.target.value);
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      let endpoint = "";

      // Try admin endpoint first
      try {
        const checkAdmin = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/admin/forgot-password`,
          { email }
        );
        if (checkAdmin.status === 200) {
          endpoint = `${process.env.REACT_APP_BACKEND_URL}/admin/forgot-password`;
        }
      } catch (adminError) {
        console.warn("Admin email not found, checking other roles...");
      }

      // If no admin found, try regular user
      if (!endpoint) {
        try {
          const checkUser = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/api/user/forgot-password`,
            { email }
          );
          if (checkUser.status === 200) {
            endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/user/forgot-password`;
          }
        } catch (userError) {
          console.warn("User email not found, checking department user...");
        }
      }

      // If no admin or regular user found, try department user
      if (!endpoint) {
        endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/deptUser/forgot-password`;
      }

      // Send forgot password request
      const response = await axios.post(endpoint, { email });

      if (response.status === 200) {
        setMessage("Check your email for password reset instructions.");
        setEmail("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process request.");
    }
  };

  return (
    <>
      <section className="auth forgot-password-page bg-base d-flex flex-wrap">
        <div className="auth-left d-lg-block d-none">
          <div className="d-flex align-items-center flex-column h-100 justify-content-center">
            <img src={Login_Banner} alt="Forgot_Banner" />
          </div>
        </div>
        <div className="auth-right py-32 px-24 d-flex flex-column justify-content-center">
          <div className="max-w-464-px mx-auto w-100">
            <div>
              <h4 className="mb-12">Forgot Password</h4>
              <p className="mb-32 text-secondary-light text-lg">
                Enter the email address associated with your account and we will
                send you a link to reset your password.
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              {message && <p className="text-success">{message}</p>}
              {error && <p className="text-danger">{error}</p>}
              <div className="icon-field">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="mage:email" />
                </span>
                <input
                  type="email"
                  className="form-control h-56-px bg-neutral-50 radius-12"
                  placeholder="Enter Email"
                  value={email}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32"
              >
                Continue
              </button>
              <div className="text-center">
                <Link to="/sign-in" className="text-primary-600 fw-bold mt-24">
                  Back to Sign In
                </Link>
              </div>
              {/* <div className="mt-120 text-center text-sm">
                <p className="mb-0">
                  Already have an account?{" "}
                  <Link to="/sign-in" className="text-primary-600 fw-semibold">
                    Sign In
                  </Link>
                </p>
              </div> */}
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default ForgotPasswordLayer;
