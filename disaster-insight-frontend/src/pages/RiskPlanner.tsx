import { useState } from 'react';
import { ErrorOutline } from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Slider,
  Chip,
  Alert,
  Paper,
  CircularProgress,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  useMediaQuery
} from '@mui/material';
import {
  Assessment,
  Warning,
  LocationOn,
  CalendarMonth,
  Category,
  Calculate,
  InfoOutlined,
  TrendingUpRounded,
  SecurityRounded,
  AnalyticsRounded,
  PublicRounded,
  CheckCircleRounded,
  RestartAltRounded
} from '@mui/icons-material';
import { api } from '../api/client';
import type { RiskAssessment } from '../types';
import styles from './RiskPlanner.module.css';

const COUNTRIES = [
  'Afghanistan', 'China', 'India', 'Indonesia', 'Iran (Islamic Republic of)',
  'Pakistan', 'Philippines', 'Turkey', 'United States of America',
  'Japan', 'Mexico', 'Chile', 'Nepal', 'Bangladesh'
];

const REGIONS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];
const DISASTER_TYPES = ['Earthquake', 'Flood', 'Storm', 'Drought', 'Landslide', 'Volcanic activity'];
const DISASTER_GROUPS = ['Natural', 'Technological'];

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function RiskPlanner() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    country: '',
    region: '',
    disaster_group: 'Natural',
    disaster_subgroup: 'Hydrological',
    disaster_type: '',
    start_year: new Date().getFullYear(),
    start_month: 1,
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RiskAssessment | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // ✅ Detect very small screens
  const isSmallmobile = useMediaQuery('(max-width:576px)');

  const steps = [
    {
      label: 'Location',
      icon: LocationOn,
      description: 'Select the geographical area'
    },
    {
      label: 'Disaster Type',
      icon: Warning,
      description: 'Specify the disaster category'
    },
    {
      label: 'Time Period',
      icon: CalendarMonth,
      description: 'Define the temporal parameters'
    }
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const assessment = await api.predictRisk(formData);
      setResult(assessment);
    } catch (error) {
      console.error('Risk assessment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (!completedSteps.includes(activeStep)) {
      setCompletedSteps([...completedSteps, activeStep]);
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setFormData({
      country: '',
      region: '',
      disaster_group: 'Natural',
      disaster_subgroup: 'Hydrological',
      disaster_type: '',
      start_year: new Date().getFullYear(),
      start_month: 1,
    });
    setResult(null);
    setActiveStep(0);
    setCompletedSteps([]);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.country && formData.region;
      case 1:
        return formData.disaster_type;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const getRiskLevel = (probability: number) => {
    if (probability > 0.75) return { 
      label: 'CRITICAL RISK', 
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      description: 'Immediate action required'
    };
    if (probability > 0.5) return { 
      label: 'HIGH RISK', 
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      description: 'Enhanced monitoring needed'
    };
    if (probability > 0.25) return { 
      label: 'MODERATE RISK', 
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      description: 'Standard precautions advised'
    };
    return { 
      label: 'LOW RISK', 
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      description: 'Routine monitoring sufficient'
    };
  };

  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={styles.container} // ✅ no need for conditional mobileContainer
  >
    {/* Header */}
    <Box className={styles.header}>
      <Box className={styles.headerContent}>
        <SecurityRounded className={styles.pageIcon} />
        <Box>
          <Typography 
            variant="h3" 
            className={styles.title} // ✅ no need for mobileTitle
          >
            Event Risk Scenario Planner
          </Typography>
          <Typography 
            variant="body1" 
            className={styles.subtitle} // ✅ no need for mobileSubtitle
          >
            AI-powered disaster risk assessment using historical pattern analysis
          </Typography>
        </Box>
      </Box>

      <Box className={styles.badges}>
        <Chip
          icon={<AnalyticsRounded className={styles.boltIcon} />}
          label="XGBoost ML Model"
          className={styles.modelBadge} // ✅ simplified
        />
        <Chip
          icon={<PublicRounded className={styles.globeIcon} />}
          label="20K+ Events Analyzed"
          className={styles.dataBadge} // ✅ simplified
        />
      </Box>
    </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          {/* Main Form Card */}
          <Card className={styles.formCard}>
            <Box className={styles.cardGradient} />
            <CardContent>
              <Box className={styles.formHeader}>
                <Typography variant="h6" className={styles.formTitle}>
                  <Assessment className={styles.titleIcon} />
                  Scenario Configuration
                </Typography>
                {result && (
                  <Button
                    startIcon={<RestartAltRounded />}
                    onClick={handleReset}
                    variant="outlined"
                    size="small"
                    className={styles.resetButton}
                  >
                    New Assessment
                  </Button>
                )}
              </Box>

              {!result ? (
                <Stepper activeStep={activeStep} orientation="vertical" connector={null} className={styles.verticalStepper}>
                  {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    return (
                      <Step key={step.label}>
                        <StepLabel
                          StepIconComponent={() => (
                            <Box 
                              className={`${styles.stepIcon} ${
                                activeStep === index ? styles.activeStep : 
                                completedSteps.includes(index) ? styles.completedStep : ''
                              }`}
                            >
                              {completedSteps.includes(index) ? (
                                <CheckCircleRounded />
                              ) : (
                                <StepIcon />
                              )}
                            </Box>
                          )}
                        >
                          <Typography variant="h6" className={styles.stepLabel}>
                            {step.label}
                          </Typography>
                          <Typography variant="caption" className={styles.stepDescription}>
                            {step.description}
                          </Typography>
                        </StepLabel>
                        <StepContent>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {index === 0 && (
                              <Grid container spacing={2} className={styles.stepContent}>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    select
                                    label="Country"
                                    value={formData.country}
                                    onChange={(e) => handleChange('country', e.target.value)}
                                    variant="outlined"
                                    className={styles.input}
                                  >
                                    {COUNTRIES.map(country => (
                                      <MenuItem key={country} value={country}>
                                        {country}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    select
                                    label="Region"
                                    value={formData.region}
                                    onChange={(e) => handleChange('region', e.target.value)}
                                    variant="outlined"
                                    className={styles.input}
                                  >
                                    {REGIONS.map(region => (
                                      <MenuItem key={region} value={region}>
                                        {region}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                </Grid>
                              </Grid>
                            )}

                            {index === 1 && (
                              <Grid container spacing={2} className={styles.stepContent}>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    select
                                    label="Disaster Group"
                                    value={formData.disaster_group}
                                    onChange={(e) => handleChange('disaster_group', e.target.value)}
                                    variant="outlined"
                                    className={styles.input}
                                  >
                                    {DISASTER_GROUPS.map(group => (
                                      <MenuItem key={group} value={group}>
                                        {group}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Disaster Subgroup"
                                    value={formData.disaster_subgroup}
                                    onChange={(e) => handleChange('disaster_subgroup', e.target.value)}
                                    variant="outlined"
                                    className={styles.input}
                                  />
                                </Grid>

                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    select
                                    label="Disaster Type"
                                    value={formData.disaster_type}
                                    onChange={(e) => handleChange('disaster_type', e.target.value)}
                                    variant="outlined"
                                    className={styles.input}
                                  >
                                    {DISASTER_TYPES.map(type => (
                                      <MenuItem key={type} value={type}>
                                        {type}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                </Grid>
                              </Grid>
                            )}

                            {index === 2 && (
                              <Grid container spacing={2} className={styles.stepContent}>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    type="number"
                                    label="Start Year"
                                    value={formData.start_year}
                                    onChange={(e) => handleChange('start_year', parseInt(e.target.value))}
                                    inputProps={{ min: 2000, max: 2050 }}
                                    variant="outlined"
                                    className={styles.input}
                                  />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                  <Box className={styles.sliderContainer}>
                                    <Typography gutterBottom className={styles.sliderLabel}>
                                      Start Month
                                    </Typography>
                                    <Slider
                                      value={formData.start_month}
                                      onChange={(_, value) => handleChange('start_month', value)}
                                      min={1}
                                      max={12}
                                      marks
                                      valueLabelDisplay="auto"
                                      valueLabelFormat={(value) => monthNames[value - 1]}
                                      className={styles.slider}
                                    />
                                    <Box className={styles.monthLabels}>
                                      <Typography variant="caption">Jan</Typography>
                                      <Typography variant="caption">{monthNames[formData.start_month - 1]}</Typography>
                                      <Typography variant="caption">Dec</Typography>
                                    </Box>
                                  </Box>
                                </Grid>
                              </Grid>
                            )}

                            <Box className={styles.stepActions}>
                              <Button
                                disabled={index === 0}
                                onClick={handleBack}
                                className={styles.backButton}
                              >
                                Back
                              </Button>
                              {index === steps.length - 1 ? (
                                <Button
                                  variant="contained"
                                  onClick={handleSubmit}
                                  disabled={loading || !isStepValid(index)}
                                  className={styles.submitButton}
                                  startIcon={loading ? <CircularProgress size={20} /> : <Calculate />}
                                >
                                  {loading ? 'Analyzing...' : 'Assess Risk'}
                                </Button>
                              ) : (
                                <Button
                                  variant="contained"
                                  onClick={handleNext}
                                  disabled={!isStepValid(index)}
                                  className={styles.nextButton}
                                >
                                  Next
                                </Button>
                              )}
                            </Box>
                          </motion.div>
                        </StepContent>
                      </Step>
                    );
                  })}
                </Stepper>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={styles.result}
                >
                  <Typography variant="h5" className={styles.resultTitle}>
                    Risk Assessment Results
                  </Typography>
                  
                  <Box
                  className={styles.riskDisplay}
                  style={{
                    flexDirection: isSmallmobile ? 'column' : 'row',
                    alignItems: isSmallmobile ? 'center' : 'flex-start',
                    textAlign: isSmallmobile ? 'center' : 'left',
                    gap: isSmallmobile ? '1.5rem' : '2rem',
                  }}
                >
                  {/* Circle + % */}
                  <Box
                    className={styles.riskMeter}
                    style={{
                      alignItems: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box
                    className={styles.riskCircle}
                    style={{
                      position: 'relative',
                      width: isSmallmobile ? 80 : 160,
                      height: isSmallmobile ? 80 : 160,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CircularProgress
                      variant="determinate"
                      value={result.high_risk_probability * 100}
                      size={isSmallmobile ? 80 : 160}
                      thickness={3}
                      style={{
                        color: getRiskLevel(result.high_risk_probability).color,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }}
                    />
                    <Box
                      style={{
                        textAlign: 'center',
                        zIndex: 1,
                      }}
                    >
                      <Typography
                        variant={isSmallmobile ? 'h6' : 'h2'}
                        className={styles.riskPercent}
                        style={{
                          fontSize: isSmallmobile ? '1.25rem' : '2.25rem',
                          fontWeight: 700,
                        }}
                      >
                        {(result.high_risk_probability * 100).toFixed(0)}%
                      </Typography>
                      <Typography variant="caption" className={styles.riskLabel}>
                        Probability
                      </Typography>
                    </Box>
                  </Box>


                    <Chip
                      
                      label={getRiskLevel(result.high_risk_probability).label}
                      className={styles.riskChip}
                      style={{
                        backgroundColor: getRiskLevel(result.high_risk_probability).bgColor,
                        color: getRiskLevel(result.high_risk_probability).color,
                        border: `1px solid ${getRiskLevel(result.high_risk_probability).color}`,
                        marginTop: '0.75rem',
                      }}
                    />
                  </Box>

                  {/* Risk info box */}
                  <Box
                    className={styles.riskInfo}
                    style={{
                      width: isSmallmobile ? '100%' : 'auto',
                      maxWidth: isSmallmobile ? '100%' : 'none',
                    }}
                  >
                    <Alert
                      severity={
                        result.high_risk_probability > 0.75
                          ? 'error'
                          : result.high_risk_probability > 0.5
                          ? 'warning'
                          : result.high_risk_probability > 0.25
                          ? 'info'
                          : 'success'
                      }
                      icon={
                        result.high_risk_probability > 0.75 ? (
                          <ErrorOutline fontSize="inherit" />
                        ) : (
                          <Warning fontSize="inherit" />
                        )
                      }
                      className={styles.riskAlert}
                      style={{
                        textAlign: isSmallmobile ? 'center' : 'left',
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: isSmallmobile ? 'column' : 'row',
                        gap: '0.5rem',
                        fontSize: 18,  // control icon and text size together
                      }}
                    >
                      <Box style={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          style={{
                            fontWeight: 600,
                            marginBottom: '0.25rem',
                          }}
                        >
                          Immediate action required
                        </Typography>
                        <Typography variant="body2">
                          Based on historical patterns, this scenario has a{' '}
                          <strong>{(result.high_risk_probability * 100).toFixed(1)}%</strong>{' '}
                          probability of becoming a high-impact event ({'>'}10 fatalities).
                        </Typography>
                      </Box>
                    </Alert>

                    {result.risk_factors && (
                      <Box className={styles.factors}>
                        <Typography variant="subtitle1" className={styles.factorsTitle}>
                          <TrendingUpRounded /> Contributing Risk Factors
                        </Typography>
                        {Object.entries(result.risk_factors).map(([factor, weight]) => (
                          <Box key={factor} className={styles.factor}>
                            <Box className={styles.factorHeader}>
                              <Typography variant="body2" className={styles.factorName}>
                                {factor
                                  .replace(/_/g, ' ')
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Typography>
                              <Typography variant="caption" className={styles.factorWeight}>
                                {(weight * 100).toFixed(0)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={weight * 100}
                              className={styles.factorBar}
                              style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          {/* Info Card */}
          <Card className={styles.infoCard}>
            <Box className={styles.infoGradient} />
            <CardContent>
              <Typography variant="h6" className={styles.infoTitle}>
                <InfoOutlined /> About This Model
              </Typography>
              
              <Alert severity="info" className={styles.infoAlert}>
                <Typography variant="subtitle2" gutterBottom>
                  XGBoost Risk Classifier
                </Typography>
                <Typography variant="body2">
                  Trained on the EMDAT global disaster database with over 20,000 
                  historical events from 1970-2023.
                </Typography>
              </Alert>

              <Divider className={styles.divider} />

              <Typography variant="subtitle2" className={styles.featuresTitle}>
                Key Features:
              </Typography>
              
              <List className={styles.featureList}>
                {[
                  'Historical pattern recognition',
                  'Multi-factor risk assessment',
                  'High-impact event prediction',
                  'Regional calibration',
                  'Temporal trend analysis'
                ].map((feature, index) => (
                  <ListItem key={index} className={styles.featureItem}>
                    <ListItemIcon>
                      <CheckCircleRounded className={styles.checkIcon} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={feature}
                      primaryTypographyProps={{
                        variant: 'body2'
                      }}
                    />
                  </ListItem>
                ))}
              </List>

              <Alert severity="warning" className={styles.warningAlert}>
                <Typography variant="body2">
                  <strong>Limitations:</strong> This model provides statistical 
                  probabilities based on historical data. It cannot account for 
                  real-time factors like current weather conditions or local 
                  preparedness levels.
                </Typography>
              </Alert>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className={styles.tipsCard}>
            <CardContent>
              <Typography variant="h6" className={styles.tipsTitle}>
                <Category /> Usage Guidelines
              </Typography>
              
              <Box className={styles.tipsList}>
                {[
                  {
                    emoji: '💡',
                    title: 'Best for:',
                    text: 'Strategic planning and resource allocation based on historical risk patterns.'
                  },
                  {
                    emoji: '📊',
                    title: 'Combine with:',
                    text: 'Real-time monitoring and local expertise for comprehensive risk assessment.'
                  },
                  {
                    emoji: '🌍',
                    title: 'Coverage:',
                    text: 'Global model with enhanced accuracy for frequently affected regions.'
                  },
                  {
                    emoji: '⏱️',
                    title: 'Time horizon:',
                    text: 'Most accurate for near-term predictions (1-3 months).'
                  }
                ].map((tip, index) => (
                  <Paper key={index} className={styles.tip}>
                    <span className={styles.tipEmoji}>{tip.emoji}</span>
                    <Box>
                      <Typography variant="subtitle2" className={styles.tipTitle}>
                        {tip.title}
                      </Typography>
                      <Typography variant="body2" className={styles.tipText}>
                        {tip.text}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  );
}