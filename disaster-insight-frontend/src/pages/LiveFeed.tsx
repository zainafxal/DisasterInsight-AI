import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Button,
  Avatar,
  Skeleton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  LocationOn,
  Link as LinkIcon,
  NotificationsActive,
  SatelliteAltRounded,
  TsunamiRounded,
  SpeedRounded,
  PublicRounded,
  WarningAmberRounded,
  InfoOutlined,
  FilterListRounded,
  DownloadRounded
} from '@mui/icons-material';
import { format } from 'date-fns';
import EarthquakeMap from '../components/maps/EarthquakeMap';
import Loading from '../components/common/Loading';
import { api } from '../api/client';
import type { EarthquakeData } from '../types';
import toast from 'react-hot-toast';
import styles from './LiveFeed.module.css';

export default function LiveFeed() {
  const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [filter, setFilter] = useState<'all' | 'major' | 'moderate'>('all');

  // Download menu state
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const openDownload = Boolean(downloadAnchorEl);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await api.getLiveEarthquakes();
      setEarthquakes(data.sort((a, b) => b.time.getTime() - a.time.getTime()));
      setLastUpdate(new Date());
      // Check for significant new earthquakes (last hour, M6.0+)
      const significantQuakes = data.filter(eq => eq.magnitude >= 6.0 &&
        (new Date().getTime() - eq.time.getTime()) < 3600000);

      if (significantQuakes.length > 0) {
        toast.custom(() => (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={styles.customToast}
          >
            <WarningAmberRounded className={styles.toastIcon} />
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                Significant Earthquake Detected!
              </Typography>
              <Typography variant="caption">
                {significantQuakes.length} major event(s) in the last hour
              </Typography>
            </Box>
          </motion.div>
        ), { duration: 5000 });
      }
    } catch (error) {
      console.error('Failed to fetch earthquake data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (autoRefresh) {
      const interval = setInterval(fetchData, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude >= 6.5) return { 
      label: 'Major', 
      backgroundColor: '#DC2626', // Red
      textColor: '#FFFFFF' // White text
    };
    if (magnitude >= 5.5) return { 
      label: 'Strong', 
      backgroundColor: '#D97706', // Orange
      textColor: '#FFFFFF' // White text
    };
    return { 
      label: 'Moderate', 
      backgroundColor: '#10B981', // Green
      textColor: '#FFFFFF' // White text
    };
  };

  const getDepthCategory = (depth: number) => {
    if (depth < 70) return { label: 'Shallow', color: '#ff6b6b' };
    if (depth < 300) return { label: 'Intermediate', color: '#feca57' };
    return { label: 'Deep', color: '#48dbfb' };
  };

  const filteredEarthquakes = earthquakes.filter(eq => {
    if (filter === 'major') return eq.magnitude >= 6.0;
    if (filter === 'moderate') return eq.magnitude >= 5.0 && eq.magnitude < 6.0;
    return true;
  });

  const stats = {
    total: earthquakes.length,
    major: earthquakes.filter(eq => eq.magnitude >= 6.0).length,
    shallow: earthquakes.filter(eq => eq.depth < 70).length,
    recent: earthquakes.filter(eq =>
      (new Date().getTime() - eq.time.getTime()) < 3600000
    ).length
  };

  // Download helpers
  const handleOpenDownloadMenu = (e: React.MouseEvent<HTMLElement>) => setDownloadAnchorEl(e.currentTarget);
  const handleCloseDownloadMenu = () => setDownloadAnchorEl(null);

  const buildExportRows = () => {
    // Export the "current view" (filteredEarthquakes)
    return filteredEarthquakes.map(eq => ({
      id: eq.id,
      time_iso: new Date(eq.time).toISOString(),
      time_local: format(eq.time, 'yyyy-MM-dd HH:mm:ss'),
      magnitude: Number(eq.magnitude.toFixed(1)),
      depth_km: Number(eq.depth.toFixed(1)),
      depth_category: getDepthCategory(eq.depth).label,
      place: eq.place,
      usgs_url: eq.url
    }));
  };

  const fileName = (ext: string) =>
    `live-earthquakes_${new Date().toISOString().slice(0, 10)}.${ext}`;

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
    if (!filteredEarthquakes.length) return;
    const rows = buildExportRows();

    if (type === 'csv') {
      const headers = Object.keys(rows[0]);
      const toCsvCell = (v: any) => {
        const s = String(v ?? '');
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const csv =
        '\uFEFF' + // BOM for UTF-8 (Excel-friendly)
        [headers.join(','), ...rows.map(r => headers.map(h => toCsvCell((r as any)[h])).join(','))].join('\n');

      downloadFile(csv, fileName('csv'), 'text/csv;charset=utf-8;');
    } else {
      const json = JSON.stringify(rows, null, 2);
      downloadFile(json, fileName('json'), 'application/json;charset=utf-8;');
    }

    handleCloseDownloadMenu();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={styles.container}
    >
      {/* Header Section */}
      <Box className={styles.header}>
        <Box className={styles.headerContent}>
          <Box className={styles.titleSection}>
            <SatelliteAltRounded className={styles.pageIcon} />
            <Box>
              <Typography variant="h3" className={styles.title}>
                Live Global Earthquake Feed
              </Typography>
              <Typography variant="body1" className={styles.subtitle}>
                Real-time seismic activity monitoring powered by USGS
              </Typography>
            </Box>
          </Box>
          <Box className={styles.controls}>
            <Chip
              icon={
                <NotificationsActive
                  sx={{ color: autoRefresh ? 'white' : 'gray', fontSize: 20 }}
                />
              }
              label={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              color={autoRefresh ? 'primary' : 'default'}
              onClick={() => setAutoRefresh(!autoRefresh)}
              clickable
              className={styles.refreshChip}
              sx={{
                color: autoRefresh ? 'white' : 'gray',
                backgroundColor: autoRefresh ? 'primary.main' : '#e0e0e0',
                '& .MuiChip-icon': { color: autoRefresh ? 'white' : 'gray' }
              }}
            />

            <Tooltip title="Refresh now">
              <IconButton
                onClick={fetchData}
                disabled={loading}
                className={styles.refreshBtn}
              >
                <RefreshIcon className={loading ? styles.spinning : ''} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Download data">
              <IconButton
                className={styles.downloadBtn}
                onClick={handleOpenDownloadMenu}
                disabled={loading || filteredEarthquakes.length === 0}
              >
                <DownloadRounded />
              </IconButton>
            </Tooltip>

            {/* Download menu */}
            <Menu
              anchorEl={downloadAnchorEl}
              open={openDownload}
              onClose={handleCloseDownloadMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => handleDownload('csv')}>Download CSV (current view)</MenuItem>
              <MenuItem onClick={() => handleDownload('json')}>Download JSON (current view)</MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Last Update Badge */}
        <Box className={styles.updateBadge}>
          <InfoOutlined fontSize="small" />
          <Typography variant="caption">
            Last updated: {format(lastUpdate, 'HH:mm:ss')} •
            Next update in: {autoRefresh ? '60s' : 'Manual'}
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box className={styles.statsGrid}>
        {[
          {
            label: 'Total Events',
            value: stats.total,
            icon: PublicRounded,
            color: '#3b82f6',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
          },
          {
            label: 'Major (M6.0+)',
            value: stats.major,
            icon: WarningAmberRounded,
            color: '#ef4444',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
          },
          {
            label: 'Shallow (<70km)',
            value: stats.shallow,
            icon: TsunamiRounded,
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
          },
          {
            label: 'Last Hour',
            value: stats.recent,
            icon: SpeedRounded,
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={styles.statCard}>
                <Box
                  className={styles.statGradient}
                  style={{ background: stat.gradient }}
                />
                <CardContent className={styles.statContent}>
                  <Box className={styles.statIcon}>
                    <Icon style={{ color: stat.color }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" className={styles.statValue}>
                      {loading ? <Skeleton width={60} /> : stat.value}
                    </Typography>
                    <Typography variant="body2" className={styles.statLabel}>
                      {stat.label}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </Box>

      {loading && earthquakes.length === 0 ? (
        <Loading message="Loading earthquake data..." />
      ) : (
        <>
          {/* Map Card */}
          <Card className={styles.mapCard}>
            <CardContent>
              <Box className={styles.mapHeader}>
                <Typography variant="h5" className={styles.mapTitle}>
                  Interactive Global Map
                </Typography>
                <Box className={styles.filterButtons}>
                  {['all', 'major', 'moderate'].map((f) => (
                    <Button
                      key={f}
                      size="small"
                      variant={filter === f ? 'contained' : 'outlined'}
                      onClick={() => setFilter(f as any)}
                      className={styles.filterBtn}
                      sx={{
                        color: filter === f ? 'white' : 'primary.main',
                        borderColor: filter === f ? 'primary.main' : 'grey.400',
                      }}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Button>

                  ))}
                </Box>
              </Box>
              <Box className={styles.mapContainer}>
                <EarthquakeMap data={filteredEarthquakes} />
              </Box>
            </CardContent>
          </Card>

          {/* Table Card */}
          <Card className={styles.tableCard}>
            <CardContent>
              <Box className={styles.tableHeader}>
                <Typography variant="h5" className={styles.tableTitle}>
                  Recent Earthquakes
                </Typography>
                <Chip
                  icon={<FilterListRounded />}
                  label={`Showing ${filteredEarthquakes.length} events`}
                  size="small"
                  variant="outlined"
                />
              </Box>

              {filteredEarthquakes.length === 0 ? (
                <Alert severity="info" className={styles.alert}>
                  No earthquake data matches your filter criteria
                </Alert>
              ) : (
                <TableContainer component={Paper} elevation={0} className={styles.tableContainer}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell align="center">Magnitude</TableCell>
                        <TableCell align="center">Depth</TableCell>
                        <TableCell align="center">Details</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <AnimatePresence>
                        {filteredEarthquakes.slice(0, 20).map((earthquake, index) => (
                          <motion.tr
                            key={earthquake.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className={styles.tableRow}
                          >
                            <TableCell>
                              <Box className={styles.timeCell}>
                                <Typography variant="body2" fontWeight={500}>
                                  {format(earthquake.time, 'MMM dd')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {format(earthquake.time, 'HH:mm:ss')}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box className={styles.locationCell}>
                                <Avatar className={styles.locationAvatar}>
                                  <LocationOn fontSize="small" />
                                </Avatar>
                                <Typography variant="body2" className={styles.locationText}>
                                  {earthquake.place}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              {/* Get the color properties from your new function */}
                              {(() => {
                                const magnitudeColors = getMagnitudeColor(earthquake.magnitude);
                                return (
                                  <Chip
                                    label={earthquake.magnitude.toFixed(1)}
                                    size="small"
                                    className={styles.magnitudeChip}
                                    sx={{
                                      backgroundColor: magnitudeColors.backgroundColor,
                                      color: magnitudeColors.textColor,
                                    }}
                                  />
                                );
                              })()}
                            </TableCell>
                            <TableCell align="center">
                              <Box className={styles.depthCell}>
                                <Box
                                  className={styles.depthIndicator}
                                  style={{
                                    backgroundColor: getDepthCategory(earthquake.depth).color
                                  }}
                                />
                                <Box>
                                  <Typography variant="body2">
                                    {earthquake.depth.toFixed(1)} km
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {getDepthCategory(earthquake.depth).label}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="View on USGS">
                                <IconButton
                                  size="small"
                                  onClick={() => window.open(earthquake.url, '_blank')}
                                  className={styles.detailsBtn}
                                >
                                  <LinkIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  );
}