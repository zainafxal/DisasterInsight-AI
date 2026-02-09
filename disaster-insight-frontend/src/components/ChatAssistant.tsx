import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconButton, Tooltip } from '@mui/material';
import { 
  SendRounded, 
  CloseRounded, 
  ChatBubbleRounded,
  ExpandMoreRounded,
  ExpandLessRounded,
  AutoAwesomeRounded,
  HubRounded,
  QueryStatsRounded,
  HealthAndSafetyRounded,
  TravelExploreRounded,
  AddPhotoAlternateRounded,
  ImageRounded,
  CameraAltRounded
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { apiClient, api } from '../api/client'; 
import styles from './ChatAssistant.module.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  imageUrl?: string;
}

const SAMPLE_QUERIES = [
  { icon: '🌊', text: "What is the flood risk in Pakistan?" },
  { icon: '🎒', text: "What should I pack in an emergency kit?" },
  { icon: '📡', text: "Analyze: 'Roof collapsed, we are trapped'" },
  { icon: '🌍', text: "Is earthquake activity increasing?" },
];

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showText, setShowText] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "👋 Hello! I'm your **Disaster Insight AI**.\n\nI can analyze **Text** queries and now **Images**! 📸\n\nUpload a photo of a disaster scene, and I will use Computer Vision to assess the damage and provide safety protocols.", 
      sender: 'bot' 
    }
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) return;
    const interval = setInterval(() => {
      setShowText(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string, imageContext?: string) => {
    const messageText = text || input;
    if (!messageText.trim() && !imageContext) return;

    if (!imageContext) {
      const userMsg: Message = { id: Date.now(), text: messageText, sender: 'user' };
      setMessages(prev => [...prev, userMsg]);
    }
    
    setInput('');
    setLoading(true);

    try {
      const payload = imageContext || messageText;
      const response = await apiClient.post('/chat/ask', { message: payload });
      
      const botMsg: Message = { 
        id: Date.now() + 1, 
        text: response.data.response, 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = { 
        id: Date.now() + 1, 
        text: "⚠️ I'm having trouble reaching the server. Please try again in a moment.", 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const localImageUrl = URL.createObjectURL(file);

      const imgMsg: Message = { 
        id: Date.now(), 
        text: "I have uploaded an image for analysis.", 
        imageUrl: localImageUrl,
        sender: 'user' 
      };
      setMessages(prev => [...prev, imgMsg]);
      setLoading(true);

      try {
        const cvResult = await api.analyzeDamageImage(file);
        const agentPrompt = `
          [SYSTEM ALERT - VISUAL DATA INJECTED]
          The user has uploaded an image. 
          Our Computer Vision model analyzed it and found:
          - Event: ${cvResult.detected_event}
          - Confidence: ${(cvResult.confidence * 100).toFixed(1)}%
          - Triage Priority: ${cvResult.triage_priority}
          
          USER QUERY: "Please analyze this image, confirm the damage, and tell me the immediate safety protocols from the RAG database for this specific situation."
        `;
        await handleSend(undefined, agentPrompt);
      } catch (error) {
        const errorMsg: Message = { 
          id: Date.now() + 1, 
          text: "❌ Failed to process image. The Computer Vision service might be offline.", 
          sender: 'bot' 
        };
        setMessages(prev => [...prev, errorMsg]);
        setLoading(false);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // NEW: variants + derived state for smoother floating button animation
  const buttonVariants = {
    icon: {
      width: 64,
      paddingLeft: 0,
      paddingRight: 0,
    },
    text: {
      width: 150, // adjust as desired
      paddingLeft: 20,
      paddingRight: 20,
    },
    open: {
      width: 64,
      paddingLeft: 0,
      paddingRight: 0,
    },
  };

  const floatingState: 'icon' | 'text' | 'open' =
    isOpen ? 'open' : showText ? 'text' : 'icon';

  return (
    <div className={styles.chatWidget}>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={styles.window}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerMain}>
                <div className={styles.headerLeft}>
                  <div className={styles.avatarContainer}>
                    <div className={styles.avatarInner}>
                      <AutoAwesomeRounded className={styles.avatarIcon} />
                    </div>
                    <div className={styles.avatarGlow} />
                    <div className={styles.statusDot} />
                  </div>
                  <div className={styles.headerText}>
                    <span className={styles.headerTitle}>Disaster Insight AI</span>
                    <div className={styles.poweredByBadge}>
                      <span className={styles.poweredByText}>Multimodal Agent</span>
                      <span className={styles.sparkle}>✨</span>
                    </div>
                  </div>
                </div>
                <div className={styles.headerActions}>
                  <Tooltip title="About this AI" arrow>
                    <IconButton 
                      size="small" 
                      onClick={() => setShowInfo(!showInfo)} 
                      className={styles.headerBtn}
                    >
                      {showInfo ? <ExpandLessRounded /> : <ExpandMoreRounded />}
                    </IconButton>
                  </Tooltip>
                  <IconButton 
                    size="small" 
                    onClick={() => setIsOpen(false)} 
                    className={styles.headerBtn}
                  >
                    <CloseRounded />
                  </IconButton>
                </div>
              </div>

              <AnimatePresence>
                {showInfo && (
                  <motion.div 
                    className={styles.infoPanel}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={styles.infoPanelContent}>
                      <div className={styles.descriptionCard}>
                        <div className={styles.descriptionIcon}>
                          <HubRounded />
                        </div>
                        <p className={styles.infoDescription}>
                          An intelligent orchestration system that <strong>sees</strong> images, <strong>reasons</strong> with text, and <strong>retrieves</strong> verified protocols.
                        </p>
                      </div>

                      <div className={styles.capabilitiesSection}>
                        <h4 className={styles.sectionTitle}>
                          <span className={styles.sectionTitleIcon}>⚡</span>
                          Core Capabilities
                        </h4>
                        <div className={styles.capabilitiesGrid}>
                          <div className={styles.capabilityCard}>
                            <div className={styles.capabilityIconWrapper} style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
                              <HubRounded />
                            </div>
                            <span>AI Orchestration</span>
                          </div>
                          <div className={styles.capabilityCard}>
                            <div className={styles.capabilityIconWrapper} style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}>
                              <CameraAltRounded />
                            </div>
                            <span>Visual Triage</span>
                          </div>
                          <div className={styles.capabilityCard}>
                            <div className={styles.capabilityIconWrapper} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                              <HealthAndSafetyRounded />
                            </div>
                            <span>Safety Protocols</span>
                          </div>
                          <div className={styles.capabilityCard}>
                            <div className={styles.capabilityIconWrapper} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                              <TravelExploreRounded />
                            </div>
                            <span>Global Insights</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.modelsSection}>
                        <h4 className={styles.sectionTitle}>
                          <span className={styles.sectionTitleIcon}>🧠</span>
                          AI Models
                        </h4>
                        <div className={styles.modelTagsContainer}>
                          <div className={styles.modelTag} data-model="gemini">
                            <span className={styles.modelDot}></span>
                            Gemini 2.0
                          </div>
                          <div className={styles.modelTag} data-model="mobilenet">
                            <span className={styles.modelDot} style={{ background: '#ec4899' }}></span>
                            MobileNetV2
                          </div>
                          <div className={styles.modelTag} data-model="xgboost">
                            <span className={styles.modelDot}></span>
                            XGBoost
                          </div>
                          <div className={styles.modelTag} data-model="distilbert">
                            <span className={styles.modelDot}></span>
                            DistilBERT
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Messages */}
            <div className={styles.messages} ref={scrollRef}>
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id} 
                  className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {msg.sender === 'bot' && (
                    <div className={styles.botAvatar}>
                      <AutoAwesomeRounded fontSize="small" />
                    </div>
                  )}
                  <div className={styles.messageContent}>
                    {msg.imageUrl && (
                      <div className={styles.messageImageWrapper}>
                        <img src={msg.imageUrl} alt="Uploaded analysis" className={styles.messageImage} />
                        <div className={styles.imageBadge}>
                          <ImageRounded style={{ fontSize: 12 }} /> Analyzing...
                        </div>
                      </div>
                    )}
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div className={`${styles.message} ${styles.botMessage}`} initial={{ opacity: 0 }}>
                  <div className={styles.botAvatar}>
                    <AutoAwesomeRounded fontSize="small" />
                  </div>
                  <div className={styles.typingIndicator}>
                    <div className={styles.typingDot} />
                    <div className={styles.typingDot} />
                    <div className={styles.typingDot} />
                    <span className={styles.typingText}>Processing Data...</span>
                  </div>
                </motion.div>
              )}

              {messages.length === 1 && !loading && (
                <div className={styles.suggestions}>
                  <p className={styles.suggestionsTitle}>Try asking:</p>
                  <div className={styles.suggestionsList}>
                    {SAMPLE_QUERIES.map((query, index) => (
                      <button 
                        key={index}
                        className={styles.suggestionChip}
                        onClick={() => handleSend(query.text)}
                      >
                        <span>{query.icon}</span>
                        <span>{query.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className={styles.inputArea}>
              <div className={styles.inputWrapper}>
                <input 
                  type="file" 
                  hidden 
                  ref={fileInputRef} 
                  accept="image/*" 
                  onChange={handleImageSelect} 
                />
                
                <Tooltip title="Analyze Image">
                  <IconButton 
                    size="small" 
                    className={styles.attachBtn}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                  >
                    <AddPhotoAlternateRounded fontSize="small" />
                  </IconButton>
                </Tooltip>

                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Type or upload an image..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
                <button 
                  className={`${styles.sendBtn} ${input.trim() ? styles.sendBtnActive : ''}`}
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                >
                  <SendRounded fontSize="small" />
                </button>
              </div>
              <p className={styles.disclaimer}>
                AI-powered analysis • Not a substitute for official emergency services
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button 
        className={styles.chatButton}
        onClick={() => setIsOpen(!isOpen)}
        variants={buttonVariants}
        animate={floatingState}
        transition={{
          type: 'spring',
          stiffness: 230,
          damping: 18,
          mass: 0.6,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        layout
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              className={styles.chatButtonIconWrapper}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
            >
              <CloseRounded />
            </motion.span>
          ) : showText ? (
            <motion.div
              key="text"
              className={styles.chatButtonTextWrapper}
              layout
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22 }}
            >
              <AutoAwesomeRounded className={styles.chatButtonTextIcon} />
              <span className={styles.chatButtonText}>AI Chat</span>
            </motion.div>
          ) : (
            <motion.span
              key="icon"
              className={styles.chatButtonIconWrapper}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
            >
              <ChatBubbleRounded />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}