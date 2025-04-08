import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from "@mui/material";

const DepartmentPageLayer = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [newDeptName, setNewDeptName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const adminId = localStorage.getItem("adminId");
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/department/?adminId=${adminId}`
      );
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (deptId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/department/${deptId}`,
        {
          method: "DELETE",
        }
      );
      const result = await response.json();
      if (response.ok) {
        alert("Department deleted successfully!");
        fetchDepartments();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error deleting department:", error);
    }
  };

  const createDepartment = async () => {
    if (!newDeptName.trim()) return alert("Department name cannot be empty");
    const adminId = localStorage.getItem("adminId");
    if (!adminId) {
      alert("Admin authentication required.");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/department/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newDeptName, adminId: adminId }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        alert("Department created successfully!");
        setNewDeptName("");
        setShowCreateModal(false);
        fetchDepartments();
      } else {
        alert(result.message);
        setNewDeptName("");
      }
    } catch (error) {
      console.error("Error creating department:", error);
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const totalPages = Math.ceil(departments.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentDisplayedDepartments = departments.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  return (
    <div className="card radius-16 mt-24">
      <div className="card-header d-flex align-items-center flex-wrap gap-2 justify-content-between">
        <h6 className="mb-2 fw-bold text-lg mb-0">Departments</h6>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Add Department
        </button>
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
                    <th className="text-center">Department Name</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDisplayedDepartments.length > 0 ? (
                    currentDisplayedDepartments.map((dept, index) => (
                      <tr key={dept._id}>
                        <td className="text-center">
                          {indexOfFirstRecord + index + 1}
                        </td>
                        <td className="text-center">{(dept.name).toUpperCase()}</td>
                        <td className="text-center">
                          <button
                            className="px-3 py-1 rounded-pill text-sm fw-medium mx-1 bg-danger-focus text-danger-main"
                            onClick={() => {
                              setSelectedDeptId(dept._id);
                              setShowDeleteModal(true);
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">
                        No departments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {departments.length > 0 && (
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3">
                  <span>
                    Showing {indexOfFirstRecord + 1} to{" "}
                    {Math.min(indexOfLastRecord, departments.length)} of{" "}
                    {departments.length} entries
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
            </>
          )}
        </div>
      </div>
      {/* Create Department Modal */}
      <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} fullWidth maxWidth="sm" >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontSize: "1rem" }}>
            Create Department
          </Typography>
        </DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Department Name"
            fullWidth
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateModal(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={createDepartment}
            color="primary"
            variant="contained"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {showDeleteModal && (
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
            <h5 className="modal-title">Confirm Delete</h5>
            <p>Are you sure you want to delete this department?</p>
            <div className="d-flex justify-content-center gap-3">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  deleteDepartment(selectedDeptId);
                  setShowDeleteModal(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentPageLayer;
