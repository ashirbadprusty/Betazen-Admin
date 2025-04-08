import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import axios from "axios";



const SalesStatisticOne = () => {
  // let { chartOptions, chartSeries } = useReactApexChart();
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  // Fetch the data from the API
  const fetchMonthlyStats = async () => {
    try {
      const companyId=localStorage.getItem("companyId");
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/form/stats/?companyId=${companyId}`);
      const { monthCounts } = response.data.data;
      setMonthlyStats(monthCounts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyStats();
  }, []);


  let chartSeries = [
    {
      name: "This month",
      data: monthlyStats.map((item) => item.count),
    },
  ];
  let chartOptions = {
    chart: {
      height: 264,
      type: "line",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      dropShadow: {
        enabled: false,
        top: 6,
        left: 0,
        blur: 4,
        color: "#000",
        opacity: 0.1,
      },
    },

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0,
        opacityTo: 0,
        stops: [0, 90, 100],
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      colors: ["#487FFF"], // Specify the line color here
      width: 3,
    },
    markers: {
      size: 0,
      strokeWidth: 3,
      hover: {
        size: 8,
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: true,
      },
      y: {
        show: false,
      },
      z: {
        show: false,
      },
    },
    grid: {
      row: {
        colors: ["transparent", "transparent"],
        opacity: 0.5,
      },
      borderColor: "#D1D5DB",
      strokeDashArray: 3,
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value;
        },
        style: {
          fontSize: "14px",
        },
      },
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      tooltip: {
        enabled: false,
      },
      labels: {
        formatter: function (value) {
          return value;
        },
        style: {
          fontSize: "14px",
        },
      },
      axisBorder: {
        show: false,
      },
      crosshairs: {
        show: true,
        width: 20,
        stroke: {
          width: 0,
        },
        fill: {
          type: "solid",
          color: "#487FFF40",
        },
      },
    },
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="lineChart">
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center justify-content-between">
            <h6 className="text-xl mb-20">Monthly Wise Visitor Details</h6>
          </div>

          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={264}
          />
        </div>
      </div>
    </div>
  );
};

export default SalesStatisticOne;
