import React, { useRef, useEffect, useCallback } from 'react';
import * as Tone from 'tone';

interface WebGLPlayerHeadProps {
  position: number; // Position in beats
  beatWidth: number;
  height: number;
  isVisible: boolean;
  isPlaying: boolean;
}

// WebGL-accelerated player head with perfect audio sync
export function WebGLPlayerHead({ 
  position, 
  beatWidth, 
  height, 
  isVisible, 
  isPlaying 
}: WebGLPlayerHeadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const startTimeRef = useRef<number>(0);

  // WebGL shaders for smooth rendering
  const vertexShaderSource = `
    attribute vec2 a_position;
    uniform vec2 u_resolution;
    uniform float u_offset;
    
    void main() {
      vec2 position = a_position;
      position.x += u_offset;
      
      // Convert from pixels to clip space
      vec2 clipSpace = ((position / u_resolution) * 2.0) - 1.0;
      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;
    uniform float u_alpha;
    
    void main() {
      gl_FragColor = vec4(u_color.rgb, u_color.a * u_alpha);
    }
  `;

  // Initialize WebGL
  const initWebGL = useCallback(() => {
    if (!canvasRef.current) return false;

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      console.warn('⚠️ WebGL not supported, falling back to Canvas2D');
      return false;
    }

    glRef.current = gl as WebGLRenderingContext;

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return false;

    // Create program
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return false;

    programRef.current = program;
    gl.useProgram(program);

    // Set up player head geometry (vertical line)
    const positions = [
      0, 0,      // Top
      0, height, // Bottom
    ];

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    console.log('✅ WebGL Player Head initialized');
    return true;
  }, [height]);

  // Create shader helper
  const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  // Create program helper
  const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    return program;
  };

  // Get real-time audio position with compensation
  const getAudioSyncPosition = useCallback((): number => {
    if (!isPlaying || Tone.Transport.state !== 'started') {
      return position;
    }

    try {
      // Get precise audio context time
      const audioContext = Tone.getContext();
      const audioTime = audioContext.currentTime;
      
      // Get Tone.js transport position in seconds
      const transportSeconds = Tone.Transport.seconds;
      
      // Calculate BPM-adjusted position
      const bpm = Tone.Transport.bpm.value;
      const beatsPerSecond = bpm / 60;
      const audioPositionInBeats = transportSeconds * beatsPerSecond;
      
      // Add lookahead compensation for visual sync (about 16ms for 60fps)
      const lookaheadBeats = (16 / 1000) * beatsPerSecond;
      const compensatedPosition = audioPositionInBeats + lookaheadBeats;
      
      return compensatedPosition;
      
    } catch (error) {
      console.warn('⚠️ Audio sync position error:', error);
      return position; // Fallback to prop position
    }
  }, [position, isPlaying]);

  // WebGL render function
  const render = useCallback(() => {
    if (!glRef.current || !programRef.current || !canvasRef.current) return;

    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;

    // Get real-time audio-synced position
    const syncedPosition = getAudioSyncPosition();
    const xOffset = syncedPosition * beatWidth;

    // Set canvas size
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Clear
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set uniforms
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const offsetLocation = gl.getUniformLocation(program, 'u_offset');
    const colorLocation = gl.getUniformLocation(program, 'u_color');
    const alphaLocation = gl.getUniformLocation(program, 'u_alpha');

    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(offsetLocation, xOffset * devicePixelRatio);

    // Set color based on playing state
    if (isPlaying) {
      gl.uniform4f(colorLocation, 1.0, 0.0, 0.0, 1.0); // Red when playing
    } else {
      gl.uniform4f(colorLocation, 1.0, 0.8, 0.0, 1.0); // Yellow when stopped
    }

    gl.uniform1f(alphaLocation, isVisible ? 1.0 : 0.0);

    // Enable line rendering
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.lineWidth(2 * devicePixelRatio);

    // Draw the line
    gl.drawArrays(gl.LINES, 0, 2);

  }, [beatWidth, isVisible, isPlaying, getAudioSyncPosition]);

  // Animation loop with audio sync
  const animate = useCallback(() => {
    if (!isPlaying) {
      animationFrameRef.current = null;
      return;
    }

    render();
    
    // Continue animation at 60fps for smooth playback
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isPlaying, render]);

  // Initialize WebGL on mount
  useEffect(() => {
    const success = initWebGL();
    if (!success) {
      console.warn('⚠️ WebGL initialization failed');
      return;
    }

    // Initial render
    render();
  }, [initWebGL, render]);

  // Handle playing state changes
  useEffect(() => {
    if (isPlaying && !animationFrameRef.current) {
      console.log('🎬 Starting WebGL player head animation');
      startTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    } else if (!isPlaying && animationFrameRef.current) {
      console.log('⏹️ Stopping WebGL player head animation');
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      render(); // Final render at stopped position
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, animate, render]);

  // Handle position changes when not playing
  useEffect(() => {
    if (!isPlaying) {
      render();
    }
  }, [position, beatWidth, render, isPlaying]);

  if (!isVisible) return null;

  return (
    <div className="absolute top-0 left-0 pointer-events-none z-50">
      {/* WebGL Canvas for player head */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0"
        style={{
          width: '100%',
          height: `${height}px`,
          imageRendering: 'pixelated', // Sharp rendering
        }}
      />
      
      {/* Position indicator (fallback if WebGL fails) */}
      <div
        className={`absolute -top-6 px-2 py-1 rounded text-xs font-mono ${
          isPlaying 
            ? 'bg-red-500 text-white' 
            : 'bg-yellow-500 text-black'
        }`}
        style={{ 
          transform: `translate3d(${getAudioSyncPosition() * beatWidth - 50}px, 0, 0)`,
          transition: isPlaying ? 'none' : 'transform 0.1s ease',
        }}
      >
        {Math.floor(getAudioSyncPosition() / 4) + 1}:{((getAudioSyncPosition() % 4) + 1).toFixed(2).padStart(5, '0')}
      </div>
    </div>
  );
}