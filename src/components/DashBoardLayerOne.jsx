import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import SalesStatisticOne from "./child/SalesStatisticOne";
import TotalSubscriberOne from "./child/TotalSubscriberOne";
import UnitCountOne from "./child/UnitCountOne";
import UsersOverviewOne from "./child/UsersOverviewOne";
import RequestPageLayer from "./RequestPageLayer";
import { FaRegClipboard } from "react-icons/fa";
import axios from "axios";
// import HourlyChart from "./child/HourlyChart";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const DashBoardLayerOne = () => {
  const [showModal, setShowModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [visitorURL, setVisitorURL] = useState("");

  useEffect(() => {
    const fetchVisitorURL = async () => {
      try {
        const adminId = localStorage.getItem("adminId");
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/admin/visitor-url/${adminId}`
        );
        console.log(response);

        setVisitorURL(response.data.visitorRegisterURL);
      } catch (error) {
        console.error(
          "Error fetching visitor registration URL:",
          error.response?.data?.error || error.message
        );
        return null;
      }
    };
    fetchVisitorURL();
  }, []);

  useEffect(() => {
    const checkLicenseStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/admin/license-status`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );

        const data = await response.json();
        if (data.isTrial === true && data.alertMessage != null) {
          setShowModal(true);
          setAlertMessage(data.alertMessage);
        } else if (
          data.isTrial === false &&
          data.isExpired === true &&
          data.alertMessage != null
        ) {
          setOpen(true);
          setAlertMessage(data.alertMessage);
        } else if (
          data.isTrial === false &&
          data.isExpired === false &&
          data.alertMessage != null
        ) {
          setShowModal(true);
          setAlertMessage(data.alertMessage);
        }
      } catch (error) {
        console.error("Error checking license status:", error);
      }
    };

    checkLicenseStatus();
  }, []);

  const handleActivate = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/admin/activate-license`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ licenseKey }),
      }
    );

    const data = await response.json();
    if (data.success) {
      setLicenseKey("");
      // eslint-disable-next-line no-undef
      // checkLicenseStatus();
      window.location.reload();
    } else {
      alert(data.message);
    }
  };

  return (
    <>
      <div className="relative">
        {showModal && (
          <div
            className="p-6 rounded-lg shadow-2xl text-center w-full max-w-md relative "
            style={{
              backgroundColor: "#FFBBBB",
              borderRadius: "10px",
              marginBottom: "20px",
              display: "block",
            }}
          >
            <button
              style={{
                float: "right",
                marginRight: "10px",
              }}
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-red-700 hover:text-red-900 text-xl font-bold "
            >
              ✖
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-4">
              🔒 Warning Message
            </h2>
            <p className="text-red-600 text-md mt-4 mb-4">{alertMessage}</p>
          </div>
        )}
        {visitorURL ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
              fontSize: "18px",
              background: "#f1f5f9",
              padding: "10px 16px",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
              maxWidth: "fit-content",
            }}
          >
            <a
              href={visitorURL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#2563eb",
                textDecoration: "underline",
                fontWeight: "500",
              }}
            >
              Visitor URL
            </a>

            <FaRegClipboard
              style={{
                cursor: "pointer",
                color: "#374151",
                transition: "color 0.2s",
              }}
              title="Copy to clipboard"
              onClick={() => {
                navigator.clipboard.writeText(visitorURL);
                alert("Visitor URL copied to clipboard");
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#2563eb")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
            />
          </div>
        ) : (
          <p style={{ color: "#555", fontSize: "16px" }}>
            Loading visitor registration URL...
          </p>
        )}
        <div>
          <Modal
            open={open}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h5">
                🔒 Access Blocked
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                {alertMessage}
              </Typography>
              <TextField
                variant="outlined"
                label="License Key"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                fullWidth
                className="mt-20"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleActivate}
                sx={{ mt: 2, width: "100%" }}
              >
                Activate License
              </Button>
            </Box>
          </Modal>
        </div>
        {/* UnitCountOne */}
        <UnitCountOne />
        {/* Payment History */}
        <RequestPageLayer />
        <section className="row gy-4 mt-1">
          {/* SalesStatisticOne */}
          <div className="col-12">
            <SalesStatisticOne />
          </div>

          <div className="col-lg-6 col-12">
            <TotalSubscriberOne />
          </div>
          {/* TotalSubscriberOne */}

          <div className="col-lg-6 col-12">
            <UsersOverviewOne />
          </div>
          {/* UsersOverviewOne */}

          {/* Hourly Chart */}
          {/* <HourlyChart/> */}
        </section>
      </div>
    </>
  );
};

export default DashBoardLayerOne;
