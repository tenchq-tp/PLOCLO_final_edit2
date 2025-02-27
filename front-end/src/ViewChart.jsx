import React from "react";
import { Bar } from "react-chartjs-2";
import { Radar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler, } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function ViewChart() {
    
    const data = {
        labels: ["CLO1", "CLO2", "CLO33", "CLO4", "CLO5"],
        datasets: [
          {
            label: "จำนวนนักเรียน",
            data: [50, 75, 100, 80, 95],
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      };
      const options = {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: "กราฟแสดงจำนวนนักเรียน" },
        },
        scales: {
          y: { beginAtZero: true },
        },
      };
      const options2 = {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: "กราฟ Radar เปรียบเทียบคะแนนนักกีฬา" },
        },
        scales: {
          r: {
            beginAtZero: true,
            suggestedMin: 0,
            suggestedMax: 100,
          },
        },
      };

    return (
        <>
         <Bar id="1" data={data} options={options} />;
         <Radar id="2" data={data} options={options2} />;
        </>
    );
}

export default ViewChart;
