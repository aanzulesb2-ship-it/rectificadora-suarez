"use client";

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChart({ data }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      }
    },
    cutout: '75%', // 5mm de grosor aprox
  };

  // Ajustar para ~2 pulgadas (96px por pulgada = 192px)
  const chartSize = 192;

  return (
    <div style={{ width: `${chartSize}px`, height: `${chartSize}px`, margin: '0 auto' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}
