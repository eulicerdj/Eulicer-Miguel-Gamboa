// services/ttsService.ts

let voices: SpeechSynthesisVoice[] = [];
// A promise that resolves when voices are loaded.
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
  // If voices are already loaded, return them.
  if (voices.length > 0) {
    return Promise.resolve(voices);
  }
  // If a request for voices is already in progress, return its promise.
  if (voicesPromise) {
    return voicesPromise;
  }
  // Otherwise, start loading voices.
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    voicesPromise = new Promise((resolve) => {
      // getVoices() can be async, so check if they are already there.
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length) {
        voices = allVoices;
        return resolve(voices);
      }
      // If not, wait for the onvoiceschanged event.
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      };
    });
    return voicesPromise;
  }
  // If speech synthesis is not supported, return an empty array.
  return Promise.resolve([]);
};

// Start loading voices as soon as the service is imported.
getVoices();


export const speak = async (
  text: string, 
  lang: 'es-ES' | 'en-US', 
  onStateChange?: (isSpeaking: boolean) => void
): Promise<void> => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Speech Synthesis not supported.');
    return;
  }
  
  // Ensure any ongoing speech is stopped before starting a new one.
  cancel();

  const availableVoices = await getVoices();
  if (availableVoices.length === 0) {
      console.warn('No voices available for speech synthesis.');
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  
  // Find a suitable "sweet" female voice.
  const langPrefix = lang.split('-')[0];
  const selectedVoice = availableVoices.find(voice => voice.lang === lang && /female|mujer/i.test(voice.name)) || 
                      availableVoices.find(voice => voice.lang.startsWith(langPrefix) && /female|mujer/i.test(voice.name)) ||
                      availableVoices.find(voice => voice.lang === lang && voice.default) ||
                      availableVoices.find(voice => voice.lang.startsWith(langPrefix) && voice.default) ||
                      availableVoices.find(voice => voice.lang === lang) ||
                      availableVoices.find(voice => voice.lang.startsWith(langPrefix)) ||
                      availableVoices.find(voice => voice.default);


  if (selectedVoice) {
    utterance.voice = selectedVoice;
  } else {
    console.warn(`No specific voice found for lang=${lang}. Using browser default.`);
  }

  // Adjust for a "sweeter" tone
  utterance.pitch = 1.1; 
  utterance.rate = 0.95; 

  utterance.onstart = () => {
    onStateChange?.(true);
  };

  utterance.onend = () => {
    onStateChange?.(false);
  };

  utterance.onerror = (event) => {
    console.error('SpeechSynthesisUtterance.onerror', event);
    onStateChange?.(false);
  };
  
  window.speechSynthesis.speak(utterance);
};

export const cancel = (): void => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
