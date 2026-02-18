import React, { useState } from 'react';

const DOODLE_BASE = '/doodles';

/**
 * Loads an image from public/doodles. Tries .png then .svg.
 * Use images from external sources (unDraw, Noun Project, Adobe Stock, etc.) — see public/doodles/README.md.
 */
function useDoodleSrc(baseName) {
  const [src, setSrc] = useState(`${DOODLE_BASE}/${baseName}.png`);
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    if (src.endsWith('.png')) {
      setSrc(`${DOODLE_BASE}/${baseName}.svg`);
    } else {
      setFailed(true);
    }
  };

  return { src, failed, onError: handleError };
}

/** Main dog illustration (hero card, dashboard). Add dog-main.png or dog-main.svg to public/doodles/. */
export function DogDoodleMain({ className = '', ...props }) {
  const { src, failed, onError } = useDoodleSrc('dog-main');
  if (failed) return null;
  return (
    <img
      src={src}
      alt=""
      className={className}
      onError={onError}
      aria-hidden
      {...props}
    />
  );
}

/** Small peeking dog. Add dog-peek.png or dog-peek.svg to public/doodles/. */
export function DogDoodlePeek({ className = '', ...props }) {
  const { src, failed, onError } = useDoodleSrc('dog-peek');
  if (failed) return null;
  return (
    <img
      src={src}
      alt=""
      className={className}
      onError={onError}
      aria-hidden
      {...props}
    />
  );
}

/** Two dogs / buddies illustration (Why card). Add dog-buddies.png or dog-buddies.svg to public/doodles/. */
export function DogDoodleBuddies({ className = '', ...props }) {
  const { src, failed, onError } = useDoodleSrc('dog-buddies');
  if (failed) return null;
  return (
    <img
      src={src}
      alt=""
      className={className}
      onError={onError}
      aria-hidden
      {...props}
    />
  );
}
