import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';

// A lightweight TopoJSON map of the world
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Your SIEM Server Location (India)
const SERVER_COORDS = [78.9629, 20.5937]; 

export default function ThreatMap({ alerts }) {
  const [activeLines, setActiveLines] = useState([]);

  useEffect(() => {
    // When a new alert comes in, generate a random origin point on the globe
    if (alerts.length > 0 && alerts[0].status === 'THREAT_DETECTED') {
      const newAttack = {
        id: Date.now(),
        // Generate random Longitude (-180 to 180) and Latitude (-60 to 80)
        origin: [(Math.random() * 360) - 180, (Math.random() * 140) - 60],
        type: alerts[0].attack_type
      };

      setActiveLines((prev) => [...prev, newAttack]);

      // Remove the laser line after 4 seconds so the map doesn't get too cluttered
      setTimeout(() => {
        setActiveLines((prev) => prev.filter(line => line.id !== newAttack.id));
      }, 4000);
    }
  }, [alerts]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <ComposableMap projection="geoMercator" projectionConfig={{ scale: 120 }}>
        {/* Draw the base map */}
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#2a2a35"
                stroke="#1e1e28"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "#3a3a45", outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* Draw the incoming attack lines */}
        {activeLines.map((line) => (
          <Line
            key={line.id}
            from={line.origin}
            to={SERVER_COORDS}
            stroke="#ff4d4d"
            strokeWidth={2}
            strokeLinecap="round"
            style={{
              strokeDasharray: "5, 5",
              animation: "dash 1s linear infinite", // Creates the moving laser effect
              opacity: 0.8
            }}
          />
        ))}

        {/* Draw the Origin points (Red dots) */}
        {activeLines.map((line) => (
          <Marker key={`marker-${line.id}`} coordinates={line.origin}>
            <circle r={4} fill="#ff4d4d" />
            <circle r={8} fill="#ff4d4d" opacity={0.4} className="pulse-circle" />
          </Marker>
        ))}

        {/* Draw your Server Location (Green Shield) */}
        <Marker coordinates={SERVER_COORDS}>
          <circle r={5} fill="#00ff41" />
          <circle r={12} fill="#00ff41" opacity={0.3} />
          <text textAnchor="middle" y={-15} style={{ fill: "#00ff41", fontSize: "10px", fontWeight: "bold" }}>
            NODE-IND
          </text>
        </Marker>
      </ComposableMap>

      {/* Embedded CSS for the animations */}
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .pulse-circle {
          animation: pulse 1.5s infinite ease-out;
          transform-origin: center;
        }
      `}</style>
    </div>
  );
}