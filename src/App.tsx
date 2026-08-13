import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { Overview } from './pages/Overview';
import { DatasetPage } from './pages/Dataset';
import { EnginesPage } from './pages/Engines';
import { AnalyticsPage } from './pages/Analytics';
import { RULPredictionPage } from './pages/RULPrediction';
import { AgentPage } from './pages/AgentPage';
import { ReportsPage } from './pages/Reports';
import { SettingsPage } from './pages/Settings';
import { DatasetMetadata } from './types';
import { fetchUploadedDatasets } from './services/datasetApi';

export default function App() {
  const [entered, setEntered] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedDataset, setSelectedDataset] = useState<DatasetMetadata | null>(null);
  const [selectedEngineId, setSelectedEngineId] = useState<number>(24);

  // Initial load of uploaded datasets
  useEffect(() => {
    fetchUploadedDatasets()
      .then(datasets => {
        if (datasets && datasets.length > 0) {
          setSelectedDataset(datasets[0]);
        }
      })
      .catch(err => {
        console.log('No prior datasets loaded or server starting up:', err);
      });
  }, []);

  const handleEnterApp = () => {
    setEntered(true);
  };

  if (!entered) {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Overview
            selectedDataset={selectedDataset}
            onNavigateToDataset={() => setActiveTab('dataset')}
            onNavigateToPrediction={() => setActiveTab('rul')}
            onNavigateToAgent={() => setActiveTab('agent')}
          />
        );
      case 'dataset':
        return (
          <DatasetPage
            selectedDataset={selectedDataset}
            onDatasetSelect={setSelectedDataset}
          />
        );
      case 'engines':
        return <EnginesPage selectedDataset={selectedDataset} />;
      case 'analytics':
        return <AnalyticsPage selectedDataset={selectedDataset} />;
      case 'rul':
        return <RULPredictionPage selectedDataset={selectedDataset} />;
      case 'agent':
        return (
          <AgentPage
            dataset={selectedDataset}
            selectedEngineId={selectedEngineId}
            onSelectEngine={setSelectedEngineId}
          />
        );
      case 'reports':
        return <ReportsPage selectedDataset={selectedDataset} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <Overview
            selectedDataset={selectedDataset}
            onNavigateToDataset={() => setActiveTab('dataset')}
            onNavigateToPrediction={() => setActiveTab('rul')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#16191C] font-sans flex flex-col antialiased selection:bg-[#A6362A]/20 selection:text-[#A6362A]">
      <Header selectedDataset={selectedDataset} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
