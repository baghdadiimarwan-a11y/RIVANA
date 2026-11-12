import { memo, useMemo } from 'react';

export interface RV_StoreFeatureItem {
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
  url?: string;
  [key: string]: unknown;
}

export interface RV_StoreFeaturesData {
  columns?: number | string;
  media_type?: 'icon' | 'image' | string;
  image_size?: 'small' | 'medium' | 'large' | string;
  bg_color?: string;
  text_color?: string;
  icon_color?: string;
  items?: RV_StoreFeatureItem[];
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

const ScallopedBadge = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
    <svg className="w-full h-full fill-[#c7e2c5]" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 2 C35 2 37 4.5 39.5 5.5 C42 6.5 45 6 47 7.5 C49 9 50.5 11.5 52 13.5 C53.5 15.5 55.5 17 56.5 19.5 C57.5 22 57.5 25 58 27.5 C58.5 30 60.5 31.5 60.5 34 C60.5 36.5 58.5 38 58 40.5 C57.5 43 57.5 46 56.5 48.5 C55.5 51 53.5 52.5 52 54.5 C50.5 56.5 49 59 47 60.5 C45 62 42 61.5 39.5 62.5 C37 63.5 35 66 32 66 C29 66 27 63.5 24.5 62.5 C22 61.5 19 62 17 60.5 C15 59 13.5 56.5 12 54.5 C10.5 52.5 8.5 51 7.5 48.5 C6.5 46 6.5 43 6 40.5 C5.5 38 3.5 36.5 3.5 34 C3.5 31.5 5.5 30 6 27.5 C6.5 25 6.5 22 7.5 19.5 C8.5 17 10.5 15.5 12 13.5 C13.5 11.5 15 9 17 7.5 C19 6 22 6.5 24.5 5.5 C27 4.5 29 2 32 2 Z" />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center text-neutral-800">
      {children}
    </div>
  </div>
);

const FeatureMedia = ({
  icon,
  image,
  mediaType = 'icon',
  imageSize = 'medium',
  className = '',
}: {
  icon?: string;
  image?: string;
  mediaType?: string;
  imageSize?: string;
  className?: string;
}) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16 sm:w-20 sm:h-20',
    large: 'w-20 h-20 sm:w-24 sm:h-24',
  }[imageSize] || 'w-16 h-16 sm:w-20 sm:h-20';

  // If a custom image is provided or mediaType is set to 'image' and image exists
  if (image) {
    return (
      <img
        src={image}
        alt=""
        className={`${sizeClasses} object-contain transition-transform duration-300 group-hover:scale-105 ${className}`}
        loading="lazy"
      />
    );
  }

  const iconKey = (icon || '').toLowerCase();

  // Beauty Badge Styles (scalloped rosettes from the design)
  if (iconKey === 'cruelty_free' || iconKey === 'cruelty-free' || iconKey === 'rabbit') {
    return (
      <ScallopedBadge>
        <svg
          className="w-7 h-7 stroke-current fill-none stroke-[1.8]"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 3c-1 0-2 2-2 4 0 3 1.5 4 2 5" />
          <path d="M16 3c1 0 2 2 2 4 0 3-1.5 4-2 5" />
          <path d="M12 11c-3.5 0-6 2.5-6 6 0 2.5 2.5 4 6 4s6-1.5 6-4c0-3.5-2.5-6-6-6z" />
          <circle cx="10" cy="15" r="0.8" fill="currentColor" />
          <circle cx="14" cy="15" r="0.8" fill="currentColor" />
          <path d="M11 17.5c.5.5 1.5.5 2 0" />
        </svg>
      </ScallopedBadge>
    );
  }

  if (iconKey === 'paraben_free' || iconKey === 'paraben-free' || iconKey === 'clean') {
    return (
      <ScallopedBadge>
        <svg
          className="w-7 h-7 stroke-current fill-none stroke-[1.8]"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 2v5l-4.5 7.5c-1 1.7.2 3.5 2.2 3.5h8.6c2 0 3.2-1.8 2.2-3.5L14 7V2" />
          <line x1="8" y1="2" x2="16" y2="2" />
          <line x1="8.5" y1="12" x2="15.5" y2="12" />
          <circle cx="12" cy="15.5" r="1" fill="currentColor" />
        </svg>
      </ScallopedBadge>
    );
  }

  if (iconKey === 'earth_conscious' || iconKey === 'earth-conscious' || iconKey === 'leaves') {
    return (
      <ScallopedBadge>
        <svg
          className="w-7 h-7 stroke-current fill-none stroke-[1.8]"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 20A7 7 0 0 1 4 13C4 7 11 3 11 3s7 4 7 10a7 7 0 0 1-7 7z" />
          <path d="M11 20V10" />
          <path d="M15 16a4 4 0 0 0 5-4c0-4-5-6-5-6" />
        </svg>
      </ScallopedBadge>
    );
  }

  // Classic Minimal Line Icons
  switch (iconKey) {
    case 'badge':
    case 'guarantee':
    case 'return':
      return (
        <svg
          className={`w-9 h-9 stroke-current fill-none stroke-[1.6] ${className}`}
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2l2.4 2.4 3.4-.4 1.4 3.1 3.1 1.4-.4 3.4 2.4 2.4-2.4 2.4.4 3.4-3.1 1.4-1.4 3.1-3.4-.4L12 22l-2.4-2.4-3.4.4-1.4-3.1-3.1-1.4.4-3.4L-1 12l2.4-2.4-.4-3.4 3.1-1.4 1.4-3.1 3.4.4L12 2z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );

    case 'support':
    case 'chat':
    case 'online':
      return (
        <svg
          className={`w-9 h-9 stroke-current fill-none stroke-[1.6] ${className}`}
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          <circle cx="8" cy="12" r="0.7" fill="currentColor" />
          <circle cx="12" cy="12" r="0.7" fill="currentColor" />
          <circle cx="16" cy="12" r="0.7" fill="currentColor" />
        </svg>
      );

    case 'shield':
    case 'security':
      return (
        <svg
          className={`w-9 h-9 stroke-current fill-none stroke-[1.6] ${className}`}
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );

    case 'box':
    case 'shipping':
    default:
      return (
        <svg
          className={`w-9 h-9 stroke-current fill-none stroke-[1.6] ${className}`}
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
  }
};

export const RV_StoreFeatures = memo(function RV_StoreFeatures({
  data,
}: {
  data: RV_StoreFeaturesData;
}) {
  const columns = Number(scalar(data?.columns)) || 3;
  const mediaType = scalar(data?.media_type) || 'icon';
  const imageSize = scalar(data?.image_size) || 'medium';
  const bgColor = data?.bg_color;
  const textColor = data?.text_color || '#1c1917';
  const iconColor = data?.icon_color || '#1c1917';

  const items = useMemo(() => {
    return Array.isArray(data?.items) ? data.items.filter((it) => it.title || it.description) : [];
  }, [data?.items]);

  if (!items.length) {
    return null;
  }

  const gridColsClass =
    columns === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-1 md:grid-cols-3';

  return (
    <section
      className="s-block rv-store-features-block py-12 md:py-20 px-4"
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      <div className="container mx-auto max-w-7xl">
        <div className={`grid ${gridColsClass} gap-10 md:gap-12 lg:gap-16 justify-items-center`}>
          {items.map((item, index) => {
            const ComponentTag = item.url ? 'a' : 'div';
            const linkProps = item.url
              ? {
                  href: item.url,
                  target: item.url.startsWith('http') ? '_blank' : undefined,
                  rel: item.url.startsWith('http') ? 'noopener noreferrer' : undefined,
                }
              : {};

            return (
              <ComponentTag
                key={index}
                {...linkProps}
                className="flex flex-col items-center text-center max-w-xs group cursor-default transition-transform duration-300 hover:-translate-y-1"
              >
                {/* Media Icon or Image */}
                <div
                  className="mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                  style={{ color: iconColor }}
                >
                  <FeatureMedia
                    icon={scalar(item.icon)}
                    image={item.image}
                    mediaType={mediaType}
                    imageSize={imageSize}
                  />
                </div>

                {/* Title */}
                {item.title && (
                  <h3
                    className="font-serif italic font-normal text-lg sm:text-xl md:text-2xl leading-snug mb-2"
                    style={{ color: textColor }}
                  >
                    {item.title}
                  </h3>
                )}

                {/* Description */}
                {item.description && (
                  <p
                    className="text-xs sm:text-sm leading-relaxed"
                    style={{ color: textColor, opacity: 0.75 }}
                  >
                    {item.description}
                  </p>
                )}
              </ComponentTag>
            );
          })}
        </div>
      </div>
    </section>
  );
});
