import React from "react";
import ScanPageLayer from "../components/ScanPageLayer";
import MasterLayout from "../masterLayout/MasterLayout";

const ScanPage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        
        {/* DashBoardLayerOne */}
        <ScanPageLayer />
      </MasterLayout>
    </>
  );
};

export default ScanPage;
