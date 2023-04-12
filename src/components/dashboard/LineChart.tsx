import React, { useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { ScriptableContext } from "chart.js/auto";
import Container from "../Container";

interface LineChartProps {
  label: string;
  data: any;
}

const LineChart: React.FC<LineChartProps> = ({ data, label }) => {
  const chartData = {
    labels: data.map((item: any) => item.date),
    datasets: [
      {
        label: label,
        data: data.map((item: any) => item.count),
        borderColor: "rgba(136,132,216,0.2",
        borderWidth: 2,
        //backgroundColor: 'rgba(136, 132, 216, 0.1)',
        backgroundColor: (context: ScriptableContext<"line">) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(89, 86, 148,0.5)");
          gradient.addColorStop(1, "rgba(89, 86, 148,0)");
          return gradient;
        },
        pointBorderColor: "rgba(136,132,216,0.0)",
        pointBackgroundColor: "rgba(89, 86, 148,1)",
        pointHitRadius: 256,
        pointRadius: 2.25,
        pointHoverRadius: 5,
        fill: true,
        yAxisID: "y",
        xAxisID: "x",
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: {
          beginAtZero: true,
          stepSize: 1,
        },
        scaleLabel: {
          display: true,
          labelString: "Count",
        },
      },
    },
  };

  return (
    <Container className="p-4 rounded-lg">
      <div style={{ width: "100%", height: 300 }}>
        <Line data={chartData} options={chartOptions as any} />
      </div>
    </Container>
  );
};

export default LineChart;
