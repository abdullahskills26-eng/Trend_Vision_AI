import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Download, GitCompare, Star, Archive } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ConfidenceBar from '../ui/ConfidenceBar';
import AdvancedTrendChart from '../charts/AdvancedTrendChart';
import KeywordBubbleCloud from '../charts/KeywordBubbleCloud';
import PredictionLoader from '../ui/LoadingSpinner';
import { createPrediction, comparePredictions, addToWatchlist, fetchModels, validateDataset } from '../../services/api';
import { validatePredictionInput } from '../../utils/predictionValidation';
import { DOMAIN_CATEGORIES } from '../../utils/constants';
import type { TrendPrediction, ViewName, ChartType } from '../../types';

// ─── Props ────────────────────────────────────────────────────────────────────
// NOTE: No hoisted/lifted prediction state needed.
// App.tsx keeps AIPredictor permanently mounted via CSS display:none/block.
// This means local state here is NEVER destroyed by navigation events.
interface AIPredictorProps {
  token: string;
  prefillQuery: string;
  clearPrefill: () => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onNavigate: (view: ViewName) => void;
}

export default function AIPredictor({
  token: _token,       // kept in props for future auth use; suppressed unused warning
  prefillQuery,
  clearPrefill,
  onToast,
  onNavigate,
}: AIPredictorProps) {

  // ── Form wizard state ──────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [selectedDomain, setSelectedDomain] = useState('Technology');
  const [selectedModel, setSelectedModel] = useState('AutoML');
  const [modelOptions, setModelOptions] = useState<{ name: string; description: string; autoSelectable: boolean; supported: boolean }[]>([]);
  const [datasetSample, setDatasetSample] = useState('');
  const [datasetValidation, setDatasetValidation] = useState<null | { valid: boolean; rowCount: number; columnCount: number; missingRate: number; duplicateCount: number; warnings: string[]; qualityScore: number; metadata: any }>(null);
  const [query, setQuery] = useState('');
  const [queryB, setQueryB] = useState('');
  const [isCompareMode, setIsCompareMode] = useState(false);

  // ── Async / result state ───────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing connection...');
  const [prediction, setPrediction] = useState<TrendPrediction | null>(() => {
    if (typeof window === 'undefined') return null;
    const cached = window.sessionStorage.getItem('trendvision_last_prediction');
    return cached ? JSON.parse(cached) as TrendPrediction : null;
  });
  const [predictionB, setPredictionB] = useState<TrendPrediction | null>(() => {
    if (typeof window === 'undefined') return null;
    const cached = window.sessionStorage.getItem('trendvision_last_prediction_b');
    return cached ? JSON.parse(cached) as TrendPrediction : null;
  });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  // ── Chart display state ────────────────────────────────────────────────────
  const [chartType, setChartType] = useState<ChartType>('line');

  const reportRef = useRef<HTMLDivElement>(null);

  // ── Prefill effect: when a topic is pre-selected from Dashboard/Watchlist ──
  useEffect(() => {
    if (prefillQuery) {
      setQuery(prefillQuery);
      setStep(3);
      clearPrefill();
    }
  }, [prefillQuery, clearPrefill]);

  useEffect(() => {
    let mounted = true;
    const loadModels = async () => {
      try {
        const result = await fetchModels();
        if (!mounted) return;
        setModelOptions(result.models || []);
        if (result.models && result.models.length) {
          setSelectedModel((prev) => {
            const hasPrev = result.models.some((model) => model.name === prev);
            return hasPrev ? prev : result.models[0].name;
          });
        }
      } catch (err) {
        console.warn('Failed to load models', err);
      }
    };

    loadModels();
    return () => { mounted = false; };
  }, []);

  // Persist the current prediction workspace so results survive temporary page state updates.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (prediction) {
      window.sessionStorage.setItem('trendvision_last_prediction', JSON.stringify(prediction));
    } else {
      window.sessionStorage.removeItem('trendvision_last_prediction');
    }
  }, [prediction]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (predictionB) {
      window.sessionStorage.setItem('trendvision_last_prediction_b', JSON.stringify(predictionB));
    } else {
      window.sessionStorage.removeItem('trendvision_last_prediction_b');
    }
  }, [predictionB]);

  // ── handleSubmit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (isCompareMode && !queryB.trim()) return;

    const validationA = validatePredictionInput(query);
    if (!validationA.valid) {
      setError(validationA.message);
      setNotice('');
      return;
    }

    if (isCompareMode) {
      const validationB = validatePredictionInput(queryB);
      if (!validationB.valid) {
        setError(validationB.message);
        setNotice('');
        return;
      }
    }

    // Reset result state before new prediction
    setPrediction(null);
    setPredictionB(null);
    setNotice('');
    setError('');
    setLoading(true);

    // Cycle through loading messages
    const loadingStages = [
      'Fetching raw market data...',
      'Preprocessing datasets...',
      `Initializing ${selectedModel} model weights...`,
      'Running statistical regressions...',
      'Calculating confidence scores...',
      'Synthesizing final forecast...',
    ];
    let stageIndex = 0;
    const intervalId = setInterval(() => {
      stageIndex++;
      if (stageIndex < loadingStages.length) {
        setLoadingText(loadingStages[stageIndex]);
      }
    }, 800);

    try {
      if (isCompareMode) {
        const data = await comparePredictions(
          query.trim(), queryB.trim(), selectedDomain, selectedModel
        );
        setPrediction(data.predictionA);
        setPredictionB(data.predictionB);
        if (data.notice) setNotice(data.notice);
      } else {
        const data = await createPrediction(query.trim(), selectedDomain, selectedModel);
        setPrediction(data.prediction);
        if (data.notice) setNotice(data.notice);
      }
      onToast('Forecast generated successfully!', 'success');
    } catch (err: any) {
      setError(err.message || 'Prediction failed. Please try again.');
      onToast('Prediction failed. Please try again.', 'error');
    } finally {
      clearInterval(intervalId);
      setLoading(false);
      setLoadingText('Initializing connection...');
    }
  };

  const handleValidateDataset = async () => {
    try {
      const rows = JSON.parse(datasetSample || '[]');
      const result = await validateDataset(rows);
      setDatasetValidation(result);
      if (result.valid) {
        onToast('Dataset validation passed', 'success');
      } else {
        onToast('Dataset validation completed with warnings', 'info');
      }
    } catch (err: any) {
      setDatasetValidation(null);
      onToast('Failed to validate dataset. Provide valid JSON rows.', 'error');
    }
  };

  // ── Watchlist add ─────────────────────────────────────────────────────────
  const handleWatchlistAdd = async (q: string) => {
    try {
      await addToWatchlist(q, selectedDomain);
      onToast(`Added "${q}" to Watchlist`, 'success');
    } catch (err: any) {
      if (err.message?.includes('already')) {
        onToast(`"${q}" is already in Watchlist`, 'info');
      } else {
        onToast('Failed to add to watchlist', 'error');
      }
    }
  };

  // ── PDF export ────────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    const report = reportRef.current;
    if (!report || !prediction || isExporting) {
      if (!prediction) onToast('Generate a forecast before exporting a report.', 'info');
      return;
    }

    try {
      setIsExporting(true);
      onToast('Generating PDF...', 'info');
      const [jsPdfModule, html2canvasModule] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      // jsPDF is a named export in Vite's browser bundle. html2canvas is a default export.
      const jsPDF = jsPdfModule.jsPDF;
      const html2canvas = html2canvasModule.default;
      if (!jsPDF || !html2canvas) {
        throw new Error('The PDF generator could not be loaded.');
      }

      const canvas = await html2canvas(report, {
        backgroundColor: '#0b1120',
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: report.scrollWidth,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const pageHeightInPixels = Math.floor((pdfHeight * canvas.width) / pdfWidth);

      // Slice the rendered report into pages so content is not truncated on long forecasts.
      for (let sourceY = 0, pageNumber = 0; sourceY < canvas.height; sourceY += pageHeightInPixels, pageNumber += 1) {
        const sliceHeight = Math.min(pageHeightInPixels, canvas.height - sourceY);
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;
        const context = pageCanvas.getContext('2d');
        if (!context) throw new Error('Unable to prepare the PDF page.');

        context.drawImage(
          canvas,
          0, sourceY, canvas.width, sliceHeight,
          0, 0, canvas.width, sliceHeight,
        );

        if (pageNumber > 0) pdf.addPage();
        const imageHeight = (sliceHeight * pdfWidth) / canvas.width;
        pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfWidth, imageHeight, undefined, 'FAST');
      }

      const safeQuery = prediction.query
        .trim()
        .replace(/[^a-z0-9]+/gi, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 60) || 'forecast';
      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`TrendVision_Forecast_${safeQuery}_${date}.pdf`);
      onToast('PDF exported successfully!', 'success');
    } catch (err) {
      console.error(err);
      onToast('Failed to export PDF', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // ── Reset to form ─────────────────────────────────────────────────────────
  const resetForm = () => {
    setPrediction(null);
    setPredictionB(null);
    setQuery('');
    setQueryB('');
    setStep(1);
    setNotice('');
    setError('');
    setLoading(false);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('trendvision_last_prediction');
      window.sessionStorage.removeItem('trendvision_last_prediction_b');
    }
  };

  // ── Result panel renderer ─────────────────────────────────────────────────
  const renderPredictionPanel = (pred: TrendPrediction) => (
    <div className="space-y-6">
      {/* Header card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-[10px] font-mono border border-[var(--color-brand-primary)]/20">
                {pred.category}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-[10px] font-mono border border-purple-500/20 flex items-center gap-1">
                🤖 {pred.modelUsed}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)] text-[10px] font-mono border border-[var(--bg-border)]">
                Confidence: {pred.confidence}%
              </span>
            </div>
            {pred.modelReason ? (
              <p className="text-xs text-[var(--text-secondary)] mt-2">Model rationale: {pred.modelReason}</p>
            ) : null}
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">{pred.query}</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-2xl">{pred.summary}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge direction={pred.direction} showDescription />
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-[var(--bg-border)]">
          <ConfidenceBar value={pred.confidence} />
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">📈 12-Month Projection</h4>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartType)}
              className="bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-md px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)]"
            >
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="scatter">Scatter Plot</option>
              <option value="histogram">Histogram</option>
              <option value="heatmap">Heatmap</option>
              <option value="box">Box Plot</option>
              <option value="treemap">Treemap</option>
              <option value="radar">Radar Chart</option>
              <option value="confidence">Confidence Interval</option>
              <option value="residual">Residual Plot</option>
            </select>
          </div>
          <AdvancedTrendChart prediction={pred} chartType={chartType} />
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">📊 Historical Trend (2022–2026)</h4>
          </div>
          <AdvancedTrendChart prediction={{ ...pred, forecastData: pred.historicalData as any }} chartType={chartType === 'line' ? 'area' : chartType === 'confidence' ? 'line' : chartType} />
        </Card>
      </div>

      {/* Keywords + Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-1">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4">🔑 Keyword Cloud</h4>
          <KeywordBubbleCloud keywords={pred.keywords} />
        </Card>
        <Card className="p-6 md:col-span-2">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4">💡 AI Insights</h4>
          <div className="space-y-3">
            {pred.insights.map((insight, idx) => (
              <div key={idx} className="flex gap-3 text-sm items-start">
                <span className="text-[var(--color-brand-primary)] mt-0.5">✓</span>
                <p className="text-[var(--text-secondary)] leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER DECISION TREE
  // Order matters: results first, then loading, then form.
  // The `prediction && !loading` guard ensures the result stays visible even
  // after the toast fires and App re-renders — because this component is
  // always mounted (CSS display) and local state is never destroyed.
  // ─────────────────────────────────────────────────────────────────────────

  if (prediction && !loading) {
    return (
      <div className="space-y-6">
        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--bg-border)]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-emerald-400 text-sm font-semibold">✅ Forecast ready!</span>
            {notice && (
              <p className="text-xs text-amber-400 flex items-center gap-1.5">
                · ⚡ {notice}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 ml-auto flex-wrap">
            <button
              onClick={() => handleWatchlistAdd(prediction.query)}
              className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-semibold text-sm rounded-xl transition cursor-pointer flex items-center gap-2"
            >
              <Star className="w-4 h-4" /> Add to Watchlist
            </button>
            <button
              onClick={() => onNavigate('archive')}
              className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-sm rounded-xl transition cursor-pointer flex items-center gap-2 border border-emerald-500/20"
            >
              <Archive className="w-4 h-4" /> View in Archive
            </button>
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-4 py-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-border)] text-[var(--text-primary)] font-semibold text-sm rounded-xl transition cursor-pointer flex items-center gap-2 border border-[var(--bg-border)]"
            >
              <Download className="w-4 h-4" /> {isExporting ? 'Generating PDF...' : 'Export PDF'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-[var(--color-brand-primary)] hover:brightness-110 text-white font-semibold text-sm rounded-xl transition cursor-pointer flex items-center gap-2 shadow-lg shadow-sky-500/20"
            >
              <Sparkles className="w-4 h-4" /> New Predict
            </button>
          </div>
        </div>

        {/* Printable result area */}
        <div ref={reportRef} className="space-y-6 bg-[var(--bg-base)]">
          {isCompareMode && predictionB ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-center text-[var(--color-brand-primary)]">Topic A</h3>
                {renderPredictionPanel(prediction)}
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-center text-[var(--color-brand-secondary)]">Topic B</h3>
                {renderPredictionPanel(predictionB)}
              </div>
            </div>
          ) : (
            renderPredictionPanel(prediction)
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <Card className="min-h-[400px] flex flex-col items-center justify-center bg-[var(--bg-base)]">
        <PredictionLoader />
      </Card>
    );
  }

  // ── Step-by-step form ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          <Sparkles className="w-6 h-6 inline mr-2 text-[var(--color-brand-primary)]" />
          AI Trend Predictor
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Analyze any topic and get AI-powered forecasts</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${step >= s
                ? 'bg-[var(--color-brand-primary)] text-white'
                : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--bg-border)]'}`}>
              {s}
            </div>
            {s < 3 && (
              <div className={`w-12 h-0.5 rounded ${step > s ? 'bg-[var(--color-brand-primary)]' : 'bg-[var(--bg-border)]'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Domain */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
            Step 1: What do you want to analyze?
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-4">Choose a domain category for your forecast</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {DOMAIN_CATEGORIES.map(domain => (
              <button
                key={domain.id}
                type="button"
                onClick={() => { setSelectedDomain(domain.id); setStep(Math.max(step, 2)); }}
                className={`p-4 rounded-xl border text-center cursor-pointer transition-all duration-200
                  ${selectedDomain === domain.id
                    ? 'bg-[var(--color-brand-primary)]/10 border-[var(--color-brand-primary)]/50 shadow-lg shadow-sky-500/10'
                    : 'bg-[var(--bg-elevated)] border-[var(--bg-border)] hover:border-[var(--color-brand-primary)]/30'}`}
              >
                <span className="text-2xl block mb-1">{domain.icon}</span>
                <span className={`text-xs font-semibold block ${selectedDomain === domain.id ? 'text-[var(--color-brand-primary)]' : 'text-[var(--text-primary)]'}`}>
                  {domain.label}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Step 2: Model */}
        {step >= 2 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              Step 2: Choose your Machine Learning Model
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Each model uses different maths — results, confidence scores, and chart shapes will vary
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {(modelOptions.length > 0 ? modelOptions : [
                { name: 'AutoML', description: 'Automatically selects the best model for your query', autoSelectable: true, supported: true },
                { name: 'Random Forest', description: 'Ensemble of trees, robust & balanced', autoSelectable: false, supported: true },
                { name: 'Neural Network', description: 'Deep patterns, volatile forecast', autoSelectable: false, supported: true },
                { name: 'Gradient Boosting', description: 'Best accuracy, aggressive projection', autoSelectable: false, supported: true },
                { name: 'SVM', description: 'Smooth boundary, high precision', autoSelectable: false, supported: true },
              ]).map((model) => (
                <button
                  key={model.name}
                  type="button"
                  onClick={() => { setSelectedModel(model.name); setStep(Math.max(step, 3)); }}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition-all duration-200 flex flex-col items-center gap-1
                    ${selectedModel === model.name
                      ? 'bg-[var(--color-brand-secondary)]/10 border-[var(--color-brand-secondary)]/50 shadow-lg shadow-purple-500/10'
                      : 'bg-[var(--bg-elevated)] border-[var(--bg-border)] hover:border-[var(--color-brand-secondary)]/30'}`}
                >
                  <span className="text-xl">{model.name === 'AutoML' ? '🤖' : model.name === 'Random Forest' ? '🌲' : model.name === 'Neural Network' ? '🧠' : model.name === 'Gradient Boosting' ? '🚀' : '📐'}</span>
                  <span className={`text-xs font-semibold ${selectedModel === model.name ? 'text-[var(--color-brand-secondary)]' : 'text-[var(--text-primary)]'}`}>
                    {model.name}
                  </span>
                  <span className="text-[9px] text-[var(--text-muted)] leading-tight">{model.description}</span>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Step 3: Query */}
        {step >= 3 && (
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Step 3: Enter your query</h3>
                <p className="text-xs text-[var(--text-muted)]">Describe the trend or topic you want to forecast</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isCompareMode
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--bg-border)] hover:text-[var(--text-primary)]'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                Compare Mode
              </button>
            </div>

            <div className="space-y-4">
              <div>
                {isCompareMode && (
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">Topic A</label>
                )}
                <textarea
                  required
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Decentralized Web Hosting, AI Video Editors..."
                  rows={isCompareMode ? 2 : 4}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] transition placeholder-[var(--text-muted)] resize-none"
                />
              </div>
              {isCompareMode && (
                <div>
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">Topic B</label>
                  <textarea
                    required
                    value={queryB}
                    onChange={(e) => setQueryB(e.target.value)}
                    placeholder="e.g. Traditional Cloud Hosting, Manual Video Editing..."
                    rows={2}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] transition placeholder-[var(--text-muted)] resize-none"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 rounded-3xl border border-[var(--bg-border)] bg-[var(--bg-elevated)] p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">Dataset Quality Check</p>
                  <p className="text-[var(--text-muted)] text-xs">Paste a sample dataset as JSON rows to validate missing values and duplicates.</p>
                </div>
                <button
                  type="button"
                  onClick={handleValidateDataset}
                  className="px-3 py-1.5 bg-[var(--color-brand-primary)] text-white text-[11px] rounded-full transition hover:brightness-110"
                >
                  Validate
                </button>
              </div>
              <textarea
                value={datasetSample}
                onChange={(e) => setDatasetSample(e.target.value)}
                placeholder='[{"month":"2025-01","value":120},{"month":"2025-02","value":130}]'
                rows={4}
                className="w-full bg-[var(--bg-base)] border border-[var(--bg-border)] rounded-3xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] transition placeholder-[var(--text-muted)] resize-none"
              />
              {datasetValidation && (
                <div className="mt-3 rounded-2xl bg-[var(--bg-base)] border border-[var(--bg-border)] p-3 text-[13px]">
                  <p className="font-semibold text-[var(--text-primary)]">Validation Result</p>
                  <p className="text-[var(--text-muted)] text-xs mt-1">Row count: {datasetValidation.rowCount}, columns: {datasetValidation.columnCount}, quality score: {datasetValidation.qualityScore}</p>
                  {datasetValidation.warnings.length > 0 ? (
                    <ul className="mt-2 space-y-2 text-[var(--text-secondary)] text-xs list-disc list-inside">
                      {datasetValidation.warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-emerald-400 text-xs mt-2">No issues found. Dataset looks strong.</p>
                  )}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-rose-400 mt-3">❌ {error}</p>}

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={!query.trim() || (isCompareMode && !queryB.trim())}
                className="px-8 py-3 bg-[var(--color-brand-primary)] hover:brightness-110 text-white font-bold text-sm rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCompareMode ? 'Compare Trends' : 'Generate Forecast'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Card>
        )}
      </form>
    </div>
  );
}
