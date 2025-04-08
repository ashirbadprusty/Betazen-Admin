import {
  Box,
  Button,
  DialogContent,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";

const CreateUserPageLayer = ({ onUserCreated, }) => {
  const [deptUserForm, setDeptUserForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    dept: "",
  });

  const [deptUserErrors, setDeptUserErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [departments, setDepartments] = useState([]);

  // Fetch existing departments
  const fetchDepartments = async () => {
    try {
      const adminId = localStorage.getItem("adminId");
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/department/?adminId=${adminId}`
      );
      setDepartments([...response.data]);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDeptUserChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      // Allow only numbers and limit to 10 digits
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 10) return;
      setDeptUserForm({ ...deptUserForm, [name]: numericValue });
    } else if (name === "name") {
      // Allow only letters and spaces (no numbers or special characters)
      const validName = value.replace(/[^a-zA-Z\s]/g, "");
      setDeptUserForm({ ...deptUserForm, [name]: validName });
    } else {
      setDeptUserForm({ ...deptUserForm, [name]: value });
    }
  };

  const validateDeptUserForm = () => {
    let errors = {};
    if (!deptUserForm.name.trim()) errors.name = "Name is required";
    if (!deptUserForm.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(deptUserForm.email))
      errors.email = "Invalid email format";
    if (!deptUserForm.password.trim()) errors.password = "Password is required";
    else if (deptUserForm.password.length < 6)
      errors.password = "Password must be at least 6 characters";
    if (!deptUserForm.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(deptUserForm.phoneNumber)) {
      errors.phoneNumber = "Phone number must be exactly 10 digits";
    } else if (!/^[6-9]\d{9}$/.test(deptUserForm.phoneNumber)) {
      errors.phoneNumber = "Invalid phone number format (must start with 6-9)";
    }
    if (!deptUserForm.dept.trim()) errors.dept = "Please select a department";

    setDeptUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      setErrorMessage("Admin authentication required.");
      return;
    }

    if (!validateDeptUserForm()) return;

    try {
      const adminId = localStorage.getItem("adminId");

      if (!adminId) {
        setErrorMessage("Invalid admin authentication.");
        return;
      }

      // Include adminId in the request body
      const requestData = { ...deptUserForm, adminId };

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/deptUser/signup`,
        requestData,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      if (response.status === 201) {
        setSuccessMessage("Department user created successfully!");
        setDeptUserForm({
          name: "",
          email: "",
          password: "",
          phoneNumber: "",
          dept: "",
        });
        setDeptUserErrors({});
        onUserCreated();
      } else {
        setErrorMessage(response.data.message || "An error occurred.");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Failed to create user.");
    }
  };

  return (
    <DialogContent>
      <Typography variant="h5" align="center" gutterBottom>
        Create Employee
      </Typography>
      <Box mb={2}>
        <FormControl fullWidth required error={!!deptUserErrors.dept}>
          <InputLabel>Department</InputLabel>
          <Select
            label="Department"
            name="dept"
            value={deptUserForm.dept}
            onChange={(e) => {
              handleDeptUserChange(e);
              setDeptUserErrors({ ...deptUserErrors, dept: "" });
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 200,
                  overflowY: "auto",
                },
              },
            }}
          >
            {departments.map((dept) => (
              <MenuItem key={dept._id} value={dept.name}>
                {(dept.name).toUpperCase()}
              </MenuItem>
            ))}
          </Select>

          {deptUserErrors.dept && (
            <FormHelperText>{deptUserErrors.dept}</FormHelperText>
          )}
        </FormControl>
      </Box>
      <Box mb={2}>
        <TextField
          label="Name"
          name="name"
          value={deptUserForm.name}
          onChange={handleDeptUserChange}
          error={!!deptUserErrors.name}
          helperText={deptUserErrors.name}
          fullWidth
          required
        />
      </Box>
      <Box mb={2}>
        <TextField
          label="Email"
          name="email"
          type="email"
          value={deptUserForm.email}
          onChange={handleDeptUserChange}
          error={!!deptUserErrors.email}
          helperText={deptUserErrors.email}
          fullWidth
          required
        />
      </Box>

      <Box mb={2}>
        <TextField
          label="Password"
          name="password"
          type="password"
          value={deptUserForm.password}
          onChange={handleDeptUserChange}
          error={!!deptUserErrors.password}
          helperText={deptUserErrors.password}
          fullWidth
          required
        />
      </Box>
      <Box mb={2}>
        <TextField
          label="Phone Number"
          name="phoneNumber"
          value={deptUserForm.phoneNumber}
          onChange={handleDeptUserChange}
          error={!!deptUserErrors.phoneNumber}
          helperText={deptUserErrors.phoneNumber}
          inputProps={{ maxLength: 10 }}
          fullWidth
          required
        />
      </Box>
      <Box mb={2}>
        {(successMessage || errorMessage) && (
          <Typography color={successMessage ? "success.main" : "error.main"}>
            {successMessage || errorMessage}
          </Typography>
        )}
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        fullWidth
      >
        Create Employee
      </Button>
    </DialogContent>
  );
};

export default CreateUserPageLayer;
