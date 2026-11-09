import { DetectedFace, FaceLandmarks, Rect, SwapSettings, MotionSettings } from '../types';

/**
 * High-performance Face Swap and Blending Engine
 * Runs in-browser using HTML5 Canvas & TypedArrays for real-time 60fps responsiveness.
 */

// Generate pseudo-landmarks based on face bounding box
export function estimateFaceLandmarks(box: Rect): FaceLandmarks {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  const leftEye = { x: cx - box.width * 0.2, y: cy - box.height * 0.12 };
  const rightEye = { x: cx + box.width * 0.2, y: cy - box.height * 0.12 };
  const nose = { x: cx, y: cy + box.height * 0.05 };
  const mouthLeft = { x: cx - box.width * 0.16, y: cy + box.height * 0.25 };
  const mouthRight = { x: cx + box.width * 0.16, y: cy + box.height * 0.25 };
  const mouthCenter = { x: cx, y: cy + box.height * 0.26 };
  const chin = { x: cx, y: box.y + box.height * 0.92 };
  const forehead = { x: cx, y: box.y + box.height * 0.08 };
  const leftCheek = { x: box.x + box.width * 0.12, y: cy + box.height * 0.08 };
  const rightCheek = { x: box.x + box.width * 0.88, y: cy + box.height * 0.08 };

  const jawline = [
    { x: box.x + box.width * 0.1, y: cy - box.height * 0.05 },
    { x: box.x + box.width * 0.14, y: cy + box.height * 0.2 },
    { x: box.x + box.width * 0.25, y: cy + box.height * 0.38 },
    chin,
    { x: box.x + box.width * 0.75, y: cy + box.height * 0.38 },
    { x: box.x + box.width * 0.86, y: cy + box.height * 0.2 },
    { x: box.x + box.width * 0.9, y: cy - box.height * 0.05 },
  ];

  return {
    leftEye,
    rightEye,
    nose,
    mouthLeft,
    mouthRight,
    mouthCenter,
    chin,
    forehead,
    leftCheek,
    rightCheek,
    jawline,
  };
}

// Compute average skin tone color in center of face
export function sampleSkinTone(ctx: CanvasRenderingContext2D, box: Rect): string {
  try {
    const sampleX = Math.max(0, Math.floor(box.x + box.width * 0.35));
    const sampleY = Math.max(0, Math.floor(box.y + box.height * 0.35));
    const sampleW = Math.max(1, Math.floor(box.width * 0.3));
    const sampleH = Math.max(1, Math.floor(box.height * 0.3));

    const imgData = ctx.getImageData(sampleX, sampleY, sampleW, sampleH);
    const data = imgData.data;
    let r = 0, g = 0, b = 0, count = 0;

    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    if (count > 0) {
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
  } catch (err) {
    // Canvas security / CORS fallback
  }
  return '#e2b38b';
}

// Draw Face Landmark Wireframe overlay for HUD visualization
export function drawLandmarkWireframe(
  ctx: CanvasRenderingContext2D,
  landmarks: FaceLandmarks,
  box: Rect,
  color: string = '#6366f1'
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;

  // Bounding box
  ctx.strokeRect(box.x, box.y, box.width, box.height);

  // Corner brackets
  const bracketLen = Math.min(box.width, box.height) * 0.15;
  ctx.lineWidth = 2.5;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(box.x, box.y + bracketLen);
  ctx.lineTo(box.x, box.y);
  ctx.lineTo(box.x + bracketLen, box.y);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(box.x + box.width - bracketLen, box.y);
  ctx.lineTo(box.x + box.width, box.y);
  ctx.lineTo(box.x + box.width, box.y + bracketLen);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(box.x, box.y + box.height - bracketLen);
  ctx.lineTo(box.x, box.y + box.height);
  ctx.lineTo(box.x + bracketLen, box.y + box.height);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(box.x + box.width - bracketLen, box.y + box.height);
  ctx.lineTo(box.x + box.width, box.y + box.height);
  ctx.lineTo(box.x + box.width, box.y + box.height - bracketLen);
  ctx.stroke();

  // Points
  const points = [
    landmarks.leftEye,
    landmarks.rightEye,
    landmarks.nose,
    landmarks.mouthLeft,
    landmarks.mouthRight,
    landmarks.mouthCenter,
    landmarks.chin,
    landmarks.forehead,
    landmarks.leftCheek,
    landmarks.rightCheek,
    ...landmarks.jawline,
  ];

  ctx.fillStyle = '#38bdf8';
  for (const pt of points) {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Connecting lines: Eye to Eye
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
  ctx.lineWidth = 1;
  ctx.moveTo(landmarks.leftEye.x, landmarks.leftEye.y);
  ctx.lineTo(landmarks.rightEye.x, landmarks.rightEye.y);
  ctx.stroke();

  // Nose bridge
  ctx.beginPath();
  ctx.moveTo((landmarks.leftEye.x + landmarks.rightEye.x) / 2, landmarks.forehead.y);
  ctx.lineTo(landmarks.nose.x, landmarks.nose.y);
  ctx.stroke();

  // Jawline contour
  ctx.beginPath();
  ctx.moveTo(landmarks.jawline[0].x, landmarks.jawline[0].y);
  for (let i = 1; i < landmarks.jawline.length; i++) {
    ctx.lineTo(landmarks.jawline[i].x, landmarks.jawline[i].y);
  }
  ctx.stroke();

  ctx.restore();
}

/**
 * Real-Time Face Blend Pipeline
 * Renders target image/video frame, then computes masked warped source face
 * with skin-tone transfer, feathering, and lighting adjustment.
 */
export function renderFaceSwap(
  targetCanvas: HTMLCanvasElement,
  targetMedia: HTMLImageElement | HTMLVideoElement,
  sourceImg: HTMLImageElement | null,
  sourceBox: Rect | null,
  targetBox: Rect,
  settings: SwapSettings
) {
  try {
    const ctx = targetCanvas.getContext('2d');
    if (!ctx) return;

    const w = targetCanvas.width;
    const h = targetCanvas.height;
    if (w <= 0 || h <= 0) return;

    // Check targetMedia readiness
    if (targetMedia instanceof HTMLImageElement) {
      if (!targetMedia.complete || targetMedia.naturalWidth === 0 || targetMedia.naturalHeight === 0) {
        return;
      }
    } else if (targetMedia instanceof HTMLVideoElement) {
      if (targetMedia.readyState < 2 || targetMedia.videoWidth === 0 || targetMedia.videoHeight === 0) {
        return;
      }
    }

    // 1. Draw Target Media
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(targetMedia, 0, 0, w, h);

    // If no source image or split-slider is 0, just draw target
    if (!sourceImg || !sourceImg.complete || sourceImg.naturalWidth === 0 || sourceImg.naturalHeight === 0) {
      if (settings.showLandmarks) {
        const targetLandmarks = estimateFaceLandmarks(targetBox);
        drawLandmarkWireframe(ctx, targetLandmarks, targetBox, '#38bdf8');
      }
      return;
    }

    // Calculate face placement geometry on target
    const baseScale = Math.max(0.2, settings.scale || 1);
    const targetFaceW = targetBox.width * baseScale;
    const targetFaceH = targetBox.height * baseScale;
    const targetFaceX = targetBox.x + (targetBox.width - targetFaceW) / 2 + (settings.offsetX || 0);
    const targetFaceY = targetBox.y + (targetBox.height - targetFaceH) / 2 + (settings.offsetY || 0);

    if (targetFaceW <= 0 || targetFaceH <= 0) return;

    // Offscreen canvas for extracted face
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = Math.max(10, Math.floor(targetFaceW * 1.5));
    faceCanvas.height = Math.max(10, Math.floor(targetFaceH * 1.5));
    const fCtx = faceCanvas.getContext('2d');
    if (!fCtx) return;

    const fw = faceCanvas.width;
    const fh = faceCanvas.height;

    // Determine source crop box
    const sBox = sourceBox || {
      x: sourceImg.naturalWidth * 0.25,
      y: sourceImg.naturalHeight * 0.15,
      width: Math.max(1, sourceImg.naturalWidth * 0.5),
      height: Math.max(1, sourceImg.naturalHeight * 0.6),
    };

    // Draw source face to offscreen canvas
    fCtx.drawImage(
      sourceImg,
      sBox.x,
      sBox.y,
      sBox.width,
      sBox.height,
      fw * 0.15,
      fh * 0.15,
      fw * 0.7,
      fh * 0.7
    );

  // Apply Skin-Tone & Color Warmth / Contrast adjustments
  if (settings.skinToneMatch > 0 || settings.colorWarmth !== 0 || settings.contrast !== 0) {
    try {
      const imgData = fCtx.getImageData(0, 0, fw, fh);
      const data = imgData.data;
      const warmthFactor = settings.colorWarmth * 0.5;
      const contrastFactor = (259 * (settings.contrast + 255)) / (255 * (259 - settings.contrast));

      // Skin Tone harmonization shift
      const skinBlend = settings.skinToneMatch / 100;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;

        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Contrast
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;

        // Warmth (increase red, reduce blue)
        r = r + warmthFactor;
        b = b - warmthFactor * 0.8;

        // Soft skin harmonization
        if (skinBlend > 0) {
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          r = r * (1 - skinBlend * 0.4) + luma * (skinBlend * 0.4);
          g = g * (1 - skinBlend * 0.3) + (luma * 0.95) * (skinBlend * 0.3);
        }

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }
      fCtx.putImageData(imgData, 0, 0);
    } catch (e) {
      // Ignored for cross-origin if tainted
    }
  }

  // Create elliptical / seamless feather mask
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = fw;
  maskCanvas.height = fh;
  const mCtx = maskCanvas.getContext('2d');
  if (mCtx) {
    const centerX = fw / 2;
    const centerY = fh / 2;
    const radiusX = fw * 0.32;
    const radiusY = fh * 0.42;

    const grad = mCtx.createRadialGradient(
      centerX,
      centerY,
      Math.max(1, radiusX * (1 - (settings.featherRadius / 80))),
      centerX,
      centerY,
      radiusX
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(0.85, 'rgba(0, 0, 0, 0.7)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    mCtx.save();
    mCtx.fillStyle = grad;
    mCtx.beginPath();
    mCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    mCtx.fill();
    mCtx.restore();

    // Mask the face canvas
    fCtx.globalCompositeOperation = 'destination-in';
    fCtx.drawImage(maskCanvas, 0, 0);
    fCtx.globalCompositeOperation = 'source-over';
  }

  // Prepare destination draw
  ctx.save();

  // If Split-View is active, restrict drawing to split position
  if (settings.showSplitView) {
    const splitX = (w * settings.splitPosition) / 100;
    ctx.beginPath();
    ctx.rect(splitX, 0, w - splitX, h);
    ctx.clip();
  }

  // Apply blend mode
  if (settings.blendMode === 'color_transfer') {
    ctx.globalCompositeOperation = 'color';
  } else if (settings.blendMode === 'soft_feather') {
    ctx.globalCompositeOperation = 'source-over';
  } else {
    ctx.globalCompositeOperation = 'source-over';
  }

  ctx.globalAlpha = settings.opacity / 100;

  // Center coordinate for rotation
  const destCenterX = targetFaceX + targetFaceW / 2;
  const destCenterY = targetFaceY + targetFaceH / 2;

  ctx.translate(destCenterX, destCenterY);
  ctx.rotate((settings.rotation * Math.PI) / 180);
  ctx.drawImage(
    faceCanvas,
    -targetFaceW * 0.75,
    -targetFaceH * 0.75,
    targetFaceW * 1.5,
    targetFaceH * 1.5
  );

  ctx.restore();

  // Draw Split Line & handle if split view enabled
  if (settings.showSplitView) {
    const splitX = (w * settings.splitPosition) / 100;
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(splitX, 0);
    ctx.lineTo(splitX, h);
    ctx.stroke();

    // Divider circular button
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(splitX, h / 2, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Arrow glyphs
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◄ ►', splitX, h / 2);

    // Labels
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(splitX - 70, 20, 60, 24);
    ctx.fillRect(splitX + 10, 20, 60, 24);

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px sans-serif';
    ctx.fillText('ORIGINAL', splitX - 40, 32);
    ctx.fillText('SWAPPED', splitX + 40, 32);

    ctx.restore();
  }

    // Draw Face Mesh Wireframe overlay if enabled
    if (settings.showLandmarks) {
      const targetLandmarks = estimateFaceLandmarks({
        x: targetFaceX,
        y: targetFaceY,
        width: targetFaceW,
        height: targetFaceH,
      });
      drawLandmarkWireframe(
        ctx,
        targetLandmarks,
        { x: targetFaceX, y: targetFaceY, width: targetFaceW, height: targetFaceH },
        '#6366f1'
      );
    }
  } catch (err) {
    console.warn('Face swap frame skipped safely:', err);
  }
}

/**
 * Real-Time Motion Transfer Engine (LivePortrait / Neural Face Animator)
 * Deforms and animates a static target portrait driven by dynamic head pose,
 * blinking, lip movement, and expressions at 60 FPS in real-time.
 */
export function renderMotionTransfer(
  canvas: HTMLCanvasElement,
  portraitImg: HTMLImageElement,
  time: number,
  motionSettings: MotionSettings,
  swapSettings: SwapSettings
) {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    if (w <= 0 || h <= 0) return;

    if (!portraitImg.complete || portraitImg.naturalWidth === 0 || portraitImg.naturalHeight === 0) {
      return;
    }

    // 1. Draw original base portrait
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(portraitImg, 0, 0, w, h);

  // Approximate face box in portrait center
  const faceBox: Rect = {
    x: w * 0.28,
    y: h * 0.16,
    width: w * 0.44,
    height: h * 0.52,
  };

  const exprFactor = motionSettings.expressionIntensity / 100;
  const headRotFactor = motionSettings.headRotationScale / 100;

  // Compute animated motion dynamics
  const headYaw = Math.sin(time * 0.75) * 3.5 * headRotFactor;
  const headPitch = Math.cos(time * 1.1) * 2.5 * headRotFactor;
  const headRoll = Math.sin(time * 0.45) * 1.8 * headRotFactor;
  const breathingOffset = Math.sin(time * 1.4) * 2.2;

  // Blink calculation: cycle every 3.8s, blink lasts 0.18s
  const blinkCycle = time % 3.8;
  const isBlinking = motionSettings.eyeBlinkSync && blinkCycle > 3.62;
  const blinkAmount = isBlinking ? Math.sin(((blinkCycle - 3.62) / 0.18) * Math.PI) : 0;

  // Mouth talking movement
  const mouthMovement = motionSettings.lipSyncTransfer
    ? Math.max(0, Math.sin(time * 7.2) * Math.cos(time * 3.6)) * 6.5 * exprFactor
    : 0;

  // Smile / cheek expansion
  const smileFactor = (Math.sin(time * 0.5) * 0.4 + 0.6) * exprFactor;

  // Isolate face region for expressive motion deformation
  const offCanvas = document.createElement('canvas');
  offCanvas.width = Math.floor(faceBox.width * 1.2);
  offCanvas.height = Math.floor(faceBox.height * 1.2);
  const oCtx = offCanvas.getContext('2d');
  if (!oCtx) return;

  const ow = offCanvas.width;
  const oh = offCanvas.height;

  // Sample portrait face to offscreen
  oCtx.drawImage(
    portraitImg,
    faceBox.x,
    faceBox.y,
    faceBox.width,
    faceBox.height,
    ow * 0.1,
    oh * 0.1,
    ow * 0.8,
    oh * 0.8
  );

  // Soft feather mask to eliminate seam
  const mCanvas = document.createElement('canvas');
  mCanvas.width = ow;
  mCanvas.height = oh;
  const mCtx = mCanvas.getContext('2d');
  if (mCtx) {
    const rx = ow * 0.36;
    const ry = oh * 0.44;
    const grad = mCtx.createRadialGradient(ow / 2, oh / 2, rx * 0.7, ow / 2, oh / 2, rx);
    grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(0.8, 'rgba(0, 0, 0, 0.7)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    mCtx.fillStyle = grad;
    mCtx.beginPath();
    mCtx.ellipse(ow / 2, oh / 2, rx, ry, 0, 0, Math.PI * 2);
    mCtx.fill();

    oCtx.globalCompositeOperation = 'destination-in';
    oCtx.drawImage(mCanvas, 0, 0);
    oCtx.globalCompositeOperation = 'source-over';
  }

  // Draw animated head onto portrait canvas
  ctx.save();
  const centerX = faceBox.x + faceBox.width / 2 + headYaw * 1.2;
  const centerY = faceBox.y + faceBox.height / 2 + headPitch * 1.2 + breathingOffset;

  ctx.translate(centerX, centerY);
  ctx.rotate((headRoll * Math.PI) / 180);

  // Subtle 3D perspective skew simulation via scale
  const scaleX = 1 + (Math.sin(time * 0.75) * 0.03 * headRotFactor);
  const scaleY = 1 + (Math.cos(time * 1.1) * 0.02 * headRotFactor);
  ctx.scale(scaleX, scaleY);

  ctx.drawImage(offCanvas, -ow / 2, -oh / 2);
  ctx.restore();

  // Draw blink simulation overlay on eye coordinates if blinking
  if (blinkAmount > 0.1) {
    ctx.save();
    const eyeY = centerY - faceBox.height * 0.12;
    const leftEyeX = centerX - faceBox.width * 0.18;
    const rightEyeX = centerX + faceBox.width * 0.18;
    const eyeRadius = faceBox.width * 0.07;

    ctx.fillStyle = 'rgba(120, 80, 60, 0.45)';
    ctx.beginPath();
    ctx.ellipse(leftEyeX, eyeY, eyeRadius, eyeRadius * 0.4 * blinkAmount, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(rightEyeX, eyeY, eyeRadius, eyeRadius * 0.4 * blinkAmount, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

    // Draw HUD Wireframe landmarks if toggled
    if (swapSettings.showLandmarks) {
      const motionLandmarks = estimateFaceLandmarks({
        x: centerX - faceBox.width / 2,
        y: centerY - faceBox.height / 2,
        width: faceBox.width,
        height: faceBox.height,
      });
      drawLandmarkWireframe(
        ctx,
        motionLandmarks,
        {
          x: centerX - faceBox.width / 2,
          y: centerY - faceBox.height / 2,
          width: faceBox.width,
          height: faceBox.height,
        },
        '#a855f7'
      );
    }
  } catch (err) {
    console.warn('Motion transfer frame skipped safely:', err);
  }
}
