"use client";

import { useState } from "react";

interface ScorecardImageGeneratorProps {
  roundData: {
    course: { name: string };
    totalStrokes: number;
    coursePar: number;
    scores: Array<{ hole: number; strokes: number; par: number }>;
    participants: Array<{ name: string; totalStrokes: number }>;
    roundType?: string;
    date?: string;
  };
  onImageGenerated?: (imageDataUrl: string) => void;
}

export function ScorecardImageGenerator({ roundData, onImageGenerated }: ScorecardImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateScorecardImage = async () => {
    setIsGenerating(true);
    
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Add roundRect polyfill
      if (!ctx.roundRect) {
        ctx.roundRect = function(x: number, y: number, width: number, height: number, radius: number) {
          this.beginPath();
          this.moveTo(x + radius, y);
          this.lineTo(x + width - radius, y);
          this.quadraticCurveTo(x + width, y, x + width, y + radius);
          this.lineTo(x + width, y + height - radius);
          this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          this.lineTo(x + radius, y + height);
          this.quadraticCurveTo(x, y + height, x, y + height - radius);
          this.lineTo(x, y + radius);
          this.quadraticCurveTo(x, y, x + radius, y);
          this.closePath();
        };
      }

      // Set canvas size (more compact: 800x1200)
      const width = 800;
      const height = 1200;
      canvas.width = width;
      canvas.height = height;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#1e293b'); // slate-800
      gradient.addColorStop(1, '#334155'); // slate-700
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add subtle pattern overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let i = 0; i < width; i += 40) {
        for (let j = 0; j < height; j += 40) {
          if ((i + j) % 80 === 0) {
            ctx.fillRect(i, j, 2, 2);
          }
        }
      }

      // Set font styles
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';

      // Header section with rounded background
      const headerHeight = 200;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.roundRect(20, 20, width - 40, headerHeight, 20);
      ctx.fill();

      // Title
      ctx.font = 'bold 36px Inter, sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText('🥏 Disc Golf Scorecard', width / 2, 70);

      // Course name
      ctx.font = 'bold 28px Inter, sans-serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(roundData.course.name, width / 2, 110);

      // Score summary in a compact card
      const scoreToPar = roundData.totalStrokes - roundData.coursePar;
      const scoreToParText = scoreToPar === 0 ? 'E' : scoreToPar > 0 ? `+${scoreToPar}` : `${scoreToPar}`;
      
      // Score card background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.roundRect(width / 2 - 120, 140, 240, 60, 15);
      ctx.fill();

      ctx.font = 'bold 48px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${roundData.totalStrokes}`, width / 2, 170);
      
      ctx.font = '24px Inter, sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`(${scoreToParText}) • Par ${roundData.coursePar}`, width / 2, 190);

      // Leaderboard (compact)
      let currentY = 250;
      if (roundData.participants.length > 1) {
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.fillStyle = '#f1f5f9';
        ctx.fillText('🏆 Leaderboard', width / 2, currentY);
        currentY += 30;

        const sortedParticipants = [...roundData.participants].sort((a, b) => a.totalStrokes - b.totalStrokes);
        sortedParticipants.forEach((participant, index) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
          
          ctx.font = '20px Inter, sans-serif';
          ctx.fillStyle = '#e2e8f0';
          ctx.fillText(`${medal} ${participant.name}: ${participant.totalStrokes}`, width / 2, currentY);
          currentY += 25;
        });
        currentY += 20;
      }

      // Hole-by-hole scores (compact grid)
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillStyle = '#f1f5f9';
      ctx.fillText('📈 Hole-by-Hole', width / 2, currentY);
      currentY += 40;

      // Create compact score grid
      const gridStartY = currentY;
      const gridWidth = 720;
      const gridHeight = 400;
      const cols = 9; // More columns for compactness
      const rows = Math.ceil(roundData.scores.length / cols);
      const cellWidth = gridWidth / cols;
      const cellHeight = gridHeight / rows;

      // Draw grid background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.roundRect((width - gridWidth) / 2, gridStartY, gridWidth, gridHeight, 15);
      ctx.fill();

      // Draw grid lines (subtle)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let i = 0; i <= cols; i++) {
        const x = (width - gridWidth) / 2 + (i * cellWidth);
        ctx.beginPath();
        ctx.moveTo(x, gridStartY);
        ctx.lineTo(x, gridStartY + gridHeight);
        ctx.stroke();
      }

      // Horizontal lines
      for (let i = 0; i <= rows; i++) {
        const y = gridStartY + (i * cellHeight);
        ctx.beginPath();
        ctx.moveTo((width - gridWidth) / 2, y);
        ctx.lineTo((width - gridWidth) / 2 + gridWidth, y);
        ctx.stroke();
      }

      // Fill in scores (compact)
      roundData.scores.forEach((score, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x = (width - gridWidth) / 2 + (col * cellWidth) + cellWidth / 2;
        const y = gridStartY + (row * cellHeight) + cellHeight / 2;

        // Hole number (smaller)
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`${score.hole}`, x, y - 8);

        // Score (larger, color-coded)
        ctx.font = 'bold 20px Inter, sans-serif';
        const diff = score.strokes - score.par;
        if (diff < 0) {
          ctx.fillStyle = '#10b981'; // green-500
        } else if (diff > 0) {
          ctx.fillStyle = '#ef4444'; // red-500
        } else {
          ctx.fillStyle = '#3b82f6'; // blue-500
        }
        ctx.fillText(score.strokes.toString(), x, y + 8);

        // Par indicator (smaller)
        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`P${score.par}`, x, y + 20);
      });

      // Footer with branding
      ctx.font = '16px Inter, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Generated by DiscGolf Tracker', width / 2, height - 30);

      // Add subtle border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, width - 20, height - 20);

      // Convert to image
      const imageDataUrl = canvas.toDataURL('image/png');
      
      if (onImageGenerated) {
        onImageGenerated(imageDataUrl);
      }

      return imageDataUrl;
    } catch (error) {
      console.error('Error generating scorecard image:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    try {
      const imageDataUrl = await generateScorecardImage();
      
      // Create download link
      const link = document.createElement('a');
      link.download = `discgolf-scorecard-${Date.now()}.png`;
      link.href = imageDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const shareImage = async () => {
    try {
      const imageDataUrl = await generateScorecardImage();
      
      // Convert data URL to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      
      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare({ files: [new File([blob], 'scorecard.png', { type: 'image/png' })] })) {
        await navigator.share({
          title: 'My Disc Golf Scorecard',
          text: `Check out my round at ${roundData.course.name}!`,
          files: [new File([blob], 'scorecard.png', { type: 'image/png' })]
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        
        // Show success message
        alert('Scorecard image copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      // Fallback to download
      downloadImage();
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={downloadImage}
        disabled={isGenerating}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            📸 Download Image
          </>
        )}
      </button>
      
      <button
        onClick={shareImage}
        disabled={isGenerating}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            📤 Share Image
          </>
        )}
      </button>
    </div>
  );
}
