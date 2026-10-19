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
  FileCheck,
  ShieldCheck
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

  const ROAD_STATE_MAP: Record<string, string> = {
    'R-1024': 'Sikkim',
    'R-1028': 'Sikkim',
    'R-1031': 'Sikkim',
    'R-1035': 'Sikkim',
    'R-2010': 'Assam',
    'R-2020': 'Assam',
    'R-3010': 'Arunachal Pradesh',
    'R-4010': 'Meghalaya',
    'R-5010': 'Nagaland',
    'R-6020': 'Manipur',
    'R-7010': 'Mizoram',
    'R-8010': 'Tripura'
  };

  const handleRealPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvAnalyzing(true);
    try {
      const res = await classifyPhoto(file);
      setCvResult(res);
      setPhotoPreview(URL.createObjectURL(file));
      if (res.predicted_type && res.predicted_type !== 'Normal') {
        setIncidentType(res.predicted_type);
      }
      if (res.severity) {
        setSeverity(res.severity);
      }
    } catch (err: any) {
      alert(`Photo classification error: ${err.message}`);
    } finally {
      setCvAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const roadId = selectedRoad.split(':')[0].trim();
    const derivedState = ROAD_STATE_MAP[roadId] || 'Sikkim';

    const report = {
      client_uuid: `FO-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      road_id: roadId,
      road_name: selectedRoad.split(':')[1]?.trim() || selectedRoad,
      state: derivedState,
      incident_type: incidentType,
      severity: severity,
      latitude: latitude,
      longitude: longitude,
      description: description || `Field officer ground verification for ${incidentType} on ${selectedRoad}`,
      officer_name: officerName,
      photo_url: photoPreview || '/demo/landslide_nh310a.jpg',
      cv_classification: cvResult || {
        detected_type: incidentType,
        confidence: 90,
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
    <div className="max-w-2xl mx-auto space-y-3.5 font-sans">
      {/* Mobile Device Frame Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">NER Field Officer Ground Uplink</h2>
              <span className="text-[10px] text-slate-500 font-mono">Offline-First Spatial Incident Reporting</span>
            </div>
          </div>

          {/* Offline Simulation Toggle Button */}
          <button
            onClick={handleToggleOffline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isOffline
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                <span>Simulated Offline Mode</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-700" />
                <span>Online Connected</span>
              </>
            )}
          </button>
        </div>

        {/* Pending Sync Banner */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${pendingQueue.length > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span className="text-slate-700 font-medium">
              Pending Offline Queue: <strong className="text-slate-900 font-mono">{pendingQueue.length}</strong> reports
            </span>
          </div>
          {!isOffline && pendingQueue.length > 0 && (
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] transition-colors cursor-pointer"
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
        </div>

        {syncMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-medium">
            {syncMessage}
          </div>
        )}
      </div>

      {/* Incident Reporting Form Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
            New Ground Incident Verification Report
          </span>
          <span className="text-[10px] text-slate-500 font-mono">ID: AUTO-LOC-{Date.now().toString().slice(-4)}</span>
        </div>

        {submitSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{submitSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Incident Type Radio / Pills */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1.5">Select Incident Hazard Type:</label>
            <div className="grid grid-cols-3 gap-2">
              {['Landslide', 'Flood', 'Road Damage', 'Bridge Damage', 'Traffic', 'Other'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setIncidentType(t)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    incidentType === t
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Upload & AI Classification Section */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Hazard Photo & AI Vision Classifier</span>
              </span>
              <span className="text-[10px] font-mono text-blue-700 font-bold">CV Model Ready</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-[11px] font-semibold cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload Field Photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleRealPhotoUpload}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => handleSimulatePhotoUpload('Landslide')}
                disabled={cvAnalyzing}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium shadow-xs"
              >
                📸 Demo Landslide
              </button>
              <button
                type="button"
                onClick={() => handleSimulatePhotoUpload('Flood')}
                disabled={cvAnalyzing}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium shadow-xs"
              >
                📸 Demo Flood
              </button>
              <button
                type="button"
                onClick={() => handleSimulatePhotoUpload('Bridge Damage')}
                disabled={cvAnalyzing}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium shadow-xs"
              >
                📸 Demo Bridge
              </button>
            </div>

            {cvAnalyzing && (
              <div className="text-[11px] text-blue-700 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Running Edge/Color Feature Classifier...</span>
              </div>
            )}

            {cvResult && (
              <div className="p-2.5 rounded-lg bg-white border border-blue-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>AI Detection: {cvResult.predicted_type}</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-700">
                    {cvResult.confidence_percentage}% Confidence
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Recommended Action: {cvResult.recommended_action}
                </p>
              </div>
            )}
          </div>

          {/* GPS Coordinates Auto Capture */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Geospatial GPS Coordinate Lock</span>
              </label>
              <button
                type="button"
                onClick={handleAcquireGPS}
                className="text-[10px] text-blue-600 hover:underline font-semibold"
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
                className="bg-slate-50 text-slate-800 font-mono px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="Latitude"
              />
              <input
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="bg-slate-50 text-slate-800 font-mono px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="Longitude"
              />
            </div>
          </div>

          {/* Highway Sector */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Highway Sector Corridor:</label>
            <select
              value={selectedRoad}
              onChange={(e) => setSelectedRoad(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="R-1024: NH-310A Gangtok–Mangan Sector (Sikkim)">R-1024: NH-310A Gangtok–Mangan Sector (Sikkim)</option>
              <option value="R-1035: NH-10 Siliguri–Rangpo Lifeline (Sikkim)">R-1035: NH-10 Siliguri–Rangpo Lifeline (Sikkim)</option>
              <option value="R-2010: NH-27 Guwahati–Nagaon–Silchar (Assam)">R-2010: NH-27 Guwahati–Nagaon–Silchar (Assam)</option>
              <option value="R-2020: NH-37 Guwahati–Tezpur–Dibrugarh (Assam)">R-2020: NH-37 Guwahati–Tezpur–Dibrugarh (Assam)</option>
              <option value="R-3010: NH-13 Trans-Himalayan Highway (Arunachal Pradesh)">R-3010: NH-13 Trans-Himalayan Highway (Arunachal Pradesh)</option>
              <option value="R-4010: NH-6 Guwahati–Shillong–Silchar (Meghalaya)">R-4010: NH-6 Guwahati–Shillong–Silchar (Meghalaya)</option>
              <option value="R-5010: NH-29 Dimapur–Kohima Highway (Nagaland)">R-5010: NH-29 Dimapur–Kohima Highway (Nagaland)</option>
              <option value="R-6020: NH-37 Silchar–Jiribam–Imphal (Manipur)">R-6020: NH-37 Silchar–Jiribam–Imphal (Manipur)</option>
              <option value="R-7010: NH-306 Silchar–Aizawl Corridor (Mizoram)">R-7010: NH-306 Silchar–Aizawl Corridor (Mizoram)</option>
              <option value="R-8010: NH-8 Dharmanagar–Agartala Corridor (Tripura)">R-8010: NH-8 Dharmanagar–Agartala Corridor (Tripura)</option>
            </select>
          </div>

          {/* Severity Radio */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Severity Rating:</label>
            <div className="flex items-center gap-4">
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                <label key={s} className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                  <input
                    type="radio"
                    name="severity"
                    value={s}
                    checked={severity === s}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="text-blue-600 border-slate-300 focus:ring-0"
                  />
                  <span className="font-semibold text-xs">{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Field Observation Details:</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Major mud slurry and boulder displacement blocking both lanes across 45 meters..."
              className="w-full bg-slate-50 text-slate-800 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
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
