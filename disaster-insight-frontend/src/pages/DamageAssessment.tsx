// DamageAssessment.tsx
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, Typography, Card, CardContent, Button, 
  LinearProgress, Chip, IconButton, Tooltip
} from '@mui/material';
import { 
  AddPhotoAlternateRounded, CloudUploadRounded, 
  DeleteOutlineRounded, AssignmentTurnedInRounded,
  WarningAmberRounded, CheckCircleRounded, ErrorRounded,
  InfoOutlined, CameraAltRounded, HistoryRounded,
  PhotoLibraryRounded, AnalyticsRounded, CloseRounded,
  ZoomInRounded, AccessTimeRounded, TrendingUpRounded
} from '@mui/icons-material';
import { api } from '../api/client';
import styles from './DamageAssessment.module.css';

interface AnalysisResult {
  id: number;
  imageUrl: string;
  timestamp: Date;
  detected_event: string;
  confidence: number;
  triage_priority: string;
  action_recommendation: string;
  ui_color: string;
}

// Helper function to format event labels
const formatEventLabel = (label: string): string => {
  if (!label) return 'Unknown';
  return label
    .replace(/^\d+_/, '')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Get priority icon
const getPriorityIcon = (priority: string) => {
  const p = priority?.toUpperCase() || '';
  if (p.includes('HIGH') || p.includes('CRITICAL') || p.includes('SEVERE')) {
    return <ErrorRounded />;
  }
  if (p.includes('MEDIUM') || p.includes('MODERATE')) {
    return <WarningAmberRounded />;
  }
  return <CheckCircleRounded />;
};

// Get priority class
const getPriorityClass = (priority: string): string => {
  const p = priority?.toUpperCase() || '';
  if (p.includes('HIGH') || p.includes('CRITICAL') || p.includes('SEVERE')) {
    return styles.priorityHigh;
  }
  if (p.includes('MEDIUM') || p.includes('MODERATE')) {
    return styles.priorityMedium;
  }
  return styles.priorityLow;
};

// Format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleDateString();
};

export default function DamageAssessment() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file (JPG, PNG)");
        return;
      }
      
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        setError("File too large. Please select an image under 5MB.");
        return;
      }
      
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      if (!file.type.startsWith('image/')) {
        setError("Please drop a valid image file (JPG, PNG)");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError("File too large. Please select an image under 5MB.");
        return;
      }
      
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await api.analyzeDamageImage(selectedImage);
      
      const newRecord: AnalysisResult = {
        id: Date.now(),
        imageUrl: previewUrl!,
        timestamp: new Date(),
        ...result
      };

      setHistory(prev => [newRecord, ...prev]);
      setSelectedImage(null);
      setPreviewUrl(null);
    } catch (err) {
      setError("Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setSelectedResult(null);
  };

  const removeItem = (id: number) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    if (selectedResult?.id === id) {
      setSelectedResult(null);
    }
  };

  // Calculate stats
  const stats = {
    total: history.length,
    highPriority: history.filter(h => {
      const p = h.triage_priority?.toUpperCase() || '';
      return p.includes('HIGH') || p.includes('CRITICAL') || p.includes('SEVERE');
    }).length,
    avgConfidence: history.length > 0 
      ? (history.reduce((acc, h) => acc + h.confidence, 0) / history.length * 100).toFixed(0)
      : null
  };

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.headerIcon}>
          <CameraAltRounded />
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Damage Assessment & Triage</h1>
          <p className={styles.subtitle}>
            Upload drone, satellite, or ground-level photos to instantly classify disaster impact 
            and generate resource triage priorities using Computer Vision.
          </p>
        </div>
      </motion.div>

      {/* Guidelines Card */}
      <motion.div 
        className={styles.guidelinesCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <InfoOutlined className={styles.guidelinesIcon} />
        <div className={styles.guidelinesContent}>
          <span className={styles.guidelinesTitle}>Quick Tips:</span>
          <span className={styles.guidelinesText}>
            Upload clear JPG/PNG images (max 5MB) • Best results with unobstructed aerial or ground views • 
            AI analyzes structural damage patterns
          </span>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        
        {/* Left Column: Upload Area */}
        <motion.div 
          className={styles.uploadSection}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.sectionHeader}>
            <PhotoLibraryRounded />
            <span>Image Upload</span>
          </div>

          <Card className={styles.uploadCard}>
            <CardContent className={styles.uploadCardContent}>
              
              {/* Error Message */}
              {error && (
                <div className={styles.errorMessage}>
                  <ErrorRounded />
                  <span>{error}</span>
                  <IconButton size="small" onClick={() => setError(null)}>
                    <CloseRounded fontSize="small" />
                  </IconButton>
                </div>
              )}
              
              {previewUrl ? (
                <div className={styles.previewContainer}>
                  <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                  <div className={styles.previewOverlay}>
                    <Tooltip title="Remove image" arrow>
                      <IconButton 
                        onClick={clearImage}
                        className={styles.removeBtn}
                      >
                        <DeleteOutlineRounded />
                      </IconButton>
                    </Tooltip>
                  </div>
                  <div className={styles.previewBadge}>
                    <CheckCircleRounded />
                    Ready to analyze
                  </div>
                  {selectedImage && (
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName}>{selectedImage.name}</span>
                      <span className={styles.fileSize}>
                        {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className={styles.dropzoneIcon}>
                    <AddPhotoAlternateRounded />
                  </div>
                  <h3 className={styles.dropzoneTitle}>
                    {dragActive ? 'Drop your image here' : 'Drag & Drop or Click'}
                  </h3>
                  <p className={styles.dropzoneSubtitle}>
                    Supports: JPG, PNG • Max: 5MB
                  </p>
                  <div className={styles.dropzoneDivider}>
                    <span>or</span>
                  </div>
                  <Button 
                    variant="outlined" 
                    className={styles.browseBtn}
                    startIcon={<PhotoLibraryRounded />}
                  >
                    Browse Files
                  </Button>
                </div>
              )}

              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                accept="image/jpeg,image/png,image/jpg" 
                onChange={handleImageSelect} 
              />

              <Button 
                variant="contained" 
                size="large" 
                fullWidth 
                disabled={!selectedImage || loading}
                onClick={handleAnalyze}
                className={styles.analyzeBtn}
                startIcon={loading ? null : <AnalyticsRounded />}
              >
                {loading ? "Analyzing..." : "Run Damage Analysis"}
              </Button>
              
              {loading && (
                <div className={styles.progressContainer}>
                  <LinearProgress className={styles.progressBar} />
                  <span className={styles.progressText}>
                    Processing image with AI model...
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Summary */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <AnalyticsRounded />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stats.total}</span>
                <span className={styles.statLabel}>Analyzed</span>
              </div>
            </div>
            <div className={`${styles.statCard} ${styles.statCardWarning}`}>
              <div className={styles.statIconWrapper}>
                <WarningAmberRounded />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stats.highPriority}</span>
                <span className={styles.statLabel}>High Priority</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <TrendingUpRounded />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>
                  {stats.avgConfidence ? `${stats.avgConfidence}%` : '—'}
                </span>
                <span className={styles.statLabel}>Avg. Confidence</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Results History */}
        <motion.div 
          className={styles.resultsSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.sectionHeader}>
            <HistoryRounded />
            <span>Analysis History</span>
            {history.length > 0 && (
              <Chip 
                label={`${history.length} result${history.length > 1 ? 's' : ''}`} 
                size="small" 
                className={styles.countChip}
              />
            )}
            {history.length > 0 && (
              <Button 
                size="small" 
                color="error" 
                onClick={clearHistory} 
                className={styles.clearBtn}
                startIcon={<DeleteOutlineRounded />}
              >
                Clear All
              </Button>
            )}
          </div>

          <div className={styles.resultsWrapper}>
            <div className={styles.resultsContainer}>
              <AnimatePresence mode="popLayout">
                {history.length === 0 ? (
                  <motion.div 
                    className={styles.emptyState}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className={styles.emptyIcon}>
                      <AssignmentTurnedInRounded />
                    </div>
                    <h3>No Analysis Yet</h3>
                    <p>Upload an image to start assessing damage with AI-powered computer vision.</p>
                  </motion.div>
                ) : (
                  history.map((item, index) => (
                    <motion.div 
                      key={item.id}
                      className={styles.resultCard}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => setSelectedResult(item)}
                      layout
                    >
                      <div 
                        className={styles.resultColorBar} 
                        style={{ backgroundColor: item.ui_color }}
                      />
                      
                      <div className={styles.resultImageContainer}>
                        <img src={item.imageUrl} alt="Analysis" className={styles.resultImage} />
                        <div className={`${styles.priorityTag} ${getPriorityClass(item.triage_priority)}`}>
                          {getPriorityIcon(item.triage_priority)}
                          <span>{item.triage_priority}</span>
                        </div>
                      </div>
                      
                      <div className={styles.resultContent}>
                        <div className={styles.resultHeader}>
                          <h4 className={styles.resultTitle}>
                            {formatEventLabel(item.detected_event)}
                          </h4>
                          <Tooltip title="Remove" arrow>
                            <IconButton 
                              size="small" 
                              onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                              className={styles.resultRemoveBtn}
                            >
                              <CloseRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </div>
                        
                        <p className={styles.resultAction}>
                          <span className={styles.actionIcon}>⚡</span>
                          <span className={styles.actionText}>{item.action_recommendation}</span>
                        </p>
                        
                        <div className={styles.resultMeta}>
                          <div className={styles.confidenceWrapper}>
                            <div className={styles.confidenceHeader}>
                              <span className={styles.confidenceLabel}>Confidence</span>
                              <span className={styles.confidenceValue}>
                                {(item.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className={styles.confidenceTrack}>
                              <div 
                                className={styles.confidenceFill}
                                style={{ 
                                  width: `${item.confidence * 100}%`,
                                  backgroundColor: item.ui_color 
                                }}
                              />
                            </div>
                          </div>
                          
                          <div className={styles.resultTime}>
                            <AccessTimeRounded />
                            <span>{formatTimeAgo(item.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedResult && (
          <motion.div 
            className={styles.detailOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedResult(null)}
          >
            <motion.div 
              className={styles.detailModal}
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.detailHeader}>
                <h3>Analysis Details</h3>
                <IconButton onClick={() => setSelectedResult(null)} size="small">
                  <CloseRounded />
                </IconButton>
              </div>
              
              <div className={styles.detailImageWrapper}>
                <img 
                  src={selectedResult.imageUrl} 
                  alt="Detail" 
                  className={styles.detailImage}
                />
                <div 
                  className={styles.detailColorIndicator}
                  style={{ backgroundColor: selectedResult.ui_color }}
                />
              </div>
              
              <div className={styles.detailContent}>
                <div className={`${styles.detailPriority} ${getPriorityClass(selectedResult.triage_priority)}`}>
                  {getPriorityIcon(selectedResult.triage_priority)}
                  <span>{selectedResult.triage_priority} Priority</span>
                </div>
                
                <h4 className={styles.detailTitle}>
                  {formatEventLabel(selectedResult.detected_event)}
                </h4>
                
                <div className={styles.detailSection}>
                  <span className={styles.detailLabel}>Recommended Action</span>
                  <p className={styles.detailText}>{selectedResult.action_recommendation}</p>
                </div>
                
                <div className={styles.detailSection}>
                  <span className={styles.detailLabel}>AI Confidence Score</span>
                  <div className={styles.detailConfidence}>
                    <div className={styles.confidenceTrack}>
                      <div 
                        className={styles.confidenceFill}
                        style={{ 
                          width: `${selectedResult.confidence * 100}%`,
                          backgroundColor: selectedResult.ui_color 
                        }}
                      />
                    </div>
                    <span className={styles.detailConfidenceValue}>
                      {(selectedResult.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className={styles.detailMeta}>
                  <AccessTimeRounded />
                  <span>Analyzed {selectedResult.timestamp.toLocaleString()}</span>
                </div>
              </div>
              
              <div className={styles.detailActions}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => setSelectedResult(null)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}