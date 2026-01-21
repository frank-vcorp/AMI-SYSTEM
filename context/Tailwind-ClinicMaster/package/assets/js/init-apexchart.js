const handleChart = (() => {
  const screenWidth = window.innerWidth;

  const handleProgressChart = () => {
    const options = {
      series: [82],
      chart: {
        type: "radialBar",
        offsetY: -15,
        height: "240px",
      },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,

          hollow: {
            size: "80%",
          },
          track: {
            background: "var(--color-primarylight)",
            strokeWidth: "80%",
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              offsetY: 15,
              fontSize: "50px",
              color: "var(--color-primary)",
              fontWeight: "600",
              fontFamily: "var(--font-family-base)",
            },
          },
        },
      },
      stroke: {
        lineCap: "round",
      },
      colors: ["var(--color-primary)"],
    };

    const chartEl = document.querySelector("#progressChart");
    if (chartEl) {
      const chart = new ApexCharts(chartEl, options);
      chart.render();
    }
  };

  return {
    load: () => {
      handleProgressChart();
    },
  };
})();

// Run on window load
window.addEventListener("load", () => {
  setTimeout(() => {
    handleChart.load();
  }, 500);
});
