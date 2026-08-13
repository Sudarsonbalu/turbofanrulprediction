import { describe, it } from 'node:test';
import assert from 'node:assert';
import { listUploadedDatasets, createSampleCmapssDataset, getDatasetPreview, getDatasetQuality } from '../backend/app/services/dataset_service';
import { runDatasetAnalysis, getDatasetAnalysis } from '../backend/app/services/analysis_service';
import { runPredictionService, getPredictionResults } from '../backend/app/services/prediction_service';
import { checkHermesAgentStatus, processHermesTask } from '../backend/app/hermes/service';
import { HERMES_READONLY_TOOLS } from '../backend/app/hermes/tools';

describe('TurbofanAI Integration & Production Readiness Test Suite', () => {
  let createdDatasetId = '';

  // ==========================================
  // PHASE 1 TESTS: Dataset Management & Data Integrity
  // ==========================================
  describe('Phase 1: Dataset Management & Validation', () => {
    it('should generate or verify NASA C-MAPSS benchmark dataset', () => {
      const sample = createSampleCmapssDataset();
      assert.ok(sample, 'Sample dataset metadata should exist.');
      assert.strictEqual(sample.filename, 'train_FD001.txt');
      assert.ok(sample.summary.engines > 0, 'Should contain turbofan engine units.');
      createdDatasetId = sample.dataset_id;
    });

    it('should list available workspace datasets', () => {
      const datasets = listUploadedDatasets();
      assert.ok(Array.isArray(datasets), 'Datasets should return an array.');
      assert.ok(datasets.length > 0, 'At least one dataset should be registered.');
    });

    it('should retrieve dataset preview and quality report', () => {
      const preview = getDatasetPreview(createdDatasetId, 5);
      assert.ok(preview, 'Preview should be generated.');
      assert.strictEqual(preview.rows.length, 5, 'Preview should contain 5 rows.');

      const quality = getDatasetQuality(createdDatasetId);
      assert.ok(quality, 'Quality metrics should exist.');
      assert.ok(quality.missing_values >= 0, 'Missing values count should be valid.');
    });
  });

  // ==========================================
  // PHASE 2 TESTS: Sensor Analysis & ML RUL Predictions
  // ==========================================
  describe('Phase 2: Data Analysis & ML Predictive Engine', () => {
    it('should execute sensor analysis pipeline', () => {
      const analysis = runDatasetAnalysis(createdDatasetId);
      assert.ok(analysis, 'Analysis pipeline should execute.');
      assert.ok(analysis.sensors_stats.length > 0, 'Sensor statistics should be generated.');
    });

    it('should retrieve dataset analysis results', () => {
      const analysis = getDatasetAnalysis(createdDatasetId);
      assert.ok(analysis, 'Retrieved analysis should exist.');
      assert.ok(analysis.summary.total_engines > 0, 'Engine summary should be populated.');
    });

    it('should run ML prediction service and compute RUL', () => {
      const pred = runPredictionService(createdDatasetId);
      assert.ok(pred, 'Prediction pipeline should execute.');
      assert.ok(pred.predictions.length > 0, 'Engine predictions should be returned.');
      assert.ok(pred.metrics.mae >= 0, 'Model MAE metric should be valid.');
    });

    it('should fetch saved prediction results', () => {
      const saved = getPredictionResults(createdDatasetId);
      assert.ok(saved, 'Saved predictions should exist.');
      assert.ok(saved.model_used, 'Model name should be specified.');
    });
  });

  // ==========================================
  // PHASE 3 TESTS: Hermes AI Service & Proxy Connection
  // ==========================================
  describe('Phase 3: Hermes / Nous AI Agent Service', () => {
    it('should check Hermes service health and provider configuration', async () => {
      const health = await checkHermesAgentStatus();
      assert.ok(health, 'Health object should be returned.');
      assert.strictEqual(health.provider, 'Nous Portal');
      assert.strictEqual(health.model, 'upstage/solar-pro4');
      assert.ok(Array.isArray(health.capabilities), 'Capabilities should be listed.');
    });

    it('should list Hermes read-only engineering tools', () => {
      assert.ok(HERMES_READONLY_TOOLS.length >= 8, 'Read-only tools should be configured.');
      const toolNames = HERMES_READONLY_TOOLS.map(t => t.function.name);
      assert.ok(toolNames.includes('get_dataset_summary'), 'get_dataset_summary tool should exist.');
      assert.ok(toolNames.includes('get_engine_details'), 'get_engine_details tool should exist.');
      assert.ok(toolNames.includes('compare_engines'), 'compare_engines tool should exist.');
    });
  });

  // ==========================================
  // END-TO-END INTEGRATION TEST
  // ==========================================
  describe('End-to-End AI Integration Flow', () => {
    it('should complete full request flow: User -> Frontend -> Backend -> Hermes -> AI -> Frontend', async () => {
      const testPrompt = 'Explain what this application does.';
      const testConvId = `e2e_test_${Date.now()}`;

      console.log(`\nExecuting E2E Test Query: "${testPrompt}"...`);
      const response = await processHermesTask(testPrompt, testConvId, createdDatasetId, 1);

      assert.ok(response, 'Response should not be empty.');
      assert.strictEqual(response.status, 'SUCCESS', 'Response status must be SUCCESS.');
      assert.strictEqual(response.conversation_id, testConvId, 'Conversation ID should be preserved.');
      assert.strictEqual(response.provider, 'Nous Portal', 'Provider should be Nous Portal.');
      assert.ok(response.response.length > 0, 'AI response text should be generated.');
      assert.ok(response.tool_activity.length > 0, 'Tool activity trail should record executed tools.');

      console.log(`✔ E2E Test Completed Successfully!`);
      console.log(`- Conversation ID: ${response.conversation_id}`);
      console.log(`- Provider: ${response.provider}`);
      console.log(`- Model: ${response.model_used}`);
      console.log(`- Tools Executed: ${response.tool_activity.map(t => t.tool_name).join(', ')}`);
      console.log(`- AI Response Preview: ${response.response.slice(0, 150)}...\n`);
    });
  });
});
