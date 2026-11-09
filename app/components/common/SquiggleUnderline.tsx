import { memo } from 'react';

export interface SquiggleUnderlineProps {
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const SquiggleUnderline = memo(function SquiggleUnderline({
  color = '#f2a900',
  className = '',
  style,
}: SquiggleUnderlineProps) {
  return (
    <>
      <svg className="sr-only" aria-hidden="true" width="0" height="0">
        <defs>
          <g id="squiggle-svg-3">
            <path
              d="M3 16.5C46 10 112 6.5 183 9M162 12.5C125 15 54 18 34 19M75 21.5C98 20.5 124 19.5 146 18.5"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </defs>
      </svg>
      <svg
        viewBox="0 0 186 24"
        fill="none"
        className={`squiggle-svg animate block w-full h-auto ${className}`}
        style={{ color, ...style }}
        aria-hidden="true"
      >
        <use href="#squiggle-svg-3" />
      </svg>
    </>
  );
});

