<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6 flex flex-col h-full animate-in fade-in zoom-in duration-300">
    <div class="flex items-center justify-between mb-6 flex-shrink-0">
      <div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Pertumbuhan Pendapatan</h3>
        <p class="text-sm text-slate-500">Pendapatan Harian (30 Hari Terakhir)</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="flex items-center gap-1 text-xs text-slate-500">
          <span class="w-2.5 h-2.5 rounded-full bg-primary"></span> Revenue
        </span>
      </div>
    </div>
    <div class="flex flex-col flex-1 min-h-[250px] overflow-hidden">
        <div class="relative w-full h-full">
          <canvas ref="chartCanvas"></canvas>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps<{
  data: { date: string; total: number; count: number }[] | null | undefined;
  loading?: boolean;
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const renderChart = () => {
  if (!chartCanvas.value) return;
  
  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;

  // Prepare data
  const rawData = props.data || [];
  // Sort by date just in case
  const sortedData = [...rawData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Format dates for labels
  const labels = sortedData.map(item => {
    const date = new Date(item.date);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  });
  
  const values = sortedData.map(item => item.total);

  // Gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)'); 
  gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Revenue',
          data: values,
          borderColor: '#2563eb', 
          backgroundColor: gradient,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#1e293b',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y);
                    }
                    return label;
                }
            }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: '#e2e8f0', 
            // @ts-ignore
            borderDash: [5, 5],
            drawBorder: false
          },
          ticks: {
             callback: function(value: any) {
                if (value >= 1000000000) return (value/1000000000) + 'M';
                if (value >= 1000000) return (value/1000000) + 'jt';
                if (value >= 1000) return (value/1000) + 'rb';
                return value;
             },
             color: '#94a3b8',
             font: { size: 11, family: 'Inter' }
          },
          border: { display: false }
        },
        x: {
          grid: { display: false },
          ticks: {
             color: '#94a3b8',
             font: { size: 11, family: 'Inter' },
             maxTicksLimit: 10 // Limit x-axis labels to prevent overcrowding
          },
          border: { display: false }
        }
      }
    }
  });
};

watch(() => props.data, () => {
  nextTick(() => {
    renderChart();
  });
}, { deep: true });

onMounted(() => {
  nextTick(() => {
    renderChart();
  });
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>
