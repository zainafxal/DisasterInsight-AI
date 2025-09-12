import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  useMediaQuery,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  LinearProgress,
  Chip,
  Alert,
  Grid,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Badge,
  Avatar
} from '@mui/material';
import {
  Psychology,
  Send,
  Info,
  CheckCircle,
  AutoAwesomeRounded,
  SmartToyRounded,
  HistoryRounded,
  ContentCopyRounded,
  DeleteOutlineRounded,
  BoltRounded,
  TipsAndUpdatesRounded
} from '@mui/icons-material';
import { api } from '../api/client';
import type { ClassificationResult } from '../types';
import styles from './SignalAnalysis.module.css';

const exampleTexts = [
  {
    text: "Massive earthquake just hit Tokyo, buildings are shaking and people are evacuating!",
    category: "Emergency",
    icon: "🚨"
  },
  {
    text: "Flood warnings issued for coastal areas as hurricane approaches",
    category: "Weather Alert",
    icon: "🌊"
  },
  {
    text: "Relief supplies urgently needed for earthquake victims in remote villages",
    category: "Humanitarian",
    icon: "🏥"
  },
  {
    text: "Community organizing shelter for displaced families after the disaster",
    category: "Community Response",
    icon: "🏘️"
  }
];

const categoryInfo: Record<string, { color: string; icon: string; description: string }> = {
  'earthquake': { 
    color: '#ef4444', 
    icon: '🌍', 
    description: 'Seismic events and ground shaking incidents' 
  },
  'flood': { 
    color: '#3b82f6', 
    icon: '🌊', 
    description: 'Water overflow and inundation events' 
  },
  'storm': { 
    color: '#8b5cf6', 
    icon: '🌪️', 
    description: 'Severe weather including hurricanes and typhoons' 
  },
  'fire': { 
    color: '#f97316', 
    icon: '🔥', 
    description: 'Wildfire and urban fire emergencies' 
  },
  'drought': { 
    color: '#eab308', 
    icon: '☀️', 
    description: 'Extended dry conditions and water scarcity' 
  },
  'infrastructure': { 
    color: '#6b7280', 
    icon: '🏗️', 
    description: 'Damage to buildings, roads, and utilities' 
  },
  'humanitarian': { 
    color: '#10b981', 
    icon: '❤️', 
    description: 'Human impact and relief operations' 
  },
  'evacuation': { 
    color: '#f59e0b', 
    icon: '🚸', 
    description: 'Emergency displacement and relocation' 
  },
  'warning': { 
    color: '#dc2626', 
    icon: '⚠️', 
    description: 'Alerts and early warning messages' 
  },
  'other': { 
    color: '#6b7280', 
    icon: '📋', 
    description: 'Other disaster-related content' 
  }
};

export default function SignalAnalysis() {
  const isSmallMobile = useMediaQuery('(max-width: 576px)');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [history, setHistory] = useState<Array<{
    id: string;
    text: string; 
    result: ClassificationResult;
    timestamp: Date;
  }>>([]);
  const [showHistory, setShowHistory] = useState(true);

  const handleClassify = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const classificationResult = await api.classifyText(text);
      setResult(classificationResult);
      
      // Add to history
      const historyItem = {
        id: Date.now().toString(),
        text,
        result: classificationResult,
        timestamp: new Date()
      };
      setHistory(prev => [historyItem, ...prev].slice(0, 10));
    } catch (error) {
      console.error('Classification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleText: string) => {
    setText(exampleText);
    setResult(null);
  };

  const handleCopyText = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
  };

  const handleDeleteFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const getCategoryStyle = (label: string) => {
    const category = label.toLowerCase().replace('_', '');
    return categoryInfo[category] || categoryInfo['other'];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.container}
    >
      {/* Header */}
      <Box className={styles.header}>
        <Box className={styles.headerContent}>
          <SmartToyRounded className={styles.pageIcon} />
          <Box>
            <Typography variant="h3" className={styles.title}>
              Real-Time Signal Analysis
            </Typography>
            <Typography variant="body1" className={styles.subtitle}>
              AI-powered text classification for humanitarian crisis detection
            </Typography>
          </Box>
        </Box>
        
        <Box className={styles.badges}>
        <Chip
          icon={<BoltRounded className={styles.boltIcon} />}
          label="DistilBERT Model"
          className={styles.modelBadge}
        />
      </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          {/* Input Card */}
          <Card className={styles.inputCard}>
            <Box className={styles.cardGradient} />
            <CardContent>
              <Box className={styles.inputHeader}>
                <Typography variant="h6" className={styles.inputTitle}>
                  <Psychology className={styles.titleIcon} />
                  Enter Text for Analysis
                </Typography>
                <Chip
                  label={`${text.length} / 500`}
                  size="small"
                  color={text.length > 400 ? 'warning' : 'default'}
                  variant="outlined"
                />
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 500))}
                placeholder="Enter a tweet, news snippet, or any text about a potential disaster or crisis..."
                variant="outlined"
                className={styles.textInput}
                InputProps={{
                  className: styles.textInputField
                }}
              />

              <Box className={styles.actions}>
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={handleClassify}
                  disabled={loading || !text.trim()}
                  className={styles.analyzeButton}
                  size="large"
                >
                  Analyze Text
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => { setText(''); setResult(null); }}
                  disabled={!text}
                  className={styles.clearButton}
                >
                  Clear
                </Button>
              </Box>

              {loading && (
                <Box className={styles.loadingBox}>
                  <LinearProgress className={styles.progress} />
                  <Typography variant="body2" className={styles.loadingText}>
                    <AutoAwesomeRounded className={styles.loadingIcon} />
                    AI is analyzing your text...
                  </Typography>
                </Box>
              )}

              <AnimatePresence>
                {result && !loading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className={styles.result}
                  >
                    <Typography
                      variant={isSmallMobile ? 'h5' : 'h6'}
                      className={styles.resultTitle}
                      style={{ textAlign: isSmallMobile ? 'center' : 'left' }} // <-- CENTER for small mobile
                    >
                      Classification Result
                    </Typography>
                    
                    <Box className={styles.resultContent}>
                      <Box className={styles.resultMain}>
                        <Avatar 
                          className={styles.categoryAvatar}
                          style={{ 
                            backgroundColor: `${getCategoryStyle(result.label).color}20`,
                            border: `2px solid ${getCategoryStyle(result.label).color}`
                          }}
                        >
                          <span className={styles.categoryEmoji}>
                            {getCategoryStyle(result.label).icon}
                          </span>
                        </Avatar>
                        
                        <Box className={styles.resultInfo}>
                          <Typography variant="h5" className={styles.label}>
                            {result.label.replace('_', ' ').toUpperCase()}
                          </Typography>
                          <Typography variant="body2" className={styles.categoryDescription}>
                            {getCategoryStyle(result.label).description}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box className={styles.confidence}>
                        <Box className={styles.confidenceHeader}>
                          <Typography variant="body2" color="text.secondary">
                            Confidence Score
                          </Typography>
                          <Typography 
                            variant="h4" 
                            style={{ color: getCategoryStyle(result.label).color }}
                          >
                            {(result.score * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                        <Box className={styles.confidenceBarWrapper}>
                          <Box 
                            className={styles.confidenceBar}
                            style={{ 
                              width: `${result.score * 100}%`,
                              backgroundColor: getCategoryStyle(result.label).color
                            }}
                          />
                        </Box>
                        <Typography variant="caption" className={styles.confidenceLabel}>
                          {result.score > 0.9 ? 'Very High' : 
                           result.score > 0.7 ? 'High' : 
                           result.score > 0.5 ? 'Moderate' : 'Low'} Confidence
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Examples Card */}
          <Card className={styles.examplesCard}>
            <CardContent>
              <Typography variant="h6" className={styles.examplesTitle}>
                <TipsAndUpdatesRounded className={styles.titleIcon} />
                Try These Examples
              </Typography>
              
              <Grid container spacing={2}>
                {exampleTexts.map((example, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Paper
                        className={styles.exampleItem}
                        onClick={() => handleExampleClick(example.text)}
                      >
                        <Box className={styles.exampleHeader}>
                          <span className={styles.exampleIcon}>{example.icon}</span>
                          <Typography variant="caption" className={styles.exampleCategory}>
                            {example.category}
                          </Typography>
                        </Box>
                        <Typography variant="body2" className={styles.exampleText}>
                          "{example.text}"
                        </Typography>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          {/* Model Info Card */}
          <Card className={styles.infoCard}>
            <Box className={styles.infoGradient} />
            <CardContent>
              <Typography variant="h6" className={styles.infoTitle}>
                <Info /> About This Model
              </Typography>
              
              <List className={styles.featureList}>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle className={styles.checkIcon} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Fine-tuned DistilBERT"
                    secondary="Optimized for speed and accuracy"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle className={styles.checkIcon} />
                  </ListItemIcon>
                  <ListItemText
                    primary="10 Categories"
                    secondary="Comprehensive disaster classification"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle className={styles.checkIcon} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Real-time Processing"
                    secondary="Sub-second response time"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle className={styles.checkIcon} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Multi-language Support"
                    secondary="Primarily English, expanding soon"
                  />
                </ListItem>
              </List>

              <Divider className={styles.divider} />

              <Alert severity="info" className={styles.alert}>
                This model classifies text topics and is optimized for 
                English content. It acts as a first-pass filter for 
                high-volume data streams in crisis situations.
              </Alert>
            </CardContent>
          </Card>

          {/* History Card */}
          <Card className={styles.historyCard}>
            <CardContent>
              <Box className={styles.historyHeader}>
                <Typography variant="h6" className={styles.historyTitle}>
                  <HistoryRounded /> Recent Analyses
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setShowHistory(!showHistory)}
                  className={styles.toggleHistory}
                >
                  <Badge badgeContent={history.length} color="primary">
                    <HistoryRounded />
                  </Badge>
                </IconButton>
              </Box>
              
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    {history.length === 0 ? (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        className={styles.emptyHistory}
                      >
                        No analysis history yet
                      </Typography>
                    ) : (
                      <List className={styles.historyList}>
                        {history.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <ListItem className={styles.historyItem}>
                              <Box className={styles.historyContent}>
                                <Box className={styles.historyMain}>
                                  <Avatar 
                                    className={styles.historyAvatar}
                                    style={{ 
                                      backgroundColor: `${getCategoryStyle(item.result.label).color}20`,
                                      color: getCategoryStyle(item.result.label).color
                                    }}
                                  >
                                    <Typography variant="caption">
                                      {getCategoryStyle(item.result.label).icon}
                                    </Typography>
                                  </Avatar>
                                  <Box className={styles.historyText}>
                                    <Typography variant="body2" fontWeight={600}>
                                      {item.result.label.replace('_', ' ').toUpperCase()}
                                    </Typography>
                                    <Typography 
                                      variant="caption" 
                                      className={styles.historyPreview}
                                    >
                                      "{item.text.substring(0, 50)}..."
                                    </Typography>
                                  </Box>
                                </Box>
                                
                                <Box className={styles.historyActions}>
                                  <Chip
                                    label={`${(item.result.score * 100).toFixed(0)}%`}
                                    size="small"
                                    className={styles.historyScore}
                                  />
                                  <Tooltip title="Copy text">
                                    <IconButton 
                                      size="small"
                                      onClick={() => handleCopyText(item.text)}
                                    >
                                      <ContentCopyRounded fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton 
                                      size="small"
                                      onClick={() => handleDeleteFromHistory(item.id)}
                                    >
                                      <DeleteOutlineRounded fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                            </ListItem>
                            {index < history.length - 1 && <Divider />}
                          </motion.div>
                        ))}
                      </List>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );
}