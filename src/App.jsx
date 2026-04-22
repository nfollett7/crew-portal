import { useState, useEffect } from "react";
import { Camera, Clock, MapPin, CheckCircle, ArrowRight, User, Sun, Cloud, CloudRain, Phone, ChevronDown, ChevronUp, LogOut, Play, Square, MessageSquare, Truck, AlertTriangle, Globe } from "lucide-react";

// ============================================================
// FOLLETT OUTDOORS CREW PORTAL
// Mobile-first field operations dashboard
// Connects to Notion API for live schedule + visit logging
// ============================================================

// --- CONFIGURATION ---
const CONFIG = {
  NOTION_API_KEY: "YOUR_NOTION_API_KEY_HERE", // Replace with integration token
  NOTION_API_BASE: "https://api.notion.com/v1",
  // Database IDs (from Nick's Notion workspace)
  SCHEDULE_BLOCKS_DB: "YOUR_SCHEDULE_BLOCKS_DB_ID",
  VISIT_LOG_DB: "YOUR_VISIT_LOG_DB_ID",
  SUBCONTRACTORS_DB: "YOUR_SUBCONTRACTORS_DB_ID",
  COMPANY: "Follett Outdoors",
  PHONE: "(317) 350-1887",
};

// --- DEMO DATA (Replace with Notion API calls in production) ---
const CREW_MEMBERS = [
  { id: "antonio", name: "Antonio Santos", role: "Crew Lead", lang: "es", emoji: "🟢" },
  { id: "esther", name: "Esther", role: "Crew Lead", lang: "es", emoji: "🟢" },
  { id: "cristian", name: "Cristian", role: "Field Tech", lang: "es", emoji: "🔵" },
  { id: "thomas", name: "Thomas Gottschalk", role: "Owner-Operator", lang: "en", emoji: "🟠" },
  { id: "kyle", name: "Kyle Trusgnich", role: "Project Manager", lang: "en", emoji: "🟣" },
];

const generateTodaySchedule = (crewId) => {
  const schedules = {
    antonio: [
      { id: "sb-001", client: "Keele Residence", address: "8845 Shelborne Dr, Zionsville, IN 46077", serviceType: "Estate Maintenance", serviceLane: "Estate Maintenance", notes: "Mowing + edging + blowing. Gate code: 4521. Dog in backyard — check before mowing.", estimatedHours: 2.5, poNumber: "PO-2026-0147", status: "upcoming", startTime: "7:00 AM", jobId: "JOB-0147" },
      { id: "sb-002", client: "Davidson Residence", address: "9922 Lakewood Dr, Zionsville, IN 46077", serviceType: "Landscape Maintenance", serviceLane: "Estate Maintenance", notes: "Black mulch install — 4 yards. Beds already edged.", estimatedHours: 3, poNumber: "PO-2026-0189", status: "upcoming", startTime: "10:00 AM", jobId: "JOB-0189" },
    ],
    esther: [
      { id: "sb-003", client: "Hudak — Brooks School Rd", address: "2847 Brooks School Rd, Zionsville, IN 46077", serviceType: "Planting / Install", serviceLane: "Design-Build", notes: "Day 1 of 2: Mulch, entry evergreen screening, berm planting. Lighting tech also on site for diagnostic. Gate scheduled open 6-6.", estimatedHours: 8, poNumber: "PO-2026-0201", status: "upcoming", startTime: "7:00 AM", jobId: "JOB-0201" },
    ],
    cristian: [
      { id: "sb-003b", client: "Hudak — Brooks School Rd", address: "2847 Brooks School Rd, Zionsville, IN 46077", serviceType: "Planting / Install", serviceLane: "Design-Build", notes: "Supporting Esther. Mulch spreading and berm planting. 2-day project.", estimatedHours: 8, poNumber: "PO-2026-0201", status: "upcoming", startTime: "7:00 AM", jobId: "JOB-0201" },
    ],
    thomas: [
      { id: "sb-004", client: "Wallis Residence", address: "5422 Fall Creek Rd, Indianapolis, IN 46220", serviceType: "Hardscape", serviceLane: "Design-Build", notes: "Paver patio extension — day 3 of 4. Base is set, starting lay tomorrow. Client working from home.", estimatedHours: 6, poNumber: "PO-2026-0178", status: "upcoming", startTime: "8:00 AM", jobId: "JOB-0178" },
    ],
    kyle: [
      { id: "sb-005", client: "Sauder Property", address: "1120 W 116th St, Carmel, IN 46032", serviceType: "Spring Cleanup", serviceLane: "Estate Maintenance", notes: "Full spring cleanup — leaf removal, bed cleanup, pruning. Estimate approved $1,200.", estimatedHours: 5, poNumber: "PO-2026-0195", status: "upcoming", startTime: "7:30 AM", jobId: "JOB-0195" },
      { id: "sb-006", client: "Tillberry Property", address: "4401 W 96th St, Zionsville, IN 46077", serviceType: "Trimming / Pruning", serviceLane: "Estate Maintenance", notes: "Shrub roses need pruning. Pre-emergent application. Quality follow-up from last visit.", estimatedHours: 2, poNumber: "PO-2026-0188", status: "upcoming", startTime: "1:00 PM", jobId: "JOB-0188" },
    ],
  };
  return schedules[crewId] || [];
};

// --- TRANSLATIONS ---
const translations = {
  en: {
    welcome: "Good morning",
    todaySchedule: "Today's Schedule",
    noJobs: "No jobs scheduled today",
    checkIn: "Check In",
    checkOut: "Check Out",
    logVisit: "Log Visit",
    inProgress: "In Progress",
    completed: "Completed",
    upcoming: "Upcoming",
    hours: "hours",
    notes: "Notes",
    addNotes: "Add notes about this visit...",
    hoursWorked: "Hours Worked",
    servicesPerformed: "Services Performed",
    submit: "Submit Visit Log",
    cancel: "Cancel",
    openMaps: "Open in Maps",
    callOffice: "Call Office",
    weather: "Weather",
    selectCrew: "Select Your Name",
    signOut: "Sign Out",
    photos: "Add Photos",
    materials: "Materials Used",
    addMaterials: "List materials used...",
    issues: "Issues / Flags",
    addIssues: "Report any issues...",
    estimatedTime: "Est. Time",
    actualTime: "Actual Time",
    jobComplete: "Job Complete!",
    confirmSubmit: "Submit this visit log?",
    yes: "Yes",
    no: "No",
    scheduleSummary: "jobs today",
    totalHours: "total hours",
    startDay: "Start Your Day",
    endDay: "End Your Day",
    checkedIn: "Checked in",
    visitLogged: "Visit logged",
    serviceType: "Service",
    poNumber: "PO#",
    client: "Client",
  },
  es: {
    welcome: "Buenos días",
    todaySchedule: "Horario de Hoy",
    noJobs: "No hay trabajos programados hoy",
    checkIn: "Registrar Llegada",
    checkOut: "Registrar Salida",
    logVisit: "Registrar Visita",
    inProgress: "En Progreso",
    completed: "Completado",
    upcoming: "Próximo",
    hours: "horas",
    notes: "Notas",
    addNotes: "Agregar notas sobre esta visita...",
    hoursWorked: "Horas Trabajadas",
    servicesPerformed: "Servicios Realizados",
    submit: "Enviar Registro de Visita",
    cancel: "Cancelar",
    openMaps: "Abrir en Mapas",
    callOffice: "Llamar a la Oficina",
    weather: "Clima",
    selectCrew: "Selecciona Tu Nombre",
    signOut: "Cerrar Sesión",
    photos: "Agregar Fotos",
    materials: "Materiales Usados",
    addMaterials: "Listar materiales usados...",
    issues: "Problemas / Alertas",
    addIssues: "Reportar cualquier problema...",
    estimatedTime: "Tiempo Est.",
    actualTime: "Tiempo Real",
    jobComplete: "¡Trabajo Completo!",
    confirmSubmit: "¿Enviar este registro de visita?",
    yes: "Sí",
    no: "No",
    scheduleSummary: "trabajos hoy",
    totalHours: "horas totales",
    startDay: "Comenzar Tu Día",
    endDay: "Terminar Tu Día",
    checkedIn: "Llegada registrada",
    visitLogged: "Visita registrada",
    serviceType: "Servicio",
    poNumber: "PO#",
    client: "Cliente",
  },
};

// --- SERVICE TYPE COLORS ---
const serviceColors = {
  "Mowing": "bg-green-100 text-green-800",
  "Landscape Maintenance": "bg-emerald-100 text-emerald-800",
  "Estate Maintenance": "bg-teal-100 text-teal-800",
  "Planting / Install": "bg-lime-100 text-lime-800",
  "Spring Cleanup": "bg-yellow-100 text-yellow-800",
  "Trimming / Pruning": "bg-orange-100 text-orange-800",
  "Hardscape": "bg-stone-100 text-stone-800",
  "Design-Build": "bg-blue-100 text-blue-800",
  "Christmas Lighting": "bg-red-100 text-red-800",
  "Permanent Lighting": "bg-purple-100 text-purple-800",
  "Irrigation": "bg-cyan-100 text-cyan-800",
};

const statusColors = {
  upcoming: "bg-gray-100 text-gray-600 border-gray-200",
  "in-progress": "bg-amber-50 text-amber-700 border-amber-300",
  completed: "bg-green-50 text-green-700 border-green-300",
};

// --- WEATHER COMPONENT ---
function WeatherBar({ lang }) {
  const t = translations[lang];
  return (
    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <CloudRain className="w-4 h-4 text-amber-600" />
        <span className="text-amber-800 font-medium">82°F — {lang === "es" ? "Tormentas antes 2PM" : "Storms before 2PM"}</span>
      </div>
      <AlertTriangle className="w-4 h-4 text-amber-500" />
    </div>
  );
}

// --- CREW SELECTION SCREEN ---
function CrewSelect({ onSelect }) {
  const [lang, setLang] = useState("en");
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{CONFIG.COMPANY}</h1>
          <p className="text-slate-400 text-sm mt-1">Crew Portal</p>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-700 rounded-full p-1 flex">
            <button onClick={() => setLang("en")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${lang === "en" ? "bg-white text-slate-900" : "text-slate-400"}`}>
              English
            </button>
            <button onClick={() => setLang("es")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${lang === "es" ? "bg-white text-slate-900" : "text-slate-400"}`}>
              Español
            </button>
          </div>
        </div>

        {/* Crew Selection */}
        <p className="text-slate-300 text-center text-sm mb-4">{t.selectCrew}</p>
        <div className="space-y-2">
          {CREW_MEMBERS.map((member) => (
            <button
              key={member.id}
              onClick={() => onSelect(member, lang)}
              className="w-full bg-slate-700 hover:bg-slate-600 active:bg-slate-500 border border-slate-600 rounded-xl px-4 py-3.5 flex items-center gap-3 transition-all"
            >
              <span className="text-lg">{member.emoji}</span>
              <div className="text-left flex-1">
                <div className="text-white font-medium">{member.name}</div>
                <div className="text-slate-400 text-xs">{member.role}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          ))}
        </div>

        {/* Office Contact */}
        <div className="mt-8 text-center">
          <a href={`tel:${CONFIG.PHONE}`} className="text-slate-500 text-xs flex items-center justify-center gap-1">
            <Phone className="w-3 h-3" /> {CONFIG.PHONE}
          </a>
        </div>
      </div>
    </div>
  );
}

// --- VISIT LOG FORM ---
function VisitLogForm({ job, lang, onSubmit, onCancel }) {
  const t = translations[lang];
  const [hours, setHours] = useState(job.estimatedHours.toString());
  const [notes, setNotes] = useState("");
  const [materials, setMaterials] = useState("");
  const [issues, setIssues] = useState("");
  const [services, setServices] = useState([job.serviceType]);
  const [confirming, setConfirming] = useState(false);

  const allServices = ["Mowing", "Landscape Maintenance", "Planting / Install", "Trimming / Pruning", "Spring Cleanup", "Hardscape", "Irrigation", "General Labor"];

  if (confirming) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-center mb-2">{t.confirmSubmit}</h3>
          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
            <div><span className="font-medium">{t.client}:</span> {job.client}</div>
            <div><span className="font-medium">{t.hoursWorked}:</span> {hours}h</div>
            {notes && <div><span className="font-medium">{t.notes}:</span> {notes}</div>}
            {issues && <div className="text-red-600"><span className="font-medium">{t.issues}:</span> {issues}</div>}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setConfirming(false)} className="flex-1 py-3 rounded-xl border border-gray-300 font-medium text-gray-600">{t.no}</button>
            <button onClick={() => onSubmit({ hours: parseFloat(hours), notes, materials, issues, services })} className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold shadow-lg active:bg-green-600">{t.yes}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{t.logVisit}</h2>
          <button onClick={onCancel} className="text-gray-400 text-sm">{t.cancel}</button>
        </div>

        {/* Job Info */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <div className="font-medium">{job.client}</div>
          <div className="text-xs text-gray-500">{job.serviceType} • {job.poNumber}</div>
        </div>

        {/* Hours */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.hoursWorked}</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setHours((parseFloat(hours) - 0.5).toString())} className="w-10 h-10 rounded-lg bg-gray-100 text-lg font-bold flex items-center justify-center active:bg-gray-200">−</button>
            <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className="flex-1 text-center text-2xl font-bold py-2 border rounded-lg" step="0.5" />
            <button onClick={() => setHours((parseFloat(hours) + 0.5).toString())} className="w-10 h-10 rounded-lg bg-gray-100 text-lg font-bold flex items-center justify-center active:bg-gray-200">+</button>
          </div>
          <div className="text-center text-xs text-gray-400 mt-1">{t.estimatedTime}: {job.estimatedHours}h</div>
        </div>

        {/* Services Performed */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.servicesPerformed}</label>
          <div className="flex flex-wrap gap-2">
            {allServices.map((svc) => (
              <button key={svc} onClick={() => setServices(services.includes(svc) ? services.filter((s) => s !== svc) : [...services, svc])}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${services.includes(svc) ? "bg-green-500 text-white border-green-500" : "bg-white text-gray-600 border-gray-300"}`}>
                {svc}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.notes}</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.addNotes} className="w-full border rounded-xl p-3 text-sm h-20 resize-none" />
        </div>

        {/* Materials */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.materials}</label>
          <textarea value={materials} onChange={(e) => setMaterials(e.target.value)} placeholder={t.addMaterials} className="w-full border rounded-xl p-3 text-sm h-16 resize-none" />
        </div>

        {/* Issues */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.issues}</label>
          <textarea value={issues} onChange={(e) => setIssues(e.target.value)} placeholder={t.addIssues} className="w-full border border-red-200 rounded-xl p-3 text-sm h-16 resize-none bg-red-50" />
        </div>

        {/* Submit */}
        <button onClick={() => setConfirming(true)} className="w-full py-4 rounded-2xl bg-green-500 text-white font-bold text-lg shadow-lg active:bg-green-600 flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {t.submit}
        </button>
      </div>
    </div>
  );
}

// --- JOB CARD ---
function JobCard({ job, lang, onCheckIn, onLogVisit, expanded, onToggle }) {
  const t = translations[lang];
  const colorClass = serviceColors[job.serviceType] || "bg-gray-100 text-gray-800";
  const statusClass = statusColors[job.status] || statusColors.upcoming;

  const statusLabel = job.status === "in-progress" ? t.inProgress : job.status === "completed" ? t.completed : t.upcoming;
  const statusIcon = job.status === "completed" ? <CheckCircle className="w-4 h-4" /> : job.status === "in-progress" ? <Play className="w-4 h-4" /> : <Clock className="w-4 h-4" />;

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all shadow-sm ${statusClass}`}>
      {/* Card Header */}
      <button onClick={onToggle} className="w-full px-4 py-3 flex items-center gap-3 text-left">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>{job.serviceType}</span>
            <span className="text-xs text-gray-400">{job.startTime}</span>
          </div>
          <div className="font-bold text-base">{job.client}</div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
            <MapPin className="w-3 h-3" /> {job.address.split(",")[0]}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1 text-xs font-medium">{statusIcon} {statusLabel}</div>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Job Details */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{t.poNumber}</span>
              <span className="font-mono text-xs">{job.poNumber}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{t.estimatedTime}</span>
              <span className="font-medium">{job.estimatedHours} {t.hours}</span>
            </div>
            {job.checkinTime && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t.checkedIn}</span>
                <span className="font-medium text-green-600">{job.checkinTime}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {job.notes && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 text-sm text-yellow-800">
              <div className="flex items-start gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{job.notes}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex gap-2">
            {/* Maps Button */}
            <a href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-sm font-medium flex items-center justify-center gap-1.5 border border-blue-200 active:bg-blue-100">
              <MapPin className="w-4 h-4" /> {t.openMaps}
            </a>

            {/* Status Action */}
            {job.status === "upcoming" && (
              <button onClick={onCheckIn} className="flex-1 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold flex items-center justify-center gap-1.5 shadow-md active:bg-green-600">
                <Play className="w-4 h-4" /> {t.checkIn}
              </button>
            )}
            {job.status === "in-progress" && (
              <button onClick={onLogVisit} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold flex items-center justify-center gap-1.5 shadow-md active:bg-amber-600">
                <CheckCircle className="w-4 h-4" /> {t.logVisit}
              </button>
            )}
            {job.status === "completed" && (
              <div className="flex-1 py-2.5 rounded-xl bg-green-100 text-green-700 text-sm font-medium flex items-center justify-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> {t.completed}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- MAIN DASHBOARD ---
function Dashboard({ crew, lang, onSignOut }) {
  const t = translations[lang];
  const [jobs, setJobs] = useState([]);
  const [expandedJob, setExpandedJob] = useState(null);
  const [loggingJob, setLoggingJob] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const today = new Date();
  const dateStr = today.toLocaleDateString(lang === "es" ? "es-US" : "en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  useEffect(() => {
    const schedule = generateTodaySchedule(crew.id);
    setJobs(schedule);
    if (schedule.length > 0) setExpandedJob(schedule[0].id);
  }, [crew.id]);

  const totalHours = jobs.reduce((sum, j) => sum + j.estimatedHours, 0);
  const completedJobs = jobs.filter((j) => j.status === "completed").length;

  const handleCheckIn = (jobId) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setJobs(jobs.map((j) => j.id === jobId ? { ...j, status: "in-progress", checkinTime: now } : j));
    setSuccessMsg(t.checkedIn + " ✓");
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  const handleLogVisit = (jobId, data) => {
    setJobs(jobs.map((j) => j.id === jobId ? { ...j, status: "completed", actualHours: data.hours, visitNotes: data.notes, visitIssues: data.issues } : j));
    setLoggingJob(null);
    setSuccessMsg(t.visitLogged + " ✓");
    setTimeout(() => setSuccessMsg(null), 2000);

    // In production: POST to Notion API to create Visit Log entry
    console.log("VISIT LOG ENTRY:", { jobId, crewMember: crew.name, ...data, timestamp: new Date().toISOString() });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-green-500 text-white rounded-xl px-4 py-3 text-center font-medium shadow-lg animate-bounce">
          {successMsg}
        </div>
      )}

      {/* Visit Log Form Modal */}
      {loggingJob && (
        <VisitLogForm job={loggingJob} lang={lang} onSubmit={(data) => handleLogVisit(loggingJob.id, data)} onCancel={() => setLoggingJob(null)} />
      )}

      {/* Header */}
      <div className="bg-slate-900 text-white px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-slate-400">{t.welcome},</div>
            <div className="text-xl font-bold">{crew.name} {crew.emoji}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onSignOut} className="p-2 rounded-lg bg-slate-800 active:bg-slate-700">
              <LogOut className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
        <div className="text-sm text-slate-400">{dateStr}</div>

        {/* Summary Stats */}
        <div className="flex gap-3 mt-3">
          <div className="flex-1 bg-slate-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{jobs.length}</div>
            <div className="text-xs text-slate-400">{t.scheduleSummary}</div>
          </div>
          <div className="flex-1 bg-slate-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{totalHours}</div>
            <div className="text-xs text-slate-400">{t.totalHours}</div>
          </div>
          <div className="flex-1 bg-slate-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{completedJobs}/{jobs.length}</div>
            <div className="text-xs text-slate-400">{t.completed}</div>
          </div>
        </div>
      </div>

      {/* Weather Alert */}
      <div className="px-4 mt-3">
        <WeatherBar lang={lang} />
      </div>

      {/* Job Cards */}
      <div className="px-4 mt-4 pb-8 space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t.todaySchedule}</h2>

        {jobs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Sun className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t.noJobs}</p>
          </div>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              lang={lang}
              expanded={expandedJob === job.id}
              onToggle={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
              onCheckIn={() => handleCheckIn(job.id)}
              onLogVisit={() => setLoggingJob(job)}
            />
          ))
        )}
      </div>

      {/* Bottom Call Office Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
        <a href={`tel:${CONFIG.PHONE}`} className="w-full py-3 rounded-xl bg-slate-900 text-white font-medium flex items-center justify-center gap-2 active:bg-slate-800">
          <Phone className="w-4 h-4" /> {t.callOffice} — {CONFIG.PHONE}
        </a>
      </div>
    </div>
  );
}

// --- APP ROOT ---
export default function App() {
  const [crew, setCrew] = useState(null);
  const [lang, setLang] = useState("en");

  const handleSelect = (member, selectedLang) => {
    setCrew(member);
    setLang(member.lang === "es" ? "es" : selectedLang);
  };

  if (!crew) {
    return <CrewSelect onSelect={handleSelect} />;
  }

  return <Dashboard crew={crew} lang={lang} onSignOut={() => setCrew(null)} />;
}
