import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  TextField,
  Button,
  Slider,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem
} from '@mui/material';
import {
  TrendingUp,
  Public,
  LocationOn,
  ShowChart,
  Calculate,
  Info,
  AutoGraphRounded,
  InsightsRounded,
  DateRangeRounded,
  NotificationsActiveRounded,
  DownloadRounded,
  RefreshRounded,
} from '@mui/icons-material';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  Bar,
  ComposedChart
} from 'recharts';
import { format } from 'date-fns';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { api } from '../api/client';
import type { ForecastData, RegionalForecast } from '../types';
import Loading from '../components/common/Loading';
import styles from './Forecasts.module.css';

const HIGH_RISK_REGIONS = ['China', 'India', 'Indonesia', 'Philippines'];

export default function Forecasts() {
  const [activeTab, setActiveTab] = useState(0);
  const [globalForecast, setGlobalForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [isSmallMobile, setIsSmallMobile] = useState(false);

  useEffect(() => {
    // Using 576px to be consistent with your other file's breakpoint
    const checkSmallMobile = () => setIsSmallMobile(window.innerWidth <= 576);
    checkSmallMobile();

    window.addEventListener('resize', checkSmallMobile);
    return () => window.removeEventListener('resize', checkSmallMobile);
  }, []);

  // Download menu state
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const openDownload = Boolean(downloadAnchorEl);

  // Regional forecast state
  const [regionalData, setRegionalData] = useState({
    event_count: 5,
    max_magnitude: 6.8,
    avg_magnitude: 5.5,
  });
  const [regionalResult, setRegionalResult] = useState<RegionalForecast | null>(null);
  const [regionalLoading, setRegionalLoading] = useState(false);

  useEffect(() => {
    fetchGlobalForecast();
  }, []);

  const fetchGlobalForecast = async () => {
    try {
      setLoading(true);
      const data = await api.getGlobalForecast();
      setGlobalForecast(data);
    } catch (error) {
      console.error('Failed to fetch global forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGlobalForecast();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleRegionalForecast = async () => {
    try {
      setRegionalLoading(true);
      const result = await api.predictRegionalImpact(regionalData);
      setRegionalResult(result);
    } catch (error) {
      console.error('Regional forecast failed:', error);
    } finally {
      setRegionalLoading(false);
    }
  };

  const handleOpenDownloadMenu = (e: any) => setDownloadAnchorEl(e.currentTarget);
  const handleCloseDownloadMenu = () => setDownloadAnchorEl(null);

  const formatChartData = (data: ForecastData[]) => {
    return data.map(item => ({
      date: format(new Date(item.ds), 'MMM yyyy'),
      fullDate: item.ds,
      forecast: Math.round(item.yhat * 10) / 10,
      upper: Math.round(item.yhat_upper * 10) / 10,
      lower: Math.round(item.yhat_lower * 10) / 10,
      range: Math.round((item.yhat_upper - item.yhat_lower) * 10) / 10
    }));
  };

  // Build export rows
  const buildGlobalExportRows = () => {
    return formatChartData(globalForecast).map(d => ({
      ds: d.fullDate,
      date_label: d.date,
      forecast: d.forecast,
      upper: d.upper,
      lower: d.lower,
      uncertainty_range: d.range
    }));
  };

  const fileName = (ext: string) =>
    `global-forecast_${new Date().toISOString().slice(0, 10)}.${ext}`;

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = (type: 'csv' | 'json') => {
    if (!globalForecast?.length) return;

    const rows = buildGlobalExportRows();

    if (type === 'csv') {
      const headers = Object.keys(rows[0]);
      const toCsvCell = (v: any) => {
        const s = String(v ?? '');
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const csv =
        '\uFEFF' +
        [headers.join(','), ...rows.map(r => headers.map(h => toCsvCell((r as any)[h])).join(','))].join('\n');

      downloadFile(csv, fileName('csv'), 'text/csv;charset=utf-8;');
    } else {
      const json = JSON.stringify(rows, null, 2);
      downloadFile(json, fileName('json'), 'application/json;charset=utf-8;');
    }

    handleCloseDownloadMenu();
  };

  const getRiskColor = (probability: number) => {
    if (probability > 0.7) return '#ef4444';
    if (probability > 0.4) return '#f59e0b';
    return '#10b981';
  };

  const getRiskLevel = (probability: number) => {
    if (probability > 0.7) return { text: 'High Alert', icon: '🚨' };
    if (probability > 0.4) return { text: 'Moderate Risk', icon: '⚠️' };
    return { text: 'Low Risk', icon: '✓' };
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const upper = payload.find((p: any) => p.dataKey === 'upper');
    const lower = payload.find((p: any) => p.dataKey === 'lower');
    const forecast = payload.find((p: any) => p.dataKey === 'forecast');
    const range = payload.find((p: any) => p.dataKey === 'range');

    const rows: { label: string; value: string | number; color: string }[] = [];

    if (forecast) rows.push({ label: 'Forecast', value: forecast.value, color: '#f97316' });
    if (upper && lower) rows.push({ label: 'Confidence Interval', value: `${lower.value} - ${upper.value}`, color: 'var(--color-secondary)' });
    if (range) rows.push({ label: 'Uncertainty Range', value: range.value, color: '#3b82f6' });

    return (
      <Paper className={styles.customTooltip}>
        <Typography variant="subtitle2" className={styles.tooltipTitle}>{label}</Typography>
        {rows.map((r, i) => (
          <Box key={i} className={styles.tooltipItem}>
            <Box className={styles.tooltipDot} style={{ backgroundColor: r.color }} />
            <Typography variant="body2" className={styles.tooltipText}>{r.label}: {r.value}</Typography>
          </Box>
        ))}
      </Paper>
    );
  };

  const renderLegend = () => {
    const items = [
      { key: 'ci', label: isSmallMobile ? 'Interval' : 'Confidence Interval', color: 'var(--color-secondary)' },
      { key: 'fc', label: 'Forecast', color: '#f97316' },
      { key: 'ur', label: isSmallMobile ? 'Uncertainty' : 'Uncertainty Range', color: '#3b82f6' },
    ];

    return (
      <Box className={styles.legendGrid}>
        {items.map((item) => (
          <Box key={item.key} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: item.color }} />
            <span className={styles.legendLabel}>
              {item.label}
              {item.key === 'ci' && !isSmallMobile && (
                <Tooltip title="The faint white fill follows the lower bound; together with the blue fill it forms the confidence band (lower → upper)." arrow placement="top">
                  <span className={styles.legendHelp} aria-label="Confidence interval info" role="button" tabIndex={0}>
                    <InfoOutlined className={styles.legendHelpIcon} />
                  </span>
                </Tooltip>
              )}
            </span>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.container}>
      {/* Header */}
      <Box className={styles.header}>
        {/* ✅ FIX IS HERE: The `flexDirection` property is removed from the sx prop */}
        <Box className={styles.headerContent} sx={isSmallMobile ? { alignItems: 'flex-start', gap: 0.5 } : {}}>
          <AutoGraphRounded className={styles.pageIcon} />
          <Box>
            <Typography variant="h3" className={styles.title}>Global & Regional Forecasts</Typography>
            <Typography variant="body1" className={styles.subtitle}>AI-powered predictions for seismic activity and disaster patterns</Typography>
          </Box>
        </Box>
        <Box className={styles.badges} sx={isSmallMobile ? { flexWrap: 'wrap', gap: 0.25 } : {}}>
          <Chip icon={<InsightsRounded className={styles.InsightsIcon} />} label="Prophet + XGBoost" className={styles.modelBadge} size={isSmallMobile ? 'small' : 'medium'} />
        </Box>
      </Box>

      {/* Tabs */}
      <Card className={styles.tabCard}>
        <Box className={styles.tabHeader} sx={isSmallMobile ? { flexDirection: 'column', alignItems: 'stretch', gap: 0.5 } : {}}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} className={styles.tabs} TabIndicatorProps={{ style: { background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)', height: 3 } }} sx={{ '& .MuiTab-root': { color: 'var(--color-text-secondary)', minWidth: isSmallMobile ? 'auto' : undefined, '& .MuiTab-iconWrapper > *': { color: 'inherit' } }, '& .MuiTab-root.Mui-selected': { color: 'var(--color-primary)' } }} variant={isSmallMobile ? 'fullWidth' : 'standard'}>
            <Tab icon={<Public />} label="Global Forecast" iconPosition="start" className={styles.tab} />
            <Tab icon={<LocationOn />} label="Regional Impact" iconPosition="start" className={styles.tab} />
          </Tabs>

          {activeTab === 0 && (
            <Box className={styles.tabActions} sx={isSmallMobile ? { width: '100%', justifyContent: 'space-around', padding: '0 8px', flexWrap: 'wrap', gap: 0.25 } : {}}>
              <Tooltip title="Download forecast data">
                <IconButton className={styles.actionBtn} onClick={handleOpenDownloadMenu} disabled={loading || !globalForecast.length} size={isSmallMobile ? 'small' : 'medium'}>
                  <DownloadRounded fontSize={isSmallMobile ? 'small' : 'inherit'} />
                </IconButton>
              </Tooltip>
              <Menu anchorEl={downloadAnchorEl} open={openDownload} onClose={handleCloseDownloadMenu} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <MenuItem onClick={() => handleDownload('csv')}>Download CSV</MenuItem>
                <MenuItem onClick={() => handleDownload('json')}>Download JSON</MenuItem>
              </Menu>
              <Tooltip title="Refresh data">
                <IconButton onClick={handleRefresh} disabled={refreshing} className={styles.actionBtn} size={isSmallMobile ? 'small' : 'medium'}>
                  <RefreshRounded className={refreshing ? styles.spinning : ''} fontSize={isSmallMobile ? 'small' : 'inherit'} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div key="global" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <CardContent>
                <Box className={styles.sectionHeader} sx={isSmallMobile ? { flexDirection: 'column', gap: 1 } : {}}>
                  <Box>
                    <Typography variant="h5" className={styles.sectionTitle}>Strategic Global Earthquake Forecast</Typography>
                    <Typography variant="body2" className={styles.sectionDescription} sx={isSmallMobile ? { fontSize: '0.7rem' } : {}}>Monthly forecast of significant earthquakes (M6.0+) globally, providing a strategic baseline for anomaly detection and resource planning.</Typography>
                  </Box>
                  {!isSmallMobile && (
                    <Box className={styles.forecastBadges}>
                      <Badge badgeContent="60" color="primary"><Chip icon={<DateRangeRounded />} label="Month Forecast" variant="outlined" size="small" /></Badge>
                    </Box>
                  )}
                </Box>

                {loading ? <Loading message="Loading forecast data..." size={isSmallMobile ? 'small' : 'medium'} /> : globalForecast.length > 0 ? (
                  <>
                    <Box className={styles.chartContainer}>
                      <Box className={styles.chartScrollWrapper} sx={{ overflowX: isSmallMobile ? 'auto' : 'visible' }}>
                        <ResponsiveContainer width="100%" minWidth={isSmallMobile ? 500 : undefined} height={isSmallMobile ? 220 : 400}>
                          <ComposedChart data={formatChartData(globalForecast)} margin={isSmallMobile ? { top: 5, right: 20, left: 10, bottom: 0 } : { top: 5, right: 20, left: 0, bottom: 5 }}>
                            <defs>
                              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/><stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/></linearGradient>
                              <linearGradient id="colorRange" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                            <XAxis dataKey="date" stroke="var(--color-text-secondary)" tick={{ fontSize: isSmallMobile ? 9 : 12 }} tickLine={false} interval={isSmallMobile ? 11 : 'preserveStartEnd'} />
                            <YAxis stroke="var(--color-text-secondary)" tick={{ fontSize: isSmallMobile ? 9 : 12 }} tickLine={false} axisLine={false} label={{
                              content: (props: any) => {
                                const { viewBox } = props; const { x, y, height } = viewBox || {};
                                const cx = (x ?? 0) + 15; const cy = (y ?? 0) + (height ?? 0) / 2;
                                return (<text x={cx} y={cy} fill="var(--color-text-secondary)" fontWeight={600} fontSize={isSmallMobile ? 10 : 12} fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto" textAnchor="middle" dominantBaseline="central" transform={`rotate(-90, ${cx}, ${cy})`}>Predicted Count</text>);
                              }
                            }} />
                            <ChartTooltip content={<CustomTooltip />} />
                            {!isSmallMobile && (
                              <Legend verticalAlign="bottom" align="center" content={renderLegend} wrapperStyle={{ width: '100%', paddingTop: 16 }} />
                            )}
                            <Area type="monotone" dataKey="upper" stroke="none" fill="url(#colorRange)" name="Confidence Interval" stackId="1" />
                            <Area type="monotone" dataKey="lower" stroke="none" fill="var(--color-bg)" name=" " stackId="1" />
                            <Line type="monotone" dataKey="forecast" stroke="#f97316" strokeWidth={isSmallMobile ? 2 : 3} dot={{ fill: '#f97316', strokeWidth: 1, r: isSmallMobile ? 2 : 4 }} activeDot={{ r: isSmallMobile ? 4 : 6 }} name="Forecast" />
                            <Bar dataKey="range" fill="#3b82f6" opacity={0.3} name="Uncertainty Range" />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </Box>
                      {isSmallMobile && (
                        <Box className={styles.legendWrapperMobile}>
                          {renderLegend()}
                        </Box>
                      )}
                    </Box>

                    <Grid container spacing={isSmallMobile ? 1 : 2} className={styles.insightCards}>
                      {[{ title: 'Next Month Prediction', value: formatChartData(globalForecast)[0]?.forecast || 0, subtitle: 'Expected earthquakes', icon: NotificationsActiveRounded, color: '#f97316' }, { title: 'Trend Direction', value: formatChartData(globalForecast)[0]?.forecast > formatChartData(globalForecast)[1]?.forecast ? 'Increasing' : 'Decreasing', subtitle: 'Compared to last month', icon: TrendingUp, color: '#3b82f6' }, { title: 'Average Forecast', value: Math.round((globalForecast.reduce((acc, item) => acc + item.yhat, 0) / globalForecast.length) * 10) / 10, subtitle: 'Over forecast period', icon: ShowChart, color: '#10b981' }].map((insight, index) => {
                        const Icon = insight.icon;
                        return (
                          <Grid item xs={12} md={4} key={index}>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                              <Paper className={styles.insightCard}>
                                <Icon className={styles.insightIcon} style={{ color: insight.color }} />
                                <Box>
                                  <Typography variant="h6" className={styles.insightValue}>{insight.value}</Typography>
                                  <Typography variant="body2" className={styles.insightTitle}>{insight.title}</Typography>
                                  <Typography variant="caption" className={styles.insightSubtitle}>{insight.subtitle}</Typography>
                                </Box>
                              </Paper>
                            </motion.div>
                          </Grid>
                        );
                      })}
                    </Grid>

                    <Alert severity="info" className={styles.alert} icon={<Info />} sx={isSmallMobile ? { '& .MuiAlert-message': { fontSize: '0.65rem' }, padding: 0.5 } : {}}>
                      <Typography variant="subtitle2" gutterBottom>About This Global Model</Typography>
                      <Typography variant="body2">Prophet time-series model trained on 50+ years of global seismic data. This provides a strategic baseline but cannot predict specific locations or exact timing of earthquakes.</Typography>
                    </Alert>
                  </>
                ) : <Alert severity="error">Failed to load forecast data</Alert>}
              </CardContent>
            </motion.div>
          )}

          {activeTab === 1 && (
            <motion.div key="regional" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <CardContent>
                <Box className={styles.sectionHeader} sx={isSmallMobile ? { flexDirection: 'column', gap: 1 } : {}}>
                  <Box>
                    <Typography variant="h5" className={styles.sectionTitle}>Tactical Regional Impact Forecast</Typography>
                    <Typography variant="body2" className={styles.sectionDescription} sx={isSmallMobile ? { fontSize: '0.7rem' } : {}}>Predict the probability of a fatal earthquake in the next quarter based on current seismic activity patterns.</Typography>
                  </Box>
                </Box>

                <Alert severity="warning" className={styles.warningAlert} sx={isSmallMobile ? { '& .MuiAlert-message': { fontSize: '0.65rem', width: '100%' }, padding: 1 } : {}}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">Critical Geographic Limitation</Typography>
                  <Typography variant="body2">This model is currently calibrated ONLY for:</Typography>
                  <Box className={styles.regionChips}>{HIGH_RISK_REGIONS.map(region => (<Box key={region} sx={{ backgroundColor: '#F59E0B !important', color: '#fff !important', fontWeight: '600 !important', height: '24px !important', padding: '0 8px !important', borderRadius: '16px !important', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '24px', fontSize: isSmallMobile ? '10px' : '12px', whiteSpace: 'nowrap' }}>{region}</Box>))}</Box>
                </Alert>

                <Card className={styles.inputCard} sx={isSmallMobile ? { padding: 0.5 } : {}}>
                  <CardContent>
                    <Typography variant="h6" className={styles.inputTitle} sx={isSmallMobile ? { fontSize: '0.8rem', mb: 1 } : {}}>Current Quarter Seismic Summary</Typography>
                    <Grid container spacing={isSmallMobile ? 2 : 3}>
                      <Grid item xs={12} md={4}><Box className={styles.inputGroup} sx={isSmallMobile ? { gap: 0.25 } : {}}><Typography variant="subtitle2" className={styles.inputLabel} sx={isSmallMobile ? { fontSize: '0.65rem' } : {}}>Number of Earthquakes</Typography><TextField fullWidth type="number" value={regionalData.event_count} onChange={(e) => setRegionalData(prev => ({ ...prev, event_count: parseInt(e.target.value) || 0 }))} inputProps={{ min: 0, max: 100 }} variant="outlined" className={styles.input} size={isSmallMobile ? 'small' : 'medium'} /><Typography variant="caption" className={styles.inputHelp} sx={isSmallMobile ? { fontSize: '0.6rem' } : {}}>Total events this quarter</Typography></Box></Grid>
                      <Grid item xs={12} md={4}><Box className={styles.inputGroup} sx={isSmallMobile ? { gap: 0.25 } : {}}><Typography variant="subtitle2" className={styles.inputLabel} sx={isSmallMobile ? { fontSize: '0.65rem' } : {}}>Max Magnitude</Typography><Box className={styles.sliderWrapper}><Slider value={regionalData.max_magnitude} onChange={(_, value) => setRegionalData(prev => ({ ...prev, max_magnitude: value as number }))} min={0} max={10} step={0.1} marks={!isSmallMobile ? [{ value: 0, label: '0' }, { value: 5, label: '5' }, { value: 10, label: '10' }] : false} valueLabelDisplay="on" className={styles.slider} size={isSmallMobile ? 'small' : 'medium'} /></Box><Typography variant="caption" className={styles.inputHelp} sx={isSmallMobile ? { fontSize: '0.6rem' } : {}}>Strongest earthquake recorded</Typography></Box></Grid>
                      <Grid item xs={12} md={4}><Box className={styles.inputGroup} sx={isSmallMobile ? { gap: 0.25 } : {}}><Typography variant="subtitle2" className={styles.inputLabel} sx={isSmallMobile ? { fontSize: '0.65rem' } : {}}>Average Magnitude</Typography><Box className={styles.sliderWrapper}><Slider value={regionalData.avg_magnitude} onChange={(_, value) => setRegionalData(prev => ({ ...prev, avg_magnitude: value as number }))} min={0} max={10} step={0.1} marks={!isSmallMobile ? [{ value: 0, label: '0' }, { value: 5, label: '5' }, { value: 10, label: '10' }] : false} valueLabelDisplay="on" className={styles.slider} size={isSmallMobile ? 'small' : 'medium'} /></Box><Typography variant="caption" className={styles.inputHelp} sx={isSmallMobile ? { fontSize: '0.6rem' } : {}}>Mean magnitude of all events</Typography></Box></Grid>
                      <Grid item xs={12}><Box className={styles.forecastActions} sx={isSmallMobile ? { mt: 1 } : {}}><Button variant="contained" startIcon={regionalLoading ? <CircularProgress size={isSmallMobile ? 16 : 20} /> : <Calculate />} onClick={handleRegionalForecast} disabled={regionalLoading} className={styles.forecastButton} size={isSmallMobile ? 'small' : 'large'} fullWidth={isSmallMobile}>{regionalLoading ? 'Calculating...' : 'Forecast Next-Quarter Impact'}</Button></Box></Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <AnimatePresence>
                  {regionalResult && !regionalLoading && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={styles.regionalResult}>
                      <Grid container spacing={isSmallMobile ? 2 : 3}>
                        <Grid item xs={12} md={6}><Card className={styles.probabilityCard}><CardContent><Box className={styles.probabilityDisplay}><Box className={styles.probabilityMeter}><CircularProgress variant="determinate" value={regionalResult.high_impact_probability * 100} size={isSmallMobile ? 120 : 180} thickness={4} className={styles.probabilityCircle} style={{ color: getRiskColor(regionalResult.high_impact_probability) }} /><Box className={styles.probabilityValue}><Typography variant="h2" className={styles.probabilityPercent} sx={isSmallMobile ? { fontSize: '1.5rem' } : {}}>{(regionalResult.high_impact_probability * 100).toFixed(0)}%</Typography><Typography variant="body2" className={styles.probabilityLabel} sx={isSmallMobile ? { fontSize: '0.65rem' } : {}}>Fatal Event Probability</Typography></Box></Box><Chip icon={<span>{getRiskLevel(regionalResult.high_impact_probability).icon}</span>} label={getRiskLevel(regionalResult.high_impact_probability).text} className={styles.riskChip} style={{ backgroundColor: `${getRiskColor(regionalResult.high_impact_probability)}20`, color: getRiskColor(regionalResult.high_impact_probability), border: `1px solid ${getRiskColor(regionalResult.high_impact_probability)}`, fontSize: isSmallMobile ? '0.65rem' : '1rem', padding: isSmallMobile ? '4px 8px' : undefined, height: isSmallMobile ? 'auto' : undefined }} /></Box></CardContent></Card></Grid>
                        <Grid item xs={12} md={6}><Card className={styles.interpretationCard}><CardContent><Typography variant="h6" className={styles.interpretationTitle} sx={isSmallMobile ? { fontSize: '0.75rem', mb: 0.5 } : {}}><InsightsRounded sx={{ fontSize: 'inherit', verticalAlign: 'middle' }} /> Interpretation</Typography><Typography variant="body1" className={styles.interpretation} sx={isSmallMobile ? { fontSize: '0.65rem' } : {}}>Based on current seismic patterns, there is a <strong style={{ color: getRiskColor(regionalResult.high_impact_probability) }}>{regionalResult.high_impact_probability > 0.5 ? 'significant' : 'moderate'}</strong> probability of a fatal earthquake occurring in the next quarter in the monitored regions.</Typography><Divider className={styles.divider} sx={isSmallMobile ? { my: 1 } : {}} /><Box className={styles.recommendations}><Typography variant="subtitle2" gutterBottom fontWeight={600} sx={isSmallMobile ? { fontSize: '0.7rem' } : {}}>Recommended Actions:</Typography>{regionalResult.high_impact_probability > 0.5 ? (<ul className={styles.recommendationList} style={{ fontSize: isSmallMobile ? '0.65rem' : '0.875rem' }}><li>Activate enhanced monitoring protocols</li><li>Review emergency response procedures</li><li>Alert relevant authorities</li><li>Prepare resource allocation plans</li></ul>) : (<ul className={styles.recommendationList} style={{ fontSize: isSmallMobile ? '0.65rem' : '0.875rem' }}><li>Maintain standard monitoring</li><li>Update contingency plans</li><li>Continue data collection</li></ul>)}</Box></CardContent></Card></Grid>
                      </Grid>
                      <Alert severity="info" className={styles.modelInfo}><Typography variant="body2"><strong>Model Performance:</strong> High precision (few false alarms) but low recall. An alert is a strong signal, but absence of alert doesn't guarantee safety. Always combine with local expertise and real-time monitoring.</Typography></Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}