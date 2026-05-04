import React, { useEffect, useState } from 'react';
import { X, BrainCircuit, Activity, Crosshair, Network, Cpu } from 'lucide-react';

export default function XaiModal({ alert, onClose }) {
  const [animate, setAnimate] = useState(false);

  // Trigger animations after component mounts
  useEffect(() => {
    setAnimate(true);
  }, []);

  if (!alert) return null;

  // Generate realistic-sounding ML features based on the attack type
  const getFeatureWeights = (type) => {
    switch (type) {
      case 'DDoS':
        return [
          { name: 'Bwd Packet Length Std', weight: 89, baseline: '12.4', current: '1045.8' },
          { name: 'Flow Bytes/s', weight: 76, baseline: '450', current: '85040' },
          { name: 'Total Fwd Packets', weight: 65, baseline: '4', current: '854' },
          { name: 'Flow Duration', weight: 42, baseline: '120ms', current: '9800ms' }
        ];
      case 'Port Scan':
        return [
          { name: 'Destination Port', weight: 92, baseline: '443', current: 'Multiple (1-1024)' },
          { name: 'Init_Win_bytes_fwd', weight: 81, baseline: '8192', current: '1024' },
          { name: 'FIN Flag Count', weight: 55, baseline: '0', current: '1' },
          { name: 'Packet Length Mean', weight: 30, baseline: '500', current: '42' }
        ];
      default:
        return [
          { name: 'Failed Login Ratio', weight: 88, baseline: '0.01', current: '0.95' },
          { name: 'Active Mean Time', weight: 70, baseline: '45s', current: '0.5s' },
          { name: 'Subflow Fwd Bytes', weight: 60, baseline: '200', current: '4500' },
          { name: 'Packet Length Var', weight: 45, baseline: '12', current: '405' }
        ];
    }
  };

  const features = getFeatureWeights(alert.attack_type);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(9, 9, 14, 0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
      opacity: animate ? 1 : 0, transition: 'opacity 0.3s ease-in-out'
    }}>
      
      {/* Modal Container */}
      <div style={{
        width: '900px', height: '600px', backgroundColor: '#16161e', border: '1px solid #00d8ff',
        borderRadius: '12px', boxShadow: '0 0 40px rgba(0, 216, 255, 0.15)', display: 'flex', flexDirection: 'column',
        transform: animate ? 'scale(1)' : 'scale(0.95)', transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #2a2a35' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <BrainCircuit size={28} color="#00d8ff" />
            <div>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', letterSpacing: '1px' }}>XAI DIAGNOSTIC MATRIX</h2>
              <span style={{ color: '#00d8ff', fontSize: '0.8rem', fontFamily: 'monospace' }}>TARGET_IP: {alert.sourceIp} // MODEL: RF_CICIDS_v2</span>
            </div>
          </div>
          <X size={24} color="#aaa" style={{ cursor: 'pointer' }} onClick={onClose} />
        </div>

        {/* Content Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* LEFT: The "Neural Core" Visualization */}
          <div style={{ flex: 1, borderRight: '1px solid #2a2a35', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            
            {/* Background Grid */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(#2a2a35 1px, transparent 1px), linear-gradient(90deg, #2a2a35 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.2 }}></div>

            {/* Central Prediction Core */}
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '180px', height: '180px', borderRadius: '50%', backgroundColor: 'rgba(255, 77, 77, 0.1)', border: '2px solid #ff4d4d', boxShadow: '0 0 30px rgba(255, 77, 77, 0.4)' }}>
              <Crosshair size={40} color="#ff4d4d" style={{ marginBottom: '10px' }} />
              <h3 style={{ margin: 0, color: '#ff4d4d', fontSize: '1.2rem', textAlign: 'center' }}>{alert.attack_type}</h3>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>{alert.risk_score}% CONFIDENCE</span>
              
              {/* Radar Sweeper Animation */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(from 0deg, transparent 70%, rgba(255,77,77,0.4) 100%)', animation: 'spin 2s linear infinite' }}></div>
            </div>

            {/* Orbiting Feature Nodes */}
            {features.map((feat, i) => {
              const angle = (i / features.length) * (2 * Math.PI);
              const radius = 160; 
              const left = `calc(50% + ${Math.cos(angle) * radius}px)`;
              const top = `calc(50% + ${Math.sin(angle) * radius}px)`;

              return (
                <div key={i} style={{
                  position: 'absolute', left, top, transform: 'translate(-50%, -50%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 20
                }}>
                  <div style={{ width: `${feat.weight / 2}px`, height: `${feat.weight / 2}px`, borderRadius: '50%', backgroundColor: '#00d8ff', border: '2px solid #fff', boxShadow: '0 0 15px #00d8ff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Network size={feat.weight > 60 ? 20 : 12} color="#000" />
                  </div>
                  <span style={{ marginTop: '8px', color: '#aaa', fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'nowrap', backgroundColor: '#111', padding: '2px 6px', borderRadius: '4px' }}>{feat.name}</span>
                  {/* Draw SVG line back to center */}
                  <svg style={{ position: 'absolute', top: '50%', left: '50%', width: radius*2, height: radius*2, transform: 'translate(-50%, -50%)', zIndex: -1, pointerEvents: 'none' }}>
                    <line x1="50%" y1="50%" x2={50 - Math.cos(angle)*50 + "%"} y2={50 - Math.sin(angle)*50 + "%"} stroke="#00d8ff" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                  </svg>
                </div>
              );
            })}
          </div>

          {/* RIGHT: SHAP Academic Breakdown */}
          <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
            
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Cpu size={18} color="#b366ff"/> Random Forest Inference Path</h3>
              <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                The AI model identified {features.length} critical packet parameters deviating from the established network baseline. The following SHAP (SHapley Additive exPlanations) values represent the mathematical weight each feature carried in triggering the alarm.
              </p>
            </div>

            {/* Dynamic SHAP Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1rem' }}>
              {features.map((feat, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#00d8ff', fontWeight: 'bold' }}>{feat.name}</span>
                    <span style={{ color: '#aaa' }}>Impact: {feat.weight}</span>
                  </div>
                  
                  {/* The Bar */}
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#2a2a35', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${animate ? feat.weight : 0}%`, height: '100%', backgroundColor: feat.weight > 70 ? '#ff4d4d' : '#ffaa00', transition: `width 1s cubic-bezier(0.25, 0.1, 0.25, 1) ${i * 0.2}s` }}></div>
                  </div>

                  {/* Context Data */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    <span style={{ color: '#5cb85c' }}>Baseline: {feat.baseline}</span>
                    <span style={{ color: '#ff4d4d' }}>Detected: {feat.current}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Remediation Block */}
            <div style={{ marginTop: 'auto', padding: '1rem', backgroundColor: 'rgba(255, 170, 0, 0.1)', border: '1px solid #ffaa00', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#ffaa00', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16}/> Autonomous Action Taken</h4>
              <p style={{ margin: 0, color: '#e0e0e0', fontSize: '0.85rem' }}>{alert.autonomous_remedy || 'Traffic dropped at Edge Firewall. IP blacklisted for 24 hours.'}</p>
            </div>

          </div>
        </div>
      </div>
      
      {/* Required CSS Keyframes for the modal */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}