import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Html5QrcodeScanner } from "html5-qrcode";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

const ScanningPageLayer = () => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [barcodeToConfirm, setBarcodeToConfirm] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const [showModal, setShowModal] = useState(false);

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  // API call function to send the barcode ID
  const handleScan = async (barcodeId) => {
    try {
      const checkResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/check-scan?barcodeId=${barcodeId}`
      );

      if (checkResponse.data.alreadyScanned) {
        setBarcodeToConfirm(barcodeId);
        setOpenConfirmDialog(true);
        return;
      }

      processScan(barcodeId);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to connect to the server."
      );
      setOpen(true);
      setTimeout(() => {
        navigate(-1);
      }, 4000);
    }
  };

  // Function to process scan after confirmation
  const processScan = async (barcodeId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/scan?barcodeId=${barcodeId}`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        setSuccessMessage("Scan Successful!");
        setOpen(true);
        setTimeout(() => {
          navigate(-1);
        }, 1000);
      } else if (response.status === 201) {
        setUserDetails(response.data.userDetails);
        setShowModal(true);
      } else {
        setErrorMessage(response.data.message || "An error occurred.");
        setOpen(true);
        setTimeout(() => {
          navigate(-1);
        }, 4000);
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to connect to the server."
      );
      setOpen(true);
      setTimeout(() => {
        navigate(-1);
      }, 4000);
    }
  };

  const handleSecurityApproval = async (approved, barcodeId) => {
    if (approved) {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/scan?barcodeId=${barcodeId}`,
        { securityApproval: true }
      );
      if (response.status === 200) {
        setSuccessMessage("Entry time overridden!");
        setOpen(true);
        setTimeout(() => {
          navigate(-1);
        }, 1000);
      }
    } else {
      setErrorMessage("Entry denied. Please try again later.");
    }
    setShowModal(false);
  };

  useEffect(() => {
    let scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 300, height: 300 },
    });

    scanner.render(
      (decodedText) => {
        handleScan(decodedText);
        scanner.clear().catch(console.error);
      },
      (errorMessage) => {
        console.log("⚠️ QR Code Error:", errorMessage);
      }
    );

    return () => {
      scanner?.clear().catch(console.error);
    };
  }, [navigate]);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => {
          window.history.length > 1 ? navigate(-1) : navigate("/scan");
        }}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          background: "rgba(255, 255, 255, 0.2)",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "white",
          zIndex: 1000,
        }}
      >
        <ArrowBackIcon fontSize="large" />
      </button>

      {/* Scanner Box */}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div id="reader" style={{ width: "100%" }}></div>
      </div>

      {/* Snackbar Alert for Success/Error Messages */}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={errorMessage ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {errorMessage || successMessage}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>Confirm Exit Time</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to update the exit time?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenConfirmDialog(false);
              navigate(-1);
            }}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setOpenConfirmDialog(false);
              processScan(barcodeToConfirm);
            }}
            color="primary"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Accept & Reject Dialog */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle style={{ textAlign: "center" }}>
          Manual Verification
        </DialogTitle>
        <DialogContent
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Profile Photo */}
          <img
            src={userDetails?.photo}
            alt="Profile"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              marginBottom: "10px",
            }}
          />

          {/* Name and Email */}
          <DialogContentText>
            <strong>Name:</strong> {userDetails?.name}
          </DialogContentText>
          <DialogContentText>
            <strong>Date:</strong> {userDetails?.date}
          </DialogContentText>
          <DialogContentText>
            <strong>Timings:</strong> {formatTime(userDetails?.timeFrom)} -{" "}
            {formatTime(userDetails?.timeTo)}
          </DialogContentText>

          {/* Approve and Reject Buttons */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            <Button
              variant="contained"
              color="success"
              onClick={() =>
                handleSecurityApproval(true, userDetails.barcodeId)
              }
            >
              Approve
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleSecurityApproval(false);
                navigate(-1);
              }}
            >
              Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScanningPageLayer;
