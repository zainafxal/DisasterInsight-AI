import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from './contexts/ThemeContext';
//import { Toaster } from 'react-hot-toast';
import { useTheme } from './hooks/useTheme';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import LiveFeed from './pages/LiveFeed';
import SignalAnalysis from './pages/SignalAnalysis';
import RiskPlanner from './pages/RiskPlanner';
import Forecasts from './pages/Forecasts';
import './styles/globals.css';

function AppContent() {
  const { theme } = useTheme();
  
  const muiTheme = createTheme({
    palette: {
      mode: theme,
      primary: {
        main: '#f97316',
      },
      secondary: {
        main: '#3b82f6',
      },
      background: {
        default: theme === 'dark' ? '#0a0a0a' : '#ffffff',
        paper: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Router>
        {/* <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                color: theme === 'dark' ? '#fafafa' : '#111827',
                border: `1px solid ${theme === 'dark' ? '#27272a' : '#e5e7eb'}`,
              },
            }}
          /> */}

        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/live-feed" element={<LiveFeed />} />
            <Route path="/signal-analysis" element={<SignalAnalysis />} />
            <Route path="/risk-planner" element={<RiskPlanner />} />
            <Route path="/forecasts" element={<Forecasts />} />
          </Routes>
        </MainLayout>
      </Router>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;