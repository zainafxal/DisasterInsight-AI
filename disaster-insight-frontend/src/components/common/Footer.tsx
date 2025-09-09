import { useEffect, useState } from 'react';
import { Box, Container, Typography, Link, IconButton, Divider, Chip } from '@mui/material';
import {
  GitHub,
  LinkedIn,
  Instagram,
  Email,
  FiberManualRecordRounded,
  RocketLaunchRounded,
  AutoAwesomeRounded
} from '@mui/icons-material';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';
import styles from './Footer.module.css';
import { api } from '../../api/client';

// Define the interface for the footer link objects
interface FooterLink {
  label: string;
  href: string;
  badge?: string; // The badge property is optional
}

export default function Footer() {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

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

  const quickLinks: FooterLink[] = [
    { label: 'API Docs', href: '#' },
    { label: 'Documentation', href: '#' },
    { label: 'About', href: '#' },
    { label: 'Contact', href: '#' },
  ];

  const onlineStatusColor = apiOnline === false ? '#EF4444' : '#10B981';
  const onlineStatusLabel = apiOnline === null ? 'Checking...' : apiOnline === false ? 'API Offline' : 'System Online';

  return (
    <footer className={styles.footer}>
      <Container maxWidth="lg">
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}
        >
          <motion.div
            className={styles.content}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Box className={styles.brandSection}>
              <Box className={styles.brand}>
                <img
                  src={`/src/assets/logos/logo-icon${theme === 'dark' ? '-white' : ''}.svg`}
                  alt="DisasterInsight AI"
                  className={styles.logo}
                />
                <Box>
                  <Typography variant="h6" className={styles.brandName}>
                    DisasterInsight AI
                  </Typography>
                  <Typography variant="body2" className={styles.tagline}>
                    Clarity in Crisis.
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" className={styles.description}>
                Transforming global data streams into actionable intelligence
                for disaster response and crisis management.
              </Typography>

              <Box className={styles.badges}>
                <Chip
                  icon={<FiberManualRecordRounded />}
                  label={onlineStatusLabel}
                  size="small"
                  className={styles.statusBadge}
                  sx={{
                    backgroundColor: `rgba(${onlineStatusColor.slice(1).match(/.{2}/g)!.map(x => parseInt(x, 16)).join(',')}, 0.1) !important`,
                    color: `${onlineStatusColor} !important`,
                    border: `1px solid rgba(${onlineStatusColor.slice(1).match(/.{2}/g)!.map(x => parseInt(x, 16)).join(',')}, 0.2) !important`,
                    '& .MuiChip-icon': {
                      color: `${onlineStatusColor} !important`,
                    },
                  }}
                />
                <Chip
                  icon={<RocketLaunchRounded />}
                  label="v1.0"
                  size="small"
                  variant="outlined"
                  className={styles.versionBadge}
                  sx={{
                    color: '#F97316 !important',
                    borderColor: '#F97316 !important',
                    '& .MuiChip-icon': {
                      color: '#F97136 !important',
                    },
                  }}
                />
                <Chip
                  icon={<AutoAwesomeRounded />}
                  label="AI Powered"
                  size="small"
                  variant="outlined"
                  className={styles.aiBadge}
                  sx={{
                    color: '#8B5CF6 !important',
                    borderColor: '#8B5CF6 !important',
                    '& .MuiChip-icon': {
                      color: '#8B5CF6 !important',
                    },
                  }}
                />
              </Box>

              <Box className={styles.social}>
              <a
                href="https://github.com/zainafxal"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconButton className={styles.socialIcon}>
                  <GitHub />
                </IconButton>
              </a>

              <a
                href="https://www.linkedin.com/in/zainafxal/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconButton className={styles.socialIcon}>
                  <LinkedIn />
                </IconButton>
              </a>

              <a
                href="https://instagram.com/zainafxal"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconButton className={styles.socialIcon}>
                  <Instagram />
                </IconButton>
              </a>

              <a
                href="mailto:connect.zainafzal@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconButton className={styles.socialIcon}>
                  <Email />
                </IconButton>
              </a>
            </Box>

            </Box>
          </motion.div>
          {/* Quick links section with correct alignment and styling */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 'bold', fontSize: '1.1rem', mb: 1 }}
            >
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  underline="none"
                  sx={{
                    position: 'relative',
                    fontSize: '1rem',
                    mb: 0.5,
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '100%',
                      height: '2px',
                      bottom: '-2px',
                      left: '0',
                      backgroundColor: '#F97316',
                      transform: 'scaleX(0)',
                      transformOrigin: 'left',
                      transition: 'transform 0.3s ease-in-out',
                    },
                    '&:hover::after': {
                      transform: 'scaleX(1)',
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Box>
        </Box>

        <Divider className={styles.divider} />

        <Box className={styles.bottom}>
          <Typography variant="body2" className={styles.copyright}>
            © {currentYear} DisasterInsight AI. All rights reserved.
          </Typography>
          <Box className={styles.bottomLinks}>
            <Link href="#" className={styles.bottomLink}>Privacy Policy</Link>
            <span className={styles.separator}>•</span>
            <Link href="#" className={styles.bottomLink}>Terms of Service</Link>
            <span className={styles.separator}>•</span>
            <Link href="#" className={styles.bottomLink}>Cookie Settings</Link>
          </Box>
        </Box>
      </Container>
    </footer>
  );
}
