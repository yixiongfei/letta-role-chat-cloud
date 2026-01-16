import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display';

// 注册 PIXI 到全局，pixi-live2d-display 需要它
(window as any).PIXI = PIXI;

interface Live2DModelProps {
  modelUrl: string;
  width?: number;
  height?: number;
}

export const Live2DModelView: React.FC<Live2DModelProps> = ({ 
  modelUrl, 
  width = 400, 
  height = 400 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const modelRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 初始化 PIXI Application
    const app = new PIXI.Application({
      view: canvasRef.current,
      width: width,
      height: height,
      backgroundAlpha: 0,
      antialias: true,
    });
    appRef.current = app;

    // 加载模型
    const loadModel = async () => {
      try {
        const model = await Live2DModel.from(modelUrl);
        modelRef.current = model;
        
        app.stage.addChild(model);

        // 调整模型大小和位置
        const scale = Math.min(width / model.width, height / model.height) * 0.8;
        model.scale.set(scale);
        model.anchor.set(0.5, 0.5);
        model.x = width / 2;
        model.y = height / 2;

        // 简单的交互
        model.on('hit', (hitAreas: string[]) => {
          if (hitAreas.includes('body')) {
            model.motion('tap_body');
          }
        });

      } catch (error) {
        console.error('Failed to load Live2D model:', error);
      }
    };

    loadModel();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
      }
    };
  }, [modelUrl, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width: '100%', height: '100%', maxWidth: width, maxHeight: height }}
    />
  );
};
