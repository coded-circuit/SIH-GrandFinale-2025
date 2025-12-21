"use client";

import { useEffect, useState, useRef } from "react";

const THINKING_SENTENCES = [
  [
    "Initializing Qwen-VL pipeline...",
    "Quantizing 4-bit weights...",
    "Aligning visual encoders...",
    "Loading SkySense context...",
    "Synthesizing response...",
  ],
  [
    "Booting YOLO11-OBB engine...",
    "Detecting oriented boxes...",
    "Filtering NMS thresholds...",
    "Mapping spatial coordinates...",
    "Finalizing object list...",
  ],
  [
    "Loading LoRA adapters...",
    "Injecting domain weights...",
    "Refining attention heads...",
    "Adapting to SkySense logic...",
    "Generating output...",
  ],
  [
    "Activating Qwen Vision-Language...",
    "Tokenizing image patches...",
    "Running BNB-4-bit inference...",
    "Cross-referencing logic...",
    "Compiling results...",
  ],
  [
    "Initializing SkySense GPT...",
    "Parsing query intent...",
    "Retrieving visual tokens...",
    "Applying LoRA fine-tuning...",
    "Formulating answer...",
  ],
  [
    "Starting OBB detection...",
    "Calculating box rotation...",
    "Analyzing object orientation...",
    "Merging YOLO11 outputs...",
    "Preparing overlay...",
  ],
  [
    "Loading vision backbone...",
    "Extracting Qwen features...",
    "Mapping semantic density...",
    "Running forward pass...",
    "Decoding response...",
  ],
  [
    "Optimizing inference tensors...",
    "Loading LoRA low-rank matrices...",
    "Adjusting model weights...",
    "Processing SkySense data...",
    "Delivering insights...",
  ],
  [
    "Scanning visual inputs...",
    "YOLO11-OBB segmentation...",
    "Isolating regions of interest...",
    "Vectorizing features...",
    "Finalizing analysis...",
  ],
  [
    "Warming up GPU clusters...",
    "Loading 32B model parameters...",
    "Quantizing visual streams...",
    "Running Qwen inference...",
    "Generating reply...",
  ],
  [
    "Initializing multimodal fusion...",
    "Aligning text-image pairs...",
    "Applying SkySense filters...",
    "Decoding spatial logic...",
    "Preparing output...",
  ],
  [
    "Starting geospatial analysis...",
    "Detecting oriented features...",
    "Refining bounding boxes...",
    "Correlating object data...",
    "Completing scan...",
  ],
  [
    "Loading adapter configurations...",
    "Merging LoRA weights...",
    "Enhancing precision...",
    "Running SkySense validation...",
    "Synthesizing answer...",
  ],
  [
    "Booting vision transformer...",
    "Embedding patch vectors...",
    "Qwen-VL attention mapping...",
    "Predicting next tokens...",
    "Finalizing text...",
  ],
  [
    "Activating object recognizer...",
    "YOLO11 predictive modeling...",
    "Calculating confidence scores...",
    "Refining OBB coordinates...",
    "Generating report...",
  ],
  [
    "Initializing context window...",
    "Loading system prompts...",
    "Injecting SkySense knowledge...",
    "Running inference loop...",
    "Delivering result...",
  ],
  [
    "Starting deep vision scan...",
    "Encoding image structure...",
    "Applying LoRA corrections...",
    "Extracting semantic attributes...",
    "Preparing response...",
  ],
  [
    "Loading inference precision...",
    "Decompressing 4-bit layers...",
    "Activating Qwen neural pathways...",
    "Processing user query...",
    "Assembling output...",
  ],
  [
    "Analyzing spatial geometry...",
    "Running OBB regression...",
    "Aligning bounding boxes...",
    "Filtering visual noise...",
    "Finalizing detection...",
  ],
  [
    "Initializing domain experts...",
    "Loading SkySense adapters...",
    "Computing feature relevance...",
    "Synthesizing insights...",
    "Generating answer...",
  ],
  [
    "Starting visual tokenization...",
    "Mapping pixels to vectors...",
    "Running Qwen-VL context...",
    "Decoding semantics...",
    "Completing task...",
  ],
  [
    "Activating detection grid...",
    "YOLO11 feature pyramid...",
    "Extracting rotated boxes...",
    "Classifying objects...",
    "Preparing overlay...",
  ],
  [
    "Loading fine-tuned layers...",
    "Applying LoRA gradients...",
    "Optimizing for SkySense...",
    "Running prediction...",
    "Delivering output...",
  ],
  [
    "Booting multimodal engine...",
    "Syncing vision and text...",
    "Processing 32B parameters...",
    "Generating embeddings...",
    "Finalizing response...",
  ],
  [
    "Initializing object tracking...",
    "Calculating angular offsets...",
    "Refining YOLO predictions...",
    "Mapping visual hierarchy...",
    "Generating report...",
  ],
  [
    "Starting neural adaptation...",
    "Injecting custom weights...",
    "Aligning SkySense logic...",
    "Processing inference...",
    "Completing analysis...",
  ],
  [
    "Loading visual encoder...",
    "Extracting high-res features...",
    "Qwen-VL semantic parse...",
    "Decoding attention maps...",
    "Synthesizing reply...",
  ],
  [
    "Optimizing spatial detection...",
    "Running oriented inference...",
    "Filtering overlap...",
    "YOLO11 post-processing...",
    "Finalizing data...",
  ],
  [
    "Initializing knowledge base...",
    "Loading LoRA context...",
    "Refining query vector...",
    "Running SkySense model...",
    "Preparing answer...",
  ],
  [
    "Starting image analysis...",
    "Quantizing input stream...",
    "Activating 4-bit transformers...",
    "Generating predictions...",
    "Delivering result...",
  ],
  [
    "Booting segmentation logic...",
    "Identifying object bounds...",
    "Calculating OBB angles...",
    "Merging visual data...",
    "Generating output...",
  ],
  [
    "Loading specialized weights...",
    "Applying adapter fusion...",
    "Enhancing SkySense accuracy...",
    "Running forward pass...",
    "Finalizing reply...",
  ],
  [
    "Activating vision attention...",
    "Scanning feature patches...",
    "Qwen-VL deep reasoning...",
    "Synthesizing logic...",
    "Completing request...",
  ],
  [
    "Initializing detection pipeline...",
    "YOLO11 feature extraction...",
    "Mapping oriented objects...",
    "Refining confidence...",
    "Preparing results...",
  ],
  [
    "Starting context fusion...",
    "Loading LoRA parameters...",
    "Aligning domain knowledge...",
    "Processing SkySense query...",
    "Generating insight...",
  ],
  [
    "Loading model architecture...",
    "Initializing 32B layers...",
    "Encoding visual inputs...",
    "Running prediction loop...",
    "Assembling answer...",
  ],
  [
    "Optimizing bounding boxes...",
    "Calculating rotation vectors...",
    "YOLO11 spatial analysis...",
    "Filtering detections...",
    "Finalizing overlay...",
  ],
  [
    "Initializing adaptive engine...",
    "Injecting LoRA tensors...",
    "Refining model states...",
    "Running SkySense inference...",
    "Delivering output...",
  ],
  [
    "Starting visual decoding...",
    "Processing Qwen embeddings...",
    "Analyzing image context...",
    "Generating text tokens...",
    "Completing analysis...",
  ],
  [
    "Booting spatial recognizer...",
    "Detecting geometric shapes...",
    "Aligning OBB coordinates...",
    "Verifying object classes...",
    "Preparing report...",
  ],
  [
    "Loading inference buffers...",
    "Quantizing active layers...",
    "Applying SkySense parameters...",
    "Running neural pass...",
    "Synthesizing result...",
  ],
  [
    "Activating feature extractor...",
    "YOLO11 grid analysis...",
    "Computing box orientation...",
    "Merging detection maps...",
    "Finalizing objects...",
  ],
  [
    "Initializing query processor...",
    "Loading LoRA adjustments...",
    "Refining semantic search...",
    "Generating SkySense logic...",
    "Delivering answer...",
  ],
  [
    "Starting multimodal scan...",
    "Encoding visual patches...",
    "Qwen-VL cross-attention...",
    "Decoding attributes...",
    "Preparing output...",
  ],
  [
    "Loading detection matrices...",
    "Optimizing OBB thresholds...",
    "Running YOLO inference...",
    "Mapping visual data...",
    "Completing scan...",
  ],
  [
    "Initializing response engine...",
    "Applying adapter weights...",
    "Processing SkySense context...",
    "Generating tokens...",
    "Finalizing reply...",
  ],
  [
    "Starting deep learning task...",
    "Loading 4-bit quantization...",
    "Running Qwen logic...",
    "Synthesizing information...",
    "Delivering output...",
  ],
  [
    "Booting geometry engine...",
    "Calculating box dimensions...",
    "YOLO11 orientation fix...",
    "Refining spatial data...",
    "Generating results...",
  ],
  [
    "Loading adaptive weights...",
    "Injecting LoRA expertise...",
    "Aligning SkySense features...",
    "Running prediction...",
    "Assembling answer...",
  ],
  [
    "Initializing final synthesis...",
    "Aggregating visual tokens...",
    "Processing Qwen inference...",
    "Formatting response...",
    "Completing request...",
  ],
];
const getRandomRow = () => {
  const randomRowIndex = Math.floor(Math.random() * THINKING_SENTENCES.length);
  return THINKING_SENTENCES[randomRowIndex];
};

export default function ThinkingEffect({ isVisible, onComplete }) {
  const initialRow = useRef(getRandomRow());
  const [selectedRow, setSelectedRow] = useState(initialRow.current);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [fadeState, setFadeState] = useState("in");
  useEffect(() => {
    if (isVisible) {
      const newRow = getRandomRow();
      initialRow.current = newRow;
      setSelectedRow(newRow);
      setSentenceIndex(0);
      setFadeState("in");
    }
  }, [isVisible]);
  useEffect(() => {
    if (!isVisible || !selectedRow) return;
    const fadeOutTimer = setTimeout(() => {
      setFadeState("out");
    }, 700);
    const nextTimer = setTimeout(() => {
      if (sentenceIndex < selectedRow.length - 1) {
        setSentenceIndex((prev) => prev + 1);
        setFadeState("in");
      } else {
        setFadeState(fadeState === "in" ? "out" : "in");
      }
    }, 900);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(nextTimer);
    };
  }, [isVisible, selectedRow, sentenceIndex, fadeState]);
  useEffect(() => {
    if (sentenceIndex === selectedRow.length - 1 && fadeState === "out") {
      if (onComplete) onComplete();
    }
  }, [sentenceIndex, fadeState, onComplete]);
  if (!isVisible) return null;
  const currentSentence = selectedRow?.[sentenceIndex] || "Processing...";

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex gap-1">
        <span
          className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "0.6s" }}
        />
        <span
          className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
          style={{ animationDelay: "150ms", animationDuration: "0.6s" }}
        />
        <span
          className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
          style={{ animationDelay: "300ms", animationDuration: "0.6s" }}
        />
      </div>
      <span
        className={`text-sm text-slate-400 italic transition-opacity duration-500 ${
          fadeState === "in" ? "opacity-70" : "opacity-0"
        }`}
      >
        {currentSentence}
      </span>
    </div>
  );
}
