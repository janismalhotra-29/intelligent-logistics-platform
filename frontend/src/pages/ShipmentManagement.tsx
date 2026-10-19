import React, { useState } from 'react';
import { Shipment } from '../types';
import { 
  Package, 
  AlertTriangle, 
  Clock, 
  Truck, 
  CheckCircle2, 
  Search, 
  ShieldAlert,
  ArrowRight,
  Filter
} from 'lucide-react';

interface ShipmentManagementProps {
  shipments: Shipment[];
}

export const ShipmentManagement: React.FC<ShipmentManagementProps> = ({ shipments }) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const filtered = shipments.filter((s) => {
    const matchesCat = filterCategory === 'All' || s.cargo_category === filterCategory;
    const matchesSearch = s.cargo_name.toLowerCase().includes(search.toLowerCase()) ||
                          s.destination.toLowerCase().includes(search.toLowerCase()) ||
                          s.id.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-3.5 font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Critical Supply & Consignment Dispatch</h2>
          </div>
          <p className="text-xs text-slate-500">
            Priority weighting and impact monitoring for emergency relief supplies across the 8 NER states.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-slate-700 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Medicine">Medicine (Priority 100)</option>
              <option value="Emergency supplies">Emergency Supplies (Priority 95)</option>
              <option value="Food">Food & Grain (Priority 90)</option>
              <option value="Fuel">Fuel (Priority 85)</option>
              <option value="Agricultural produce">Agricultural Produce (Priority 70)</option>
              <option value="Construction material">Construction Material (Priority 50)</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search consignment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 text-xs text-slate-800 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 w-48 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Priority Legend Notice */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-slate-500 uppercase font-bold">Priority Tiers:</span>
          <span className="px-2 py-0.5 rounded font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
            Medicine (100)
          </span>
          <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Emergency (95)
          </span>
          <span className="px-2 py-0.5 rounded font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Food (90)
          </span>
          <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Standard (50-70)
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          Autonomous rerouting triggered for Priority ≥ 85 upon road failure.
        </span>
      </div>

      {/* Consignments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-mono uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Shipment ID</th>
                <th className="py-2.5 px-3">Cargo Details</th>
                <th className="py-2.5 px-3">Priority Score</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Transit Route</th>
                <th className="py-2.5 px-3">Carrier Convoy</th>
                <th className="py-2.5 px-3">Arrival (Exp / Pred)</th>
                <th className="py-2.5 px-3">Risk Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => {
                const isCrit = s.priority >= 95;
                const isDelayed = s.status === 'DELAYED';
                const isDiverted = s.status === 'DIVERTED';

                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      {s.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 text-xs">{s.cargo_name}</div>
                      <span className="text-[10px] text-slate-500">{s.cargo_category}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        isCrit
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : s.priority >= 85
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {s.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {s.quantity}
                    </td>
                    <td className="py-3 px-3">
                      <div className="truncate max-w-[160px] text-slate-900 font-medium">{s.origin}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[160px]">→ {s.destination}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-blue-700">
                      {s.vehicle_id}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <span className="text-slate-400 block">{s.expected_arrival}</span>
                      <span className={`font-bold ${isDelayed ? 'text-rose-600' : isDiverted ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {s.predicted_arrival}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-[220px]">
                      <span className={`text-[11px] leading-tight block ${
                        isDelayed ? 'text-rose-700 font-medium' : isDiverted ? 'text-emerald-800' : 'text-slate-600'
                      }`}>
                        {s.risk_impact}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            No matching consignments found.
          </div>
        )}
      </div>
    </div>
  );
};
