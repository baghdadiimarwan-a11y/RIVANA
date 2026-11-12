import { memo, useMemo } from 'react';
import { ScrollCarousel } from '../../common';

export interface RV_InstagramItem {
  image?: string;
  url?: string;
  alt?: string;
  [key: string]: unknown;
}

export interface RV_InstagramFeedData {
  title?: string;
  subtitle?: string;
  instagram_url?: string;
  layout?: 'slider' | 'grid' | string;
  items_per_view?: number | string;
  in_container?: boolean | string | number | { value?: unknown; selected?: unknown };
  show_arrows?: boolean | string | number | { value?: unknown; selected?: unknown };
  bg_color?: string;
  text_color?: string;
  items?: RV_InstagramItem[];
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

const toBool = (val: unknown, fallback = true): boolean => {
  if (val === false || val === 'false' || val === 0 || val === '0') return false;
  if (val === true || val === 'true' || val === 1 || val === '1') return true;
  if (val && typeof val === 'object') {
    const o = val as { value?: unknown; selected?: unknown };
    if ('value' in o) return toBool(o.value, fallback);
    if ('selected' in o) return toBool(o.selected, fallback);
  }
  return fallback;
};

export const RV_InstagramFeed = memo(function RV_InstagramFeed({
  data,
}: {
  data: RV_InstagramFeedData;
}) {
  const title = data?.title;
  const subtitle = data?.subtitle;
  const defaultUrl = data?.instagram_url || 'https://instagram.com';
  const layout = scalar(data?.layout) || 'slider';
  const itemsPerView = Math.max(3, Math.min(6, Number(scalar(data?.items_per_view)) || 6));
  const inContainer = toBool(data?.in_container, true);
  const showArrows = toBool(data?.show_arrows, true);
  const bgColor = data?.bg_color;
  const textColor = data?.text_color || '#1c1917';

  const items = useMemo(() => {
    return Array.isArray(data?.items) ? data.items.filter((it) => it.image) : [];
  }, [data?.items]);

  if (!title && !items.length) {
    return null;
  }

  const slideBasisDesktop = `calc((100% - ${(itemsPerView - 1) * 1}rem) / ${itemsPerView})`;

  const renderItem = (item: RV_InstagramItem, index: number) => {
    const itemUrl = item.url || defaultUrl;
    return (
      <a
        key={index}
        href={itemUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={item.alt || `منشور إنستغرام ${index + 1}`}
        className="group relative block w-full aspect-square sm:aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden bg-neutral-100 shadow-sm cursor-pointer select-none"
      >
        <img
          src={item.image}
          alt={item.alt || `إنستغرام ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Center Instagram Icon Badge */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 shadow-md flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out pointer-events-none text-neutral-900"
          aria-hidden="true"
        >
          <svg
            className="w-5 h-5 fill-none stroke-current stroke-[1.8]"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </div>
      </a>
    );
  };

  return (
    <section
      className="s-block rv-instagram-block py-10 md:py-16"
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      {!showArrows && (
        <style>{`
          .rv-instagram-block .scroll-carousel__nav,
          .rv-instagram-block .scroll-carousel__foot {
            display: none !important;
          }
        `}</style>
      )}

      <div className={inContainer ? 'container mx-auto max-w-7xl px-4' : 'w-full px-2 sm:px-4'}>
        {(title || subtitle) && (
          <div className="text-center mb-8 md:mb-12">
            {title && (
              <h2
                className="font-serif italic text-3xl sm:text-4xl md:text-5xl leading-tight font-normal mb-3"
                style={{ color: textColor }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className="text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto"
                style={{ color: textColor, opacity: 0.75 }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {layout === 'slider' ? (
          <div className="s-products-carousel">
            <ScrollCarousel
              prevLabel="السابق"
              nextLabel="التالي"
            >
              {items.map((item, index) => (
                <div
                  key={index}
                  className="shrink-0"
                  style={{
                    flex: `0 0 ${slideBasisDesktop}`,
                    minWidth: '180px',
                  }}
                >
                  {renderItem(item, index)}
                </div>
              ))}
            </ScrollCarousel>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
            {items.map((item, index) => renderItem(item, index))}
          </div>
        )}
      </div>
    </section>
  );
});
