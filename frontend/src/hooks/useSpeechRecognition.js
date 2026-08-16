import { useState, useEffect, useRef, useCallback } from 'react';

const useSpeechRecognition = (language = navigator.language || 'en-IN') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript;
        } else {
          interimStr += event.results[i][0].transcript;
        }
      }
      
      if (finalStr) {
        setTranscript(prev => {
          // Add a space if previous transcript doesn't end with one and new doesn't start with one
          const spacing = (prev && !prev.endsWith(' ') && !finalStr.startsWith(' ')) ? ' ' : '';
          return prev + spacing + finalStr;
        });
      }
      setInterimTranscript(interimStr);
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
      
      switch (event.error) {
        case 'not-allowed':
          setError('Microphone access was denied. Please allow microphone permissions in your browser.');
          break;
        case 'no-speech':
          setError('No speech detected. Please try again.');
          break;
        case 'network':
          setError('Network error occurred during speech recognition.');
          break;
        case 'audio-capture':
          setError('No microphone was found. Ensure that a microphone is installed and enabled.');
          break;
        case 'aborted':
          // Often triggered when stop() is called, usually safe to ignore as an "error"
          break;
        default:
          setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // If we manually stopped it or if it timed out.
      // If we want continuous dictation to restart automatically, we could do it here,
      // but for short doubts, stopping on end is safer to prevent endless listening.
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    setIsListening(true);
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      // Handle case where it might already be started
      console.warn("Recognition already started", err);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setError
  };
};

export default useSpeechRecognition;
