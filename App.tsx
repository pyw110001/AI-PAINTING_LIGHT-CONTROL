import React, { useState, useCallback } from 'react';
import LightVisualizer from './components/LightVisualizer';
import ControlPanel from './components/ControlPanel';
import { LightParams, AppState } from './types';
import { generateLitImage } from './services/geminiService';

const DEFAULT_PARAMS: LightParams = {
  azimuth: 45,
  elevation: 30,
  intensity: 1.0,
};

// Helper to find nearest supported aspect ratio for Gemini
const getSupportedAspectRatio = (width: number, height: number): string => {
  const target = width / height;
  const ratios = [
    { str: "1:1", val: 1 },
    { str: "4:3", val: 4/3 },
    { str: "3:4", val: 3/4 },
    { str: "16:9", val: 16/9 },
    { str: "9:16", val: 9/16 },
  ];
  
  // Find the ratio with minimal difference
  const closest = ratios.reduce((prev, curr) => {
    return (Math.abs(curr.val - target) < Math.abs(prev.val - target)) ? curr : prev;
  });
  
  return closest.str;
};

function App() {
  const [params, setParams] = useState<LightParams>(DEFAULT_PARAMS);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Image Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSourceImage(result);
        
        // Load image object to get dimensions
        const img = new Image();
        img.onload = () => {
           const ratioStr = getSupportedAspectRatio(img.naturalWidth, img.naturalHeight);
           console.log(`Detected dimensions: ${img.naturalWidth}x${img.naturalHeight}, matching ratio: ${ratioStr}`);
           setAspectRatio(ratioStr);
        };
        img.src = result;

        setGeneratedImage(null);
        setAppState(AppState.IDLE);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Parameter Changes from Visualizer or Sliders
  const handleParamChange = (newParams: LightParams) => {
    setParams(newParams);
  };

  const handleSliderChange = (key: keyof LightParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  // Handle Generate Action
  const handleGenerate = async () => {
    if (!sourceImage) return;

    setAppState(AppState.GENERATING);
    setGeneratedImage(null); // Clear previous result
    setErrorMsg(null);

    try {
      const resultImageUrl = await generateLitImage(sourceImage, params, aspectRatio);
      setGeneratedImage(resultImageUrl);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate image.");
      setAppState(AppState.ERROR);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0f172a] text-white flex flex-col overflow-hidden">
      
      {/* Header - Compact */}
      <header className="flex-shrink-0 px-6 py-3 border-b border-white/10 flex justify-between items-center bg-cyber-dark/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyber-primary to-cyber-secondary flex items-center justify-center">
            <span className="text-lg">💡</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary to-cyber-secondary">
              AI VIRTUAL STUDIO
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-xs font-mono text-gray-500">Gemini 3 Pro</span>
           <span className="px-2 py-0.5 bg-cyber-primary/10 text-cyber-primary text-[10px] font-mono rounded border border-cyber-primary/30">
             v1.0 BETA
           </span>
        </div>
      </header>

      {/* Main Content - Full Height Grid */}
      <main className="flex-1 min-h-0 grid grid-cols-12 gap-4 p-4">
        
        {/* LEFT COLUMN: Controls (3.5/12 cols approx) - Full height flex column */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col gap-3 h-full min-h-0">
          
          {/* 1. Image Upload (Compact) */}
          <div className="bg-cyber-panel p-3 rounded-xl border border-white/5 shadow-lg flex-shrink-0 flex gap-3 items-center">
            <div className="relative w-20 h-20 bg-black/50 rounded-lg border border-dashed border-gray-600 flex-shrink-0 overflow-hidden group hover:border-cyber-primary transition-colors">
               {sourceImage ? (
                  <img src={sourceImage} alt="Ref" className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  </div>
               )}
               <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <div className="flex-1 min-w-0">
               <h2 className="text-sm font-bold text-white truncate">Reference Image</h2>
               <p className="text-[10px] text-gray-400 truncate mt-1">
                 {sourceImage ? `Ratio: ${aspectRatio}` : 'Upload a subject to light'}
               </p>
               {!sourceImage && <div className="text-[10px] text-cyber-primary mt-1 animate-pulse">Waiting for upload...</div>}
            </div>
          </div>

          {/* 2. 3D Visualizer (Fixed Height) */}
          <div className="bg-cyber-panel p-3 rounded-xl border border-white/5 shadow-lg flex-shrink-0 relative">
             <div className="absolute top-3 left-3 z-10 pointer-events-none">
                <span className="text-[10px] font-bold text-cyber-primary bg-black/40 px-1.5 py-0.5 rounded">3D RIG</span>
             </div>
             <LightVisualizer params={params} onChange={handleParamChange} />
          </div>

          {/* 3. Sliders (Flex to fill remaining space if needed, or compact) */}
          <div className="bg-cyber-panel p-3 rounded-xl border border-white/5 shadow-lg flex-shrink-0 overflow-y-auto custom-scrollbar">
             <ControlPanel 
               params={params} 
               onChange={handleSliderChange} 
               disabled={appState === AppState.GENERATING}
             />
          </div>

          {/* Generate Button (Bottom pinned) */}
          <div className="mt-auto pt-1">
            <button
                onClick={handleGenerate}
                disabled={!sourceImage || appState === AppState.GENERATING}
                className={`w-full py-3 rounded-lg font-bold text-base font-mono tracking-wider transition-all shadow-lg
                ${!sourceImage 
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700' 
                    : appState === AppState.GENERATING 
                    ? 'bg-cyber-panel border border-cyber-primary text-cyber-primary animate-pulse'
                    : 'bg-gradient-to-r from-cyber-primary to-blue-600 hover:to-blue-500 text-white shadow-cyber-primary/20'
                }`}
            >
                {appState === AppState.GENERATING ? 'PROCESSING...' : 'GENERATE'}
            </button>
            {errorMsg && (
                <div className="mt-2 text-[10px] text-red-400 text-center truncate px-2">
                {errorMsg}
                </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Output Preview - Full Height */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9 h-full min-h-0">
          <div className="w-full h-full bg-black/40 rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center shadow-2xl">
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
              style={{backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
            </div>

            {/* Empty State */}
            {!generatedImage && appState !== AppState.GENERATING && (
              <div className="text-center opacity-30 select-none">
                <div className="text-8xl mb-2 text-cyber-primary blur-[2px]">💡</div>
                <h3 className="text-3xl font-bold text-white tracking-widest">STUDIO_IDLE</h3>
              </div>
            )}

            {/* Loading State */}
            {appState === AppState.GENERATING && (
              <div className="text-center z-10">
                <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 border-t-4 border-cyber-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-t-4 border-cyber-secondary rounded-full animate-spin reverse-spin opacity-70"></div>
                </div>
                <p className="text-cyber-primary font-mono text-xl animate-pulse tracking-widest">RENDERING</p>
                <p className="text-xs text-gray-500 mt-2 font-mono">CALCULATING PHOTONS...</p>
              </div>
            )}

            {/* Result Image */}
            {generatedImage && (
              <div className="relative w-full h-full p-2 group">
                <img 
                  src={generatedImage} 
                  alt="AI Generated" 
                  className="w-full h-full object-contain drop-shadow-2xl" 
                />
                
                {/* Badge */}
                <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-cyber-primary/40 flex items-center gap-2 shadow-lg">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                   <span className="text-[10px] text-white font-mono tracking-wider">GEMINI_RENDER</span>
                </div>

                {/* Download Fab */}
                <a 
                  href={generatedImage} 
                  download="studio-relight.png"
                  className="absolute bottom-6 right-6 w-12 h-12 bg-cyber-primary hover:bg-cyber-accent text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110 shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                  title="Download"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                </a>
              </div>
            )}
          </div>
        </div>

      </main>
      
      {/* Global Styles for Scrollbar hidden but functional if needed inside panels */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
        .reverse-spin {
            animation-direction: reverse;
        }
      `}</style>
    </div>
  );
}

export default App;