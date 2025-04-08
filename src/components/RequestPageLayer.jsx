import {
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { Icon, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Modal, ModalBody } from "reactstrap";
import { Link } from "react-router-dom";

const RequestPageLayer = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchForms();

    const interval = setInterval(() => {
      fetchForms();
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  const handleRefresh = () => {
    fetchForms();
  };
  const fetchForms = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem("companyId");
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/allForms/?companyId=${companyId}`
      );
      const data = await response.json();
      const currentTime = new Date(); // Get the current time

      // const startOfDay = new Date();
      // startOfDay.setHours(0, 0, 0, 0);

      // const endOfDay = new Date();
      // endOfDay.setHours(23, 59, 59, 999);

      const filteredForms = data.forms
        .filter((form) => {
          // Convert timeTo to a valid Date object
          const visitingEndTime = new Date(`${form.date}T${form.timeTo}`);
          return (
            form.status === "Pending" && visitingEndTime >= currentTime // Only show records that haven't expired
            // new Date(form.createdAt) >= startOfDay &&
            // new Date(form.createdAt) <= endOfDay
          );
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setForms(filteredForms);
    } catch (error) {
      console.error("Error fetching forms:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (formId, status) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/statusUpdate/${formId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        fetchForms();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

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

  const handleConfirmAction = () => {
    updateStatus(selectedFormId, selectedAction);
    setShowModal(false);
    setSelectedFormId(null);
  };

  const openModal = (photo) => {
    setSelectedPhoto(photo);
    setModalShow(true);
  };

  return (
    <div className="card radius-16 mt-24">
      <div className="card-header d-flex align-items-center flex-wrap gap-2 justify-content-between">
        <h6 className="mb-2 fw-bold text-lg mb-0">New Request Details</h6>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <RefreshIcon onClick={handleRefresh} className="cursor-pointer" />
          <Link
            className="text-primary-600 hover-text-primary d-flex align-items-center gap-1"
            to="/all-users-list"
          >
            View All
          </Link>
        </div>
      </div>
      <div className="card-body">
        <div className="table-responsive scroll-sm">
          {loading ? (
            <div className="d-flex justify-content-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <table className="table bordered-table sm-table mb-0">
              <thead>
                <tr>
                  <th>Image</th>
                  <th className="text-center">Name</th>
                  {/* <th className="text-center">Email</th> */}
                  {/* <th className="text-center">Phone</th> */}
                  <th className="text-center">Department</th>
                  <th className="text-center">Person To Meet</th>
                  <th className="text-center">Visiting Date</th>
                  <th className="text-center">Timing</th>
                  {/* <th className="text-center">Entered By</th> */}
                  <th className="text-center">Reason</th>
                  <th className="text-center">File</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {forms.length > 0 ? (
                  forms.map((user, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={user.profilePhoto}
                            alt="Profile"
                            className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                            style={{ cursor: "pointer" }}
                            onClick={() => openModal(user.profilePhoto)}
                          />
                        </div>
                      </td>
                      <td className="text-center">{user.name}</td>
                      {/* <td className="text-center">{user.email}</td>
                      <td className="text-center">+91 {user.phone}</td> */}
                      <td className="text-center">{(user.department?.name).toUpperCase()}</td>
                      <td className="text-center">{user.personToMeet?.name}</td>
                      <td className="text-center">{user.date}</td>
                      <td className="text-center">
                        {formatTime(user.timeFrom)} - {formatTime(user.timeTo)}
                      </td>
                      {/* <td className="text-center">{user.gate}</td> */}
                      <td className="text-center">{user.reason}</td>
                      <td className="text-center">
                        {user.file ? (
                          <a
                            href={user.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-primary"
                          >
                            View Document
                          </a>
                        ) : (
                          "No File"
                        )}
                      </td>
                      <td className="text-center">
                        <button
                          className="px-3 py-1 rounded-pill text-sm fw-medium mx-1 bg-success-focus text-success-main"
                          onClick={() => {
                            setSelectedAction("Approved");
                            setSelectedFormId(user._id);
                            setShowModal(true);
                          }}
                        >
                          Approve
                        </button>
                        <button
                          className="px-3 py-1 rounded-pill text-sm fw-medium mx-1 bg-danger-focus text-danger-main"
                          onClick={() => {
                            setSelectedAction("Rejected");
                            setSelectedFormId(user._id);
                            setShowModal(true);
                          }}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="text-center">
                      No requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {/* Modal for Profile Photo */}
        <Modal isOpen={modalShow} toggle={() => setModalShow(false)} centered>
          <ModalBody
            className="position-relative text-center"
          >
            {/* Close Icon in Top-Right */}
            <IconButton
              onClick={() => setModalShow(false)}
              className="position-absolute"
              style={{ top: 10, right: 10 }}
            >
              <CloseIcon />
            </IconButton>

            {/* Profile Photo */}
            {selectedPhoto && (
              <img
                src={selectedPhoto}
                alt="Profile"
                className="img-fluid rounded"
                
              />
            )}
          </ModalBody>
        </Modal>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1050,
          }}
        >
          <div
            className="modal-container"
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
              padding: "20px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <div className="modal-header d-flex justify-content-between align-items-center">
              <h5 className="modal-title">Confirm Action</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to {selectedAction} this form?</p>
            </div>
            <div className="modal-footer d-flex justify-content-center gap-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmAction}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestPageLayer;
