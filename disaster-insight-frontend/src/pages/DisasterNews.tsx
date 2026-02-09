// DisasterNews.tsx
import { useEffect, useState } from 'react';
import type { SyntheticEvent } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, Typography, Grid, Card, CardContent, CardMedia, 
  Chip, Button, Skeleton, Tooltip 
} from '@mui/material';
import { 
  NewspaperRounded, AutoAwesomeRounded, OpenInNewRounded, 
  AccessTimeRounded, ArrowBackRounded, BoltRounded, HelpOutlineRounded,
  ArticleRounded
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

import { api } from '../api/client';
import { newsApi, type NewsArticle } from '../api/newsService';
import styles from './DisasterNews.module.css';
import type { ClassificationResult } from '../types';

// FALLBACK IMAGES
const FALLBACK_IMAGES = [
  'https://unsplash.com/photos/rxlx9Yi0298/download?force=true&w=1200',
  'https://unsplash.com/photos/_whs7FPfkwQ/download?force=true&w=1200',
  'https://unsplash.com/photos/WYd_PkCa1BY/download?force=true&w=1200',
  'https://unsplash.com/photos/7SP-NotqFrE/download?force=true&w=1200',
  'https://unsplash.com/photos/3PNqQNc7pdE/download?force=true&w=1200',
  'https://unsplash.com/photos/qhgJkFXCJIY/download?force=true&w=1200',
  'https://unsplash.com/photos/UL7RcjeaZzc/download?force=true&w=1200'
];

export default function DisasterNews() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, ClassificationResult>>({});
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    const data = await newsApi.getDisasterNews();
    setArticles(data);
    setLoading(false);
  };

  const handleAnalyze = async (article: NewsArticle) => {
    const id = article.id || article.url || article.title || '';
    if (!id || results[id]) return;

    setAnalyzing(prev => ({ ...prev, [id]: true }));

    try {
      const textToAnalyze = `${article.title}. ${article.description || ''}`;
      const result = await api.classifyText(textToAnalyze.substring(0, 500));
      setResults(prev => ({ ...prev, [id]: result }));
    } catch (error) {
      console.error('Analysis failed', error);
    } finally {
      setAnalyzing(prev => ({ ...prev, [id]: false }));
    }
  };

  const getFallbackImage = (key: string) => {
    if (!key) {
      const i = Math.floor(Math.random() * FALLBACK_IMAGES.length);
      return FALLBACK_IMAGES[i];
    }
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % FALLBACK_IMAGES.length;
    return FALLBACK_IMAGES[index];
  };

  const getDisplayImage = (article: NewsArticle, key: string) => {
    const fallback = getFallbackImage(key);
    if (imgErrors[key]) return fallback;
    const url = article.urlToImage?.trim();
    if (!url || url === 'null' || url === 'N/A') return fallback;
    if (!url.startsWith('http')) return fallback;
    return url;
  };

  const handleImgError = (
    key: string,
    event: SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const fallback = getFallbackImage(key);
    const imgEl = event.currentTarget;
    if (imgEl.src !== fallback) {
      imgEl.src = fallback;
    }
    setImgErrors(prev => ({ ...prev, [key]: true }));
  };

  const getLabelColor = (label: string) => {
    const colors: Record<string, string> = {
      earthquake: '#ef4444',
      flood: '#3b82f6',
      fire: '#f97316',
      storm: '#8b5cf6',
      humanitarian: '#10b981',
      warning: '#dc2626',
      infrastructure_and_utilities_damage: '#6b7280'
    };
    const key = label.toLowerCase().replace(/\s+/g, '_');
    if (key.includes('damage') || key.includes('infrastructure')) {
      return colors.infrastructure_and_utilities_damage;
    }
    return colors[key] || colors[key.split('_')[0]] || '#6b7280';
  };

  const formatLabel = (label: string) => {
    return label.replace(/_/g, ' ').toUpperCase();
  };

  const getConfidenceLevel = (score: number) => {
    if (score > 0.9) return { text: 'Very High', color: '#10b981' };
    if (score > 0.75) return { text: 'High', color: '#22c55e' };
    if (score > 0.6) return { text: 'Moderate', color: '#f59e0b' };
    return { text: 'Low', color: '#6b7280' };
  };

  const getConfidenceStyles = (score: number, baseColor: string) => {
    if (score > 0.9) {
      return {
        bg: `linear-gradient(135deg, ${baseColor}20, ${baseColor}10)`,
        border: `2px solid ${baseColor}`,
        shadow: `0 4px 12px ${baseColor}30`
      };
    } else if (score > 0.7) {
      return {
        bg: `linear-gradient(135deg, ${baseColor}15, ${baseColor}08)`,
        border: `1.5px solid ${baseColor}`,
        shadow: `0 2px 8px ${baseColor}20`
      };
    } else {
      return {
        bg: `${baseColor}08`,
        border: `1px dashed ${baseColor}60`,
        shadow: 'none'
      };
    }
  };

  const analyzedCount = Object.keys(results).length;

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Box className={styles.header}>
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate(-1)}
          className={styles.backButton}
        >
          Back to Analysis
        </Button>
        
        <Box className={styles.headerContent}>
          <NewspaperRounded className={styles.pageIcon} />
          <Box>
            <Typography variant="h3" className={styles.title}>
              Global Disaster Feed
            </Typography>
            <Typography variant="body1" className={styles.subtitle}>
              Real-time news aggregation powered by AI classification
            </Typography>
            
            {/* Stats Bar */}
            {!loading && (
              <Box className={styles.statsBar}>
                <Box className={styles.statItem}>
                  <span className={styles.statValue}>{articles.length}</span>
                  <span className={styles.statLabel}>Articles</span>
                </Box>
                <Box className={styles.statItem}>
                  <span className={styles.statValue}>{analyzedCount}</span>
                  <span className={styles.statLabel}>Analyzed</span>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {loading ? (
          [1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <Grid item xs={12} sm={6} lg={4} key={n}>
              <Skeleton
                variant="rectangular"
                height={400}
                className={styles.skeleton}
              />
            </Grid>
          ))
        ) : articles.length === 0 ? (
          <Box className={styles.emptyState}>
            <ArticleRounded className={styles.emptyIcon} />
            <Typography variant="h6">No articles found</Typography>
            <Typography variant="body2">
              Check back later for the latest disaster news
            </Typography>
          </Box>
        ) : (
          articles.map((article, index) => {
            const key = article.id || article.url || `idx-${index}`;
            const displayImage = getDisplayImage(article, key);
            const resultKey = article.id || article.url || article.title;
            const result = resultKey ? results[resultKey] : undefined;
            const analyzeKey = article.id || article.url || article.title || `idx-${index}`;

            return (
              <Grid item xs={12} sm={6} lg={4} key={key}>
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ 
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 100
                  }}
                  className={styles.cardWrapper}
                >
                  <Card className={styles.newsCard}>
                    {/* Image Section */}
                    <Box className={styles.imageContainer}>
                      <CardMedia
                        component="img"
                        image={displayImage}
                        alt={article.title || 'News image'}
                        className={styles.cardImage}
                        loading="lazy"
                        onError={(e) => handleImgError(key, e)}
                      />
                      <Chip
                        label={article.source?.name || 'News'}
                        size="small"
                        className={styles.sourceChip}
                      />
                    </Box>

                    {/* Content Section */}
                    <CardContent className={styles.cardContent}>
                      <Typography variant="caption" className={styles.date}>
                        <AccessTimeRounded fontSize="inherit" />
                        {article.publishedAt
                          ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
                          : 'Recently'}
                      </Typography>

                      <Tooltip title={article.title} arrow placement="top">
                        <Typography variant="h6" className={styles.cardTitle}>
                          {article.title}
                        </Typography>
                      </Tooltip>

                      <Typography variant="body2" className={styles.cardDesc}>
                        {article.description?.slice(0, 120)}
                        {article.description && article.description.length > 120 ? '...' : ''}
                      </Typography>

                      {/* AI Analysis Section */}
                      <Box className={styles.aiSection}>
                        <AnimatePresence mode="wait">
                          {result ? (
                            <motion.div
                              key="result"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 200 }}
                              className={styles.resultBadge}
                              style={{
                                background: getConfidenceStyles(result.score, getLabelColor(result.label)).bg,
                                border: getConfidenceStyles(result.score, getLabelColor(result.label)).border,
                                boxShadow: getConfidenceStyles(result.score, getLabelColor(result.label)).shadow,
                                position: 'relative'
                              }}
                            >
                              <Box className={styles.resultTextContent}>
                                <Typography
                                  variant="caption"
                                  className={styles.resultLabel}
                                  style={{ color: getLabelColor(result.label) }}
                                >
                                  {formatLabel(result.label)}
                                </Typography>

                                <Tooltip
                                  title="AI Confidence indicates how strongly the text matches disaster category patterns. This doesn't verify news source accuracy."
                                  arrow
                                  placement="top"
                                >
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                      cursor: 'help'
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      className={styles.resultScore}
                                      style={{
                                        color: getConfidenceLevel(result.score).color,
                                        fontWeight: 700
                                      }}
                                    >
                                      {(result.score * 100).toFixed(0)}% • {getConfidenceLevel(result.score).text}
                                    </Typography>
                                    <HelpOutlineRounded
                                      sx={{
                                        fontSize: 14,
                                        color: getConfidenceLevel(result.score).color,
                                        opacity: 0.8
                                      }}
                                    />
                                  </Box>
                                </Tooltip>
                              </Box>
                              
                              <BoltRounded
                                className={styles.resultIcon}
                                style={{ color: getLabelColor(result.label) }}
                              />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="button"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              style={{ width: '100%' }}
                            >
                              <Button
                                variant="outlined"
                                size="medium"
                                fullWidth
                                onClick={() => handleAnalyze(article)}
                                disabled={analyzing[analyzeKey]}
                                startIcon={
                                  analyzing[analyzeKey] ? (
                                    <AutoAwesomeRounded className={styles.spin} />
                                  ) : (
                                    <AutoAwesomeRounded />
                                  )
                                }
                                className={styles.analyzeBtn}
                              >
                                {analyzing[analyzeKey] ? 'Analyzing...' : 'Analyze with AI'}
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Box>
                    </CardContent>

                    {/* Actions Section - Now at bottom */}
                    {article.url && (
                      <Box className={styles.cardActions}>
                        <Button
                          onClick={() => window.open(article.url, '_blank')}
                          className={styles.openButton}
                          endIcon={<OpenInNewRounded fontSize="small" />}
                        >
                          Read Full Article
                        </Button>
                      </Box>
                    )}
                  </Card>
                </motion.div>
              </Grid>
            );
          })
        )}
      </Grid>
    </motion.div>
  );
}