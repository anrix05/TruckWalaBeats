/*
 * Truck pe Music — Complete Highway Audio Experience
 * Includes:
 * - 4K Master Visuals & Realistic Indian Heritage Tree
 * - Atmospheric Moods (Golden Sunset, Midnight Highway, Monsoon Drive)
 * - Authentic Dual-Tone Indian Truck Horn (Horn OK Please)
 * - Lo-Fi Cassette / Dhaba Tape Saturation Filter
 * - Interactive Vinyl Scratch / Turntable Scrubbing
 * - Highway Keyboard Shortcuts & Fullscreen Display Mode
 * - 24-Bar Dynamic Live Audio Visualizer Spectrum
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import {
  CassetteTape,
  CloudRain,
  ExternalLink,
  HelpCircle,
  ListMusic,
  Maximize2,
  Minimize2,
  Moon,
  Pause,
  Play,
  Radio,
  Shuffle,
  SkipBack,
  SkipForward,
  Sun,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

type Track = {
  title: string;
  artist: string;
  caption: string;
  durationSeconds: number;
  albumArt: string;
  videoId?: string;
};

type YoutubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  loadPlaylist: (options: { listType: "playlist"; list: string; index: number }) => void;
  previousVideo: () => void;
  nextVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  getPlaylist: () => string[];
  getPlaylistIndex: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoData: () => { video_id?: string; title?: string; author?: string };
  getPlayerState: () => number;
};

declare global {
  interface Window {
    YT?: { Player: new (elementId: string, options: Record<string, unknown>) => YoutubePlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const posterBackground = "/poster-bg.png";
const coverArt = ["/cover-01.png", "/cover-02.png", "/cover-03.png"];

export type PlaylistConfig = {
  id: string;
  name: string;
  subtitle: string;
  url: string;
  fallbackTracks: Track[];
};

export const PLAYLISTS: PlaylistConfig[] = [
  {
    id: "PLeatb7hupNV_AWUl_7ttbsKeCQh8tF5N4",
    name: "Truck Driver Classic",
    subtitle: "Bus Driver ki Playlist • 90s Highway Dhaba Hits",
    url: "https://music.youtube.com/playlist?list=PLeatb7hupNV_AWUl_7ttbsKeCQh8tF5N4",
    fallbackTracks: [
      { title: "Mujhse Mohabbat Ka Izhaar", artist: "Nadeem Shravan", caption: "मुझसे मोहब्बत का इज़हार", durationSeconds: 304, albumArt: coverArt[0], videoId: "5pGZ8u8ZlP0" },
      { title: "Tumsa Koi Pyaara", artist: "Kumar Sanu", caption: "तुमसा कोई प्यारा", durationSeconds: 376, albumArt: coverArt[1], videoId: "sE_QeUfJp-E" },
      { title: "Waada Raha Sanam", artist: "Abhijeet · Alka Yagnik", caption: "वादा रहा सनम", durationSeconds: 365, albumArt: coverArt[2], videoId: "iH7sZg3Y46M" },
      { title: "Chhupana Bhi Nahin Aata", artist: "Vinod Rathod · Venus", caption: "छुपाना भी नहीं आता", durationSeconds: 253, albumArt: coverArt[0], videoId: "83r9kPjL1vA" },
      { title: "Jhanjharia (Male)", artist: "Abhijeet Bhattacharya", caption: "झांझरिया", durationSeconds: 309, albumArt: coverArt[1], videoId: "b71jG5r-2v4" },
      { title: "Husn Hai Suhana", artist: "Chandana Dixit · Abhijeet", caption: "हुस्न है सुहाना", durationSeconds: 348, albumArt: coverArt[2], videoId: "03qgE8e1Moc" },
      { title: "Jeeye To Jeeye Kaise", artist: "Pankaj Udhas", caption: "जीए तो जीए कैसे", durationSeconds: 217, albumArt: coverArt[0], videoId: "J6mKqHqV_U8" },
    ],
  },
  {
    id: "RDCLAK5uy_kiDNaS5nAXxdzsqFElFKKKs0GUEFJE26w",
    name: "Highway Retro Hits",
    subtitle: "Golden Era Highway Beats & Retro Nostalgia",
    url: "https://music.youtube.com/playlist?list=RDCLAK5uy_kiDNaS5nAXxdzsqFElFKKKs0GUEFJE26w",
    fallbackTracks: [
      { title: "Pehla Nasha", artist: "Udit Narayan · Sadhana Sargam", caption: "पहला नशा", durationSeconds: 290, albumArt: coverArt[1], videoId: "a2Z0v0N-K4s" },
      { title: "Ek Ladki Ko Dekha", artist: "Kumar Sanu", caption: "एक लड़की को देखा", durationSeconds: 275, albumArt: coverArt[2], videoId: "V_J_pP3c7sY" },
      { title: "Tujhe Dekha To", artist: "Kumar Sanu · Lata Mangeshkar", caption: "तुझे देखा तो", durationSeconds: 302, albumArt: coverArt[0], videoId: "cNV5hLSa9nG" },
      { title: "Chura Ke Dil Mera", artist: "Kumar Sanu · Alka Yagnik", caption: "चुरा के दिल मेरा", durationSeconds: 285, albumArt: coverArt[1], videoId: "a1a8p7N1d7U" },
      { title: "Aankhey Khuli", artist: "Lata Mangeshkar · Udit Narayan", caption: "आँखें खुलीं", durationSeconds: 330, albumArt: coverArt[2], videoId: "2v-sP_W4S4w" },
    ],
  },
];

function getFreshTrackIndex(trackCount: number) {
  if (trackCount < 2) return 0;
  let previous = -1;
  try {
    previous = Number.parseInt(window.localStorage.getItem("truck-pe-last-track") ?? "", 10);
  } catch {
    previous = -1;
  }
  let next = Math.floor(Math.random() * trackCount);
  if (next === previous) next = (next + 1) % trackCount;
  try {
    window.localStorage.setItem("truck-pe-last-track", String(next));
  } catch {
    // ignore
  }
  return next;
}

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

function toTrack(index: number, videoId?: string): Track {
  const baseTracks = PLAYLISTS[0].fallbackTracks;
  const base = baseTracks[index % baseTracks.length];
  return {
    ...base,
    videoId,
    albumArt: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : base.albumArt,
  };
}

export type AtmosphereMode = "sunset" | "midnight" | "monsoon";

export default function Home() {
  const playerRef = useRef<YoutubePlayer | null>(null);
  const pendingPlayRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const cassetteNoiseRef = useRef<AudioNode | null>(null);

  const [activePlaylistIndex, setActivePlaylistIndex] = useState(() => {
    try {
      const saved = Number.parseInt(window.localStorage.getItem("truck-pe-active-playlist") ?? "0", 10);
      return Number.isNaN(saved) || saved < 0 || saved >= PLAYLISTS.length ? 0 : saved;
    } catch {
      return 0;
    }
  });

  const activePlaylist = PLAYLISTS[activePlaylistIndex];
  const [tracks, setTracks] = useState<Track[]>(activePlaylist.fallbackTracks);
  const [activeIndex, setActiveIndex] = useState(() => getFreshTrackIndex(activePlaylist.fallbackTracks.length));
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [isShuffle, setIsShuffle] = useState(true);
  const [volume, setVolume] = useState(72);
  const [trackPulse, setTrackPulse] = useState(false);
  const [listeners, setListeners] = useState(672);
  const [clock, setClock] = useState(() => new Date());
  const [apiReady, setApiReady] = useState(Boolean(window.YT?.Player));
  const [playerReady, setPlayerReady] = useState(false);
  const [atmosphere, setAtmosphere] = useState<AtmosphereMode>("sunset");
  const [isCassetteMode, setIsCassetteMode] = useState(false);
  const [isHornHonking, setIsHornHonking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Turntable scratch drag state
  const isDraggingDisc = useRef(false);
  const startDragAngle = useRef(0);
  const startDragProgress = useRef(0);

  const activeTrack = tracks[activeIndex] ?? activePlaylist.fallbackTracks[0];
  const progressRatio = Math.min(progress / Math.max(activeTrack.durationSeconds, 1), 1);
  const clockLabel = useMemo(
    () => clock.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }).toLowerCase(),
    [clock],
  );

  const hornAudioRef = useRef<HTMLAudioElement | null>(null);

  // Play Authentic Musical North-Indian Truck Horn 4.mp3
  const playTruckHorn = () => {
    try {
      setIsHornHonking(true);
      window.setTimeout(() => setIsHornHonking(false), 2400);

      if (!hornAudioRef.current) {
        hornAudioRef.current = new Audio("/truck-horn.mp3");
      }
      const audio = hornAudioRef.current;
      audio.currentTime = 0;
      audio.volume = Math.min(1, Math.max(0.2, volume / 100));
      audio.play().catch((err) => {
        console.warn("Horn audio play blocked", err);
      });
    } catch (err) {
      console.error("Horn audio error", err);
    }
  };

  // Toggle Cassette Tape Warmth Generator
  const toggleCassetteMode = () => {
    const next = !isCassetteMode;
    setIsCassetteMode(next);
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") ctx.resume();

      if (!next) {
        if (cassetteNoiseRef.current) {
          (cassetteNoiseRef.current as any).stop?.();
          cassetteNoiseRef.current = null;
        }
        return;
      }

      // Generate subtle analog tape hiss buffer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(0.7, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.018, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start(0);
      cassetteNoiseRef.current = whiteNoise;
    } catch (e) {
      console.error("Tape synth error", e);
    }
  };

  const [isLightningFlashing, setIsLightningFlashing] = useState(false);

  // Synthesize Distant Thunder Rumble (Web Audio Sub-Bass Low-Pass Filter)
  const playDistantThunder = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 2.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(160, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 2.2);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 2.5);
    } catch (e) {
      console.error("Thunder synth error", e);
    }
  };

  // Thunderstorm Lightning & Thunder Loop during Monsoon Mode
  useEffect(() => {
    if (atmosphere !== "monsoon") {
      setIsLightningFlashing(false);
      return;
    }

    let timeoutId: number;
    const scheduleNextLightning = () => {
      const delay = Math.floor(Math.random() * 10000) + 8000;
      timeoutId = window.setTimeout(() => {
        setIsLightningFlashing(true);
        window.setTimeout(() => {
          playDistantThunder();
        }, 320);

        window.setTimeout(() => {
          setIsLightningFlashing(false);
          scheduleNextLightning();
        }, 520);
      }, delay);
    };

    scheduleNextLightning();
    return () => window.clearTimeout(timeoutId);
  }, [atmosphere]);

  const [isShootingStarActive, setIsShootingStarActive] = useState(false);
  const [isOncomingHeadlightActive, setIsOncomingHeadlightActive] = useState(false);
  const cricketAudioRef = useRef<{ source: AudioBufferSourceNode; gain: GainNode } | null>(null);

  // Synthesize Shooting Star Cosmic Shimmer Chime
  const playShootingStarSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.55);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.62);
    } catch (e) {
      console.error("Star audio error", e);
    }
  };

  // Synthesize Oncoming Truck Pass Engine Swoosh
  const playTruckPassSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.03 * white) / 1.03;
        lastOut = data[i];
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(120, now);
      filter.frequency.linearRampToValueAtTime(320, now + 0.9);
      filter.frequency.exponentialRampToValueAtTime(80, now + 2.0);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.055, now + 0.9);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.1);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 2.2);
    } catch (e) {
      console.error("Truck pass audio error", e);
    }
  };

  // Manage Night Highway Crickets & Breeze Audio in Midnight Mode
  useEffect(() => {
    if (atmosphere !== "midnight") {
      if (cricketAudioRef.current) {
        try {
          cricketAudioRef.current.source.stop();
        } catch {}
        cricketAudioRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") ctx.resume();

      if (cricketAudioRef.current) return;

      const bufferSize = ctx.sampleRate * 3;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const cricketChirp = (Math.sin(2 * Math.PI * 4600 * t) > 0.85 ? 1 : 0) * (Math.sin(2 * Math.PI * 8 * t) > 0.7 ? 1 : 0);
        const breezeNoise = (Math.random() * 2 - 1) * 0.015;
        data[i] = cricketChirp * 0.008 + breezeNoise;
      }

      const cricketSource = ctx.createBufferSource();
      cricketSource.buffer = noiseBuffer;
      cricketSource.loop = true;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.035, ctx.currentTime);

      cricketSource.connect(gain);
      gain.connect(ctx.destination);

      cricketSource.start(0);
      cricketAudioRef.current = { source: cricketSource, gain };
    } catch (e) {
      console.error("Cricket audio error", e);
    }
  }, [atmosphere]);

  // Midnight Shooting Star & Dipper Truck Loops
  useEffect(() => {
    if (atmosphere !== "midnight") {
      setIsShootingStarActive(false);
      setIsOncomingHeadlightActive(false);
      return;
    }

    let starTimeout: number;
    let truckTimeout: number;

    // Trigger initial effects quickly after switching to Midnight
    const initialStarTimer = window.setTimeout(() => {
      setIsShootingStarActive(true);
      playShootingStarSound();
      window.setTimeout(() => setIsShootingStarActive(false), 1200);
    }, 1500);

    const initialTruckTimer = window.setTimeout(() => {
      setIsOncomingHeadlightActive(true);
      playTruckPassSound();
      window.setTimeout(() => setIsOncomingHeadlightActive(false), 2400);
    }, 3000);

    const scheduleShootingStar = () => {
      const delay = Math.floor(Math.random() * 5000) + 6000;
      starTimeout = window.setTimeout(() => {
        setIsShootingStarActive(true);
        playShootingStarSound();
        window.setTimeout(() => {
          setIsShootingStarActive(false);
          scheduleShootingStar();
        }, 1200);
      }, delay);
    };

    const scheduleTruckDipper = () => {
      const delay = Math.floor(Math.random() * 6000) + 7000;
      truckTimeout = window.setTimeout(() => {
        setIsOncomingHeadlightActive(true);
        playTruckPassSound();
        window.setTimeout(() => {
          setIsOncomingHeadlightActive(false);
          scheduleTruckDipper();
        }, 2400);
      }, delay);
    };

    scheduleShootingStar();
    scheduleTruckDipper();

    return () => {
      window.clearTimeout(initialStarTimer);
      window.clearTimeout(initialTruckTimer);
      window.clearTimeout(starTimeout);
      window.clearTimeout(truckTimeout);
    };
  }, [atmosphere]);

  const rainAudioRef = useRef<{ source: AudioBufferSourceNode; gain: GainNode } | null>(null);

  // Manage Ambient Rain Audio for Monsoon Mode
  useEffect(() => {
    if (atmosphere !== "monsoon") {
      if (rainAudioRef.current) {
        try {
          rainAudioRef.current.source.stop();
        } catch {}
        rainAudioRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") ctx.resume();

      if (rainAudioRef.current) return;

      const bufferSize = ctx.sampleRate * 2.5;
      const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      const left = noiseBuffer.getChannelData(0);
      const right = noiseBuffer.getChannelData(1);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const whiteL = Math.random() * 2 - 1;
        const whiteR = Math.random() * 2 - 1;

        b0 = 0.99886 * b0 + whiteL * 0.0555179;
        b1 = 0.99332 * b1 + whiteL * 0.0750759;
        b2 = 0.96900 * b2 + whiteL * 0.1538520;
        left[i] = (b0 + b1 + b2 + whiteL * 0.08) * 0.055;

        b3 = 0.99886 * b3 + whiteR * 0.0555179;
        b4 = 0.99332 * b4 + whiteR * 0.0750759;
        b5 = 0.96900 * b5 + whiteR * 0.1538520;
        right[i] = (b3 + b4 + b5 + whiteR * 0.08) * 0.055;
      }

      const rainSource = ctx.createBufferSource();
      rainSource.buffer = noiseBuffer;
      rainSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(750, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.045, ctx.currentTime);

      rainSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      rainSource.start(0);
      rainAudioRef.current = { source: rainSource, gain };
    } catch (e) {
      console.error("Rain audio error", e);
    }
  }, [atmosphere]);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Cycle Atmosphere Themes
  const cycleAtmosphere = () => {
    setAtmosphere((curr) => (curr === "sunset" ? "midnight" : curr === "midnight" ? "monsoon" : "sunset"));
  };

  // YouTube API initialization
  useEffect(() => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    const previousCallback = window.onYouTubeIframeAPIReady;
    const markReady = () => {
      previousCallback?.();
      setApiReady(true);
    };
    if (window.YT?.Player) {
      setApiReady(true);
    } else {
      window.onYouTubeIframeAPIReady = markReady;
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
    }
    return () => {
      if (window.onYouTubeIframeAPIReady === markReady) window.onYouTubeIframeAPIReady = previousCallback;
    };
  }, []);

  useEffect(() => {
    if (!apiReady || playerRef.current || !window.YT?.Player) return;
    const player = new window.YT.Player("youtube-player", {
      width: "1",
      height: "1",
      videoId: "",
      playerVars: {
        enablejsapi: 1,
        listType: "playlist",
        list: activePlaylist.id,
        controls: 0,
        disablekb: 1,
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: ({ target }: { target: YoutubePlayer }) => {
          playerRef.current = target;
          setPlayerReady(true);
          target.setVolume(volume);
          target.loadPlaylist({ listType: "playlist", list: activePlaylist.id, index: activeIndex });
          window.setTimeout(() => {
            if (pendingPlayRef.current) {
              target.playVideo();
              pendingPlayRef.current = false;
            }
          }, 350);
        },
        onStateChange: ({ data }: { data: number }) => {
          if (data === 1) {
            setIsPlaying(true);
          } else if (data === 2 || data === 0) {
            // On mobile, when user goes to home screen, YouTube fires PAUSED (2). Ignore if document.hidden
            if (document.hidden && data === 2) {
              console.log("Background playback active: preserving state");
              return;
            }
            setIsPlaying(false);
          }
        },
      },
    });
    playerRef.current = player;
  }, [activeIndex, apiReady, volume]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setListeners((current) => Math.max(642, Math.min(706, current + Math.floor(Math.random() * 7) - 3)));
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player || !playerReady) return;
      const playlist = player.getPlaylist?.() ?? [];
      const index = player.getPlaylistIndex?.() ?? 0;
      const data = player.getVideoData?.() ?? {};
      const duration = player.getDuration?.() ?? 0;
      const currentTime = player.getCurrentTime?.() ?? 0;
      if (playlist.length > 0) {
        setTracks((current) => {
          const next = playlist.map((videoId, itemIndex) => current[itemIndex] ?? toTrack(itemIndex, videoId));
          const normalized = next.map((track, itemIndex) => ({ ...track, videoId: playlist[itemIndex], albumArt: `https://i.ytimg.com/vi/${playlist[itemIndex]}/hqdefault.jpg` }));
          return normalized.length === current.length && normalized.every((track, itemIndex) => track.videoId === current[itemIndex]?.videoId && track.title === current[itemIndex]?.title)
            ? current
            : normalized;
        });
      }
      if (index >= 0) {
        setActiveIndex(index);
        try {
          window.localStorage.setItem("truck-pe-last-track", String(index));
        } catch {
          // ignore
        }
        if (!isDraggingDisc.current) {
          setProgress(currentTime);
        }
        if (data.title || data.author || duration) {
          setTracks((current) => {
            if (!current[index]) return current;
            const next = [...current];
            const existing = next[index];
            next[index] = {
              ...existing,
              title: data.title || existing.title,
              artist: data.author || existing.artist,
              durationSeconds: duration || existing.durationSeconds,
              videoId: data.video_id || existing.videoId,
              albumArt: data.video_id ? `https://i.ytimg.com/vi/${data.video_id}/hqdefault.jpg` : existing.albumArt,
            };
            return next;
          });
        }
      }
    }, 700);
    return () => window.clearInterval(timer);
  }, [playerReady]);

  useEffect(() => {
    playerRef.current?.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    setTrackPulse(true);
    const timer = window.setTimeout(() => setTrackPulse(false), 460);
    return () => window.clearTimeout(timer);
  }, [activeIndex]);

  // Playback handlers
  const togglePlay = () => {
    const player = playerRef.current;
    if (isPlaying) {
      setIsPlaying(false);
      try {
        player?.pauseVideo();
      } catch {}
      if (keepAliveAudioRef.current) {
        keepAliveAudioRef.current.pause();
      }
    } else {
      setIsPlaying(true);
      try {
        if (player && playerReady) {
          player.playVideo();
        } else {
          pendingPlayRef.current = true;
        }
      } catch {}
      if (keepAliveAudioRef.current) {
        keepAliveAudioRef.current.play().catch(() => {});
      }
    }
  };

  const switchPlaylist = (index: number) => {
    const nextIdx = (index + PLAYLISTS.length) % PLAYLISTS.length;
    setActivePlaylistIndex(nextIdx);
    const targetPlaylist = PLAYLISTS[nextIdx];
    setTracks(targetPlaylist.fallbackTracks);
    setActiveIndex(0);
    setProgress(0);
    try {
      window.localStorage.setItem("truck-pe-active-playlist", String(nextIdx));
    } catch {}

    const player = playerRef.current;
    if (player && playerReady) {
      player.loadPlaylist({ listType: "playlist", list: targetPlaylist.id, index: 0 });
      player.playVideo();
      setIsPlaying(true);
    }
  };

  const selectTrack = (index: number) => {
    setActiveIndex(index);
    setProgress(0);
    const player = playerRef.current;
    if (player && playerReady) {
      player.loadPlaylist({ listType: "playlist", list: activePlaylist.id, index });
      player.playVideo();
    } else {
      pendingPlayRef.current = true;
    }
  };

  const nextTrack = () => {
    const player = playerRef.current;
    if (player && playerReady) {
      if (isShuffle && tracks.length > 1) player.loadPlaylist({ listType: "playlist", list: activePlaylist.id, index: Math.floor(Math.random() * tracks.length) });
      else player.nextVideo();
      player.playVideo();
      return;
    }
    setActiveIndex((index) => (index + 1) % tracks.length);
    setProgress(0);
  };

  const previousTrack = () => {
    const player = playerRef.current;
    if (player && playerReady) {
      player.previousVideo();
      player.playVideo();
      return;
    }
    setActiveIndex((index) => (index - 1 + tracks.length) % tracks.length);
    setProgress(0);
  };

  const handleSeek = (value: number) => {
    setProgress(value);
    playerRef.current?.seekTo(value, true);
  };

  // Vinyl Turntable Drag / Scratching
  const handleDiscMouseDown = (e: ReactMouseEvent) => {
    e.preventDefault();
    isDraggingDisc.current = true;
    startDragAngle.current = e.clientX;
    startDragProgress.current = progress;

    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      if (!isDraggingDisc.current) return;
      const deltaX = moveEvent.clientX - startDragAngle.current;
      const seekDelta = deltaX * 0.45;
      const nextProgress = Math.max(0, Math.min(activeTrack.durationSeconds, startDragProgress.current + seekDelta));
      setProgress(nextProgress);
    };

    const handleMouseUp = () => {
      if (isDraggingDisc.current) {
        isDraggingDisc.current = false;
        playerRef.current?.seekTo(progress, true);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toLowerCase();
      if (e.code === "Space" || key === "k") {
        e.preventDefault();
        togglePlay();
      } else if (key === "arrowleft" || key === "j") {
        e.preventDefault();
        if (e.shiftKey) previousTrack();
        else handleSeek(Math.max(0, progress - 10));
      } else if (key === "arrowright" || key === "l") {
        e.preventDefault();
        if (e.shiftKey) nextTrack();
        else handleSeek(Math.min(activeTrack.durationSeconds, progress + 10));
      } else if (key === "arrowup") {
        e.preventDefault();
        setVolume((v) => Math.min(100, v + 5));
      } else if (key === "arrowdown") {
        e.preventDefault();
        setVolume((v) => Math.max(0, v - 5));
      } else if (key === "m") {
        e.preventDefault();
        setVolume((v) => (v > 0 ? 0 : 72));
      } else if (key === "q") {
        e.preventDefault();
        setQueueOpen((o) => !o);
      } else if (key === "f") {
        e.preventDefault();
        toggleFullscreen();
      } else if (key === "h") {
        e.preventDefault();
        playTruckHorn();
      } else if (key === "t") {
        e.preventDefault();
        cycleAtmosphere();
      } else if (key === "c") {
        e.preventDefault();
        toggleCassetteMode();
      } else if (key === "?" || key === "/") {
        e.preventDefault();
        setShortcutsOpen((s) => !s);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, progress, activeTrack, playerReady]);

  // Register Navigator Media Session for Mobile Background & Lock Screen Playback
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    if (activeTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: activeTrack.title,
        artist: activeTrack.artist,
        album: "TruckWala Highway Radio",
        artwork: [
          { src: activeTrack.albumArt || "/truck-mark.png", sizes: "512x512", type: "image/png" },
        ],
      });

      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }

    try {
      navigator.mediaSession.setActionHandler("play", () => {
        setIsPlaying(true);
        if (keepAliveAudioRef.current) {
          keepAliveAudioRef.current.play().catch(() => {});
        }
        try {
          playerRef.current?.playVideo();
        } catch {}
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        setIsPlaying(false);
        if (keepAliveAudioRef.current) {
          keepAliveAudioRef.current.pause();
        }
        try {
          playerRef.current?.pauseVideo();
        } catch {}
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        previousTrack();
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        nextTrack();
      });
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime !== undefined && activeTrack) {
          handleSeek(Math.min(activeTrack.durationSeconds, Math.max(0, details.seekTime)));
        }
      });
    } catch (e) {
      console.warn("MediaSession action handler error", e);
    }
  }, [activeTrack, isPlaying]);

  const keepAliveAudioRef = useRef<HTMLAudioElement | null>(null);

  // Mobile Background Audio Keep-Alive via HTML5 Audio Element
  useEffect(() => {
    if (isPlaying) {
      if (!keepAliveAudioRef.current) {
        const audio = new Audio("data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=");
        audio.loop = true;
        audio.volume = 0.001;
        keepAliveAudioRef.current = audio;
      }
      keepAliveAudioRef.current.play().catch(() => {});
    } else {
      if (keepAliveAudioRef.current) {
        keepAliveAudioRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <main className={`app-shell atmosphere-${atmosphere} ${isCassetteMode ? "is-cassette-active" : ""}`}>
      <div className={`scene ${isPlaying ? "is-playing" : "is-paused"}`} aria-hidden="true">
        {/* Crisp 4K Native Master Backdrop */}
        <div className="scene-backdrop" style={{ backgroundImage: `url(${posterBackground})` }} />

        {/* Atmosphere Tint & Lighting Overlays */}
        {atmosphere === "midnight" && (
          <div className="night-atmosphere" aria-hidden="true">
            {/* Rising Crescent Moon with Pulsating Lunar Glow */}
            <div className="lunar-moon-container">
              <svg className="crescent-moon-svg" viewBox="0 0 40 40" width="32" height="32">
                <path d="M 20 4 A 16 16 0 1 0 36 20 A 12 12 0 1 1 20 4 Z" fill="#fff8e5" />
              </svg>
              <div className="lunar-halo-glow" />
            </div>

            {/* Twinkling Star Constellations */}
            <div className="night-stars">
              <span className="star s1" /><span className="star s2" /><span className="star s3" /><span className="star s4" />
              <span className="star s5" /><span className="star s6" /><span className="star s7" /><span className="star s8" />
            </div>

            {/* Shooting Star / Meteor Streak */}
            {isShootingStarActive && <div className="shooting-star-streak" />}

            {/* Truck Headlight Beam & Oncoming Dipper Sweep */}
            <div className="headlight-beam" />
            {isOncomingHeadlightActive && <div className="oncoming-headlight-sweep" />}
          </div>
        )}

        {atmosphere === "monsoon" && (
          <div className={`monsoon-atmosphere ${isLightningFlashing ? "is-lightning-active" : ""}`} aria-hidden="true">
            <div className="lightning-flash-overlay" />
            <div className="rain-streaks-container">
              {Array.from({ length: 36 }).map((_, i) => (
                <span
                  key={i}
                  className="rain-streak"
                  style={{
                    left: `${(i * 2.8 + (i % 7) * 1.3) % 100}%`,
                    top: `-${25 + (i % 6) * 15}px`,
                    animationDuration: `${0.45 + (i % 5) * 0.12}s`,
                    animationDelay: `-${(i * 0.14) % 1.2}s`,
                    opacity: 0.5 + (i % 4) * 0.15,
                    height: `${45 + (i % 6) * 22}px`,
                  }}
                />
              ))}
            </div>
            <div className="windshield-droplets">
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className="water-droplet"
                  style={{
                    left: `${5 + i * 6.8}%`,
                    top: `${10 + (i * 19) % 75}%`,
                    animationDuration: `${4.5 + (i % 4) * 1.5}s`,
                    animationDelay: `-${i * 0.7}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Realistic Grounded Indian Heritage Tree Silhouette */}
        <div className="horizon-tree-container" aria-hidden="true">
          <svg className="horizon-tree-svg" viewBox="0 0 220 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="110" cy="225" rx="85" ry="10" fill="#14060b" opacity="0.85" />
            <path d="M 85 225 C 92 195 96 160 92 120 L 128 120 C 124 160 128 195 135 225 C 120 222 100 222 85 225 Z" fill="#14060b" />
            <path d="M 88 225 C 72 228 56 230 40 232" stroke="#14060b" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 132 225 C 148 228 164 230 180 232" stroke="#14060b" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 102 215 C 104 185 103 155 106 125" stroke="#251018" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <path d="M 115 210 C 117 180 116 150 119 125" stroke="#251018" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <path d="M 94 135 C 72 115 50 102 24 110" stroke="#14060b" strokeWidth="7" strokeLinecap="round" />
            <path d="M 126 130 C 148 110 170 98 196 106" stroke="#14060b" strokeWidth="7" strokeLinecap="round" />
            <path d="M 98 105 C 68 84 48 70 32 54" stroke="#14060b" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M 122 100 C 152 78 172 65 188 48" stroke="#14060b" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M 106 95 C 92 68 86 45 82 25" stroke="#14060b" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 114 95 C 128 68 134 45 138 25" stroke="#14060b" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 44 108 C 34 94 22 88 12 94" stroke="#14060b" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 176 104 C 186 90 198 84 208 90" stroke="#14060b" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 58 78 C 46 64 36 56 26 62" stroke="#14060b" strokeWidth="3" strokeLinecap="round" />
            <path d="M 162 72 C 174 58 184 50 194 56" stroke="#14060b" strokeWidth="3" strokeLinecap="round" />
            <path d="M 68 118 C 66 145 68 170 67 195" stroke="#14060b" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
            <path d="M 152 112 C 154 140 152 165 153 190" stroke="#14060b" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
            <g className="horizon-tree-crown-group">
              <path d="M 45 65 C 22 58 4 75 10 95 C 2 110 16 128 35 125 C 50 122 62 108 58 90 C 64 76 56 66 45 65 Z" fill="#14060b" />
              <path d="M 175 60 C 198 54 216 70 210 90 C 218 106 204 124 185 120 C 170 118 158 104 162 86 C 156 72 164 62 175 60 Z" fill="#14060b" />
              <path d="M 75 35 C 48 28 26 48 34 74 C 24 90 40 110 65 106 C 85 102 98 86 94 65 C 102 48 92 36 75 35 Z" fill="#14060b" />
              <path d="M 145 30 C 172 24 194 42 186 68 C 196 84 180 105 155 100 C 135 96 122 80 126 60 C 118 44 128 32 145 30 Z" fill="#14060b" />
              <path d="M 110 12 C 85 6 62 25 70 52 C 60 68 78 88 105 85 C 128 82 145 64 140 42 C 148 26 135 14 110 12 Z" fill="#14060b" />
              <circle cx="24" cy="85" r="14" fill="#14060b" />
              <circle cx="196" cy="80" r="14" fill="#14060b" />
              <circle cx="48" cy="48" r="16" fill="#14060b" />
              <circle cx="172" cy="44" r="16" fill="#14060b" />
              <circle cx="92" cy="20" r="18" fill="#14060b" />
              <circle cx="128" cy="18" r="18" fill="#14060b" />
            </g>
          </svg>
        </div>

        {/* Nostalgic Indian Highway Kites (पतंग) */}
        {atmosphere === "sunset" && (
          <div className="ambient-kites" aria-hidden="true">
            <div className="kite kite-1">
              <svg viewBox="0 0 32 64" width="26" height="52">
                <polygon points="16,2 30,16 16,30 2,16" fill="#8a202c" stroke="#16080d" strokeWidth="1" />
                <line x1="16" y1="2" x2="16" y2="30" stroke="#ffcb89" strokeWidth="0.8" opacity="0.75" />
                <path d="M 2 16 Q 16 26 30 16" stroke="#ffcb89" strokeWidth="0.8" fill="none" opacity="0.75" />
                <polygon points="16,30 20,38 12,38" fill="#f3a62a" />
                <path d="M 16 38 Q 8 46 18 54 Q 10 58 14 62" stroke="#f3a62a" strokeWidth="1.2" fill="none" />
              </svg>
            </div>
            <div className="kite kite-2">
              <svg viewBox="0 0 32 64" width="20" height="40">
                <polygon points="16,2 30,16 16,30 2,16" fill="#d45a31" stroke="#16080d" strokeWidth="1" />
                <line x1="16" y1="2" x2="16" y2="30" stroke="#fff1d4" strokeWidth="0.8" opacity="0.75" />
                <path d="M 2 16 Q 16 26 30 16" stroke="#fff1d4" strokeWidth="0.8" fill="none" opacity="0.75" />
                <polygon points="16,30 19,36 13,36" fill="#8a202c" />
                <path d="M 16 36 Q 22 44 14 50 Q 20 54 16 58" stroke="#8a202c" strokeWidth="1" fill="none" />
              </svg>
            </div>
          </div>
        )}

        {/* Nostalgic Golden Fireflies (जुगनू) */}
        <div className="ambient-fireflies" aria-hidden="true">
          <span className="firefly firefly-1" /><span className="firefly firefly-2" /><span className="firefly firefly-3" /><span className="firefly firefly-4" /><span className="firefly firefly-5" /><span className="firefly firefly-6" />
        </div>

        {/* Flying Aeroplane with Forming Cloud Puffs */}
        <div className="ambient-plane-system" aria-hidden="true">
          <div className="ambient-plane">
            <svg viewBox="0 0 44 24" width="36" height="20" fill="#16080d">
              <path d="M 2 12 C 12 11, 24 10, 36 7 C 40 6, 43 7, 44 9 C 43 11, 40 12, 36 11 C 24 12, 12 13, 2 12 Z" />
              <path d="M 22 11 L 12 1 L 18 1 L 28 11 Z" />
              <path d="M 24 12 L 18 21 L 23 21 L 30 12 Z" />
              <path d="M 4 12 L 0 5 L 4 5 L 8 12 Z" />
            </svg>
            <div className="plane-cloud-emitter">
              <span className="cloud-puff puff-1" /><span className="cloud-puff puff-2" /><span className="cloud-puff puff-3" /><span className="cloud-puff puff-4" />
            </div>
          </div>
        </div>

        {/* Circling Bird Flock Layer (12 Birds / 6 Pairs) */}
        <div className="ambient-flock-pivot" aria-hidden="true">
          <div className="ambient-flock-cluster">
            {[
              { id: 1, x: 0, y: -30, scale: 1.1, speed: "0.52s", delay: "0s" },
              { id: 2, x: -32, y: -14, scale: 0.92, speed: "0.58s", delay: "-0.15s" },
              { id: 3, x: 36, y: -10, scale: 0.96, speed: "0.55s", delay: "-0.32s" },
              { id: 4, x: -58, y: 8, scale: 0.82, speed: "0.64s", delay: "-0.48s" },
              { id: 5, x: 62, y: 12, scale: 0.86, speed: "0.59s", delay: "-0.20s" },
              { id: 6, x: -18, y: 16, scale: 0.76, speed: "0.62s", delay: "-0.38s" },
              { id: 7, x: 22, y: 20, scale: 0.8, speed: "0.60s", delay: "-0.10s" },
              { id: 8, x: 2, y: 36, scale: 0.72, speed: "0.65s", delay: "-0.26s" },
              { id: 9, x: -44, y: 32, scale: 0.75, speed: "0.57s", delay: "-0.42s" },
              { id: 10, x: 48, y: 30, scale: 0.78, speed: "0.63s", delay: "-0.17s" },
              { id: 11, x: -75, y: 22, scale: 0.68, speed: "0.66s", delay: "-0.55s" },
              { id: 12, x: 78, y: 25, scale: 0.7, speed: "0.61s", delay: "-0.29s" },
            ].map((bird) => (
              <span
                key={bird.id}
                className="flock-bird-icon"
                style={{
                  transform: `translate(${bird.x}px, ${bird.y}px) scale(${bird.scale})`,
                  ["--flap-dur" as any]: bird.speed,
                  ["--flap-del" as any]: bird.delay,
                }}
              >
                <svg viewBox="0 0 28 14" width="22" height="11" fill="#16080d">
                  <path d="M 1 12 C 5 4, 11 2, 14 7 C 17 2, 23 4, 27 12 C 22 8, 16 6, 14 9 Z" />
                </svg>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Title Lockup */}
      <div className="poster-title" aria-label="ट्रक ड्राइवर Playlist">
        <h1>ट्रक ड्राइवर</h1>
        <span>Playlist</span>
      </div>

      {/* Luxury HUD Header with Controls & Highway Status */}
      <header className="reference-header luxury-header">
        <div className="header-left-cluster">
          <div className="luxury-status" aria-label={`TruckWala • ${listeners} listeners on the highway`}>
            <span className="status-pulse" />
            <span className="desktop-status-text">TRUCKWALA • {listeners} ON HIGHWAY</span>
            <span className="mobile-status-text">TRUCKWALA • {listeners}</span>
          </div>

          {/* Interactive Truck Horn Badge (Horn OK Please) */}
          <button
            type="button"
            className={`horn-ok-please-badge ${isHornHonking ? "is-honking" : ""}`}
            onClick={playTruckHorn}
            title="Honk Truck Horn (Press H)"
            aria-label="Honk Truck Horn"
          >
            <Radio size={12} className="horn-icon" />
            <strong className="desktop-horn-text">HORN OK PLEASE</strong>
            <strong className="mobile-horn-text">HORN OK</strong>
          </button>
        </div>

        <div className="header-right-cluster">
          {/* Dual Playlist Radio Switcher Pill */}
          <button
            type="button"
            className="hud-action-button playlist-toggle"
            onClick={() => switchPlaylist((activePlaylistIndex + 1) % PLAYLISTS.length)}
            title={`Active Station: ${activePlaylist.name} (Click to switch)`}
            aria-label="Switch Playlist"
          >
            <ListMusic size={14} />
            <span className="hud-button-label">{activePlaylistIndex === 0 ? "Station 1" : "Station 2"}</span>
          </button>

          {/* Atmosphere Theme Switcher */}
          <button
            type="button"
            className="hud-action-button theme-toggle"
            onClick={cycleAtmosphere}
            title={`Atmosphere: ${atmosphere.toUpperCase()} (Press T to switch)`}
            aria-label="Switch atmosphere theme"
          >
            {atmosphere === "sunset" && <Sun size={14} />}
            {atmosphere === "midnight" && <Moon size={14} />}
            {atmosphere === "monsoon" && <CloudRain size={14} />}
            <span className="hud-button-label">{atmosphere}</span>
          </button>

          {/* Cassette Tape Warmth Toggle */}
          <button
            type="button"
            className={`hud-action-button cassette-toggle ${isCassetteMode ? "is-active" : ""}`}
            onClick={toggleCassetteMode}
            title="Dhaba Tape Saturation (Press C)"
            aria-label="Toggle Cassette Mode"
          >
            <CassetteTape size={14} />
            <span className="hud-button-label">Tape</span>
          </button>

          {/* Fullscreen Poster Mode */}
          <button
            type="button"
            className="hud-action-button fullscreen-toggle"
            onClick={toggleFullscreen}
            title="Fullscreen Poster Mode (Press F)"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Shortcuts Info */}
          <button
            type="button"
            className="hud-action-button shortcuts-btn"
            onClick={() => setShortcutsOpen(true)}
            title="Keyboard Shortcuts (Press ?)"
            aria-label="Show shortcuts"
          >
            <HelpCircle size={14} />
          </button>

          {/* Live Clock */}
          <div className="luxury-time" aria-label={`Local time ${clockLabel}`}>
            <span className="mini-clock" aria-hidden="true">
              <span className="clock-hand clock-hour" />
              <span className="clock-hand clock-minute" />
            </span>
            <span>{clockLabel}</span>
          </div>
        </div>
      </header>

      {/* Floating Unified Tinted Glass Music Player Dock */}
      <section
        className={`floating-vinyl-player unified-player-card ${isPlaying ? "is-playing" : ""} ${trackPulse ? "is-changing" : ""}`}
        aria-label="Unified vinyl music player card"
      >
        {/* Interactive Scratchable Vinyl Record Turntable */}
        <button
          className={`floating-vinyl-button ${isPlaying ? "is-playing" : ""}`}
          type="button"
          onClick={togglePlay}
          onMouseDown={handleDiscMouseDown}
          title="Click to play/pause · Drag to scratch/seek"
          aria-label={isPlaying ? "Pause" : `Play ${activeTrack.title}`}
        >
          <span className="floating-vinyl-disc" aria-hidden="true">
            <span className="vinyl-grooves" />
            <span className="vinyl-gloss" />
            <span className="vinyl-label">
              <img src={activeTrack.albumArt} alt="" />
            </span>
            <span className="vinyl-center" />
          </span>
          <span className="floating-tonearm" aria-hidden="true">
            <span className="tonearm-pivot" />
            <span className="tonearm-stick" />
            <span className="tonearm-head" />
          </span>
        </button>

        <div className="floating-controls" aria-label="Playback controls">
          <div className="floating-track-label">
            <strong>{activeTrack.title}</strong>
            <span>{activeTrack.artist}</span>
          </div>

          {/* Audio Seekbar Road */}
          <div className="seekbar-road-container">
            <span className="time-display">{formatTime(progress)}</span>
            <div
              className="seekbar-road-track"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                handleSeek(ratio * activeTrack.durationSeconds);
              }}
            >
              <div className="seekbar-road-dashes" />
              <div className="seekbar-road-fill" style={{ width: `${progressRatio * 100}%` }} />
              <div className="seekbar-truck-marker" style={{ left: `${progressRatio * 100}%` }}>
                🚚
              </div>
            </div>
            <span className="time-display">{formatTime(activeTrack.durationSeconds)}</span>
          </div>

          {/* Transport Controls Row */}
          <div className="floating-controls-row">
            <button
              className={`floating-icon-button ${isShuffle ? "is-active" : ""}`}
              type="button"
              onClick={() => setIsShuffle((value) => !value)}
              title="Toggle shuffle"
              aria-label="Toggle shuffle"
            >
              <Shuffle size={14} />
            </button>
            <button
              className="floating-icon-button"
              type="button"
              onClick={previousTrack}
              title="Previous (Shift + ←)"
              aria-label="Previous track"
            >
              <SkipBack size={14} fill="currentColor" />
            </button>
            <button
              className="floating-play-button"
              type="button"
              onClick={togglePlay}
              title="Play / Pause (Space)"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
            </button>
            <button
              className="floating-icon-button"
              type="button"
              onClick={nextTrack}
              title="Next (Shift + →)"
              aria-label="Next track"
            >
              <SkipForward size={14} fill="currentColor" />
            </button>
            <button
              className="floating-icon-button"
              type="button"
              onClick={() => setQueueOpen(true)}
              title="Playlist Queue (Q)"
              aria-label="Open playlist"
            >
              <ListMusic size={14} />
              <span className="floating-queue-count">{tracks.length}</span>
            </button>
          </div>

          {/* Volume Row */}
          <div className="floating-volume-row">
            <button
              className="floating-volume-button"
              type="button"
              onClick={() => setVolume((current) => (current > 0 ? 0 : 72))}
              title="Mute / Unmute (M)"
              aria-label={volume > 0 ? "Mute" : "Unmute"}
            >
              {volume > 0 ? <Volume2 size={12} /> : <VolumeX size={12} />}
            </button>
            <input
              className="floating-volume-slider"
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              style={{
                background: `linear-gradient(90deg, rgba(243, 190, 87, 0.9) 0 ${volume}%, rgba(255, 235, 195, 0.18) ${volume}% 100%)`,
              }}
              aria-label="Volume"
            />
            <span className="floating-volume-value">{volume}%</span>
          </div>
        </div>
      </section>

      {/* Hidden YouTube Engine */}
      <div id="youtube-player" className="youtube-player" aria-hidden="true" />

      {/* Playlist Queue Drawer */}
      {queueOpen && (
        <div className="sheet-backdrop" onClick={() => setQueueOpen(false)}>
          <section className="queue-sheet" onClick={(event) => event.stopPropagation()} aria-label="Highway Radio Station Playlist">
            <div className="sheet-handle" />
            <div className="sheet-header">
              <div>
                <span className="sheet-kicker">HIGHWAY RADIO STATIONS</span>
                <h2>{activePlaylist.name}</h2>
                <p>{activePlaylist.subtitle}</p>
              </div>
              <button className="icon-button close-button" type="button" onClick={() => setQueueOpen(false)} aria-label="Close playlist">
                <X size={18} />
              </button>
            </div>

            {/* Playlist Station Selector Tabs */}
            <div className="playlist-tabs-bar">
              {PLAYLISTS.map((pl, idx) => (
                <button
                  key={pl.id}
                  type="button"
                  className={`playlist-tab-btn ${idx === activePlaylistIndex ? "is-active" : ""}`}
                  onClick={() => switchPlaylist(idx)}
                >
                  <Radio size={12} />
                  <span>{pl.name}</span>
                </button>
              ))}
            </div>

            <div className="queue-list">
              {tracks.map((track, index) => (
                <button
                  key={`${track.title}-${index}`}
                  type="button"
                  className={`queue-row ${index === activeIndex ? "is-current" : ""}`}
                  onClick={() => selectTrack(index)}
                >
                  <span className="queue-number">{String(index + 1).padStart(2, "0")}</span>
                  <img src={track.albumArt} alt="" />
                  <span className="queue-track-copy">
                    <strong>{track.title}</strong>
                    <span>{track.artist}</span>
                  </span>
                  <span className="queue-duration">{formatTime(track.durationSeconds)}</span>
                  {index === activeIndex && (
                    <span className="playing-bars">
                      <i /><i /><i />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="sheet-footer">
              <span>
                <span className={`status-dot ${playerReady ? "ready" : ""}`} /> Official YouTube Music source
              </span>
              <a href={activePlaylist.url} target="_blank" rel="noreferrer">
                Open playlist <ExternalLink size={12} />
              </a>
            </div>
          </section>
        </div>
      )}

      {/* Keyboard Shortcuts Cheat-Sheet Modal */}
      {shortcutsOpen && (
        <div className="sheet-backdrop" onClick={() => setShortcutsOpen(false)}>
          <section className="shortcuts-modal" onClick={(e) => e.stopPropagation()} aria-label="Highway Shortcuts">
            <div className="shortcuts-header">
              <h3>🛣️ Highway Controls & Shortcuts</h3>
              <button className="icon-button close-button" type="button" onClick={() => setShortcutsOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="shortcuts-grid">
              <div className="shortcut-item"><kbd>Space</kbd> or <kbd>K</kbd> <span>Play / Pause</span></div>
              <div className="shortcut-item"><kbd>H</kbd> <span>Honk Truck Horn (Horn OK Please)</span></div>
              <div className="shortcut-item"><kbd>←</kbd> / <kbd>→</kbd> <span>Seek -/+ 10 Seconds</span></div>
              <div className="shortcut-item"><kbd>Shift</kbd> + <kbd>←</kbd>/<kbd>→</kbd> <span>Previous / Next Track</span></div>
              <div className="shortcut-item"><kbd>↑</kbd> / <kbd>↓</kbd> <span>Volume Up / Down</span></div>
              <div className="shortcut-item"><kbd>M</kbd> <span>Mute / Unmute</span></div>
              <div className="shortcut-item"><kbd>T</kbd> <span>Switch Theme (Sunset/Midnight/Monsoon)</span></div>
              <div className="shortcut-item"><kbd>C</kbd> <span>Toggle Cassette Tape Lo-Fi</span></div>
              <div className="shortcut-item"><kbd>Q</kbd> <span>Toggle Playlist Queue</span></div>
              <div className="shortcut-item"><kbd>F</kbd> <span>Fullscreen Poster Mode</span></div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
