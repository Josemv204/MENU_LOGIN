import React, { useState, useEffect } from "react";
import { Chart as ChartJS, defaults } from "chart.js/auto";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import axios from "axios"; // Para la solicitud al backend

import "./App.css";

import revenueData from "./data/revenueData.json";
import sourceData from "./data/sourceData.json";

defaults.maintainAspectRatio = false;
defaults.responsive = true;

defaults.plugins.title.display = true;
defaults.plugins.title.align = "start";
defaults.plugins.title.font.size = 20;
defaults.plugins.title.color = "black";

export const Dashboard = () => {
  const [categoryData, setCategoryData] = useState([]);

  // Hacemos la solicitud al backend para obtener los datos de ventas por vendedor
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/dashboard") // Ajusta la URL si es necesario
      .then((response) => {
        setCategoryData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <div className="App">
      <div className="dataCard revenueCard">
        <Line
          data={{
            labels: revenueData.map((data) => data.label),
            datasets: [
              {
                label: "Ventas",
                data: revenueData.map((data) => data.revenue),
                backgroundColor: "#064FF0",
                borderColor: "#064FF0",
              },
              {
                label: "Presupuestos",
                data: revenueData.map((data) => data.cost),
                backgroundColor: "#FF3030",
                borderColor: "#FF3030",
              },
            ],
          }}
          options={{
            elements: {
              line: {
                tension: 0.5,
              },
            },
            plugins: {
              title: {
                text: "Ventas y presupuestos mensuales",
              },
            },
          }}
        />
      </div>

      <div className="dataCard customerCard">
        <Bar
          data={{
            labels: sourceData.map((data) => data.label),
            datasets: [
              {
                label: "Cuenta",
                data: sourceData.map((data) => data.value),
                backgroundColor: [
                  "rgba(43, 63, 229, 0.8)",
                  "rgba(250, 192, 19, 0.8)",
                  "rgba(253, 135, 135, 0.8)",
                ],
                borderRadius: 5,
              },
            ],
          }}
          options={{
            plugins: {
              title: {
                text: "Visitas a clientes",
              },
            },
          }}
        />
      </div>

      <div className="dataCard categoryCard">
        <Doughnut
          data={{
            labels: categoryData.map((data) => data.nombre_vendedor), // Ahora usamos nombre_vendedor
            datasets: [
              {
                label: "Total de Ventas",
                data: categoryData.map((data) => data.total_ventas), // Ahora usamos total_ventas
                backgroundColor: [
                  "rgba(43, 63, 229, 0.8)",
                  "rgba(250, 192, 19, 0.8)",
                  "rgba(253, 135, 135, 0.8)",
                ],
                borderColor: [
                  "rgba(43, 63, 229, 0.8)",
                  "rgba(250, 192, 19, 0.8)",
                  "rgba(253, 135, 135, 0.8)",
                ],
              },
            ],
          }}
          options={{
            plugins: {
              title: {
                text: "Mejores vendedores",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
