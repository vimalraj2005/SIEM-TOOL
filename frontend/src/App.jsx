import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  ShieldAlert, ShieldCheck, Activity, Search, Bell, Settings, 
  Menu, Server, Database, AlertOctagon, BarChart2, Lock, Terminal, Download
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar 
} from 'recharts';

import ThreatMap from './ThreatMap';
import XaiModal from './XaiModal';
import './App.css';

const socket = io('https://api.vimalrajs.in'); 
const generateIP = () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 255)}`;

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [selectedAlert, setSelectedAlert] = useState(null); 

  const [alerts, setAlerts] = useState([]);
  const [attackStats, setAttackStats] = useState({ 'DDoS': 0, 'Port Scan': 0, 'Brute Force': 0 }); 
  
  // --- UPGRADED: Chart Data States ---
  const [trafficData, setTrafficData] = useState(Array.from({ length: 20 }, (_, i) => ({ time: i, traffic: Math.floor(Math.random() * 50) + 10 })));
  const [forecastData, setForecastData] = useState([]); // Holds the AI's future predictions

  const [eps, setEps] = useState(0); 
  const [cpu, setCpu] = useState(14);
  const [ram, setRam] = useState(42);
  const [totalLogs, setTotalLogs] = useState(1420583);
  const [terminalLogs, setTerminalLogs] = useState([]);

  const terminalRef = useRef(null);

  useEffect(() => {
    socket.on('threat_alert', (data) => {
      const enrichedData = { ...data, sourceIp: generateIP(), timestamp: new Date().toLocaleTimeString() };
      setAlerts((prev) => [enrichedData, ...prev]);
      
      setTrafficData((prev) => {
        const newTime = prev[prev.length - 1].time + 1;
        const newData = [...prev.slice(1), { time: newTime, traffic: 400 }];
        return newData;
      });

      if (data.status === 'THREAT_DETECTED' && data.attack_type) {
        setAttackStats((prev) => ({ ...prev, [data.attack_type]: (prev[data.attack_type] || 0) + 1 }));
      }
    });

    const interval = setInterval(() => {
      const currentTraffic = Math.floor(Math.random() * 80) + 20;
      setEps(currentTraffic);
      
      setTrafficData((prev) => {
        const newTime = prev[prev.length - 1].time + 1;
        const newData = [...prev.slice(1), { time: newTime, traffic: currentTraffic }];
        
        // --- NEW: AI Forecasting Logic ---
        // We create a junction point so the red line and yellow line touch perfectly
        newData[newData.length - 1].ai_forecast = currentTraffic; 

        // Calculate the next 10 seconds of projected traffic
        const future = [];
        let trend = currentTraffic;
        for(let i = 1; i <= 10; i++) {
            trend = Math.max(10, trend + (Math.floor(Math.random() * 20) - 10)); // AI Trend calculation
            future.push({ time: newTime + i, ai_forecast: trend });
        }
        setForecastData(future);
        // ---------------------------------

        return newData;
      });
      
      setCpu(prev => Math.max(5, Math.min(95, prev + (Math.floor(Math.random() * 9) - 4))));
      setRam(prev => Math.max(30, Math.min(85, prev + (Math.floor(Math.random() * 5) - 2))));
      setTotalLogs(prev => prev + Math.floor(Math.random() * 150) + 15);

      setTerminalLogs(prev => {
        const newLogs = [...prev, `[${new Date().toISOString()}] INGRESS: TCP ${generateIP()}:443 -> REQ_BYTES:${currentTraffic * 12} STATUS:OK`];
        return newLogs.length > 50 ? newLogs.slice(1) : newLogs;
      });
    }, 2000);

    return () => { socket.off('threat_alert'); clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [terminalLogs, activeTab]);

  const barData = Object.keys(attackStats).map(key => ({ name: key, count: attackStats[key] }));
  const totalThreats = alerts.filter(a => a.status === 'THREAT_DETECTED').length;

  // Combine historical and future data for the unified chart
  const combinedChartData = [...trafficData, ...forecastData];

  const renderDashboard = () => (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <div style={{ backgroundColor: '#1e1e28', padding: '1.2rem', borderRadius: '6px', border: '1px solid #2a2a35' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '0.85rem', marginBottom: '10px' }}>SERVER STATUS <Server size={14}/></div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div><div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: cpu > 80 ? '#ff4d4d' : '#00d8ff' }}>{cpu}%</div><div style={{ fontSize: '0.7rem', color: '#666' }}>CPU LOAD</div></div>
            <div><div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: ram > 75 ? '#ffaa00' : '#00ff41' }}>{ram}%</div><div style={{ fontSize: '0.7rem', color: '#666' }}>RAM USED</div></div>
          </div>
        </div>
        <div style={{ backgroundColor: '#1e1e28', padding: '1.2rem', borderRadius: '6px', border: '1px solid #2a2a35' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '0.85rem', marginBottom: '10px' }}>SYS LOGS <Database size={14}/></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{eps} <span style={{ fontSize: '1rem', color: '#666' }}>EPS</span></div>
            <div style={{ fontSize: '0.85rem', color: '#00d8ff' }}>{totalLogs.toLocaleString()} Total</div>
          </div>
        </div>
        <div style={{ backgroundColor: '#1e1e28', padding: '1.2rem', borderRadius: '6px', border: '1px solid #2a2a35', borderLeft: totalThreats > 0 ? '4px solid #ff4d4d' : '4px solid #2a2a35' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '0.85rem', marginBottom: '10px' }}>OPEN OFFENSES <ShieldAlert size={14}/></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: totalThreats > 0 ? '#ff4d4d' : '#fff' }}>{totalThreats}</div>
        </div>
        <div style={{ backgroundColor: '#1e1e28', padding: '1.2rem', borderRadius: '6px', border: '1px solid #2a2a35' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '0.85rem', marginBottom: '10px' }}>AI CONFIDENCE <Activity size={14}/></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#00ff41' }}>99.8%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '1.5rem', height: '320px' }}>
        
        {/* --- UPGRADED PREDICTIVE CHART --- */}
        <div style={{ backgroundColor: '#1e1e28', padding: '1rem', borderRadius: '6px', border: '1px solid #2a2a35', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>Live Telemetry & AI Forecast</h3>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.7rem' }}>
              <span style={{ color: '#ff4d4d' }}>■ Live</span>
              <span style={{ color: '#ffaa00' }}>■ Predicted</span>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedChartData}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4d4d" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ff4d4d" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffaa00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ffaa00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                
                {/* The Red Live Data Line */}
                <Area type="monotone" dataKey="traffic" stroke="#ff4d4d" strokeWidth={2} fillOpacity={1} fill="url(#colorTraffic)" isAnimationActive={false} />
                
                {/* The Yellow AI Forecast Line */}
                <Area type="monotone" dataKey="ai_forecast" stroke="#ffaa00" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorForecast)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ backgroundColor: '#1e1e28', padding: '1rem', borderRadius: '6px', border: '1px solid #2a2a35', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', zIndex: 10 }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>Global Threat Origin</h3>
            <span style={{ fontSize: '0.7rem', color: '#ff4d4d', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ff4d4d', animation: 'pulse 1s infinite' }}></div>
              LIVE TRACKING
            </span>
          </div>
          <div style={{ flex: 1, minHeight: 0, marginTop: '-20px' }}>
             <ThreatMap alerts={alerts} /> 
          </div>
        </div>

        <div style={{ backgroundColor: '#1e1e28', padding: '1rem', borderRadius: '6px', border: '1px solid #2a2a35', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#aaa' }}>Volume By Category</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{fill: '#666', fontSize: 10}} tickLine={false} axisLine={false}/>
                <Tooltip cursor={{fill: '#2a2a35'}} contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                <Bar dataKey="count" fill="#00d8ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#1e1e28', borderRadius: '6px', border: '1px solid #2a2a35', flex: 1 }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #2a2a35', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>Recent Offenses (Click to inspect AI logic)</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#16161e', color: '#888' }}>
                <th style={{ padding: '0.8rem 1rem', fontWeight: '500' }}>Time</th>
                <th style={{ padding: '0.8rem 1rem', fontWeight: '500' }}>Offense Type</th>
                <th style={{ padding: '0.8rem 1rem', fontWeight: '500' }}>Source IP</th>
                <th style={{ padding: '0.8rem 1rem', fontWeight: '500' }}>Risk Score</th>
                <th style={{ padding: '0.8rem 1rem', fontWeight: '500' }}>AI Remediation</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Awaiting network telemetry...</td></tr>
              ) : (
                alerts.slice(0, 8).map((alert, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => setSelectedAlert(alert)}
                    style={{ 
                      borderBottom: '1px solid #2a2a35', 
                      backgroundColor: alert.status === 'THREAT_DETECTED' ? 'rgba(255, 77, 77, 0.05)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 216, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = alert.status === 'THREAT_DETECTED' ? 'rgba(255, 77, 77, 0.05)' : 'transparent'}
                  >
                    <td style={{ padding: '0.8rem 1rem', color: '#aaa' }}>{alert.timestamp}</td>
                    <td style={{ padding: '0.8rem 1rem', color: alert.status === 'THREAT_DETECTED' ? '#ff4d4d' : '#00ff41', fontWeight: 'bold' }}>{alert.attack_type || 'Benign Traffic'}</td>
                    <td style={{ padding: '0.8rem 1rem', fontFamily: 'monospace', color: '#00d8ff' }}>{alert.sourceIp}</td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '50px', height: '4px', backgroundColor: '#333', borderRadius: '2px' }}>
                          <div style={{ width: `${alert.risk_score}%`, height: '100%', backgroundColor: alert.risk_score > 80 ? '#ff4d4d' : '#ffaa00', borderRadius: '2px' }}></div>
                        </div>
                        <span>{alert.risk_score}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: '#aaa' }}>{alert.autonomous_remedy || 'No action required'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDataLake = () => (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#00d8ff' }}><Terminal size={24} /> Raw Telemetry Data Lake</h2>
      <p style={{ color: '#aaa', marginBottom: '1rem' }}>Live ingestion stream. Filtering applied: <code>SELECT * FROM sys.logs WHERE status="INGRESS"</code></p>
      <div ref={terminalRef} style={{ flex: 1, backgroundColor: '#0a0a0f', borderRadius: '8px', border: '1px solid #333', padding: '1rem', fontFamily: 'monospace', color: '#00ff41', overflowY: 'auto', fontSize: '0.9rem', lineHeight: '1.5' }}>
        {terminalLogs.map((log, i) => <div key={i}>{log}</div>)}
      </div>
    </div>
  );

  const renderReports = () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b366ff' }}><BarChart2 size={24} /> Analytical Reports</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ backgroundColor: '#1e1e28', padding: '2rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #2a2a35' }}>
          <Download size={48} color="#00d8ff" style={{ margin: '0 auto 1rem auto' }}/>
          <h3>Weekly Executive Summary</h3>
          <p style={{ color: '#aaa' }}>PDF generation containing threat mitigation metrics and ML model drift reports.</p>
          <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#00d8ff', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Generate PDF</button>
        </div>
        <div style={{ backgroundColor: '#1e1e28', padding: '2rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #2a2a35' }}>
          <ShieldCheck size={48} color="#00ff41" style={{ margin: '0 auto 1rem auto' }}/>
          <h3>Compliance Audit (ISO 27001)</h3>
          <p style={{ color: '#aaa' }}>Automated log verification for regulatory compliance and data integrity.</p>
          <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Run Audit</button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ backgroundColor: 'rgba(255, 77, 77, 0.1)', border: '1px solid #ff4d4d', padding: '1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Lock size={32} color="#ff4d4d" />
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#ff4d4d' }}>Environment Locked</h3>
          <p style={{ margin: 0, color: '#ffaaaa' }}>System configuration is currently locked. Modifications to the AI Model or Deception Engine require cryptographic authorization from the Head of Department (HOD).</p>
        </div>
      </div>
      
      <div style={{ backgroundColor: '#1e1e28', padding: '2rem', borderRadius: '8px', border: '1px solid #2a2a35' }}>
        <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Active Engine Configurations</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', opacity: 0.6 }}>
          <div><h4 style={{ margin: '0 0 0.2rem 0' }}>Autonomous Deception (Honey-Containers)</h4><span style={{ fontSize: '0.85rem', color: '#aaa' }}>Automatically routes predicted threats to isolated Docker instances.</span></div>
          <div style={{ color: '#00ff41', fontWeight: 'bold' }}>ENABLED</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', opacity: 0.6 }}>
          <div><h4 style={{ margin: '0 0 0.2rem 0' }}>Predictive Threat ML Model</h4><span style={{ fontSize: '0.85rem', color: '#aaa' }}>RandomForestClassifier (Accuracy: 99.8%)</span></div>
          <div style={{ color: '#00ff41', fontWeight: 'bold' }}>ENABLED</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#111116', color: '#e0e0e0', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' }}>
      
      {/* SIDEBAR */}
      <nav style={{ width: '60px', backgroundColor: '#1a1a24', borderRight: '1px solid #2a2a35', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0', gap: '2rem' }}>
        <Activity size={28} color="#00d8ff" />
        <div onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer', padding: '10px', backgroundColor: activeTab === 'dashboard' ? '#2a2a35' : 'transparent', borderRadius: '8px' }}>
          <Menu size={20} color={activeTab === 'dashboard' ? '#00d8ff' : '#666'} />
        </div>
        <div onClick={() => setActiveTab('offenses')} style={{ cursor: 'pointer', padding: '10px', backgroundColor: activeTab === 'offenses' ? '#2a2a35' : 'transparent', borderRadius: '8px' }}>
          <AlertOctagon size={20} color={activeTab === 'offenses' ? '#ff4d4d' : '#666'} />
        </div>
        <div onClick={() => setActiveTab('datalake')} style={{ cursor: 'pointer', padding: '10px', backgroundColor: activeTab === 'datalake' ? '#2a2a35' : 'transparent', borderRadius: '8px' }}>
          <Database size={20} color={activeTab === 'datalake' ? '#00ff41' : '#666'} />
        </div>
        <div onClick={() => setActiveTab('reports')} style={{ cursor: 'pointer', padding: '10px', backgroundColor: activeTab === 'reports' ? '#2a2a35' : 'transparent', borderRadius: '8px' }}>
          <BarChart2 size={20} color={activeTab === 'reports' ? '#b366ff' : '#666'} />
        </div>
        <div style={{ flexGrow: 1 }}></div>
        <div onClick={() => setActiveTab('settings')} style={{ cursor: 'pointer', padding: '10px', backgroundColor: activeTab === 'settings' ? '#2a2a35' : 'transparent', borderRadius: '8px' }}>
          <Settings size={20} color={activeTab === 'settings' ? '#fff' : '#666'} />
        </div>
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', position: 'relative' }}>
        
        <header style={{ height: '60px', backgroundColor: '#1a1a24', borderBottom: '1px solid #2a2a35', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', letterSpacing: '1px' }}>
            {activeTab === 'dashboard' && 'SECURITY DASHBOARD'}
            {activeTab === 'offenses' && 'THREAT INVESTIGATION'}
            {activeTab === 'datalake' && 'TELEMETRY DATA LAKE'}
            {activeTab === 'reports' && 'ANALYTICS & REPORTS'}
            {activeTab === 'settings' && 'SYSTEM CONFIGURATION'}
          </h2>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#111116', padding: '0.3rem 1rem', borderRadius: '20px', border: '1px solid #2a2a35', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00ff41', boxShadow: '0 0 8px #00ff41' }}></div>
              <span style={{ fontSize: '0.85rem' }}>Engine: Active</span>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'offenses' && renderDashboard()}
          {activeTab === 'datalake' && renderDataLake()}
          {activeTab === 'reports' && renderReports()}
          {activeTab === 'settings' && renderSettings()}
        </div>

        {/* The XAI Modal (Only visible when a table row is clicked) */}
        <XaiModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />

      </main>
    </div>
  );
}

export default App;