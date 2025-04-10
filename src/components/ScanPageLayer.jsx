import React, { useState, useEffect } from "react";
import axios from "axios";
import { Close as CloseIcon } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { ModalBody, Modal } from "reactstrap";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

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

const cardData = [
  {
    title: "Total Users",
    count: 0,
    bg: "bg-cyan",
    icon: "fluent:people-20-filled",
  },
  {
    title: "Total Entry",
    count: 0,
    bg: "bg-success",
    icon: "fluent:people-20-filled",
  },
  {
    title: "Total Exit",
    count: 0,
    bg: "bg-danger",
    icon: "fluent:people-20-filled",
  },
];

const ScanPageLayer = () => {
  const [barcodeId, setBarcodeId] = useState("");
  const [users, setUsers] = useState([]);
  const [totalEntry, setTotalEntry] = useState(0);
  const [totalExit, setTotalExit] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 500);
  const [photoModalShow, setPhotoModalShow] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userDetails, setUserDetails] = useState({});
    const [alertMessage, setAlertMessage] = useState("");
    const [open, setOpen] = useState(false);
  const companyId=localStorage.getItem("companyId");

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 500);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  useEffect(() => {
      const checkLicenseStatus = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/admin/license-status`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`,
              },
            }
          );
  
          const data = await response.json();
          if (
            data.isTrial === false &&
            data.isExpired === true &&
            data.alertMessage != null
          ) {
            setOpen(true);
            setAlertMessage(data.alertMessage);
          }
        } catch (error) {
          console.error("Error checking license status:", error);
        }
      };
  
      checkLicenseStatus();
    }, []);
  

  const handleScanBarcode = async (scannedBarcode) => {
    if (!scannedBarcode) return;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/scan?barcodeId=${scannedBarcode}`
      );
      if (response.status === 201) {
        setUserDetails(response.data.userDetails);
        setShowModal(true);
      } else {
        alert("Scan Successful!");
        fetchLast5Records();
        fetchCounts();
        setBarcodeId("");
      }
    } catch (error) {
      console.error("Error scanning:", error);
      alert(
        error.response?.data?.message || "An error occurred while scanning."
      );
      setBarcodeId("");
      fetchLast5Records();
    }
  };

  const handleSecurityApproval = async (approved, barcodeId) => {
    if (approved) {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/scan?barcodeId=${barcodeId}`,
        { securityApproval: true }
      );
      if (response.status === 200) {
        alert("Entry time overridden!");
        setBarcodeId("");
      }
    } else {
      alert("Entry denied. Please try again later.");
      setBarcodeId("");
    }
    setShowModal(false);
  };
  const fetchLast5Records = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/last5records/?companyId=${companyId}`
      );
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching last 5 records:", error);
    }
  };

  const fetchCounts = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/entry-exit-count/?companyId=${companyId}`
      );
      setTotalEntry(response.data.data.totalEntries);
      setTotalExit(response.data.data.totalExits);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const fetchTotalUsers = async () => {
    try {

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/todayVistedUsers/?companyId=${companyId}`
      );
      console.log(response.data);

      setTotalUsers(response.data.data.todayVisitors);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  // Update cardData with dynamic counts
  const updatedCardData = cardData.map((item) => {
    if (item.title === "Total Entry") {
      item.count = totalEntry;
    } else if (item.title === "Total Exit") {
      item.count = totalExit;
    } else if (item.title === "Total Users") {
      item.count = totalUsers;
    }
    return item;
  });

  useEffect(() => {
    fetchLast5Records();
    fetchCounts();
    fetchTotalUsers();
  }, []);

  const openModal = (photo) => {
    setSelectedPhoto(photo);
    setPhotoModalShow(true);
  };

  return (
    <>

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

            <Button
              variant="contained"
              color="primary"
              // onClick={handleActivate}
              sx={{ mt: 2, width: "100%" }}
            >
              Activate License
            </Button>
          </Box>
        </Modal>
      </div>
      {/* Cards Displaying Employee & Security Count */}

      <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4 flex justify-content-center">
        {updatedCardData.map((item, index) => (
          <div className="col" key={index}>
            <div
              className={`card shadow-none border h-100 bg-gradient-start-${
                index + 1
              }`}
              onClick={() => navigate("/scanned-users-list")}
            >
              <div className="card-body p-20">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div>
                    <p className="fw-medium text-primary-light mb-1">
                      {item.title}
                    </p>
                    <h6 className="mb-0">{item.count}</h6>
                  </div>
                  <div
                    className={`w-50-px h-50-px ${item.bg} rounded-circle d-flex justify-content-center align-items-center`}
                  >
                    <Icon
                      icon={item.icon}
                      className="text-white text-2xl mb-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: "15vh" }}
      >
        <div className="col-md-6 col-10">
          <input
            type="text"
            value={barcodeId}
            onChange={(e) => setBarcodeId(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && handleScanBarcode(e.target.value.trim())
            }
            className="form-control text-center shadow-lg"
            placeholder="🔍 Scan Here"
            required
            style={{
              padding: "12px",
              fontSize: "1.2rem",
              borderRadius: "8px",
              border: "2px solid #007bff",
              outline: "none",
              transition: "all 0.3s ease-in-out",
            }}
          />
        </div>
      </div>

      <div
        className="card h-100 p-0 radius-12"
        style={{ minHeight: isSmallScreen ? "80vh" : "auto" }}
      >
        <div className="card-body p-24">
          <div className="table-responsive scroll-sm">
            <table className="table bordered-table sm-table mb-0">
              <thead>
                <tr>
                  <th className="text-center">SN.</th>
                  <th className="text-center">Image</th>
                  <th className="text-center">Name</th>
                  <th className="text-center">Phone</th>
                  <th className="text-center">Department</th>
                  <th className="text-center">Person To Meet</th>
                  <th className="text-center">Reason</th>
                  <th className="text-center">Date</th>
                  <th className="text-center">Entry Time</th>
                  <th className="text-center">Exit Time</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={index}>
                      <td className="text-center">{index + 1}</td>
                      <td className="text-center">
                        <img
                          src={user.scannedData.profilePhoto}
                          alt="Profile"
                          className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            openModal(user.scannedData.profilePhoto)
                          }
                        />
                      </td>
                      <td className="text-center">{user.scannedData.name}</td>
                      <td className="text-center">
                        +91 {user.scannedData.phone}
                      </td>
                      <td className="text-center">{(user.department).toUpperCase()}</td>
                      <td className="text-center">{user.personToMeet}</td>
                      <td className="text-center">{user.scannedData.reason}</td>
                      <td className="text-center">
                        {new Date(user.scannedAt).toLocaleDateString()}
                      </td>
                      <td className="text-center">
                        {user.entryTime
                          ? new Date(user.scannedAt).toLocaleTimeString()
                          : "--"}
                      </td>
                      <td className="text-center">
                        {user.exitTime
                          ? new Date(user.exitTime).toLocaleTimeString()
                          : "--"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center">
                      No scanned records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Modal
            isOpen={photoModalShow}
            toggle={() => setPhotoModalShow(false)}
            centered
          >
            <ModalBody className="position-relative text-center">
              <IconButton
                onClick={() => setPhotoModalShow(false)}
                className="position-absolute"
                style={{ top: 10, right: 10 }}
              >
                <CloseIcon />
              </IconButton>
              {selectedPhoto && (
                <img
                  src={selectedPhoto}
                  alt="Profile"
                  className="img-fluid rounded"
                />
              )}
            </ModalBody>
          </Modal>

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
                  }}
                >
                  Reject
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default ScanPageLayer;
