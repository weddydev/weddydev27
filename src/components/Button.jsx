/* Luxury button: gold (filled, shimmering) or ghost (fills with gold on hover), magnetic on desktop */
import { useRef } from 'react';
import { useMagnetic } from './hooks.js';

export default function Button({ as: Tag = 'button', variant = 'gold', size = '', cursor, className = '', children, ...rest }) {
  const ref = useRef(null);
  useMagnetic(ref);
  const props = Tag === 'button' ? { type: 'button', ...rest } : rest;
  return (
    <Tag ref={ref} data-cursor={cursor} className={`btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${className}`} {...props}>
      <span>{children}</span>
    </Tag>
  );
}
