import React, { useRef, useEffect, useState } from 'react';
import { LightParams } from '../types';

interface LightVisualizerProps {
  params: LightParams;
  onChange: (newParams: LightParams) => void;
}

const LightVisualizer: React.FC<LightVisualizerProps> = ({ params, onChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Visual constants
  const VIEW_SIZE = 300;
  const CENTER = VIEW_SIZE / 2;
  const RADIUS = 80; // Radius of the "subject" sphere area
  const ORBIT_RADIUS = 110; // Radius of the light orbit

  // Helper: Convert Polar (Azimuth, Elevation) to Cartesian (x, y, z)
  const getPosition = (az: number, el: number, radius: number) => {
    const azRad = (az - 90) * (Math.PI / 180); // Offset so 0 is "Front"
    const elRad = el * (Math.PI / 180);

    // Standard 3D coords
    const y = radius * Math.sin(elRad);
    const h = radius * Math.cos(elRad); // Horizontal projection radius
    const x = h * Math.cos(azRad);
    const z = h * Math.sin(azRad);

    return { x, y, z };
  };

  // Helper: Project 3D point to 2D SVG space
  const project = (x: number, y: number, z: number) => {
    const perspective = 0.5; 
    const px = x + CENTER;
    const py = CENTER - y - (z * perspective * 0.3); // Invert Y, add Z depth bias
    return { x: px, y: py, scale: (z + ORBIT_RADIUS * 2) / (ORBIT_RADIUS * 3) };
  };

  const lightPos3D = getPosition(params.azimuth, params.elevation, ORBIT_RADIUS);
  const lightPos2D = project(lightPos3D.x, lightPos3D.y, lightPos3D.z);
  
  // Static Subject Wireframe (Center Sphere)
  const renderGrid = () => {
    return (
      <g className="opacity-30 stroke-cyber-primary" strokeWidth="1" fill="none">
        {/* Horizontal Equator (seen from angle) */}
        <ellipse cx={CENTER} cy={CENTER} rx={RADIUS} ry={RADIUS * 0.3} />
        {/* Vertical Meridian 1 */}
        <ellipse cx={CENTER} cy={CENTER} rx={RADIUS * 0.3} ry={RADIUS} />
        {/* Center dot subject */}
        <circle cx={CENTER} cy={CENTER} r={10} className="fill-cyber-secondary opacity-50" />
      </g>
    );
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Switch to Delta-based interaction for smoother UX
  useEffect(() => {
    let lastX = 0;
    let lastY = 0;

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      
      const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
      const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

      if (lastX === 0 && lastY === 0) {
        lastX = clientX;
        lastY = clientY;
        return;
      }

      const deltaX = clientX - lastX;
      const deltaY = clientY - lastY;

      lastX = clientX;
      lastY = clientY;

      const sensitivity = 0.8;
      
      let newAz = params.azimuth + deltaX * sensitivity;
      if (newAz >= 360) newAz -= 360;
      if (newAz < 0) newAz += 360;

      let newEl = params.elevation - deltaY * sensitivity; // Drag down = decrease elevation
      if (newEl > 60) newEl = 60;
      if (newEl < -60) newEl = -60;

      onChange({
        ...params,
        azimuth: newAz,
        elevation: newEl
      });
    };

    const onUp = () => {
      setIsDragging(false);
      lastX = 0;
      lastY = 0;
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove);
      window.addEventListener('touchend', onUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, params, onChange]);


  // Reduced height to 200px for dashboard fit
  return (
    <div className="relative w-full h-[200px] bg-cyber-dark/50 rounded-xl border border-cyber-panel overflow-hidden cursor-move neon-border"
         onMouseDown={handleMouseDown}
         onTouchStart={handleMouseDown}>
      
      {/* Background Grid Hint */}
      <div className="absolute inset-0 pointer-events-none opacity-10" 
           style={{
             backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
             backgroundSize: '20px 20px'
           }}>
      </div>

      <svg 
        ref={svgRef}
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`} 
        className="w-full h-full pointer-events-none" 
      >
        <defs>
          <radialGradient id="lightGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="40%" stopColor="#fde047" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
          </radialGradient>
        </defs>

        {renderGrid()}

        <ellipse 
            cx={CENTER} 
            cy={CENTER - (ORBIT_RADIUS * Math.sin(params.elevation * Math.PI/180) * -1)}
            rx={ORBIT_RADIUS} 
            ry={ORBIT_RADIUS * 0.3} 
            className="stroke-cyber-primary opacity-10 fill-none"
            strokeDasharray="4 4"
        />

        <line 
          x1={CENTER} 
          y1={CENTER} 
          x2={lightPos2D.x} 
          y2={lightPos2D.y} 
          stroke="white" 
          strokeWidth="1" 
          className="opacity-40"
        />

        <g transform={`translate(${lightPos2D.x}, ${lightPos2D.y})`}>
            <circle r={10 * params.intensity} fill="url(#lightGlow)" opacity={0.6} />
            <circle r={6} fill="#fff" stroke="#facc15" strokeWidth="2" />
            <text y={-15} textAnchor="middle" fill="white" fontSize="10" className="font-mono shadow-black drop-shadow-md">
                {Math.round(params.azimuth)}°
            </text>
        </g>
      </svg>
    </div>
  );
};

export default LightVisualizer;