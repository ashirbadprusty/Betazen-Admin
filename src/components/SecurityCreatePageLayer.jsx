import {
  Box,
  Button,
  DialogContent,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useState } from "react";

const SecurityCreatePageLayer = ({ onUserCreated }) => {
  const [securityForm, setSecurityForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [securityErrors, setSecurityErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    const updatedValue =
      name === "name" ? value.replace(/[^a-zA-Z\s]/g, "") : value;
    setSecurityForm({ ...securityForm, [name]: updatedValue });
  };

  const validateSecurityForm = () => {
    let errors = {};
    if (!securityForm.name.trim()) errors.name = "Name is required";
    if (!securityForm.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(securityForm.email))
      errors.email = "Invalid email format";
    if (!securityForm.password.trim()) errors.password = "Password is required";
    else if (securityForm.password.length < 6)
      errors.password = "Password must be at least 6 characters";

    setSecurityErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      setErrorMessage("Admin authentication required. Please log in.");
      return;
    }

    if (!validateSecurityForm()) return;

    try {
      const adminId = localStorage.getItem("adminId");

      if (!adminId) {
        setErrorMessage("Invalid admin authentication.");
        return;
      }

      // Include adminId in the request body
      const requestData = { ...securityForm, adminId };

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/create`,
        requestData,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      if (response.status === 201) {
        setSuccessMessage("Security user created successfully!");
        setSecurityForm({ name: "", email: "", password: "" });
        setSecurityErrors({});
        onUserCreated();
      } else {
        setErrorMessage(response.data.message || "An error occurred.");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error || "Failed to create security user."
      );
    }
  };

  return (
    <DialogContent>
      <Typography variant="h5" align="center" gutterBottom>
        Create Security User
      </Typography>
      <Box mb={2}>
        <TextField
          label="Name"
          name="name"
          value={securityForm.name}
          onChange={handleSecurityChange}
          error={!!securityErrors.name}
          helperText={securityErrors.name}
          fullWidth
          required
        />
      </Box>
      <Box mb={2}>
        <TextField
          label="Email"
          name="email"
          type="email"
          value={securityForm.email}
          onChange={handleSecurityChange}
          error={!!securityErrors.email}
          helperText={securityErrors.email}
          fullWidth
          required
        />
      </Box>
      <Box mb={2}>
        <TextField
          label="Password"
          name="password"
          type="password"
          value={securityForm.password}
          onChange={handleSecurityChange}
          error={!!securityErrors.password}
          helperText={securityErrors.password}
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
        Create Security User
      </Button>
    </DialogContent>
  );
};

export default SecurityCreatePageLayer;
