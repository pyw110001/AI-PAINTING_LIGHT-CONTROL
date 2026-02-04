# AI Virtual Studio Light Control

![Version](https://img.shields.io/badge/version-1.0_BETA-cyan) ![AI](https://img.shields.io/badge/AI-Gemini_3_Pro-purple)

A professional-grade, cyberpunk-themed web application that allows users to virtually "relight" photographs using Google's Gemini 3 Pro AI. By manipulating a virtual 3D lighting rig, users can change the lighting direction, elevation, and intensity of a subject while strictly preserving the original character and composition.

## ✨ Core Features

- **Interactive 3D Light Visualizer**: A real-time, drag-to-rotate 3D SVG visualization showing the light source's position relative to the subject.
- **Precision Lighting Controls**:
  - **Azimuth (0-360°)**: Control the horizontal direction of the light.
  - **Elevation (-60° to +60°)**: Control the vertical angle (overhead vs. underlighting).
  - **Intensity (0.1x to 2.0x)**: Adjust the brightness and shadow harshness.
- **Smart Aspect Ratio Preservation**: Automatically detects the uploaded image's dimensions and snaps to the nearest supported aspect ratio (1:1, 4:3, 3:4, 16:9, 9:16) to prevent distortion.
- **Content-Aware Relighting**: Uses advanced prompting strategies to instruct Gemini to strictly preserve the subject's pose, identity, and clothing, changing *only* the lighting physics.
- **Immersive Dashboard UI**: A 16:9 full-screen, non-scrolling interface designed with a dark, cyberpunk aesthetic using Tailwind CSS.

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS (Custom config for Neon/Cyberpunk palette)
- **AI Model**: Google Gemini 3 Pro (`gemini-3-pro-image-preview`)
- **SDK**: `@google/genai`

## 🚀 Usage Guide

1. **Upload Subject**: 
   Click the "Reference Image" card on the left to upload a photo of a person or object. The app will auto-detect the optimal aspect ratio.

2. **Position the Light**:
   - **Visual Mode**: Drag the yellow orb in the "3D Rig" panel to intuitively rotate the light around the subject.
   - **Manual Mode**: Use the sliders below the rig to fine-tune Azimuth, Elevation, and Intensity.

3. **Generate**:
   Click the **GENERATE** button. The app will process the request using Gemini 3 Pro.
   *(Note: This process may take a few seconds as it calculates complex light transport)*.

4. **Save**:
   Once the image is generated, hover over the result in the main view and click the download icon to save the PNG.

## ⚠️ API Requirements

This application relies on the **Gemini 3 Pro** model series (`gemini-3-pro-image-preview`) which supports advanced image generation and editing.

- **Paid Key Required**: This model typically requires a paid API key from a Google Cloud Project with billing enabled.
- **Key Selection**: The app integrates with `window.aistudio` for secure key selection if running in the AI Studio environment. Otherwise, it expects `process.env.API_KEY` to be configured.

## 🎨 UI Theme

The interface utilizes a custom Tailwind configuration:
- **Primary**: Cyan (`#06b6d4`)
- **Secondary**: Fuchsia (`#d946ef`)
- **Background**: Slate Dark (`#0f172a`)

## 📄 License

MIT License
