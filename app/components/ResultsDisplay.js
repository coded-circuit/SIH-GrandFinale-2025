'use client';
import { motion } from 'framer-motion';
import ImageAnnotation from './ImageAnnotation';

export default function ResultsDisplay({ results, isAnalyzing, imagePreview }) {
  const hasResults = results && results.success;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-200">Results</h2>
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Response time: {results?.responseTime || '--'}</span>
        </div>
      </div>

      {isAnalyzing ? (
        <div className="text-center py-16">
          <svg className="animate-spin w-12 h-12 mx-auto text-blue-500 mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-300 mb-2">Processing your request...</p>
          <p className="text-sm text-slate-500">Analyzing query and generating results</p>
        </div>
      ) : !hasResults ? (
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 mx-auto text-slate-600 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-slate-400 mb-2">No results yet</p>
          <p className="text-sm text-slate-500">
            Upload an image and select an analysis mode to get started
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs font-medium text-blue-300">
              {results.queryType === 'captioning' && 'Image Captioning'}
              {results.queryType === 'grounding' && 'Object Grounding'}
              {results.queryType === 'vqa' && 'Visual Q&A'}
            </span>
          </div>
          {results.queryType === 'captioning' && results.caption && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h3 className="text-sm font-medium text-slate-300 mb-2">Generated Caption</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{results.caption}</p>
            </div>
          )}
          {results.queryType === 'grounding' && results.boundingBoxes && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Annotated Image</h3>
                <ImageAnnotation 
                  imageUrl={imagePreview} 
                  boundingBoxes={results.boundingBoxes}
                />
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-sm font-medium text-slate-300 mb-2">Detected Objects</h3>
                <p className="text-slate-300 text-sm mb-3">Found {results.count} object(s)</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {results.boundingBoxes.map((box, idx) => (
                    <div key={idx} className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded flex items-center justify-between">
                      <div>
                        <span className="font-medium text-slate-300">{box.label || 'Object'} #{idx + 1}</span>
                        <span className="ml-2">Confidence: {(box.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="text-slate-500">
                        [{box.x1}, {box.y1}] → [{box.x2}, {box.y2}]
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {results.queryType === 'vqa' && results.answer && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h3 className="text-sm font-medium text-slate-300 mb-2">Answer</h3>
              <p className="text-slate-300 text-sm mb-2">{results.answer}</p>
              <div className="flex items-center space-x-4 text-xs text-slate-400">
                <span>Type: {results.answerType}</span>
                {results.confidence && <span>Confidence: {(results.confidence * 100).toFixed(1)}%</span>}
              </div>
            </div>
          )}
        </div>
      )}
      {hasResults && (
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Performance Metrics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-500 mb-1">BLEU Score</p>
              <p className="text-lg font-semibold text-slate-300">{results.metrics?.bleuScore || '--'}</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-500 mb-1">IoU @ 0.7</p>
              <p className="text-lg font-semibold text-slate-300">{results.metrics?.iou || '--'}</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-500 mb-1">Accuracy</p>
              <p className="text-lg font-semibold text-slate-300">{results.metrics?.accuracy || '--'}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
