// USER DASHBOARD HOME PAGE(SCAN PAGE)

import React from "react";
import ScanPageLayer from "../components/ScanPageLayer";
import UserDashboardLayout from "../masterLayout/UserDashboardLayout";
// const style = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: 400,
//   bgcolor: "background.paper",
//   boxShadow: 24,
//   p: 4,
// };
const UserDashboardHome = () => {
  // const [alertMessage, setAlertMessage] = useState("");
  // const [open, setOpen] = useState(false);

  // useEffect(() => {
  //   const checkLicenseStatus = async () => {
  //     try {
  //       const response = await fetch(
  //         `${process.env.REACT_APP_BACKEND_URL}/admin/license-status`,
  //         {
  //           method: "GET",
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem("userToken")}`,
  //           },
  //         }
  //       );

  //       const data = await response.json();
  //       if (
  //         data.isTrial === false &&
  //         data.isExpired === true &&
  //         data.alertMessage != null
  //       ) {
  //         setOpen(true);
  //         setAlertMessage(data.alertMessage);
  //       }
  //     } catch (error) {
  //       console.error("Error checking license status:", error);
  //     }
  //   };

  //   checkLicenseStatus();
  // }, []);

  return (
    <>
      {/* <div>
        <Modal
          open={open}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h5">
              🔒 Access Blocked
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              {alertMessage}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              // onClick={handleActivate}
              sx={{ mt: 2, width: "100%" }}
            >
              Activate License
            </Button>
          </Box>
        </Modal>
      </div> */}
      <UserDashboardLayout>
        <ScanPageLayer />
      </UserDashboardLayout>
    </>
  );
};

export default UserDashboardHome;
