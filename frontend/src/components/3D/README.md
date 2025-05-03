# 3D UroHealth Experience

This directory contains the components for the immersive 3D version of the UroHealth website.

## Running the 3D Version

To run the 3D version locally:

```bash
npm run dev3d
```

This will start the development server on port 3001 with the 3D experience.

## Components

- **ScrollScene.jsx**: Main container for the 3D scene with scroll controls
- **Sections.jsx**: 3D elements for each section (Hero, Services, Contact, Booking)
- **WaveBackground.jsx**: Enhanced wave background effect
- **FloatingParticles.jsx**: Particles that add depth to the scene
- **InteractiveElements.jsx**: Interactive 3D UI elements (buttons, cards, icons)
- **ThreeDHomePage.jsx**: Main component that integrates all 3D elements

## Required Font Files

The 3D components use the following font files which should be placed in the `public/fonts` directory:
- Inter-Bold.woff
- Inter-Regular.woff

## Deployment

To build the 3D version for production:

```bash
npm run build3d
```

This will create a production build in the `dist-3d` directory.

## Fallbacks

The 3D experience includes fallbacks for users with reduced motion preferences or devices with limited performance capabilities.
