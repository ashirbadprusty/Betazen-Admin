import { Icon } from "@iconify/react/dist/iconify.js";
import {
  Close as CloseIcon,
  GetApp as GetAppIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import axios from "axios";
import debounce from "lodash.debounce";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import * as XLSX from "xlsx";

const ScannedUserLayer = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [photoModalShow, setPhotoModalShow] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalShow, setUserModalShow] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const recordsPerPage = 15;

  // Fetch all scanned users
  const fetchUsers = async () => {
    const companyId = localStorage.getItem("companyId"); // Retrieve admin's CID

    if (!companyId) {
      console.error("CID not found. Please log in again.");
      return;
    }
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/getAllScannedData/?companyId=${companyId}`
      );
      if (response.status === 200) {
        const sortedUsers = response.data.data.sort(
          (a, b) => new Date(b.scannedAt) - new Date(a.scannedAt)
        );
        setUsers(sortedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  //Fetch Departments
  const fetchDepartments = async () => {
    try {
      const adminId = localStorage.getItem("adminId");
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/department/?adminId=${adminId}`
      );
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const handleDepartmentChange = (event) => {
    const department = event.target.value;
    setSelectedDepartment(department);

    const filtered = department
      ? users.filter((record) => record?.department === department)
      : users;

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset pagination
  };

  // Search function with debounce (delays API call)
  const handleSearch = debounce(async (query) => {
    const companyId = localStorage.getItem("companyId");
    if (!query.trim()) {
      // filterRecords();
      fetchUsers();
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/searchScannedUser?`,{
          params: {query,companyId}
        }
      );
      if (response.status === 200) {
        setUsers(
          response.data.users.sort(
            (a, b) => new Date(b.scannedAt) - new Date(a.scannedAt)
          )
        );
        // filterRecords(response.data.users);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setUsers([]);
    }
  }, 500);

  // Update search query and trigger search
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  // Handle date changes
  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);

  const handleChange = (event) => {
    setSelectedTimeRange(event.target.value);
  };

  // Filter records based on selected date range
  useEffect(() => {
    if (!startDate || !endDate) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter((record) => {
      // Convert record date to ISO format (YYYY-MM-DD)
      const recordDate = new Date(record.scannedAt).toISOString().split("T")[0];

      // Check if record falls within the date range
      if (recordDate < startDate || recordDate > endDate) return false;

      // If no time range is selected, return true (filter only by date)
      if (!selectedTimeRange) return true;

      // Extract the selected time range (e.g., "10AM - 11AM")
      const [startRange, endRange] = selectedTimeRange.split(" - ");

      // Convert record's entry and exit time to 12-hour format (e.g., "10AM")
      const entryTime = moment(record.entryTime).local().format("hA");
      const exitTime = moment(record.exitTime).local().format("hA");
      // Check if entryTime or exitTime falls within the selected time range
      return (
        moment(entryTime, "hA").isBetween(
          moment(startRange, "hA"),
          moment(endRange, "hA"),
          null,
          "[)"
        ) ||
        moment(exitTime, "hA").isBetween(
          moment(startRange, "hA"),
          moment(endRange, "hA"),
          null,
          "[)"
        )
      );
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [startDate, endDate, selectedTimeRange, users]);

  // Pagination logic remains the same
  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentDisplayedUsers = filteredUsers.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  // Reset filters
  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setSelectedTimeRange("");
    setFilteredUsers(users);
    setCurrentPage(1);
  };
  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo);
    setPhotoModalShow(true);
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setUserModalShow(true);
  };

  const exportToExcel = () => {
    if (users.length === 0) {
      alert("No data available to export.");
      return;
    }

    // Format data for Excel
    const formattedData = users.map((user, index) => ({
      SN: index + 1,
      ID: user._id,
      Barcode_ID: user.barcodeId,
      Name: user.scannedData?.name || "N/A",
      Email: user.scannedData?.email || "N/A",
      Phone: user.scannedData?.phone ? `+91 ${user.scannedData.phone}` : "N/A",
      Department: user.department || "N/A",
      "Person To Meet": user.personToMeet || "N/A",
      // "Entered By": user.scannedData?.gate || "N/A",
      Reason: user.scannedData?.reason || "N/A",
      Status: user.scannedData?.status || "N/A",
      "Profile Photo": user.scannedData?.profilePhoto || "N/A",
      File: user.scannedData?.file || "No File",
      QRCode: user.scannedData?.qrCode || "N/A",
      Scanned_At: user?.scannedAt
        ? new Date(user.scannedAt).toLocaleString()
        : "Not Scanned",
      Entry_Time: user?.entryTime
        ? new Date(user.entryTime).toLocaleString()
        : "Not Entered",
      Exit_Time: user?.exitTime
        ? new Date(user.exitTime).toLocaleString()
        : "Not Exited",
    }));

    // Create a worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(formattedData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Scanned Users");

    // Trigger download
    XLSX.writeFile(wb, "Scanned_Users.xlsx");
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-body p-24">
        {/* Search Bar (Auto Search) */}
        <div
          className="d-flex gap-4 mb-3"
          style={{
            justifyContent: "space-between",
          }}
        >
          <input
            type="text"
            placeholder="Search by name/Email/Phone"
            className="form-control "
            value={searchQuery}
            onChange={handleSearchInput}
            // style={{
            //   width: "25%",
            // }}
          />
          <select
            className="form-control w-25"
            defaultValue=""
            value={selectedDepartment}
            onChange={handleDepartmentChange}
          >
            <option value="" disabled>
              Select Department
            </option>
            {departments.map((dept, index) => (
              <option
                value={dept.name}
                key={index}
                style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                }}
              >
                {(dept.name).toUpperCase()}
              </option>
            ))}
          </select>

          <button className="btn btn-success mb-0" onClick={exportToExcel}>
            <GetAppIcon className="d-sm-none" />{" "}
            <span className="d-none d-sm-inline">Export</span>{" "}
          </button>
        </div>

        <style jsx>{`
          @media (max-width: 500px) {
            .d-flex {
              flex-direction: row;
              align-items: flex-start;
            }
            .form-control {
              width: 90% !important;
            }
            .btn {
              width: 40% !important;
            }
          }
        `}</style>

        <div>
          <div className="row g-2 mb-3 filter-row">
            <div className="col-6 col-md-3">
              <label>From Date</label>
              <input
                type="date"
                name="startDate"
                className="form-control"
                value={startDate}
                onChange={handleStartDateChange}
              />
            </div>
            <div className="col-6 col-md-3">
              <label>To Date</label>
              <input
                type="date"
                name="endDate"
                className="form-control"
                value={endDate}
                onChange={handleEndDateChange}
              />
            </div>
            <div className="col-6 col-md-3">
              <label>Select Time Range</label>
              <select
                className="form-select w-100"
                value={selectedTimeRange}
                onChange={handleChange}
              >
                <option value="" disabled selected>
                  Select Time Range
                </option>
                {Array.from({ length: 12 }, (_, i) => {
                  <option value="" disabled selected>
                    Select Time Range
                  </option>;
                  const startTime = moment()
                    .startOf("day")
                    .add(i + 8, "hours"); // Starts from 8 AM
                  const endTime = startTime.clone().add(1, "hour");
                  return (
                    <option
                      key={i}
                      value={`${startTime.format("hA")} - ${endTime.format(
                        "hA"
                      )}`}
                    >
                      {startTime.format("hA")} - {endTime.format("hA")}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="col-6 col-md-3">
              <label className="mb-1">Reset Button</label>
              <Button
                color="error"
                variant="contained"
                fullWidth
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          </div>
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
                  <th className="text-center">Email</th>
                  <th className="text-center">Phone</th>
                  <th className="text-center">Department</th>
                  <th className="text-center">Person To Meet</th>
                  <th className="text-center">Reason</th>
                  <th className="text-center">Visited Date</th>
                  <th className="text-center">Entry Time</th>
                  <th className="text-center">Exit Time</th>
                  <th className="text-center">Action</th>
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
                    <td className="text-center">{user.scannedData.email}</td>
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
                    <td
                      className="text-center cursor-pointer"
                      onClick={() => openUserModal(user)}
                    >
                      <VisibilityIcon />
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

        {/* User details modal */}
        <Modal
          isOpen={userModalShow}
          toggle={() => setUserModalShow(false)}
          centered
          size="lg"
        >
          <ModalHeader
            className="bg-neutral-600 p-10"
            toggle={() => setUserModalShow(false)}
          >
            <span className="text-white text-xl">Scanned User Details</span>
          </ModalHeader>
          <ModalBody
            style={{
              borderRadius: "10px",
            }}
          >
            {selectedUser ? (
              <Row>
                <Col>
                  <Card>
                    <CardBody>
                      <div className="d-flex">
                        <div className="flex-grow-1 align-self-center">
                          <div className="text-muted">
                            <Row>
                              <Col lg={6}>
                                <div className="flex-1 font-semibold">
                                  <h6 className="mb-1 text-lg">Name</h6>
                                  <p className="text-sm">
                                    {selectedUser.scannedData?.name}
                                  </p>
                                </div>

                                <div className="flex-1 font-semibold">
                                  <h6 className="mb-1 text-lg">Email</h6>
                                  <p
                                    className="text-sm"
                                    id="enrphotographeremail"
                                  >
                                    {selectedUser.scannedData?.email}
                                  </p>
                                </div>

                                <div className="flex-1 font-semibold">
                                  <h6 className="mb-1 text-lg">Phone</h6>
                                  <p
                                    className="text-sm"
                                    id="enrPhotographerMobNo"
                                  >
                                    +91 {selectedUser.scannedData.phone}
                                  </p>
                                </div>
                              </Col>

                              <Col lg={6}>
                                <div className="flex-1 font-semibold">
                                  <h6 className="mb-1 text-lg">Reason</h6>
                                  <p
                                    className="text-sm"
                                    id="enrPhotographerPlace"
                                  >
                                    {selectedUser.scannedData?.reason}
                                  </p>
                                </div>

                                <div className="flex-1 font-semibold">
                                  <h6 className="mb-1 text-lg">Department</h6>
                                  <p
                                    className="text-sm"
                                    id="enrPhotographerAddr"
                                  >
                                    {(selectedUser.department).toUpperCase()}
                                  </p>
                                </div>

                                <div className="flex-1 font-semibold">
                                  <h6 className="mb-1 text-lg">
                                    Person To Meet
                                  </h6>
                                  <p
                                    className="text-sm"
                                    id="enrPhotographerLinks"
                                  >
                                    {selectedUser.personToMeet}
                                  </p>
                                </div>
                              </Col>

                              <Col lg={6}>
                                <div className="flex-1 font-semibold">
                                  <h6 className="mb-1 text-lg">Date</h6>
                                  <p
                                    className="text-sm"
                                    id="enrPhotographerPswd"
                                  >
                                    {new Date(
                                      selectedUser.scannedAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>

                                <div className="flex-1 font-semibold">
                                  <h6 className="mb-1 text-lg">Exit Time</h6>
                                  <p
                                    className="text-sm"
                                    id="enrPhotographerPswd"
                                  >
                                    {selectedUser?.exitTime
                                      ? new Date(
                                          selectedUser.exitTime
                                        ).toLocaleTimeString()
                                      : "N/A"}
                                  </p>
                                </div>
                              </Col>
                              <Col lg={6}>
                                <div className="flex-1 font-semibold">
                                  <h6 className="mb-1 text-lg">Entry Time</h6>
                                  <p
                                    className="text-sm"
                                    id="enrPhotographerPswd"
                                  >
                                    {selectedUser?.entryTime
                                      ? new Date(
                                          selectedUser.entryTime
                                        ).toLocaleTimeString()
                                      : "N/A"}
                                  </p>
                                </div>

                                <div className="flex-1 font-semibold">
                                  {/* <h6 className="mb-1 text-lg">File</h6>  */}
                                  <p
                                    className="text-sm"
                                    id="enrPhotographerPswd"
                                  >
                                    {selectedUser.scannedData?.file ? (
                                      <Button
                                        color="success"
                                        variant="contained"
                                        onClick={() =>
                                          window.open(
                                            selectedUser.scannedData?.file,
                                            "_blank"
                                          )
                                        }
                                        className="text-blue-500 hover:underline"
                                      >
                                        View Document
                                      </Button>
                                    ) : (
                                      "N/A"
                                    )}
                                  </p>
                                </div>
                              </Col>
                            </Row>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            ) : (
              <p className="text-center text-muted">No details available</p>
            )}
          </ModalBody>
        </Modal>
      </div>
    </div>
  );
};

export default ScannedUserLayer;
