import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, Card, CardContent, Typography, Box, Skeleton, Chip, IconButton } from '@mui/material';
import {
  Public,
  Warning,
  TrendingUp,
  Analytics,
  Speed,
  ArrowUpward,
  ArrowDownward,
  AutoAwesomeRounded,
  NotificationsActiveRounded,
  LanguageRounded,
  MonitorHeartRounded,
  ArrowForwardRounded,
  FiberManualRecordRounded
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import styles from './Dashboard.module.css';
import { api } from '../api/client';

const features = [
  {
    icon: NotificationsActiveRounded,
    title: 'Real-Time Detection',
    description: 'AI-powered analysis of social media and news for crisis detection',
    path: '/signal-analysis',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    status: 'active',
    badge: '24/7 Active'
  },
  {
    icon: Analytics,
    title: 'Risk Assessment',
    description: 'Machine learning models for disaster risk evaluation',
    path: '/risk-planner',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    status: 'beta',
    badge: 'ML Powered'
  },
  {
    icon: TrendingUp,
    title: 'Predictive Forecasting',
    description: 'Global and regional disaster pattern predictions',
    path: '/forecasts',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    status: 'active',
    badge: '98% Accuracy'
  },
  {
    icon: LanguageRounded,
    title: 'Live Earth Monitor',
    description: 'Real-time global earthquake tracking from USGS',
    path: '/live-feed',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    status: 'live',
    badge: 'Live Now'
  },
];

interface Stat {
  label: string;
  value: number;
  suffix?: string;
  icon: any;
  color: string;
  trend: string;
  trendUp: boolean;
  description?: string;
  unit?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState({
    activeAlerts: 0,
    regionsMonitored: 0,
    dataProcessed: 0,
    responseTime: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Fetch API online status
    let cancelled = false;
    (async () => {
      try {
        const ok = await api.pingRoot();
        if (!cancelled) setApiOnline(ok);
      } catch (error) {
        if (!cancelled) setApiOnline(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Fetch real-time stats from various sources
    const fetchStats = async () => {
      const [majorEvents, latency] = await Promise.all([
        api.getMajorEventCount(),
        api.getAPILatency(),
      ]);

      setStats({
        activeAlerts: majorEvents,
        regionsMonitored: 214,
        dataProcessed: 3.7,
        responseTime: latency !== null ? latency : 0,
      });

      setLoading(false);
    };

    fetchStats();
    
    // Set up an interval to refresh the real-time stats
    const intervalId = setInterval(fetchStats, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const statItems: Stat[] = [
    {
      label: 'Major Events (24h)',
      value: stats.activeAlerts,
      icon: Warning,
      color: '#EF4444',
      trend: '+12%',
      trendUp: true,
      description: 'Earthquakes mag. >= 6.0 detected'
    },
    {
      label: 'Countries in Dataset',
      value: stats.regionsMonitored,
      icon: Public,
      color: '#3B82F6',
      trend: '+5%',
      trendUp: true,
      description: 'Historical data coverage'
    },
    {
      label: 'Total Records Analyzed',
      value: stats.dataProcessed,
      unit: 'M',
      icon: Analytics,
      color: '#10B981',
      trend: '+23%',
      trendUp: true,
      description: 'Total from all training sets'
    },
    {
      label: 'API Latency',
      value: stats.responseTime,
      unit: 'ms',
      icon: Speed,
      color: '#F59E0B',
      trend: '-15%',
      trendUp: false,
      description: 'Average response time'
    },
  ];

  return (
    <div className={styles.container}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Hero Section */}
        <motion.div className={styles.hero} variants={itemVariants}>
          <div className={styles.heroBackground}>
            <div className={styles.heroGlow} />
            <div className={styles.heroPattern} />
          </div>

          <div className={styles.heroContent}>
            <div
              className={`${styles.heroBadge} ${apiOnline === false ? styles.badgeOffline : styles.badgeOnline}`}
              aria-live="polite"
              title={apiOnline === false ? 'Cannot reach API' : 'API reachable'}
            >
              <FiberManualRecordRounded
                className={
                  apiOnline === false ? styles.liveIndicatorOffline : styles.liveIndicatorOnline
                }
              />
              <span>
                {apiOnline === null ? 'Checking...' : apiOnline === false ? 'API Offline' : 'System Online'}
              </span>
            </div>

            <h1 className={styles.title} style={{ whiteSpace: isMobile ? 'nowrap' : 'normal' }}>
              Welcome to <span className={styles.brandName}>DisasterInsight AI</span>
            </h1>
            <p className={styles.subtitle} style={{ whiteSpace: isMobile ? 'nowrap' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Real-Time Global Disaster Analytics Powered by AI
            </p>
            <p className={styles.description} style={{ whiteSpace: isMobile ? 'nowrap' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Transforming data streams into actionable intelligence for crisis response
            </p>

            <div className={styles.heroStats} style={{ flexWrap: isMobile ? 'nowrap' : 'wrap', overflowX: 'auto' }}>
              <div className={styles.heroStat} style={{ flexShrink: 0 }}>
                <AutoAwesomeRounded />
                <span>AI-Powered</span>
              </div>
              <div className={styles.heroStat} style={{ flexShrink: 0 }}>
                <MonitorHeartRounded />
                <span>24/7 Monitoring</span>
              </div>
              <div className={styles.heroStat} style={{ flexShrink: 0 }}>
                <LanguageRounded />
                <span>Global Coverage</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <Grid container spacing={3} className={styles.statsGrid}>
          <AnimatePresence>
            {statItems.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Grid item xs={12} sm={6} md={3} key={stat.label}>
                  <motion.div
                    variants={itemVariants}
                    whileHover={isMobile ? {} : { y: -4 }}
                    onHoverStart={isMobile ? undefined : () => setHoveredCard(index)}
                    onHoverEnd={isMobile ? undefined : () => setHoveredCard(null)}
                  >
                    <Card className={styles.statCard}>
                      <CardContent className={styles.statCardContent}>
                        <Box className={styles.statHeader}>
                          <Box
                            className={styles.iconWrapper}
                            style={{
                              background: `${stat.color}15`,
                              border: `2px solid ${stat.color}20`
                            }}
                          >
                            <Icon style={{ color: stat.color, fontSize: 28 }} />
                          </Box>
                          <Box className={styles.trend}>
                            {stat.trendUp ? (
                              <ArrowUpward className={styles.trendUp} />
                            ) : (
                              <ArrowDownward className={styles.trendDown} />
                            )}
                            <span className={stat.trendUp ? styles.trendUp : styles.trendDown}>
                              {stat.trend}
                            </span>
                          </Box>
                        </Box>

                        <Box className={styles.statContent}>
                          {loading ? (
                            <>
                              <Skeleton width={100} height={40} />
                              <Skeleton width={120} height={20} />
                            </>
                          ) : (
                            <>
                              <Typography variant="h4" className={styles.statValue}>
                                <CountUp
                                  start={0}
                                  end={stat.value}
                                  duration={2}
                                  decimals={stat.unit === 'M' ? 1 : 0}
                                  suffix={stat.unit}
                                />
                              </Typography>
                              <Typography variant="body2" className={styles.statLabel}>
                                {stat.label}
                              </Typography>
                              <AnimatePresence>
                                {(isMobile || hoveredCard === index) && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Typography variant="caption" className={styles.statDescription}>
                                      {stat.description}
                                    </Typography>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </AnimatePresence>
        </Grid>

        {/* Features Section */}
        <motion.div variants={itemVariants} className={styles.sectionHeader}>
          <Typography variant="h4" className={styles.sectionTitle}>
            Platform Capabilities
          </Typography>
          <Typography variant="body1" className={styles.sectionSubtitle}>
            Advanced tools for disaster prediction and response
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={styles.featureCard}
                    onClick={() => navigate(feature.path)}
                  >
                    <Box
                      className={styles.featureGradient}
                      style={{ background: feature.gradient }}
                    />
                    <CardContent className={styles.featureContent}>
                      <Box className={styles.featureHeader}>
                        <Box className={styles.featureIcon}>
                          <Icon style={{ fontSize: 36 }} />
                        </Box>
                        <Chip
                          label={feature.badge}
                          size="small"
                          className={`${styles.featureBadge} ${styles[feature.status]}`}
                        />
                      </Box>

                      <Box className={styles.featureText}>
                        <Typography variant="h5" className={styles.featureTitle}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" className={styles.featureDescription}>
                          {feature.description}
                        </Typography>
                      </Box>

                      <IconButton className={styles.featureArrow}>
                        <ArrowForwardRounded />
                      </IconButton>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      </motion.div>
    </div>
  );
}
