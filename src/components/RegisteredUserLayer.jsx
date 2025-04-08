import { Icon } from "@iconify/react/dist/iconify.js";
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  GetApp as GetAppIcon,
} from "@mui/icons-material";
import { IconButton, Button } from "@mui/material";
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

const RegisteredUserLayer = () => {
  const [forms, setForms] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [photoModalShow, setPhotoModalShow] = useState(false);
  const [userModalShow, setUserModalShow] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const recordsPerPage = 15;

  const handleDepartmentChange = (event) => {
    const department = event.target.value;
    setSelectedDepartment(department);

    const filtered = department
      ? forms.filter((record) => record.department?.name === department)
      : forms;

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset pagination
  };

  // Fetch all forms
  const fetchForms = async () => {
    const companyId = localStorage.getItem("companyId"); // Retrieve admin's CID

    if (!companyId) {
      console.error("CID not found. Please log in again.");
      return;
    }
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/allForms/?companyId=${companyId}`
      );
      if (response.status === 200) {
        // Sort by createdAt (latest first)
        setForms(
          response.data.forms.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
      }
    } catch (error) {
      console.error("Error fetching forms:", error);
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
    fetchForms();
    fetchDepartments();
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

  // Search function with debounce
  const handleSearch = debounce(async (query) => {
    if (!query.trim()) {
      fetchForms();
      return;
    }
    try {
      const companyId = localStorage.getItem("companyId");
      if (!companyId) {
        console.error("CID not found. Please log in again.");
        return;
      }
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/searchRegUser`,
        {
          params: { query, companyId },
        }
      );
      setForms(
        response.status === 200
          ? response.data.users.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )
          : []
      );
    } catch (error) {
      console.error("Error searching users:", error);
      setForms([]);
    }
  }, 500);

  // Update search query and trigger search
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  // Handle change in date
  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);

  const handleChange = (event) => {
    setSelectedTimeRange(event.target.value);
  };

  // Filter records based on the selected date and time range
  useEffect(() => {
    if (!startDate || !endDate) {
      setFilteredUsers(forms);
      return;
    }

    const filtered = forms.filter((record) => {
      const recordDate = new Date(record.date).toISOString().split("T")[0];

      // Check if record falls within the date range
      if (recordDate < startDate || recordDate > endDate) return false;

      // If no time range is selected, filter only by date range
      if (!selectedTimeRange) return true;

      // Extract the time range values (e.g., "10AM - 11AM")
      const [startRange, endRange] = selectedTimeRange.split(" - ");
      const recordTime = moment(record.createdAt).format("hA"); // Get time in "10AM" format

      return moment(recordTime, "hA").isBetween(
        moment(startRange, "hA"),
        moment(endRange, "hA"),
        null,
        "[)"
      );
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [startDate, endDate, selectedTimeRange, forms]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentDisplayedUsers = filteredUsers.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setSelectedTimeRange("");
    setFilteredUsers(forms);
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
    if (!forms.length) {
      alert("No data available to export.");
      return;
    }

    // Transform data to flatten nested objects
    const formattedData = forms.map((form, index) => ({
      SN: index + 1,
      Id: form._id,
      BarcodeId: form.barcodeId,
      Name: form.name,
      Email: form.email,
      Phone: form.phone,
      Date: form.date,
      Department: form.department?.name || "N/A",
      PersonToMeet: form.personToMeet?.name || "N/A",
      Reason: form.reason,
      Status: form.status,
      TimeFrom: form.timeFrom,
      TimeTo: form.timeTo,
      qrCode: form.qrCode,
      ProfilePhoto: form.profilePhoto,
      File: form.file,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registered Users");
    XLSX.writeFile(wb, "Registered_Users.xlsx");
  };

  return (
    <div className="card radius-16 mt-24">
      <div className="card-body">
        <div
          className="d-flex gap-4 mb-3"
          style={{
            justifyContent: "space-between",
          }}
        >
          <input
            type="text"
            placeholder="Search by name/email/phone"
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

        {forms.length === 0 ? (
          <div className="text-center py-5">
            <h4>No records found</h4>
            <p>There are no forms to display at the moment.</p>
          </div>
        ) : (
          <div className="table-responsive">
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
                  <th className="text-center">Visiting Date</th>
                  <th className="text-center">Timings</th>
                  {/* <th className="text-center">Entered By</th> */}
                  <th className="text-center">Reason</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentDisplayedUsers.map((user, index) => (
                  <tr key={user._id}>
                    <td className="text-center">
                      {indexOfFirstRecord + index + 1}
                    </td>

                    <td className="text-center">
                      <img
                        src={user.profilePhoto}
                        alt="Profile"
                        className="w-40-px h-40-px rounded-circle cursor-pointer"
                        onClick={() => openPhotoModal(user.profilePhoto)}
                      />
                    </td>
                    <td className="text-center">{user.name}</td>
                    <td className="text-center">{user.email}</td>
                    <td className="text-center">+91 {user.phone}</td>
                    <td className="text-center">{(user.department?.name).toUpperCase()}</td>
                    <td className="text-center">{user.personToMeet?.name}</td>
                    <td className="text-center">{user.date}</td>
                    <td className="text-center">
                      {formatTime(user.timeFrom)} - {formatTime(user.timeTo)}
                    </td>
                    {/* <td className="text-center">{user.gate}</td> */}
                    <td className="text-center">{user.reason}</td>
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

        {/* Photo Modal */}
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

        {/* User Details Modal */}
        <Modal
          isOpen={userModalShow}
          toggle={() => setUserModalShow(false)}
          centered
          size="lg"
        >
          <ModalHeader
            className="bg-neutral-600  p-10"
            toggle={() => setUserModalShow(false)}
          >
            <span className="text-white text-xl">Registered User Details</span>
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
                                  <p className="text-sm">{selectedUser.name}</p>
                                </div>

                                <div className="flex-1 font-semibold">
                                  <h6 className="mb-1 text-lg">Email</h6>
                                  <p
                                    className="text-sm"
                                    id="enrphotographeremail"
                                  >
                                    {selectedUser.email}
                                  </p>
                                </div>

                                <div className="flex-1 font-semibold">
                                  <h6 className="mb-1 text-lg">Phone</h6>
                                  <p
                                    className="text-sm"
                                    id="enrPhotographerMobNo"
                                  >
                                    +91 {selectedUser.phone}
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
                                    {selectedUser.reason}
                                  </p>
                                </div>

                                <div className="flex-1 font-semibold">
                                  <h6 className="mb-1 text-lg">Department</h6>
                                  <p
                                    className="text-sm"
                                    id="enrPhotographerAddr"
                                  >
                                    {(selectedUser.department?.name).toUpperCase()}
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
                                    {selectedUser.personToMeet?.name}
                                  </p>
                                </div>
                              </Col>

                              <Col lg={6}>
                                <div className="flex-1 font-semibold">
                                  <h6 className="mb-1 text-lg">
                                    Visiting Date
                                  </h6>
                                  <p
                                    className="text-sm"
                                    id="enrPhotographerPswd"
                                  >
                                    {selectedUser.date}
                                  </p>
                                </div>
                                <div className="flex-1 font-semibold">
                                  <h6 className="mb-1 text-lg">Timings</h6>
                                  <p
                                    className="text-sm"
                                    id="enrPhotographerPswd"
                                  >
                                    {selectedUser?.timeFrom &&
                                    selectedUser?.timeTo
                                      ? `${formatTime(
                                          selectedUser.timeFrom
                                        )} - ${formatTime(selectedUser.timeTo)}`
                                      : "N/A"}
                                  </p>
                                </div>
                              </Col>
                              <Col lg={6}>
                                <div className="flex-1 font-semibold">
                                  <h6 className="mb-1 text-lg">Created On</h6>
                                  <p
                                    className="text-sm"
                                    id="enrPhotographerPswd"
                                  >
                                    {new Date(
                                      selectedUser.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex-1 font-semibold">
                                  {/* <h6 className="mb-1 text-lg">File</h6>  */}
                                  <p
                                    className="text-sm"
                                    id="enrPhotographerPswd"
                                  >
                                    {selectedUser.file ? (
                                      <Button
                                        color="success"
                                        variant="contained"
                                        onClick={() =>
                                          window.open(
                                            selectedUser.file,
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

export default RegisteredUserLayer;
