import { Icon } from "@iconify/react/dist/iconify.js";
import { Close as CloseIcon } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Modal, ModalBody } from "reactstrap";

const ScannedUserListLayer = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [photoModalShow, setPhotoModalShow] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [filterOption, setFilterOption] = useState("All"); // Default filter option
  const recordsPerPage = 15;

  // Fetch all scanned users
  const fetchUsers = async () => {
    try {
      const companyId = localStorage.getItem("companyId");
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/getAllScannedData/?companyId=${companyId}`
      );
      if (response.status === 200) {
        const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

        // Filter users to include only today's records
        const todaysUsers = response.data.data.filter((user) => {
          const scannedDate = new Date(user.scannedAt)
            .toISOString()
            .split("T")[0];
          return scannedDate === today;
        });

        const sortedUsers = todaysUsers.sort(
          (a, b) => new Date(b.scannedAt) - new Date(a.scannedAt)
        );

        setUsers(sortedUsers);
        setFilteredUsers(sortedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter logic when filter option changes
  useEffect(() => {
    if (filterOption === "All") {
      setFilteredUsers(users);
    } else if (filterOption === "Exit") {
      setFilteredUsers(users.filter((user) => user.exitTime));
    } else if (filterOption === "Not-Exit") {
      setFilteredUsers(users.filter((user) => !user.exitTime));
    }
  }, [filterOption, users]);

  const displayedUsers = filteredUsers || users;

  // Pagination logic for the displayed list
  const totalPages = Math.ceil(displayedUsers.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentDisplayedUsers = displayedUsers.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo);
    setPhotoModalShow(true);
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-body p-24">
        <div className="d-flex mb-3 justify-content-between align-items-center">
          <select
            className="form-select w-auto"
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
          >
            <option value="All">All Records</option>
            <option value="Exit">Exit</option>
            <option value="Not-Exit">Not Exited</option>
          </select>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-5">
            <h4>No records found</h4>
            <p>There are no users to display at the moment.</p>
          </div>
        ) : (
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
                {currentDisplayedUsers.map((user, index) => (
                  <tr key={user.barcodeId}>
                    <td className="text-center">
                      {indexOfFirstRecord + index + 1}
                    </td>
                    <td className="text-center">
                      <img
                        src={user.scannedData.profilePhoto}
                        alt="Profile"
                        className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          openPhotoModal(user.scannedData.profilePhoto)
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
                        ? new Date(user.entryTime).toLocaleTimeString()
                        : "--"}
                    </td>
                    <td className="text-center">
                      {user.exitTime
                        ? new Date(user.exitTime).toLocaleTimeString()
                        : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {users.length > 0 && (
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24">
            <span>
              Showing {indexOfFirstRecord + 1} to{" "}
              {Math.min(indexOfLastRecord, users.length)} of {users.length}{" "}
              entries
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
        {/* Modal for Profile Photo */}
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
                alt="Profile Preview"
                className="img-fluid rounded"
              />
            )}
          </ModalBody>
        </Modal>
      </div>
    </div>
  );
};

export default ScannedUserListLayer;
