# HYPERBLOOM - Local Setup Guide

This guide will help you run HYPERBLOOM on your local machine using Node.js and Vite.

## Prerequisites

- **Node.js**: Version 18 or higher.
- **npm**: Usually comes with Node.js.

## Getting Started

1. **Clone or Download the Project**:
   Ensure you have all the files in a directory on your computer.

2. **Open Terminal in the Project Folder**:
   Crucial: You must be *inside* the folder that contains `package.json`.
   ```bash
   cd your-project-folder
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory (you can copy `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Fill in your API keys:
   - `GEMINI_API_KEY`: Your Google Gemini API key.
   - `OPENWEATHER_API_KEY`: (Optional) Your OpenWeatherMap API key.

4. **Run the Application**:
   For development mode with hot-reloading:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

5. **Build for Production**:
   If you want to build and run the production version:
   ```bash
   npm run build
   npm start
   ```

## Troubleshooting

### Error: "'vite' is not recognized..."
This means the project dependencies are not installed correctly.
1. **Delete the `node_modules` folder** (if it exists).
2. **Run the install command again**:
   ```bash
   npm install
   ```
3. **Try running with `npx`** (this will download and run Vite automatically):
   ```bash
   npx vite build
   ```

### Error: "Missing script: 'build'"
Ensure you are *inside* the project folder before running the command. Use `cd` to enter the folder.

## Features

- **Real-time Weather**: Forecasting and agricultural advisories.
- **Pest & Disease Alerts**: AI-powered detection and community reports.
- **Livestock Management**: Vaccination schedules and tracking.
- **Marketplace**: Buy and sell agricultural products.
- **Community Forum**: Connect with other farmers.
- **AI Assistant**: 24/7 agricultural expert powered by Gemini.
