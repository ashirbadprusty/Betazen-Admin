import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect, useState } from "react";
import { Modal, ModalBody } from "reactstrap";
import { Close as CloseIcon } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import moment from "moment";

const AllUserListLayer = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const recordsPerPage = 15;

  useEffect(() => {
    fetchForms();
  }, []);
  useEffect(() => {
    filterForms();
  }, [statusFilter, forms]);

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

  const fetchForms = async () => {
    try {
      const companyId=localStorage.getItem("companyId");
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/allForms/?companyId=${companyId}`
      );
      const data = await response.json();
      const sortedForms = data.forms.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setForms(sortedForms);
    } catch (error) {
      console.error("Error fetching forms:", error);
    }
  };

  const filterForms = () => {
    let filtered = [...forms]; // Make a copy of the original list
    const currentTime = moment(); // Get the current time

    // Step 1: First, always apply the date filter if a date is selected
    if (selectedDate) {
      filtered = filtered.filter((form) => form.date === selectedDate);
    }

    // Step 2: Apply status filters
    if (statusFilter === "Pending") {
      filtered = filtered.filter((form) => {
        if (!form.date || !form.timeTo) return false; // Skip invalid data

        const visitEndTime = moment(
          `${form.date} ${form.timeTo}`,
          "YYYY-MM-DD HH:mm"
        );

        return form.status === "Pending" && currentTime.isBefore(visitEndTime);
      });
    } else if (statusFilter === "Expired") {
      filtered = filtered.filter((form) => {
        if (!form.date || !form.timeTo || form.status !== "Pending")
          return false;

        const visitEndTime = moment(
          `${form.date} ${form.timeTo}`,
          "YYYY-MM-DD HH:mm"
        );

        return currentTime.isAfter(visitEndTime); // Expired if timeTo has passed
      });
    } else if (statusFilter && statusFilter !== "All") {
      filtered = filtered.filter((form) => form.status === statusFilter);
    }

    // Step 3: If "All" is selected, reset the date and show all records
    if (statusFilter === "All") {
      setSelectedDate(""); // Reset the date input
      filtered = [...forms]; // Show all records
    }

    setFilteredForms(filtered);
  };

  const totalPages = Math.ceil(filteredForms.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentUsers = filteredForms.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
      <div className="card-body">
        <div className="d-flex mb-3 justify-content-between align-items-center">
          {/* Status Filter Dropdown */}
          <select
            className="form-select w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Records</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>

          {/* Date Input */}
          <input
            type="date"
            className="form-control w-auto"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {filteredForms.length === 0 ? (
          <div className="text-center py-5">
            <h4>No records found</h4>
            <p>There are no forms to display at the moment.</p>
          </div>
        ) : (
          <div className="table-responsive scroll-sm">
            <table className="table bordered-table sm-table mb-0">
              <thead>
                <tr>
                  <th>SN.</th>
                  <th>Image</th>
                  <th className="text-center">Name</th>
                  <th className="text-center">Department</th>
                  <th className="text-center">Person To Meet</th>
                  <th className="text-center">Visiting Date</th>
                  <th className="text-center">Timings</th>
                  {/* <th className="text-center">Entered By</th> */}
                  <th className="text-center">Reason</th>
                  <th className="text-center">File</th>
                  <th className="text-center ">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, index) => {
                  const visitEndTime = moment(
                    `${user.date} ${user.timeTo}`,
                    "YYYY-MM-DD HH:mm"
                  );
                  const isExpired =
                    moment().isAfter(visitEndTime) && user.status === "Pending";

                  return (
                    <tr key={index}>
                      <td className="text-center">
                        {indexOfFirstRecord + index + 1}
                      </td>
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
                        <div className="d-flex justify-content-center align-items-center gap-2">
                          {isExpired ? (
                            <div className="px-3 py-1 rounded-pill text-sm fw-medium bg-gray-500 text-black border border-gray-600 shadow-sm cursor-not-allowed">
                              Expired
                            </div>
                          ) : (
                            <>
                              <button
                                className={`px-3 py-1 rounded-pill text-sm fw-medium border shadow-sm ${
                                  user.status === "Approved"
                                    ? "bg-success text-white border-success"
                                    : "bg-success-focus text-success-main border-success-focus"
                                }`}
                                onClick={() => {
                                  setSelectedAction("Approved");
                                  setSelectedFormId(user._id);
                                  setShowModal(true);
                                }}
                                disabled={
                                  user.status === "Approved" ||
                                  user.status === "Rejected" ||
                                  isExpired
                                }
                              >
                                {user.status === "Approved"
                                  ? "Approved"
                                  : "Approve"}
                              </button>
                              <button
                                className={`px-3 py-1 rounded-pill text-sm fw-medium border shadow-sm ${
                                  user.status === "Rejected"
                                    ? "bg-danger text-white border-danger"
                                    : "bg-danger-focus text-danger-main border-danger-focus"
                                }`}
                                onClick={() => {
                                  setSelectedAction("Rejected");
                                  setSelectedFormId(user._id);
                                  setShowModal(true);
                                }}
                                disabled={
                                  user.status === "Approved" ||
                                  user.status === "Rejected" ||
                                  isExpired
                                }
                              >
                                {user.status === "Rejected"
                                  ? "Rejected"
                                  : "Reject"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {forms.length > 0 && (
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24">
            <span>
              Showing {indexOfFirstRecord + 1} to{" "}
              {Math.min(indexOfLastRecord, forms.length)} of {forms.length}{" "}
              entries
            </span>
            <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
              <li className="page-item">
                <button
                  className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px text-md"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <Icon icon="ep:d-arrow-left" />
                </button>
              </li>
              {[...Array(totalPages).keys()].map((num) => (
                <li className="page-item" key={num + 1}>
                  <button
                    className={`page-link ${
                      currentPage === num + 1
                        ? "bg-primary-600 text-white"
                        : "bg-neutral-200 text-secondary-light"
                    } fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md`}
                    onClick={() => handlePageChange(num + 1)}
                  >
                    {num + 1}
                  </button>
                </li>
              ))}
              <li className="page-item">
                <button
                  className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px text-md"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <Icon icon="ep:d-arrow-right" />
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* Modal for Profile Photo */}
        <Modal isOpen={modalShow} toggle={() => setModalShow(false)} centered>
          <ModalBody className="position-relative text-center">
            <IconButton
              onClick={() => setModalShow(false)}
              className="position-absolute"
              style={{ top: 10, right: 10 }}
            >
              <CloseIcon />
            </IconButton>

            {selectedPhoto && (
              <img
                src={selectedPhoto}
                alt="Profile Preview"
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

export default AllUserListLayer;
