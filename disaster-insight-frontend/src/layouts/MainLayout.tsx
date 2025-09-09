import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box className={styles.layout}>
      <Header />
      <main className={styles.main}>
        {children}
      </main>
      <Footer />
    </Box>
  );
}