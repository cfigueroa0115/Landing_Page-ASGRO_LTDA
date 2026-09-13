'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useVoiceAssistant — Voz para la Asesora Virtual ASGRO.
 *
 * Reutiliza la arquitectura Web Speech del agente de UrbanThread AI
 * (SpeechRecognition para dictado + speechSynthesis para lectura), ADAPTADA a
 * ASGRO con reglas estrictas:
 * - NO se autoactiva el micrófono: requiere acción explícita del usuario.
 * - NO se autolee ninguna respuesta: la lectura es opt-in por acción explícita.
 * - Feature-detection: si el navegador no soporta la API, `supported` es false
 *   y la UI debe ocultar/desactivar los controles (el chat de texto sigue).
 * - No se envía audio crudo a servicios externos (todo local del navegador).
 *
 * El dictado transcribe al `input` (editable por el usuario antes de enviar);
 * no envía automáticamente.
 */

// Tipos mínimos (evitamos depender de lib DOM de Speech, que puede no estar).
interface RecognitionAlternative {
  transcript: string;
}
interface RecognitionResult {
  isFinal: boolean;
  0: RecognitionAlternative;
}
interface RecognitionResultList {
  length: number;
  [index: number]: RecognitionResult;
}
interface RecognitionEvent {
  resultIndex: number;
  results: RecognitionResultList;
}
type MinimalRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

export interface UseVoiceAssistantOptions {
  /** Idioma para reconocimiento y síntesis. */
  lang?: string;
  /** Callback con la transcripción parcial/final (para volcar al input). */
  onTranscript?: (text: string) => void;
}

export interface UseVoiceAssistantResult {
  /** true si el navegador soporta reconocimiento de voz. */
  supported: boolean;
  /** true si el navegador soporta síntesis de voz (lectura). */
  ttsSupported: boolean;
  /** Escuchando dictado. */
  isListening: boolean;
  /** Reproduciendo una respuesta por voz. */
  isSpeaking: boolean;
  /** Inicia el dictado (acción explícita del usuario). */
  startListening: () => void;
  /** Detiene el dictado. */
  stopListening: () => void;
  /** Lee en voz alta un texto (acción explícita del usuario). */
  speak: (text: string) => void;
  /** Detiene cualquier lectura en curso. */
  stopSpeaking: () => void;
}

export function useVoiceAssistant(
  options: UseVoiceAssistantOptions = {}
): UseVoiceAssistantResult {
  const { lang = 'es-CO', onTranscript } = options;

  const [supported, setSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<MinimalRecognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  // Inicialización (feature-detection). NO arranca el micrófono.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const w = window as unknown as {
      SpeechRecognition?: new () => MinimalRecognition;
      webkitSpeechRecognition?: new () => MinimalRecognition;
      speechSynthesis?: SpeechSynthesis;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;

    setTtsSupported(typeof w.speechSynthesis !== 'undefined');

    if (!Ctor) {
      setSupported(false);
      return;
    }

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let accumulatedFinal = '';

    recognition.onresult = (event: RecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result) continue;
        const transcript = result[0]?.transcript ?? '';
        if (result.isFinal) accumulatedFinal += transcript;
        else interim += transcript;
      }
      const displayText = (accumulatedFinal + interim).trim();
      if (displayText) onTranscriptRef.current?.(displayText);
    };

    recognition.onerror = () => {
      setIsListening(false);
      accumulatedFinal = '';
    };

    recognition.onend = () => {
      setIsListening(false);
      accumulatedFinal = '';
    };

    recognitionRef.current = recognition;
    setSupported(true);

    return () => {
      try {
        recognition.stop();
      } catch {
        /* noop */
      }
      recognitionRef.current = null;
    };
  }, [lang]);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    // Cortar cualquier lectura antes de escuchar.
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      /* start() lanza si ya está activo: ignorar */
    }
  }, []);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.stop();
    } catch {
      /* noop */
    }
    setIsListening(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.98;
      utterance.pitch = 1.1;
      utterance.volume = 1;

      // Preferir una voz femenina en español si está disponible.
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => v.lang === lang && /female|mujer/i.test(v.name)) ||
        voices.find((v) => v.lang === lang) ||
        voices.find((v) => v.lang.startsWith('es') && /female|mujer/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('es') && !/male|hombre/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('es'));
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [lang]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    supported,
    ttsSupported,
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
