import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { AutoAwesomeRounded } from '@mui/icons-material';
import styles from './Loading.module.css';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function Loading({ 
  message = 'Finding Clarity in Crisis...', 
  fullScreen = false,
  size = 'medium' 
}: LoadingProps) {
  const sizes = {
    small: 40,
    medium: 60,
    large: 80
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const iconVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <motion.div
      className={`${styles.container} ${fullScreen ? styles.fullScreen : ''}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <Box className={styles.content}>
        <Box className={styles.spinnerWrapper}>
          <CircularProgress 
            size={sizes[size]} 
            thickness={3}
            className={styles.spinner}
          />
          <motion.div
            className={styles.iconWrapper}
            variants={iconVariants}
            animate="animate"
          >
            <AutoAwesomeRounded 
              className={styles.icon}
              style={{ fontSize: sizes[size] * 0.4 }}
            />
          </motion.div>
        </Box>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Typography variant="h6" className={styles.message}>
            {message}
          </Typography>
        </motion.div>

        <Box className={styles.dots}>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className={styles.dot}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </Box>
      </Box>
    </motion.div>
  );
}