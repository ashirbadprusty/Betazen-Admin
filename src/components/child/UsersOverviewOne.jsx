import axios from "axios";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const UsersOverviewOne = () => {
  const [visitors, setVisitors] = useState(0);
  const [employee, setEmployee] = useState(0);
  const [security, setSecurity] = useState(0);
  const adminId=localStorage.getItem("adminId");

  const fetchVisitors = async () => {
    try {
      const companyId=localStorage.getItem("companyId");

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/form/reqRegCount/?companyId=${companyId}`
      );
      setVisitors(response.data.data.totalVisitors || 0);
    } catch (error) {
      console.error("Error fetching total visitors", error);
    }
  };
  const fetchEmployee = async () => {
    try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/deptUser/totalDeptUser/?adminId=${adminId}`
        );
        setEmployee(response.data.data.totalDeptUsers || 0);
      } catch (error) {
        console.error("Error fetching total employee count", error);
      }
  };
  const fetchSecurity = async () => {
    try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/user/totalUsers/?adminId=${adminId}`
        );
        setSecurity(response.data.data.totalUser || 0);
      } catch (error) {
        console.error("Error fetching total security count", error);
      }
  };

  useEffect(() => {
    fetchVisitors();
    fetchEmployee();
    fetchSecurity();
  }, []);

  let donutChartSeries = [visitors, employee, security];
  let donutChartOptions = {
    colors: ["#FF9F29", "#487FFF", "#45B369"],
    labels: ["Visitors", "Employee", "Security"],
    legend: {
      show: false,
    },
    chart: {
      type: "donut",
      height: 270,
      sparkline: {
        enabled: true, // Remove whitespace
      },
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    stroke: {
      width: 0,
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  return (
    <div className="donutChart">
      <div className="card h-100 radius-8 border-0 overflow-hidden">
        <div className="card-body p-24">
          <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
            <h6 className="mb-2 fw-bold text-lg">Users Overview</h6>
          </div>
          <ReactApexChart
            options={donutChartOptions}
            series={donutChartSeries}
            type="donut"
            height={294}
          />
        </div>
      </div>
    </div>
  );
};

export default UsersOverviewOne;
