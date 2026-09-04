import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck, MapPin, Clock } from 'lucide-react';

export const Analytics: React.FC = () => {
  // Vulnerability ranking by state as specified in prompt Section 24
  const STATE_VULNERABILITY = [
    { state: 'Sikkim', high_risk_routes: 24, fill: '#ef4444' },
    { state: 'Arunachal', high_risk_routes: 20, fill: '#f97316' },
    { state: 'Meghalaya', high_risk_routes: 14, fill: '#f59e0b' },
    { state: 'Assam', high_risk_routes: 10, fill: '#10b981' },
    { state: 'Manipur', high_risk_routes: 9, fill: '#06b6d4' },
    { state: 'Nagaland', high_risk_routes: 8, fill: '#6366f1' },
    { state: 'Mizoram', high_risk_routes: 7, fill: '#8b5cf6' },
    { state: 'Tripura', high_risk_routes: 3, fill: '#ec4899' }
  ];

  // Incidents distribution by type
  const INCIDENT_TYPES = [
    { name: 'Landslides', value: 48, color: '#ef4444' },
    { name: 'Flash Floods', value: 24, color: '#0ea5e9' },
    { name: 'Road Breaches', value: 16, color: '#f59e0b' },
    { name: 'Bridge Scour', value: 8, color: '#8b5cf6' },
    { name: 'Traffic / Other', value: 4, color: '#64748b' }
  ];

  // Disruption timeline over the last 6 months
  const TIMELINE_DATA = [
    { month: 'Apr', landslides: 12, floods: 4, delay_hours: 1.8 },
    { month: 'May', landslides: 22, floods: 9, delay_hours: 2.6 },
    { month: 'Jun', landslides: 45, floods: 28, delay_hours: 4.5 },
    { month: 'Jul', landslides: 68, floods: 42, delay_hours: 6.2 },
    { month: 'Aug', landslides: 54, floods: 35, delay_hours: 5.1 },
    { month: 'Sep', landslides: 38, floods: 18, delay_hours: 3.4 }
  ];

  // Route reliability scores
  const VULNERABLE_ROUTES = [
    { name: 'NH-310A Gangtok–Mangan', risk: 91, reliability: '34%', status: 'HIGH RISK' },
    { name: 'NH-10 Siliguri–Rangpo', risk: 82, reliability: '48%', status: 'HIGH RISK' },
    { name: 'NH-13 Bhalukpong–Tawang', risk: 78, reliability: '54%', status: 'MODERATE' },
    { name: 'NH-37 Jiribam–Imphal', risk: 74, reliability: '58%', status: 'MODERATE' },
    { name: 'NH-306 Silchar–Aizawl', risk: 62, reliability: '68%', status: 'WATCH' },
    { name: 'NH-29 Dimapur–Kohima', risk: 54, reliability: '72%', status: 'WATCH' },
    { name: 'NH-6 Guwahati–Shillong', risk: 18, reliability: '96%', status: 'STABLE' },
    { name: 'NH-27 East-West Assam', risk: 14, reliability: '98%', status: 'STABLE' }
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-command-900/80 p-4 rounded-xl border border-command-border">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Logistics & Regional Vulnerability Analytics</h2>
          </div>
          <p className="text-xs text-slate-400">
            Historical incident metrics, mountain corridor disruption trends, and route reliability across NER.
          </p>
        </div>
      </div>

      {/* Grid: Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* High-Risk Routes by State */}
        <div className="glass-panel p-4 rounded-xl border border-command-border space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              High-Risk Corridors by State (Vulnerability Index)
            </span>
            <span className="text-[10px] font-mono text-slate-400">NER Master Survey</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STATE_VULNERABILITY} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="state" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155' }} />
                <Bar dataKey="high_risk_routes" radius={[0, 4, 4, 0]}>
                  {STATE_VULNERABILITY.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incidents by Type Pie Chart */}
        <div className="glass-panel p-4 rounded-xl border border-command-border space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Disaster Hazard Breakdown (Past 12 Months)
            </span>
            <span className="text-[10px] font-mono text-slate-400">Multi-Agency Telemetry</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={INCIDENT_TYPES}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {INCIDENT_TYPES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Disruption & Transit Delay Trend Line */}
        <div className="lg:col-span-2 glass-panel p-4 rounded-xl border border-command-border space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Seasonal Monsoon Disruption & Average Transit Delay (Hours)
            </span>
            <span className="text-[10px] font-mono text-slate-400">Peak Monsoon Impact</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TIMELINE_DATA}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="landslides" stroke="#ef4444" strokeWidth={2} name="Landslide Incidents" />
                <Line type="monotone" dataKey="floods" stroke="#0ea5e9" strokeWidth={2} name="Flood Washouts" />
                <Line type="monotone" dataKey="delay_hours" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" name="Avg Transit Delay (h)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Vulnerable Corridors Matrix */}
        <div className="glass-panel p-4 rounded-xl border border-command-border space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block border-b border-slate-800 pb-2">
            Most Vulnerable Corridors
          </span>
          <div className="space-y-1.5 overflow-y-auto max-h-56">
            {VULNERABLE_ROUTES.map((r, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-command-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white block text-[11px] truncate max-w-[150px]">{r.name}</span>
                  <span className="text-[10px] text-slate-400">Reliability: {r.reliability}</span>
                </div>
                <div className="text-right">
                  <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[9px] ${
                    r.risk > 80 ? 'bg-rose-500/20 text-rose-300' : r.risk > 50 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {r.risk}% Risk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
