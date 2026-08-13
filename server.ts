import express, { Request, Response } from 'express';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import {
  saveUploadedDataset,
  listUploadedDatasets,
  getDatasetMetadata,
  getDatasetPreview,
  getDatasetQuality,
  getDatasetColumnProfiles,
  deleteDataset,
  createSampleCmapssDataset,
  ensureSampleDatasetExists
} from './backend/app/services/dataset_service';
import {
  runDatasetAnalysis,
  getDatasetAnalysis,
  getEngineDetail
} from './backend/app/services/analysis_service';
import {
  runPredictionService,
  getPredictionResults,
  getModelComparison
} from './backend/app/services/prediction_service';
import { runTrainingPipeline } from './backend/app/ml/train';
import { checkHermesAgentStatus, processHermesTask } from './backend/app/hermes/service';
import { HERMES_READONLY_TOOLS } from './backend/app/hermes/tools';
import fs from 'fs';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // File upload configuration using Multer in memory
  const storage = multer.memoryStorage();
  const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'TurbofanAI Platform', phase: 2 });
  });

  // Ensure initial sample dataset is loaded
  try {
    ensureSampleDatasetExists();
  } catch (e) {
    console.error('Failed to auto-seed sample dataset:', e);
  }

  // ==========================================
  // Phase 1 Dataset Endpoints
  // ==========================================

  // Load NASA C-MAPSS Sample Benchmark dataset
  app.post('/api/dataset/sample', (req: Request, res: Response) => {
    try {
      const metadata = createSampleCmapssDataset();
      return res.status(201).json(metadata);
    } catch (err: any) {
      console.error('Error seeding sample dataset:', err);
      return res.status(500).json({ error: 'Failed to generate NASA C-MAPSS benchmark dataset.' });
    }
  });

  // Upload dataset
  app.post('/api/dataset/upload', upload.single('file'), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        const altFile = req.file;
        if (!altFile) {
          return res.status(400).json({ error: 'No dataset file attached. Please select a .txt or .csv file.' });
        }
      }

      const file = req.file!;
      if (file.size === 0) {
        return res.status(400).json({ error: 'Uploaded file is empty (0 bytes).' });
      }

      const metadata = saveUploadedDataset(file.buffer, file.originalname);
      return res.status(201).json(metadata);
    } catch (err: any) {
      console.error('Error during dataset upload:', err);
      return res.status(500).json({
        error: 'Failed to process and validate uploaded dataset.',
        details: err?.message || 'Server error'
      });
    }
  });

  // List all uploaded datasets
  app.get('/api/datasets', (req: Request, res: Response) => {
    try {
      const datasets = listUploadedDatasets();
      res.json(datasets);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve uploaded datasets list.' });
    }
  });

  // Get metadata for specific dataset
  app.get('/api/dataset/:dataset_id', (req: Request, res: Response) => {
    try {
      const { dataset_id } = req.params;
      const metadata = getDatasetMetadata(dataset_id);
      if (!metadata) {
        return res.status(404).json({ error: `Dataset '${dataset_id}' not found.` });
      }
      res.json(metadata);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve dataset metadata.' });
    }
  });

  // Preview dataset (first 20 rows)
  app.get('/api/dataset/:dataset_id/preview', (req: Request, res: Response) => {
    try {
      const { dataset_id } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const preview = getDatasetPreview(dataset_id, limit);

      if (!preview) {
        return res.status(404).json({ error: `Dataset '${dataset_id}' or preview data not found.` });
      }

      res.json(preview);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate dataset preview.' });
    }
  });

  // Get data quality analysis
  app.get('/api/dataset/:dataset_id/quality', (req: Request, res: Response) => {
    try {
      const { dataset_id } = req.params;
      const quality = getDatasetQuality(dataset_id);
      if (!quality) {
        return res.status(404).json({ error: `Dataset '${dataset_id}' quality analysis not found.` });
      }
      res.json(quality);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve dataset quality analysis.' });
    }
  });

  // Get column profiles
  app.get('/api/dataset/:dataset_id/columns', (req: Request, res: Response) => {
    try {
      const { dataset_id } = req.params;
      const profiles = getDatasetColumnProfiles(dataset_id);
      if (!profiles) {
        return res.status(404).json({ error: `Dataset '${dataset_id}' column profile not found.` });
      }
      res.json(profiles);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve dataset column profiles.' });
    }
  });

  // Delete dataset
  app.delete('/api/dataset/:dataset_id', (req: Request, res: Response) => {
    try {
      const { dataset_id } = req.params;
      const success = deleteDataset(dataset_id);
      if (!success) {
        return res.status(404).json({ error: `Dataset '${dataset_id}' not found.` });
      }
      res.json({ message: `Dataset '${dataset_id}' deleted successfully.` });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete dataset.' });
    }
  });

  // ==========================================
  // Phase 2 Data & Sensor Analysis Endpoints
  // ==========================================

  // Run dataset analysis
  app.post('/api/analysis/run', (req: Request, res: Response) => {
    try {
      const { dataset_id } = req.body;
      if (!dataset_id) {
        return res.status(400).json({ error: 'dataset_id is required in request body.' });
      }
      const result = runDatasetAnalysis(dataset_id);
      return res.json(result);
    } catch (err: any) {
      console.error('Error running dataset analysis:', err);
      return res.status(500).json({ error: err?.message || 'Failed to execute dataset analysis.' });
    }
  });

  // Get dataset analysis
  app.get('/api/analysis/:dataset_id', (req: Request, res: Response) => {
    try {
      const { dataset_id } = req.params;
      const analysis = getDatasetAnalysis(dataset_id);
      if (!analysis) {
        return res.status(404).json({ error: `No validated dataset available for ID '${dataset_id}'. Upload and validate a real dataset before running analysis.` });
      }
      return res.json(analysis);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve dataset analysis.' });
    }
  });

  // Get sensor statistics
  app.get('/api/analysis/:dataset_id/sensors', (req: Request, res: Response) => {
    try {
      const { dataset_id } = req.params;
      const analysis = getDatasetAnalysis(dataset_id);
      if (!analysis) {
        return res.status(404).json({ error: `No analysis available for dataset '${dataset_id}'.` });
      }
      return res.json({ sensors: analysis.sensors_stats });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve sensor statistics.' });
    }
  });

  // Get sensor correlation matrix
  app.get('/api/analysis/:dataset_id/correlation', (req: Request, res: Response) => {
    try {
      const { dataset_id } = req.params;
      const analysis = getDatasetAnalysis(dataset_id);
      if (!analysis) {
        return res.status(404).json({ error: `No correlation analysis available for dataset '${dataset_id}'.` });
      }
      return res.json(analysis.correlation);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve sensor correlation matrix.' });
    }
  });

  // Get engine details & degradation trajectory
  app.get('/api/analysis/:dataset_id/engines/:engine_id', (req: Request, res: Response) => {
    try {
      const { dataset_id, engine_id } = req.params;
      const engIdNum = parseInt(engine_id, 10);
      if (isNaN(engIdNum)) {
        return res.status(400).json({ error: 'engine_id must be a valid integer.' });
      }
      const engineDetail = getEngineDetail(dataset_id, engIdNum);
      if (!engineDetail) {
        return res.status(404).json({ error: `Engine '${engine_id}' not found in dataset '${dataset_id}'.` });
      }
      return res.json(engineDetail);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve engine details.' });
    }
  });

  // ==========================================
  // Phase 2 ML Prediction Endpoints
  // ==========================================

  // Train ML models
  app.post('/api/prediction/train', (req: Request, res: Response) => {
    try {
      const { dataset_id, params } = req.body;
      if (!dataset_id) {
        return res.status(400).json({ error: 'dataset_id is required in request body.' });
      }
      const dataPath = path.join(process.cwd(), 'uploads', dataset_id.startsWith('dataset_') ? dataset_id : `dataset_${dataset_id}`, 'parsed_data.json');
      if (!fs.existsSync(dataPath)) {
        return res.status(404).json({ error: `No validated dataset available for ID '${dataset_id}'. Upload and validate a real dataset before running prediction.` });
      }
      const rawRows = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      const output = runTrainingPipeline(dataset_id, rawRows, params);
      return res.json({
        status: 'SUCCESS',
        dataset_id: output.datasetId,
        selected_model: output.bestModelName,
        selection_reason: output.selectionReason,
        model_comparisons: output.modelComparisons,
        feature_importance: output.featureImportances
      });
    } catch (err: any) {
      console.error('Error training models:', err);
      return res.status(500).json({ error: err?.message || 'Failed to train ML models.' });
    }
  });

  // Run prediction pipeline & update dashboard
  app.post('/api/prediction/run', (req: Request, res: Response) => {
    try {
      const { dataset_id, params } = req.body;
      if (!dataset_id) {
        return res.status(400).json({ error: 'dataset_id is required in request body.' });
      }
      const results = runPredictionService(dataset_id, params);
      return res.json(results);
    } catch (err: any) {
      console.error('Error running predictions:', err);
      return res.status(500).json({ error: err?.message || 'Failed to generate predictions.' });
    }
  });

  // Get prediction results
  app.get('/api/prediction/:dataset_id/results', (req: Request, res: Response) => {
    try {
      const { dataset_id } = req.params;
      const results = getPredictionResults(dataset_id);
      if (!results) {
        return res.status(404).json({ error: `No predictions found for dataset '${dataset_id}'. Run predictive analysis first.` });
      }
      return res.json(results);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve prediction results.' });
    }
  });

  // Get prediction metrics
  app.get('/api/prediction/:dataset_id/metrics', (req: Request, res: Response) => {
    try {
      const { dataset_id } = req.params;
      const results = getPredictionResults(dataset_id);
      if (!results) {
        return res.status(404).json({ error: `No prediction metrics found for dataset '${dataset_id}'.` });
      }
      return res.json({
        model_used: results.model_used,
        metrics: results.metrics
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve prediction metrics.' });
    }
  });

  // Get model comparison table
  app.get('/api/prediction/:dataset_id/model-comparison', (req: Request, res: Response) => {
    try {
      const { dataset_id } = req.params;
      const comparison = getModelComparison(dataset_id);
      if (!comparison) {
        return res.status(404).json({ error: `No model comparison found for dataset '${dataset_id}'.` });
      }
      return res.json({ comparisons: comparison });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve model comparison.' });
    }
  });

  // Get feature importance
  app.get('/api/prediction/:dataset_id/feature-importance', (req: Request, res: Response) => {
    try {
      const { dataset_id } = req.params;
      const results = getPredictionResults(dataset_id);
      if (!results) {
        return res.status(404).json({ error: `No feature importance found for dataset '${dataset_id}'.` });
      }
      return res.json({ feature_importance: results.feature_importance });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve feature importance.' });
    }
  });

  // ==========================================
  // Phase 3 Hermes Agent Endpoints
  // ==========================================

  // Check Hermes Agent connection status & health
  app.get(['/api/hermes/status', '/api/hermes/health'], async (req: Request, res: Response) => {
    try {
      const status = await checkHermesAgentStatus();
      return res.json(status);
    } catch (err: any) {
      return res.status(500).json({ status: 'OFFLINE', message: err?.message || 'Failed to query Hermes status.' });
    }
  });

  // Get Hermes Agent read-only tool capabilities
  app.get('/api/hermes/capabilities', (req: Request, res: Response) => {
    return res.json({
      read_only_tools: HERMES_READONLY_TOOLS,
      access_level: 'READ_ONLY_ENGINEERING_INTELLIGENCE'
    });
  });

  // Hermes task processing / chat
  app.post('/api/hermes/chat', async (req: Request, res: Response) => {
    try {
      const { message, conversation_id, dataset_id, engine_id } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'message parameter is required.' });
      }
      const response = await processHermesTask(message, conversation_id, dataset_id || 'train_FD001.txt', engine_id);
      return res.json(response);
    } catch (err: any) {
      console.error('Error processing Hermes task:', err);
      return res.status(500).json({ error: err?.message || 'Failed to process Hermes task.' });
    }
  });

  // Hermes engine health evaluation
  app.post('/api/hermes/analyze-engine', async (req: Request, res: Response) => {
    try {
      const { dataset_id, engine_id } = req.body;
      if (!engine_id) {
        return res.status(400).json({ error: 'engine_id parameter is required.' });
      }
      const prompt = `Analyze Engine #${engine_id} in detail. Evaluate degradation, predicted RUL, and key sensor trends.`;
      const response = await processHermesTask(prompt, undefined, dataset_id || 'train_FD001.txt', Number(engine_id));
      return res.json(response);
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Failed to run Hermes engine analysis.' });
    }
  });

  // Hermes engine comparisons
  app.post('/api/hermes/compare-engines', async (req: Request, res: Response) => {
    try {
      const { dataset_id } = req.body;
      const prompt = 'Rank and compare all engines by lowest predicted RUL. Highlight critical risk units.';
      const response = await processHermesTask(prompt, undefined, dataset_id || 'train_FD001.txt');
      return res.json(response);
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Failed to run Hermes engine comparison.' });
    }
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TurbofanAI Platform server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
