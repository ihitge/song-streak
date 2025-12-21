import React from 'react';

export { InsetShadowOverlay } from './InsetShadowOverlay.web';
export { SurfaceTextureOverlay } from './SurfaceTextureOverlay.web';
export { GlassOverlay } from './GlassOverlay.web';

// These components also need web versions, but for now export empty placeholders
// to prevent import errors. They can be implemented if needed.
export const InsetWell: React.FC<any> = () => null;
export const RaisedCap: React.FC<any> = () => null;
export const LEDIndicator: React.FC<any> = () => null;
