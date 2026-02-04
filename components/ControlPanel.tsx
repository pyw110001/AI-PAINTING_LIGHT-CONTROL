import React from 'react';
import { LightParams } from '../types';

interface ControlPanelProps {
  params: LightParams;
  onChange: (key: keyof LightParams, value: number) => void;
  disabled: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ params, onChange, disabled }) => {
  return (
    <div className="space-y-2"> {/* Reduced spacing */}
      
      {/* Azimuth Control */}
      <div>
        <div className="flex justify-between text-xs font-mono text-cyber-primary mb-1">
          <label>AZIMUTH</label>
          <span>{Math.round(params.azimuth)}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          value={params.azimuth}
          onChange={(e) => onChange('azimuth', parseFloat(e.target.value))}
          disabled={disabled}
          className="w-full accent-cyber-primary h-2"
        />
        <div className="flex justify-between text-[9px] text-gray-600 font-mono mt-0.5">
          <span>0°</span>
          <span>90°</span>
          <span>180°</span>
          <span>270°</span>
          <span>360°</span>
        </div>
      </div>

      {/* Elevation Control */}
      <div>
        <div className="flex justify-between text-xs font-mono text-cyber-secondary mb-1">
          <label>ELEVATION</label>
          <span>{Math.round(params.elevation)}°</span>
        </div>
        <input
          type="range"
          min="-60"
          max="60"
          value={params.elevation}
          onChange={(e) => onChange('elevation', parseFloat(e.target.value))}
          disabled={disabled}
          className="w-full accent-cyber-secondary h-2"
        />
        <div className="flex justify-between text-[9px] text-gray-600 font-mono mt-0.5">
          <span>-60°</span>
          <span>0°</span>
          <span>+60°</span>
        </div>
      </div>

      {/* Intensity Control */}
      <div>
        <div className="flex justify-between text-xs font-mono text-white mb-1">
          <label>INTENSITY</label>
          <span>{params.intensity.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="2.0"
          step="0.1"
          value={params.intensity}
          onChange={(e) => onChange('intensity', parseFloat(e.target.value))}
          disabled={disabled}
          className="w-full accent-white h-2"
        />
        <div className="flex justify-between text-[9px] text-gray-600 font-mono mt-0.5">
          <span>0.1x</span>
          <span>1.0x</span>
          <span>2.0x</span>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;