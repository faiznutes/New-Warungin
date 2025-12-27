<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Advanced Reporting</h1>
        <p class="text-[#4c739a] dark:text-slate-400">Custom reports, scheduled reports, and dashboard customization.</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="showTemplateModal = true"
          class="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all font-medium text-sm"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          <span>Create Template</span>
        </button>
        <button
          @click="showScheduleModal = true"
          class="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium text-sm"
        >
          <span class="material-symbols-outlined text-[20px]">schedule</span>
          <span>Schedule Report</span>
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-1">
      <nav class="flex gap-1">
        <button
          @click="activeTab = 'templates'"
          class="flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition"
          :class="activeTab === 'templates' ? 'bg-primary text-white shadow-lg shadow-emerald-500/30' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'"
        >
          <span class="material-symbols-outlined text-[20px]">description</span>
          Report Templates
        </button>
        <button
          @click="activeTab = 'scheduled'"
          class="flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition"
          :class="activeTab === 'scheduled' ? 'bg-primary text-white shadow-lg shadow-emerald-500/30' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'"
        >
          <span class="material-symbols-outlined text-[20px]">schedule</span>
          Scheduled Reports
        </button>
        <button
          @click="activeTab = 'dashboard'"
          class="flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition"
          :class="activeTab === 'dashboard' ? 'bg-primary text-white shadow-lg shadow-emerald-500/30' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'"
        >
          <span class="material-symbols-outlined text-[20px]">dashboard_customize</span>
          Dashboard Settings
        </button>
      </nav>
    </div>

    <!-- Templates Tab -->
    <div v-if="activeTab === 'templates'" class="space-y-6">
      <div v-if="templates.length === 0" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
        <span class="material-symbols-outlined text-[64px] text-slate-300 mb-4">description</span>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">No Report Templates Yet</h3>
        <p class="text-slate-500 text-center max-w-md mb-4">Create your first template to customize reports.</p>
        <button
          @click="showTemplateModal = true"
          class="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all font-medium text-sm"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          Create Template
        </button>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="template in templates"
          :key="template.id"
          class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border-l-4 border-primary p-6 hover:shadow-lg transition"
        >
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">{{ template.name }}</h3>
          <p class="text-sm text-slate-500 mb-4">{{ template.description || 'No description' }}</p>
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {{ template.type }}
            </span>
            <div class="flex gap-2">
              <button
                @click="generateReport(template)"
                class="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition flex items-center gap-1"
              >
                <span class="material-symbols-outlined text-[16px]">play_arrow</span>
                Generate
              </button>
              <button
                @click="editTemplate(template)"
                class="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-1"
              >
                <span class="material-symbols-outlined text-[16px]">edit</span>
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scheduled Reports Tab -->
    <div v-if="activeTab === 'scheduled'" class="space-y-6">
      <div v-if="scheduledReports.length === 0" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
        <span class="material-symbols-outlined text-[64px] text-slate-300 mb-4">schedule</span>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">No Scheduled Reports Yet</h3>
        <p class="text-slate-500 text-center max-w-md mb-4">Set up automated report delivery to your inbox.</p>
        <button
          @click="showScheduleModal = true"
          class="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all font-medium text-sm"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          Schedule Report
        </button>
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="report in scheduledReports"
          :key="report.id"
          class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border-l-4 p-6 hover:shadow-lg transition"
          :class="getStatusBorderClass(report.status)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-3">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ report.templateName || 'Report' }}</h3>
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full"
                  :class="getStatusClass(report.status)"
                >
                  {{ report.status }}
                </span>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Schedule</p>
                  <p class="font-semibold text-slate-900 dark:text-white">{{ report.schedule }}</p>
                </div>
                <div>
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Format</p>
                  <p class="font-semibold text-slate-900 dark:text-white">{{ report.format }}</p>
                </div>
                <div>
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Next Run</p>
                  <p class="font-semibold text-slate-900 dark:text-white">{{ report.nextRunAt ? formatDate(report.nextRunAt) : '-' }}</p>
                </div>
                <div>
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Recipients</p>
                  <p class="font-semibold text-slate-900 dark:text-white">{{ report.recipients?.length || 0 }} emails</p>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-2 ml-4">
              <button
                @click="editSchedule(report)"
                class="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-1"
              >
                <span class="material-symbols-outlined text-[16px]">edit</span>
                Edit
              </button>
              <button
                @click="deleteSchedule(report)"
                class="px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center gap-1"
              >
                <span class="material-symbols-outlined text-[16px]">delete</span>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Settings Tab -->
    <div v-if="activeTab === 'dashboard'" class="space-y-6">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">dashboard_customize</span>
          Customize Dashboard Layout
        </h3>
        <p class="text-sm text-slate-500 mb-6">Select widgets to display on your dashboard.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="widget in dashboardWidgets"
            :key="widget.id"
            class="border-2 rounded-xl p-4 cursor-pointer transition"
            :class="selectedWidgets.includes(widget.id) ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-dashed border-slate-200 dark:border-slate-700 hover:border-primary/50'"
            @click="toggleWidget(widget.id)"
          >
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-bold text-slate-900 dark:text-white">{{ widget.name }}</h4>
                <p class="text-xs text-slate-500">{{ widget.description }}</p>
              </div>
              <input
                type="checkbox"
                :checked="selectedWidgets.includes(widget.id)"
                @change="toggleWidget(widget.id)"
                class="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            @click="saveDashboardSettings"
            :disabled="saving"
            class="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all font-medium text-sm disabled:opacity-50"
          >
            <div v-if="saving" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span class="material-symbols-outlined text-[20px]" v-else>save</span>
            {{ saving ? 'Saving...' : 'Save Layout' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Create Template Modal -->
    <div
      v-if="showTemplateModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="closeTemplateModal"
    >
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">description</span>
              {{ editingTemplate ? 'Edit Template' : 'Create Report Template' }}
            </h3>
            <button
              @click="closeTemplateModal"
              class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
            >
              <span class="material-symbols-outlined text-slate-500">close</span>
            </button>
          </div>

          <form @submit.prevent="saveTemplate" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Name *</label>
              <input
                v-model="templateForm.name"
                type="text"
                required
                class="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
              <textarea
                v-model="templateForm.description"
                rows="3"
                class="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type *</label>
              <select
                v-model="templateForm.type"
                required
                class="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select Type</option>
                <option value="SALES">Sales Report</option>
                <option value="INVENTORY">Inventory Report</option>
                <option value="FINANCIAL">Financial Report</option>
                <option value="CUSTOMER">Customer Report</option>
                <option value="CUSTOM">Custom Report</option>
              </select>
            </div>

            <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Columns</label>
              <div class="space-y-2">
                <div
                  v-for="(column, index) in templateForm.config.columns"
                  :key="index"
                  class="flex items-center gap-2"
                >
                  <input
                    v-model="column.field"
                    type="text"
                    placeholder="Field name"
                    class="flex-1 px-3 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                  <input
                    v-model="column.label"
                    type="text"
                    placeholder="Label"
                    class="flex-1 px-3 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                  <button
                    type="button"
                    @click="removeColumn(index)"
                    class="px-3 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                  >
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
                <button
                  type="button"
                  @click="addColumn"
                  class="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-[18px]">add</span>
                  Add Column
                </button>
              </div>
            </div>

            <div class="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                @click="closeTemplateModal"
                class="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition font-medium text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
              >
                <div v-if="saving" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ saving ? 'Saving...' : 'Save Template' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Create Schedule Modal -->
    <div
      v-if="showScheduleModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="closeScheduleModal"
    >
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">schedule</span>
              Schedule Report
            </h3>
            <button
              @click="closeScheduleModal"
              class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
            >
              <span class="material-symbols-outlined text-slate-500">close</span>
            </button>
          </div>

          <form @submit.prevent="saveSchedule" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Template *</label>
              <select
                v-model="scheduleForm.templateId"
                required
                class="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select Template</option>
                <option v-for="template in templates" :key="template.id" :value="template.id">
                  {{ template.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Schedule *</label>
              <select
                v-model="scheduleForm.schedule"
                required
                @change="updateScheduleConfig"
                class="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>

            <div v-if="scheduleForm.schedule === 'WEEKLY'">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Day of Week</label>
              <select
                v-model="scheduleForm.scheduleConfig.dayOfWeek"
                class="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              >
                <option :value="1">Monday</option>
                <option :value="2">Tuesday</option>
                <option :value="3">Wednesday</option>
                <option :value="4">Thursday</option>
                <option :value="5">Friday</option>
                <option :value="6">Saturday</option>
                <option :value="0">Sunday</option>
              </select>
            </div>

            <div v-if="scheduleForm.schedule === 'MONTHLY'">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Day of Month</label>
              <input
                v-model.number="scheduleForm.scheduleConfig.dayOfMonth"
                type="number"
                min="1"
                max="31"
                class="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time</label>
              <input
                v-model="scheduleForm.scheduleConfig.time"
                type="time"
                class="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Format *</label>
              <select
                v-model="scheduleForm.format"
                required
                class="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="PDF">PDF</option>
                <option value="EXCEL">Excel</option>
                <option value="CSV">CSV</option>
                <option value="HTML">HTML</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recipients (Email) *</label>
              <textarea
                v-model="scheduleForm.recipientsText"
                rows="3"
                placeholder="Enter email addresses, one per line"
                required
                class="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              ></textarea>
            </div>

            <div class="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                @click="closeScheduleModal"
                class="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition font-medium text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
              >
                <div v-if="saving" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ saving ? 'Saving...' : 'Save Schedule' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

const activeTab = ref('templates');
const templates = ref<any[]>([]);
const scheduledReports = ref<any[]>([]);
const dashboardWidgets = ref([
  { id: 'sales-overview', name: 'Sales Overview', description: 'Total sales and revenue' },
  { id: 'top-products', name: 'Top Products', description: 'Best selling products' },
  { id: 'recent-orders', name: 'Recent Orders', description: 'Latest orders' },
  { id: 'customer-stats', name: 'Customer Stats', description: 'Customer metrics' },
  { id: 'inventory-alerts', name: 'Inventory Alerts', description: 'Low stock warnings' },
  { id: 'financial-summary', name: 'Financial Summary', description: 'Revenue and expenses' },
]);
const selectedWidgets = ref<string[]>([]);
const showTemplateModal = ref(false);
const showScheduleModal = ref(false);
const editingTemplate = ref<any>(null);
const editingScheduleId = ref<string | null>(null);
const saving = ref(false);

const templateForm = ref({
  name: '',
  description: '',
  type: '',
  config: {
    columns: [{ field: '', label: '', type: 'string' }],
    filters: [],
  },
});

const scheduleForm = ref({
  templateId: '',
  schedule: 'DAILY',
  scheduleConfig: {
    dayOfWeek: 1,
    dayOfMonth: 1,
    time: '09:00',
  },
  format: 'PDF',
  recipientsText: '',
});

const loadTemplates = async () => {
  try {
    const response = await api.get('/advanced-reporting/templates');
    templates.value = response.data.data || [];
  } catch (error: any) {
    console.error('Error loading templates:', error);
    await showError('Failed to load templates');
  }
};

const loadScheduledReports = async () => {
  try {
    const response = await api.get('/advanced-reporting/scheduled');
    scheduledReports.value = response.data.data || [];
  } catch (error: any) {
    console.error('Error loading scheduled reports:', error);
  }
};

const loadDashboardSettings = async () => {
  try {
    const response = await api.get('/advanced-reporting/dashboard-settings');
    if (response.data.widgets) {
      selectedWidgets.value = response.data.widgets.map((w: any) => w.id);
    }
  } catch (error: any) {
    console.error('Error loading dashboard settings:', error);
  }
};

const saveTemplate = async () => {
  saving.value = true;
  try {
    if (editingTemplate.value) {
      await api.put(`/advanced-reporting/templates/${editingTemplate.value.id}`, templateForm.value);
      await showSuccess('Template updated successfully');
    } else {
      await api.post('/advanced-reporting/templates', templateForm.value);
      await showSuccess('Template created successfully');
    }
    closeTemplateModal();
    await loadTemplates();
  } catch (error: any) {
    console.error('Error saving template:', error);
    await showError('Failed to save template');
  } finally {
    saving.value = false;
  }
};

const saveSchedule = async () => {
  saving.value = true;
  try {
    const recipients = scheduleForm.value.recipientsText.split('\n').filter(e => e.trim());
    const data = {
      ...scheduleForm.value,
      recipients,
    };
    delete data.recipientsText;
    
    if (editingScheduleId.value) {
      await api.put(`/advanced-reporting/scheduled/${editingScheduleId.value}`, data);
      await showSuccess('Scheduled report updated successfully');
    } else {
      await api.post('/advanced-reporting/scheduled', data);
      await showSuccess('Scheduled report created successfully');
    }
    closeScheduleModal();
    await loadScheduledReports();
  } catch (error: any) {
    console.error('Error saving schedule:', error);
    await showError('Failed to save schedule');
  } finally {
    saving.value = false;
  }
};

const saveDashboardSettings = async () => {
  saving.value = true;
  try {
    const settings = {
      widgets: selectedWidgets.value.map(id => ({
        id,
        position: { x: 0, y: 0 },
        size: { w: 4, h: 2 },
      })),
      layout: 'grid',
    };
    await api.put('/advanced-reporting/dashboard-settings', settings);
    await showSuccess('Dashboard settings saved successfully');
  } catch (error: any) {
    console.error('Error saving dashboard settings:', error);
    await showError('Failed to save dashboard settings');
  } finally {
    saving.value = false;
  }
};

const generateReport = async (template: any) => {
  try {
    await api.post('/advanced-reporting/generate', {
      templateId: template.id,
    });
    await showSuccess('Report generated successfully');
  } catch (error: any) {
    console.error('Error generating report:', error);
    await showError('Failed to generate report');
  }
};

const editTemplate = (template: any) => {
  editingTemplate.value = template;
  templateForm.value = {
    name: template.name,
    description: template.description || '',
    type: template.type,
    config: template.config || { columns: [], filters: [] },
  };
  showTemplateModal.value = true;
};

const editSchedule = (report: any) => {
  editingScheduleId.value = report.id;
  scheduleForm.value = {
    templateId: report.templateId,
    schedule: report.schedule,
    scheduleConfig: { ...report.scheduleConfig },
    format: report.format,
    recipientsText: report.recipients ? report.recipients.join('\n') : '',
  };
  showScheduleModal.value = true;
};

const deleteSchedule = async (report: any) => {
  const confirmed = await showConfirm('Are you sure you want to delete this scheduled report?');
  if (!confirmed) return;
  
  try {
    await api.delete(`/advanced-reporting/scheduled/${report.id}`);
    await showSuccess('Scheduled report deleted successfully');
    await loadScheduledReports();
  } catch (error: any) {
    console.error('Error deleting schedule:', error);
    await showError(error.response?.data?.message || 'Failed to delete schedule');
  }
};

const addColumn = () => {
  templateForm.value.config.columns.push({ field: '', label: '', type: 'string' });
};

const removeColumn = (index: number) => {
  templateForm.value.config.columns.splice(index, 1);
};

const toggleWidget = (widgetId: string) => {
  const index = selectedWidgets.value.indexOf(widgetId);
  if (index > -1) {
    selectedWidgets.value.splice(index, 1);
  } else {
    selectedWidgets.value.push(widgetId);
  }
};

const updateScheduleConfig = () => {
  if (scheduleForm.value.schedule === 'DAILY') {
    scheduleForm.value.scheduleConfig = { time: '09:00' };
  } else if (scheduleForm.value.schedule === 'WEEKLY') {
    scheduleForm.value.scheduleConfig = { dayOfWeek: 1, time: '09:00' };
  } else if (scheduleForm.value.schedule === 'MONTHLY') {
    scheduleForm.value.scheduleConfig = { dayOfMonth: 1, time: '09:00' };
  }
};

const closeTemplateModal = () => {
  showTemplateModal.value = false;
  editingTemplate.value = null;
  templateForm.value = {
    name: '',
    description: '',
    type: '',
    config: {
      columns: [{ field: '', label: '', type: 'string' }],
      filters: [],
    },
  };
};

const closeScheduleModal = () => {
  showScheduleModal.value = false;
  editingScheduleId.value = null;
  scheduleForm.value = {
    templateId: '',
    schedule: 'DAILY',
    scheduleConfig: {
      dayOfWeek: 1,
      dayOfMonth: 1,
      time: '09:00',
    },
    format: 'PDF',
    recipientsText: '',
  };
};

const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    FAILED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-slate-100 text-slate-600',
  };
  return classes[status] || 'bg-slate-100 text-slate-600';
};

const getStatusBorderClass = (status: string): string => {
  const classes: Record<string, string> = {
    ACTIVE: 'border-green-500',
    PENDING: 'border-yellow-500',
    FAILED: 'border-red-500',
    CANCELLED: 'border-slate-400',
  };
  return classes[status] || 'border-slate-400';
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  loadTemplates();
  loadScheduledReports();
  loadDashboardSettings();
});
</script>
