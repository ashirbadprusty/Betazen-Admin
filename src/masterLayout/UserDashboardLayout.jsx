// USER DASHBOARD LAYOUT

import { Icon } from "@iconify/react/dist/iconify.js";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import BZ_Logo from "../assets/logo/BZ_Logo_Security.png";
import Small_BZ_Logo from "../assets/logo/FavIcon.png";
import "../global.css";

const UserDashboardLayout = ({ children }) => {
  let [sidebarActive, seSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Function to handle dropdown clicks
    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest(".dropdown");

      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains("open");

      // Close all dropdowns
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
      });

      // Toggle the clicked dropdown
      if (!isActive) {
        clickedDropdown.classList.add("open");
      }
    };

    // Attach click event listeners to all dropdown triggers
    const dropdownTriggers = document.querySelectorAll(
      ".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link"
    );

    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleDropdownClick);
    });

    // Function to open submenu based on current route
    const openActiveDropdown = () => {
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll(".sidebar-submenu li a");
        submenuLinks.forEach((link) => {
          if (
            link.getAttribute("href") === location.pathname ||
            link.getAttribute("to") === location.pathname
          ) {
            dropdown.classList.add("open");
          }
        });
      });
    };

    // Open the submenu that contains the open route
    openActiveDropdown();

    // Cleanup event listeners on unmount
    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick);
      });
    };
  }, [location.pathname]);

  let sidebarControl = () => {
    seSidebarActive(!sidebarActive);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };

  const handleScanClick = () => {
    navigate("/scan-page");
  };
  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("companyId");
    navigate("/sing-in");
  };
  return (
    <section className={mobileMenu ? "overlay active" : "overlay "}>
      {/* sidebar */}
      <aside
        className={
          sidebarActive
            ? "sidebar active "
            : mobileMenu
            ? "sidebar sidebar-open"
            : "sidebar"
        }
      >
        <button
          onClick={mobileMenuControl}
          type="button"
          className="sidebar-close-btn"
        >
          <Icon icon="radix-icons:cross-2" />
        </button>
        <div>
          <Link to="/userDashboard" className="sidebar-logo">
            <img src={BZ_Logo} alt="site logo" className="light-logo" />
            <img
              src="assets/images/logo-light.png"
              alt="site logo"
              className="dark-logo"
            />
            <img src={Small_BZ_Logo} alt="site logo" className="logo-icon" />
          </Link>
        </div>

        <div className="sidebar-menu-area">
          <ul className="sidebar-menu" id="sidebar-menu">
            <li className="">
              <NavLink
                to="/userDashboard"
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon icon="tdesign:scan" className="menu-icon" />
                <span>Scanning</span>
              </NavLink>
            </li>

            {/* Logout */}
            <li className="">
              <Link to="/sign-in" className="gap-2" onClick={handleLogout}>
                <Icon icon="lucide:power" className="icon text-xl" />
                <span>Log Out</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      <main
        className={sidebarActive ? "dashboard-main active" : "dashboard-main"}
      >
        <div className="navbar-header">
          <div className="row align-items-center justify-content-between">
            <div className="col-auto">
              <div className="d-flex flex-wrap align-items-center gap-4">
                <button
                  type="button"
                  className="sidebar-toggle"
                  onClick={sidebarControl}
                >
                  {sidebarActive ? (
                    <Icon
                      icon="iconoir:arrow-right"
                      className="icon text-2xl non-active"
                    />
                  ) : (
                    <Icon
                      icon="heroicons:bars-3-solid"
                      className="icon text-2xl non-active "
                    />
                  )}
                </button>
                <button
                  onClick={mobileMenuControl}
                  type="button"
                  className="sidebar-mobile-toggle"
                >
                  <Icon icon="heroicons:bars-3-solid" className="icon" />
                </button>
                {/* <form className="navbar-search">
                  <input type="text" name="search" placeholder="Search" />
                  <Icon icon="ion:search-outline" className="icon" />
                </form> */}
              </div>
            </div>
            {/*Place for paste the code of notofication and profile  */}
            {/*  Place for paste the code of notofication and profile */}
          </div>
        </div>

        {/* dashboard-main-body */}
        <div className="dashboard-main-body">{children}</div>
        <div id="reader"></div>
        {/* Icon section for Mobile Screen */}
        <footer
          id="mobile-footer"
          // className={isFixed ? "fixed-footer" : ""}
          style={{
            backgroundColor: "white",
            height: "12vh",
          }}
        >
          <div className="icon-section">
            <div className="icons" onClick={handleScanClick}>
              <div className="icon-wrapper">
                <QrCodeScannerIcon fontSize="large" />
              </div>
              <span>Scan</span>
            </div>
          </div>
        </footer>

        {/* Footer section */}
        <footer className="d-footer">
          <div className="row align-items-center justify-content-between">
            <div className="col-auto">
              <p className="mb-0">
                © {new Date().getFullYear()} MetroMindz Software Pvt. Ltd. All
                Rights Reserved.
              </p>
            </div>
            <div className="col-auto">
              <p className="mb-0">
                Made by{" "}
                <Link
                  to="https://www.metromindz.com"
                  className="text-primary-600"
                  target="_blank"
                >
                  MetroMindz Software Pvt. Ltd.
                </Link>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </section>
  );
};

export default UserDashboardLayout;
