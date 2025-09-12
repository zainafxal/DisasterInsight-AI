import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconButton, 
  Drawer, 
  List, 
  useMediaQuery,
  Tooltip,
  Badge,
  Popover,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Close as CloseIcon,
  DarkModeRounded,
  LightModeRounded,
  DashboardRounded,
  SatelliteAltRounded,
  PsychologyRounded,
  AssessmentRounded,
  TrendingUpRounded,
  NotificationsRounded,
  SettingsRounded,
  MenuRounded, 
} from '@mui/icons-material';
import { useTheme } from '../../hooks/useTheme';
import logoLight from '../../assets/logos/logo-light.svg';
import logoDark from '../../assets/logos/logo-dark.svg';
import logoIconLight from '../../assets/logos/logo-icon.svg';
import logoIconDark from '../../assets/logos/logo-icon-white.svg';
import styles from './Header.module.css';

// Define the interface for the earthquake data to resolve TypeScript errors
interface EarthquakeFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
  };
}

const navItems = [
  { 
    path: '/', 
    label: 'Dashboard', 
    icon: DashboardRounded,
    description: 'Overview & Analytics'
  },
  { 
    path: '/live-feed', 
    label: 'Live Feed', 
    icon: SatelliteAltRounded,
    description: 'Real-time Monitoring'
  },
  { 
    path: '/signal-analysis', 
    label: 'Analysis', 
    icon: PsychologyRounded,
    description: 'AI Detection'
  },
  { 
    path: '/risk-planner', 
    label: 'Risk Planner', 
    icon: AssessmentRounded,
    description: 'Risk Assessment'
  },
  { 
    path: '/forecasts', 
    label: 'Forecasts', 
    icon: TrendingUpRounded,
    description: 'Predictions'
  },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSmallMobile = useMediaQuery('(max-width: 576px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
  // State for Notifications Popover
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const [earthquakeData, setEarthquakeData] = useState<EarthquakeFeature[]>([]);
  const [loadingEarthquakes, setLoadingEarthquakes] = useState(true);

  // State for Settings Menu
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchEarthquakes = async () => {
      setLoadingEarthquakes(true);
      try {
        const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson');
        const data = await response.json();
        const now = Date.now();
        const recentMajorQuakes = data.features.filter(
          (quake: EarthquakeFeature) =>
            (now - quake.properties.time) < 24 * 60 * 60 * 1000 && quake.properties.mag >= 6.0
        ).slice(0, 3);
        setEarthquakeData(recentMajorQuakes);
      } catch (error) {
        console.error('Failed to fetch earthquake data:', error);
      }
      setLoadingEarthquakes(false);
    };

    fetchEarthquakes();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleNotificationsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };
  
  const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };
  
  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };
  
  const openNotifications = Boolean(notificationsAnchorEl);
  const openSettings = Boolean(settingsAnchorEl);

  return (
    <>
      <motion.header 
        className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className={styles.container}>
          <Link to="/" className={styles.logoWrapper}>
            <motion.img 
              src={isTablet ? (theme === 'dark' ? logoIconDark : logoIconLight) : (theme === 'dark' ? logoDark : logoLight)}
              alt="DisasterInsight AI"
              className={isTablet ? styles.logoIcon : styles.logoFull}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
          </Link>

          {!isSmallMobile && (
              <nav className={styles.nav}>
                <AnimatePresence>
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Tooltip 
                          title={item.description} 
                          placement="bottom"
                          arrow
                          enterDelay={500}
                        >
                          <Link
                            to={item.path}
                            className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                            style={{
                              padding: isMobile ? '12px 16px' : undefined
                            }}
                          >
                            <Icon 
                              className={styles.navIcon} 
                              style={{ fontSize: isMobile ? '28px' : '24px' }}
                            />
                            <span className={styles.navLabel}>{item.label}</span>
                            {isActive && (
                              <motion.div
                                className={styles.activeIndicator}
                                layoutId="activeNav"
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              />
                            )}
                          </Link>
                        </Tooltip>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </nav>
            )}


          <div className={styles.actions}>
          <>
            {/* Notifications (always shown) */}
            <Tooltip title="Notifications">
              <IconButton 
                className={styles.actionBtn} 
                onClick={handleNotificationsClick}
                sx={{
                  padding: isSmallMobile ? '4px' : '8px'
                }}
              >
                <Badge 
                  badgeContent={loadingEarthquakes ? 0 : earthquakeData.length} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: isSmallMobile ? '0.5rem' : '0.625rem',
                      height: isSmallMobile ? '14px' : '16px',
                      minWidth: isSmallMobile ? '14px' : '16px',
                    }
                  }}
                >
                  <NotificationsRounded 
                    sx={{ fontSize: isSmallMobile ? '20px' : '24px' }}
                  />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Notifications popover (unchanged) */}
            <Popover
              open={openNotifications}
              anchorEl={notificationsAnchorEl}
              onClose={handleNotificationsClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <div style={{ padding: '16px', maxWidth: '300px' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Active Alerts</h3>
                {loadingEarthquakes ? (
                  <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Loading alerts...</p>
                ) : earthquakeData.length > 0 ? (
                  <List disablePadding>
                    {earthquakeData.map((quake) => (
                      <div key={quake.id} style={{ marginBottom: '8px' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                          M {quake.properties.mag.toFixed(1)} - {quake.properties.place}
                        </p>
                      </div>
                    ))}
                  </List>
                ) : (
                  <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>No major earthquakes in the last 24 hours.</p>
                )}
              </div>
            </Popover>

            {/* Settings */}
            <Tooltip title="Settings">
              <IconButton className={styles.actionBtn} onClick={handleSettingsClick}>
                <SettingsRounded />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={settingsAnchorEl}
              open={openSettings}
              onClose={handleSettingsClose}
            >
              <MenuItem onClick={handleSettingsClose} component="a" href="https://github.com/zainafxal/DisasterInsight-AI" target="_blank">
                GitHub Repository
              </MenuItem>
              <MenuItem onClick={handleSettingsClose} component="a" href="https://github.com/zainafxal/DisasterInsight-AI/tree/main/disaster-insight-api" target="_blank">
                API Documentation
              </MenuItem>
            </Menu>

            <div className={styles.divider} />
          </>

          {/* Theme toggle: only show in header when NOT small mobile */}
          {!isSmallMobile && (
            <Tooltip title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              <IconButton 
                onClick={toggleTheme} 
                className={styles.themeToggle}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& > div': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }
                }}
              >
                <motion.div
                  key={theme}
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%'
                  }}
                >
                  {theme === 'dark' ? <LightModeRounded /> : <DarkModeRounded />}
                </motion.div>
              </IconButton>
            </Tooltip>
          )}

          {/* Drawer toggle (hamburger) — visible on mobile & small mobile */}
          {(isMobile || isSmallMobile) && (
            <IconButton 
              className={styles.menuBtn} 
              onClick={handleDrawerToggle}
              aria-label="Open navigation"
            >
              <MenuRounded sx={{ fontSize: isSmallMobile ? '22px' : '26px' }} />
            </IconButton>
          )}
        </div>

        </div>
      </motion.header>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            width: isSmallMobile ? 240 : 320, // narrower on tiny phones
            borderLeft: '1px solid var(--color-border)',
          }
        }}
      >
        <div className={styles.drawerHeader}>
          {isSmallMobile ? (
            <Tooltip title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              <IconButton 
                onClick={toggleTheme} 
                className={styles.themeToggle}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& > div': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }
                }}
              >
                <motion.div
                  key={theme}
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%'
                  }}
                >
                  {theme === 'dark' ? <LightModeRounded /> : <DarkModeRounded />}
                </motion.div>
              </IconButton>
            </Tooltip>
          ) : (
            <img 
              src={theme === 'dark' ? logoIconDark : logoIconLight}
              alt="DisasterInsight AI"
              className={styles.drawerLogo}
            />
          )}

          <IconButton 
            onClick={handleDrawerToggle}
            className={styles.closeBtn}
          >
            <CloseIcon />
          </IconButton>
        </div>

        <List className={styles.drawerList}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleDrawerToggle}  // 👈 closes drawer after navigation
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                style={{
                  padding: isSmallMobile 
                    ? '12px 14px'   // more padding for touch
                    : isMobile 
                      ? '12px 16px'
                      : undefined
                }}
              >
                <Icon 
                  className={styles.navIcon} 
                  style={{
                    fontSize: isSmallMobile 
                      ? '28px'   // bigger icons
                      : isMobile 
                        ? '24px'
                        : '22px'
                  }}
                />
                <span 
                  className={styles.navLabel}
                  style={{
                    fontSize: isSmallMobile ? '1rem' : '0.9rem', // bigger text
                    fontWeight: isSmallMobile ? 600 : 500
                  }}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    className={styles.activeIndicator}
                    layoutId="activeNav"
                    initial={false}
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 30,
                      mass: 1
                    }}
                  />
                )}
              </Link>
            );
          })}
        </List>
      </Drawer>

    </>
  );
}
