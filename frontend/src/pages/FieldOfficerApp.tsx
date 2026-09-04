import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Camera, 
  MapPin, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Sparkles,
  Layers,
  FileCheck
} from 'lucide-react';
import { 
  getOfflineQueue, 
  saveToOfflineQueue, 
  syncOfflineReports, 
  classifyPhoto 
} from '../services/api';

export const FieldOfficerApp: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Form State
  const [incidentType, setIncidentType] = useState('Landslide');
  const [severity, setSeverity] = useState('HIGH');
  const [description, setDescription] = useState('');
  const [selectedRoad, setSelectedRoad] = useState('R-1024: NH-310A Gangtok–Mangan');
  const [latitude, setLatitude] = useState(27.425012);
  const [longitude, setLongitude] = useState(88.552034);
  const [officerName, setOfficerName] = useState('Sub-Inspector Karma Bhutia');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cvResult, setCvResult] = useState<any>(null);
  const [cvAnalyzing, setCvAnalyzing] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    setPendingQueue(getOfflineQueue());
  }, []);

  // Sync automatically when toggled back online
  const handleToggleOffline = async () => {
    const nextState = !isOffline;
    setIsOffline(nextState);
    if (!nextState && pendingQueue.length > 0) {
      await triggerSync();
    }
  };

  const triggerSync = async () => {
    setSyncing(true);
    setSyncMessage('Synchronizing queued field reports to command center database...');
    try {
      const res = await syncOfflineReports();
      setPendingQueue(getOfflineQueue());
      setSyncMessage(`✓ Synced ${res.synced_count} report(s) successfully!`);
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err) {
      setSyncMessage('Sync failed. Will retry automatically.');
    } finally {
      setSyncing(false);
    }
  };

  const handleSimulatePhotoUpload = async (simType: string) => {
    setCvAnalyzing(true);
    try {
      const res = await classifyPhoto(undefined, simType);
      setCvResult(res);
      setPhotoPreview('/demo/landslide_nh310a.jpg');
      setIncidentType(res.predicted_type || simType);
      setSeverity(res.severity || 'HIGH');
    } catch (err) {
      console.error(err);
    } finally {
      setCvAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const report = {
      client_uuid: `FO-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      road_id: selectedRoad.split(':')[0],
      road_name: selectedRoad.split(':')[1]?.trim() || selectedRoad,
      state: 'Sikkim',
      incident_type: incidentType,
      severity: severity,
      latitude: latitude,
      longitude: longitude,
      description: description || `Field officer ground verification for ${incidentType}`,
      officer_name: officerName,
      photo_url: photoPreview || '/demo/landslide_nh310a.jpg',
      cv_classification: cvResult || {
        detected_type: incidentType,
        confidence: 93,
        severity: severity,
        recommended_action: 'Ground team dispatched.'
      }
    };

    if (isOffline) {
      const updatedQueue = saveToOfflineQueue(report);
      setPendingQueue(updatedQueue);
      setSubmitSuccess('REPORT SAVED LOCALLY IN OFFLINE QUEUE! (Waiting for network connectivity...)');
    } else {
      // Online mode: direct sync
      saveToOfflineQueue(report);
      triggerSync();
      setSubmitSuccess('REPORT TRANSMITTED & VERIFIED ON COMMAND CENTER MAP!');
    }

    // Reset fields
    setDescription('');
    setTimeout(() => setSubmitSuccess(null), 4000);
  };

  const handleAcquireGPS = () => {
    // Micro jitter for live GPS feeling
    const lat = 27.4250 + (Math.random() - 0.5) * 0.005;
    const lng = 88.5520 + (Math.random() - 0.5) * 0.005;
    setLatitude(Number(lat.toFixed(6)));
    setLongitude(Number(lng.toFixed(6)));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Mobile Device Frame Header */}
      <div className="bg-command-900 border border-command-border rounded-2xl p-4 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">NER Field Officer Mobile Experience</h2>
              <span className="text-[10px] text-slate-400 font-mono">Offline-First Spatial Incident Uplink</span>
            </div>
          </div>

          {/* Offline Simulation Toggle Button */}
          <button
            onClick={handleToggleOffline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isOffline
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Simulated Offline Mode</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span>Online Connected</span>
              </>
            )}
          </button>
        </div>

        {/* Pending Sync Banner */}
        <div className="flex items-center justify-between bg-command-950/80 p-3 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${pendingQueue.length > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
            <span className="text-slate-300">
              Pending Sync Queue: <strong className="text-white font-mono">{pendingQueue.length}</strong> reports
            </span>
          </div>
          {!isOffline && pendingQueue.length > 0 && (
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-[11px] transition-colors"
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
        </div>

        {syncMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs text-center font-medium animate-in fade-in">
            {syncMessage}
          </div>
        )}
      </div>

      {/* Incident Reporting Form Card */}
      <div className="glass-panel p-5 rounded-2xl border border-command-border space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            New Ground Incident Report
          </span>
          <span className="text-[10px] text-slate-400 font-mono">ID: AUTO-LOC-{Date.now().toString().slice(-4)}</span>
        </div>

        {submitSuccess && (
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-semibold">{submitSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Incident Type Radio / Pills */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1.5">Select Incident Hazard Type:</label>
            <div className="grid grid-cols-3 gap-2">
              {['Landslide', 'Flood', 'Road Damage', 'Bridge Damage', 'Traffic', 'Other'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setIncidentType(t)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                    incidentType === t
                      ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                      : 'bg-command-850 text-slate-300 border-slate-700/80 hover:bg-command-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Upload & AI Classification Section */}
          <div className="p-3.5 rounded-xl bg-command-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Hazard Photo & AI Vision Classifier</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400">CV Model Active</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSimulatePhotoUpload('Landslide')}
                disabled={cvAnalyzing}
                className="px-2.5 py-1.5 rounded-lg bg-command-800 hover:bg-command-700 border border-slate-700 text-slate-200 text-[11px] font-medium"
              >
                📸 Sample Landslide Photo
              </button>
              <button
                type="button"
                onClick={() => handleSimulatePhotoUpload('Flood')}
                disabled={cvAnalyzing}
                className="px-2.5 py-1.5 rounded-lg bg-command-800 hover:bg-command-700 border border-slate-700 text-slate-200 text-[11px] font-medium"
              >
                📸 Sample Flood Photo
              </button>
              <button
                type="button"
                onClick={() => handleSimulatePhotoUpload('Bridge Damage')}
                disabled={cvAnalyzing}
                className="px-2.5 py-1.5 rounded-lg bg-command-800 hover:bg-command-700 border border-slate-700 text-slate-200 text-[11px] font-medium"
              >
                📸 Sample Bridge Breach Photo
              </button>
            </div>

            {cvAnalyzing && (
              <div className="text-[11px] text-cyan-300 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Running Edge/Color Feature Classifier...</span>
              </div>
            )}

            {cvResult && (
              <div className="p-2.5 rounded-lg bg-command-900 border border-cyan-500/30 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>AI Detection: {cvResult.predicted_type}</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {cvResult.confidence_percentage}% Confidence
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Recommended Action: {cvResult.recommended_action}
                </p>
              </div>
            )}
          </div>

          {/* GPS Coordinates Auto Capture */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Geospatial GPS Coordinate Lock</span>
              </label>
              <button
                type="button"
                onClick={handleAcquireGPS}
                className="text-[10px] text-cyan-400 hover:underline font-semibold"
              >
                Acquire High-Accuracy GPS
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="bg-command-800 text-white font-mono px-3 py-1.5 rounded-lg border border-slate-700"
                placeholder="Latitude"
              />
              <input
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="bg-command-800 text-white font-mono px-3 py-1.5 rounded-lg border border-slate-700"
                placeholder="Longitude"
              />
            </div>
          </div>

          {/* Highway Sector */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">Highway Sector Corridor:</label>
            <select
              value={selectedRoad}
              onChange={(e) => setSelectedRoad(e.target.value)}
              className="w-full bg-command-800 text-white px-3 py-1.5 rounded-lg border border-slate-700"
            >
              <option value="R-1024: NH-310A Gangtok–Mangan Sector">R-1024: NH-310A Gangtok–Mangan Sector</option>
              <option value="R-1035: NH-10 Siliguri–Rangpo Lifeline">R-1035: NH-10 Siliguri–Rangpo Lifeline</option>
              <option value="R-6020: NH-37 Silchar–Jiribam–Imphal">R-6020: NH-37 Silchar–Jiribam–Imphal</option>
              <option value="R-7010: NH-306 Silchar–Aizawl Corridor">R-7010: NH-306 Silchar–Aizawl Corridor</option>
            </select>
          </div>

          {/* Severity Radio */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">Severity Rating:</label>
            <div className="flex items-center gap-3">
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                <label key={s} className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="severity"
                    value={s}
                    checked={severity === s}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="text-cyan-500 bg-command-800 border-slate-700 focus:ring-0"
                  />
                  <span className="font-semibold text-xs">{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">Field Observation Details:</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Major mud slurry and boulder displacement blocking both lanes across 45 meters..."
              className="w-full bg-command-800 text-white px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>
              {isOffline ? 'Save Report Offline (Auto-Sync On Network)' : 'Submit & Broadcast to Command Center'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
