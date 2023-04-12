import React from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import Container from '../Container';

interface DonutChartProps {
  label: string;
  data: any;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, label }) => {
  const chartData = {
    labels: ["Pending", "Approved", "Rejected"],
    datasets: [
      {
        label: label,
        data: data,
        backgroundColor: [
          'rgba(92, 92, 128, 0.25)',
          'rgba(34, 255, 116, 0.2)',
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
            'rgba(92, 92, 128, 1)',
            'rgba(34, 255, 116, 1)',
            'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
  };

  return (
    <Container className="p-4 rounded-lg">

      <div style={{ width: '100%', height: 300 }}>
        <Doughnut data={chartData} options={chartOptions as any} />
      </div>
    </Container>
  );
};

export default DonutChart;