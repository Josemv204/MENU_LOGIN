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
  const [salesData, setSalesData] = useState({ labels: [], ventas: [], presupuestos: [] });
  const [categoryData, setCategoryData] = useState([]); // Mejores vendedores

  // Solicitud al backend para ventas y presupuestos
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/dashboard/meses")
      .then((response) => {
        const meses = [];
        const ventas = [];
        const presupuestos = [];

        response.data.forEach((item) => {
          meses.push(item.mes);
          if (item.origen === "ventas") {
            ventas.push(item.total);
          } else if (item.origen === "presupuestos") {
            presupuestos.push(item.total);
          }
        });

        setSalesData({
          labels: meses,
          ventas: ventas,
          presupuestos: presupuestos,
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  // Solicitud al backend para mejores vendedores
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/dashboard")
      .then((response) => {
        setCategoryData(response.data); // Guardamos directamente los datos del backend
      })
      .catch((error) => {
        console.error("Error fetching data for categoryCard:", error);
      });
  }, []);

  return (
    <div className="App">
      {/* Gráfico de ventas y presupuestos */}
      <div className="dataCard revenueCard">
        <Line
          data={{
            labels: salesData.labels, // Usamos los meses de la API
            datasets: [
              {
                label: "Ventas",
                data: salesData.ventas, // Datos de ventas
                backgroundColor: "#064FF0",
                borderColor: "#064FF0",
              },
              {
                label: "Presupuestos",
                data: salesData.presupuestos, // Datos de presupuestos
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

      {/* Gráfico de visitas a clientes */}
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

      {/* Gráfico de mejores vendedores */}
      <div className="dataCard categoryCard">
        <Doughnut
          data={{
            labels: categoryData.map((data) => data.nombre_vendedor), // Etiquetas: nombres de vendedores
            datasets: [
              {
                label: "Total de Ventas",
                data: categoryData.map((data) => data.total_ventas), // Datos: totales de ventas
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
                borderWidth: 1,
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

