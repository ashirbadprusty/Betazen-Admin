import { Icon } from "@iconify/react/dist/iconify.js";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import CreateUserPageLayer from "../components/CreateUserPageLayer.jsx"; // Ensure the correct import
import { Input } from "reactstrap";
import axios from "axios";
const DeptUserPageLayer = () => {
  const [forms, setForms] = useState([]);
  const [departments, setDepartments] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [bulkModal, setBulkModal] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 15;
  const adminId = localStorage.getItem("adminId");

  useEffect(() => {
    fetchForms();
    fetchDepartments();
  }, []);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/deptUser/?adminId=${adminId}`
      );
      const data = await response.json();
      setForms(data.deptUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/department/?adminId=${adminId}`
      );
      const data = await response.json();
      const deptMap = {};
      data.forEach((dept) => {
        deptMap[dept._id] = dept.name;
      });

      setDepartments(deptMap);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/deptUser/${userId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();
      if (response.ok) {
        alert("User deleted successfully!");
        fetchForms(); // Refresh data after deletion
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleConfirmDelete = () => {
    deleteUser(selectedFormId);
    setShowModal(false);
    setSelectedFormId(null);
  };

  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
      "application/vnd.ms-excel", 
    ];

    if (file && allowedTypes.includes(file.type)) {
      setSelectedFile(file);
    } else {
      alert("Please upload a valid Excel file (.xls or .xlsx)");
      e.target.value = null; 
    }
  };
  const handleUpload = async () => {
    if (!selectedFile) {
      return alert("Please select a file first!");
    }
  
    const formData = new FormData();
    formData.append("file", selectedFile);
  
    const token = localStorage.getItem("adminToken"); 
  
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/deptUser/bulk-upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, 
          },
        }
      );
  
      if (response.data.success) {
        alert(response.data.message);
  
        if (response.data.failed?.length) {
          const failedInfo = response.data.failed
            .map((f) => `${f.email} - ${f.reason}`)
            .join("\n");
  
          alert(`Some entries failed:\n${failedInfo}`);
        }
  
        setBulkModal(false);
        setSelectedFile(null);
        fetchForms();
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.response?.data?.message || "Upload failed");
    }
  };
  

  // Pagination Logic
  // Pagination logic for the displayed list
  const totalPages = Math.ceil(forms.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentDisplayedUsers = forms.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  return (
    <div className="card radius-16 mt-24">
      <div className="card-header d-flex align-items-center flex-wrap gap-2 justify-content-between">
        <h6 className="mb-2 fw-bold text-lg mb-0">Employees</h6>
        <section className="d-flex gap-4">
          <Button
            variant="outlined"
            color="success"
            onClick={() => setBulkModal(true)}
          >
            Bulk Upload
          </Button>
          <button
            className="btn btn-primary"
            onClick={() => setOpenModal(true)}
          >
            Create Employee
          </button>
        </section>
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
            <>
              <table className="table bordered-table sm-table mb-0">
                <thead>
                  <tr>
                    <th className="text-center">SN</th>
                    <th className="text-center">Name</th>
                    <th className="text-center">Email</th>
                    <th className="text-center">Department</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDisplayedUsers.length > 0 ? (
                    currentDisplayedUsers.map((user, index) => (
                      <tr key={user._id}>
                        <td className="text-center">
                          {indexOfFirstRecord + index + 1}
                        </td>
                        <td className="text-center">{user.name}</td>
                        <td className="text-center">{user.email}</td>
                        <td className="text-center">
                          {departments[user.dept]?.toUpperCase()}
                        </td>{" "}
                        <td className="text-center">
                          <button
                            className="px-3 py-1 rounded-pill text-sm fw-medium mx-1 bg-danger-focus text-danger-main"
                            onClick={() => {
                              setSelectedFormId(user._id);
                              setShowModal(true);
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {currentDisplayedUsers.length > 0 && (
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24">
                  <span>
                    Showing {indexOfFirstRecord + 1} to{" "}
                    {Math.min(indexOfLastRecord, forms.length)} of{" "}
                    {forms.length} entries
                  </span>
                  <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
                    <li className="page-item">
                      <button
                        className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px text-md"
                        onClick={() => setCurrentPage(currentPage - 1)}
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
                          onClick={() => setCurrentPage(num + 1)}
                        >
                          {num + 1}
                        </button>
                      </li>
                    ))}
                    <li className="page-item">
                      <button
                        className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px text-md"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <Icon icon="ep:d-arrow-right" />
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
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
              <h5 className="modal-title">Confirm Delete</h5>
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
              <p>Are you sure you want to delete this user?</p>
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
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Creating Employee */}
      <Dialog
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          fetchForms();
        }}
        maxWidth="sm"
        fullWidth
      >
        <IconButton
          aria-label="close"
          onClick={() => {
            setOpenModal(false);
            fetchForms();
          }}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent>
          <CreateUserPageLayer onUserCreated={fetchForms} />
        </DialogContent>
      </Dialog>

      {/* Modal for upload excel file */}
      <Dialog
        open={bulkModal}
        onClose={() => setBulkModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Upload Excel File</DialogTitle>
        <DialogContent>
          <Typography variant="body1" align="center" gutterBottom>
            Upload a .xls or .xlsx file
          </Typography>
          <Input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
          <Box mt={2} textAlign="center">
            <Button
              variant="contained"
              color="success"
              onClick={handleUpload}
              disabled={!selectedFile}
            >
              Upload
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeptUserPageLayer;
