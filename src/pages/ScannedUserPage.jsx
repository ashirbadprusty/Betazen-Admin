import React from "react";
import ScannedUserLayer from "../components/ScannedUserLayer";
import MasterLayout from "../masterLayout/MasterLayout";

const ScannedUserPage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        <ScannedUserLayer />
      </MasterLayout>
    </>
  );
};

export default ScannedUserPage;
