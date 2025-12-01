document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById("weightChart");

    // Si no hay canvas o no tenemos datos, no hacemos nada
    if (!ctx || !window.weightChartData) {
        return;
    }

    const labels = window.weightChartData.labels || [];
    const values = window.weightChartData.values || [];

    // Si no hay registros aún, tampoco creamos la gráfica
    if (labels.length === 0 || values.length === 0) {
        return;
    }

    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Peso (kg)",
                    data: values,
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    borderColor: "#4f46e5",
                    backgroundColor: "rgba(79, 70, 229, 0.12)",
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        // Tooltip tipo: "22 Oct - 77.2 kg"
                        label: function (context) {
                            const v = context.parsed.y;
                            return `${v.toFixed(1)} kg`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    ticks: {
                        callback: function (value) {
                            return value + " kg";
                        }
                    }
                }
            }
        }
    });
});
