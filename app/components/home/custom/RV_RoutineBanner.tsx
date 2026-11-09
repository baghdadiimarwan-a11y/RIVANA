import { memo } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { SquiggleUnderline } from '../../common/SquiggleUnderline';

export interface RV_RoutineBannerData {
  subtitle?: string;
  title?: string;
  highlight_word?: string;
  description?: string;
  button_text?: string;
  button_url?: string;
  image?: string;
  image_position?: 'right' | 'left' | string;
  bg_color?: string;
  text_color?: string;
  accent_color?: string;
  button_bg_color?: string;
  button_text_color?: string;
  [key: string]: unknown;
}

const scalar = (v: unknown): string => {
  if (Array.isArray(v)) return scalar(v[0]);
  if (v && typeof v === 'object') {
    const o = v as { value?: unknown; key?: unknown; id?: unknown };
    return scalar(o.value ?? o.key ?? o.id);
  }
  return v === null || v === undefined ? '' : String(v);
};

export const RV_RoutineBanner = memo(function RV_RoutineBanner({
  data,
}: {
  data: RV_RoutineBannerData;
}) {
  const subtitle = data?.subtitle;
  const title = data?.title;
  const highlightWord = (data?.highlight_word || '').trim();
  const description = data?.description;
  const buttonText = data?.button_text;
  const buttonUrl = data?.button_url || '#';
  const image = data?.image || '/images/routine-banner.jpg';
  const imagePosition = scalar(data?.image_position) || 'right';

  const bgColor = data?.bg_color || '#f4efe6';
  const textColor = data?.text_color || '#1c1917';
  const accentColor = data?.accent_color || '#f2a900';
  const buttonBgColor = data?.button_bg_color || '#1c3f39';
  const buttonTextColor = data?.button_text_color || '#ffffff';

  if (!title && !description && !image && !buttonText) {
    return null;
  }

  const renderTitle = () => {
    if (!title) return null;
    if (!highlightWord || !title.toLowerCase().includes(highlightWord.toLowerCase())) {
      return (
        <h2
          className="font-serif italic text-3xl sm:text-4xl md:text-5xl lg:text-[44px] leading-tight font-normal"
          style={{ color: textColor }}
        >
          {title}
        </h2>
      );
    }

    const regex = new RegExp(`(${highlightWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = title.split(regex);

    return (
      <h2
        className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[44px] leading-tight font-normal"
        style={{ color: textColor }}
      >
        {parts.map((part, index) => {
          if (part.toLowerCase() === highlightWord.toLowerCase()) {
            return (
              <span key={index} className="relative inline-block italic font-normal">
                {part}
                <span className="absolute left-0 -bottom-2.5 sm:-bottom-3.5 w-full pointer-events-none">
                  <SquiggleUnderline color={accentColor} />
                </span>
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </h2>
    );
  };

  const isImageLeft = imagePosition === 'left';

  return (
    <section className="s-block rv-routine-banner py-8 md:py-14 px-4">
      <div className="container mx-auto max-w-7xl">
        <div
          className={`rounded-2xl md:rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row items-stretch ${
            isImageLeft ? 'md:flex-row-reverse' : ''
          }`}
          style={{ backgroundColor: bgColor }}
        >
          {/* Content Column */}
          <div className="w-full md:w-1/2 p-8 sm:p-12 md:p-14 lg:p-20 flex flex-col items-center justify-center text-center">
            {subtitle && (
              <p
                className="text-xs sm:text-sm font-medium tracking-wider uppercase mb-2.5"
                style={{ color: textColor, opacity: 0.75 }}
              >
                {subtitle}
              </p>
            )}

            <div className="mb-4">{renderTitle()}</div>

            {description && (
              <p
                className="text-xs sm:text-sm md:text-base leading-relaxed max-w-md mx-auto mb-8"
                style={{ color: textColor, opacity: 0.8 }}
              >
                {description}
              </p>
            )}

            {buttonText && (
              <Link
                to={buttonUrl}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-medium tracking-wide transition-all duration-300"
                style={{
                  borderColor: buttonBgColor,
                  borderWidth: '1.5px',
                  borderStyle: 'solid',
                  backgroundColor: '#ffffff',
                  color: buttonBgColor,
                }}
              >
                {/* Background layer text (visible on hover) */}
                <span className="font-semibold transition-colors duration-300 select-none">
                  {buttonText}
                </span>

                {/* Sliding wave layer (normal solid state, slides up on hover) */}
                <div
                  className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out group-hover:-translate-y-full"
                  style={{
                    backgroundColor: buttonBgColor,
                    color: buttonTextColor,
                  }}
                >
                  <span className="font-semibold select-none">{buttonText}</span>
                  {/* Wave edge at the bottom */}
                  <svg
                    className="absolute top-full left-0 w-full h-3 sm:h-4 fill-current pointer-events-none"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                    style={{ color: buttonBgColor }}
                    aria-hidden="true"
                  >
                    <path d="M0 0 C 30 18, 70 4, 100 14 L100 0 L0 0 Z" />
                  </svg>
                </div>
              </Link>
            )}
          </div>

          {/* Image Column */}
          <div className="w-full md:w-1/2 min-h-[280px] sm:min-h-[360px] md:min-h-[440px] relative">
            {image && (
              <img
                src={image}
                alt={title || subtitle || 'Routine Banner'}
                className="absolute inset-0 w-full h-full object-cover object-center"
                loading="lazy"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

