import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const LicenseContext = createContext();

export const LicenseProvider = ({ children }) => {
  const [licenseStatus, setLicenseStatus] = useState({
    isExpired: false,
    alertMessage: "",
  });

  const fetchLicenseStatus = async () => {
    try {
      const response = await axios.get("/api/license/status");
      setLicenseStatus({
        isExpired: response.data.isExpired,
        alertMessage: response.data.alertMessage,
      });
    } catch (error) {
      console.error("Error fetching license status:", error);
    }
  };

  useEffect(() => {
    fetchLicenseStatus();
    const interval = setInterval(fetchLicenseStatus, 60 * 1000); // Check every 1 minute
    return () => clearInterval(interval);
  }, []);

  return (
    <LicenseContext.Provider value={{ licenseStatus }}>
      {children}
    </LicenseContext.Provider>
  );
};
