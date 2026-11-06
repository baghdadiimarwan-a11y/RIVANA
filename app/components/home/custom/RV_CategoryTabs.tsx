import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { product, type ProductsListSource } from '@salla.sa/twilight-theme-engine/api/product';
import { ProductCard } from '../../product';
import { ScrollCarousel } from '../../common';
import { ProductCardSkeleton } from '@salla.sa/twilight-components-react';
import { useProductCardLayout } from '../../../hooks/useProductCardLayout';

const TYPE_TO_SOURCE: Record<string, ProductsListSource> = {
  category: 'categories',
  most_sales: 'sales',
  latest_products: 'latest',
  chosen_products: 'selected',
  top_rated_products: 'top-rated',
  tag: 'tags',
};

type PickerValue = string | number | { id?: unknown; value?: unknown; key?: unknown } | null | undefined;

export interface RV_CategoryTabItem {
  name?: string;
  title?: string;
  image?: string;
  type?: PickerValue | PickerValue[];
  category?: PickerValue | PickerValue[];
  tag?: PickerValue | PickerValue[];
  chosen_products?: PickerValue | PickerValue[] | { source_value?: PickerValue[] } | null;
  [key: string]: unknown;
}

export interface RV_CategoryTabsData {
  title?: string;
  subtitle?: string;
  tabs_style?: 'text' | 'images' | string;
  products_layout?: 'grid' | 'slider' | string;
  cards_per_view?: number | string;
  limit?: number | string;
  active_color?: string;
  track_color_start?: string;
  track_color_end?: string;
  knob_color?: string;
  bg_color?: string;
  items?: RV_CategoryTabItem[];
  [key: string]: unknown;
}

interface ResolvedTab {
  key: string;
  label: string;
  image?: string;
  source: ProductsListSource;
  sourceValue?: number[];
}

const scalar = (v: unknown): string => {
  if (Array.isArray(v)) return scalar(v[0]);
  if (v && typeof v === 'object') {
    const o = v as { value?: unknown; key?: unknown; id?: unknown };
    return scalar(o.value ?? o.key ?? o.id);
  }
  return v === null || v === undefined ? '' : String(v);
};

const toIds = (v: unknown): number[] => {
  if (v && typeof v === 'object' && !Array.isArray(v) && 'source_value' in v) {
    return toIds((v as { source_value?: unknown }).source_value);
  }
  return (Array.isArray(v) ? v : v === null || v === undefined || v === '' ? [] : [v])
    .map((x) => Number(scalar(x)))
    .filter((id) => Number.isFinite(id) && id > 0);
};

function resolveTab(item: RV_CategoryTabItem, index: number): ResolvedTab {
  const type = scalar(item.type) || 'latest_products';
  const source = TYPE_TO_SOURCE[type] || 'latest';
  const label = (item.name || item.title || '').trim();
  const image = item.image ? String(item.image) : undefined;

  let sourceValue: number[] | undefined;
  if (source === 'selected') {
    sourceValue = toIds(item.chosen_products);
  } else if (source === 'categories') {
    sourceValue = toIds(item.category);
  } else if (source === 'tags') {
    sourceValue = toIds(item.tag);
  }

  return {
    key: `tab-${index}`,
    label,
    image,
    source,
    sourceValue,
  };
}

export function RV_CategoryTabs({ data }: { data: RV_CategoryTabsData }) {
  const { t } = useTranslation();
  const cardLayout = useProductCardLayout();
  const [activeIndex, setActiveIndex] = useState(0);

  const rawItems = useMemo(() => (Array.isArray(data?.items) ? data.items : []), [data?.items]);

  const tabs: ResolvedTab[] = useMemo(() => {
    return rawItems.map((item, idx) => resolveTab(item, idx));
  }, [rawItems]);

  const title = data?.title;
  const subtitle = data?.subtitle;
  const tabsStyle = scalar(data?.tabs_style) || 'text';
  const productsLayout = scalar(data?.products_layout) || 'slider';
  const cardsPerView = Math.max(2, Math.min(6, Number(scalar(data?.cards_per_view)) || 4));
  const limit = Math.max(1, Number(scalar(data?.limit)) || 12);

  const activeColor = data?.active_color || '#1a1a1a';
  const trackStart = data?.track_color_start || '#eac8af';
  const trackEnd = data?.track_color_end || '#5d3320';
  const knobColor = data?.knob_color || '#26443c';
  const bgColor = data?.bg_color;

  const safeActiveIndex = Math.min(activeIndex, Math.max(0, tabs.length - 1));
  const activeTab = tabs[safeActiveIndex];

  const { data: result, isLoading } = useQuery({
    ...product.queries.list({
      source: activeTab?.source,
      sourceValue: activeTab?.sourceValue,
      perPage: limit,
    }),
    enabled: !!activeTab?.source,
  });

  const products = result?.items?.slice(0, limit) || [];

  // Style 1 (Text tabs) underline metrics
  const textContainerRef = useRef<HTMLDivElement>(null);
  const textTabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [textUnderline, setTextUnderline] = useState<{
    left: number;
    width: number;
    ready: boolean;
  }>({
    left: 0,
    width: 0,
    ready: false,
  });

  const updateTextUnderline = useCallback(() => {
    const container = textContainerRef.current;
    const activeEl = textTabRefs.current[safeActiveIndex];
    if (!container || !activeEl) {
      setTextUnderline((prev) => ({ ...prev, ready: false }));
      return;
    }

    const cRect = container.getBoundingClientRect();
    const aRect = activeEl.getBoundingClientRect();

    setTextUnderline({
      left: aRect.left - cRect.left,
      width: aRect.width,
      ready: true,
    });
  }, [safeActiveIndex]);

  useEffect(() => {
    if (tabsStyle !== 'text') return;
    updateTextUnderline();

    const container = textContainerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => updateTextUnderline());
    ro.observe(container);
    window.addEventListener('resize', updateTextUnderline);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateTextUnderline);
    };
  }, [tabsStyle, updateTextUnderline]);

  // Style 2 (Image tabs) indicator metrics
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabElementsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorMetrics, setIndicatorMetrics] = useState<{
    trackLeft: number;
    trackWidth: number;
    knobLeft: number;
    tabCenters: number[];
    ready: boolean;
  }>({
    trackLeft: 0,
    trackWidth: 0,
    knobLeft: 0,
    tabCenters: [],
    ready: false,
  });

  const updateImageMetrics = useCallback(() => {
    const container = tabsContainerRef.current;
    if (!container || tabs.length <= 1) {
      setIndicatorMetrics((prev) => ({ ...prev, ready: false }));
      return;
    }

    const cRect = container.getBoundingClientRect();
    const centers: number[] = [];

    for (let i = 0; i < tabs.length; i++) {
      const el = tabElementsRef.current[i];
      if (!el) return;
      const r = el.getBoundingClientRect();
      centers.push((r.left + r.right) / 2 - cRect.left);
    }

    const minCenter = Math.min(...centers);
    const maxCenter = Math.max(...centers);
    const trackWidth = Math.max(1, maxCenter - minCenter);
    const currentCenter = centers[safeActiveIndex] ?? minCenter;

    setIndicatorMetrics({
      trackLeft: minCenter,
      trackWidth,
      knobLeft: currentCenter,
      tabCenters: centers,
      ready: true,
    });
  }, [tabs.length, safeActiveIndex]);

  useEffect(() => {
    if (tabsStyle !== 'images') return;
    updateImageMetrics();

    const container = tabsContainerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => updateImageMetrics());
    ro.observe(container);
    window.addEventListener('resize', updateImageMetrics);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateImageMetrics);
    };
  }, [tabsStyle, updateImageMetrics]);

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const container = tabsContainerRef.current;
      if (!container || !indicatorMetrics.tabCenters.length) return;
      const cRect = container.getBoundingClientRect();
      const clickX = e.clientX - cRect.left;

      let closestIdx = 0;
      let minDiff = Infinity;
      indicatorMetrics.tabCenters.forEach((cx, idx) => {
        const diff = Math.abs(cx - clickX);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      setActiveIndex(closestIdx);
    },
    [indicatorMetrics.tabCenters]
  );

  if (!tabs.length) return null;

  const slideBasisDesktop = `calc((100% - ${(cardsPerView - 1) * 1.5}rem) / ${cardsPerView})`;

  return (
    <section
      className="s-block rv-category-tabs-block py-10 px-4"
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      <div className="container mx-auto max-w-7xl">
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-neutral-900 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 text-sm sm:text-base text-neutral-500 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Style 1: Text Tabs with Smooth Sliding Underline */}
        {tabsStyle === 'text' && (
          <div className="flex justify-center items-center mb-10 overflow-x-auto no-scrollbar">
            <div
              ref={textContainerRef}
              className="relative inline-flex items-center gap-6 sm:gap-10 pb-1"
            >
              {/* Continuous baseline and smoothly animated sliding indicator */}
              <div dir="ltr" className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 inset-x-0 h-px bg-neutral-200" />
                {textUnderline.ready && (
                  <div
                    className="absolute bottom-0 h-0.5 rounded-full"
                    style={{
                      left: `${textUnderline.left}px`,
                      width: `${textUnderline.width}px`,
                      backgroundColor: activeColor,
                      transition:
                        'left 0.35s cubic-bezier(0.4, 0, 0.2, 1), width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                )}
              </div>

              {tabs.map((tab, idx) => {
                const isActive = idx === safeActiveIndex;
                return (
                  <button
                    key={tab.key}
                    ref={(el) => {
                      textTabRefs.current[idx] = el;
                    }}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className="relative pb-3 text-sm sm:text-base font-medium transition-colors duration-200 outline-none select-none z-10"
                    style={{ color: isActive ? activeColor : '#737373' }}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Style 2: Image Tabs with Smooth Indicator Knob */}
        {tabsStyle === 'images' && (
          <div className="mb-10 flex flex-col items-center">
            <div
              ref={tabsContainerRef}
              className="relative inline-flex flex-col items-center max-w-full"
            >
              <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
                {tabs.map((tab, idx) => {
                  const isActive = idx === safeActiveIndex;
                  return (
                    <button
                      key={tab.key}
                      ref={(el) => {
                        tabElementsRef.current[idx] = el;
                      }}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className="group flex flex-col items-center cursor-pointer transition-transform duration-200 outline-none"
                    >
                      <div
                        className={`w-16 h-10 sm:w-20 sm:h-12 rounded-full overflow-hidden transition-all duration-200 flex items-center justify-center bg-neutral-100 ${
                          isActive ? 'scale-105 shadow-sm' : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{
                          border: isActive
                            ? `1.5px solid ${activeColor}`
                            : '1.5px solid transparent',
                        }}
                      >
                        {tab.image ? (
                          <img
                            src={tab.image}
                            alt={tab.label}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onLoad={updateImageMetrics}
                          />
                        ) : (
                          <div
                            className="w-full h-full"
                            style={{
                              background: `linear-gradient(135deg, ${trackStart}, ${trackEnd})`,
                            }}
                          />
                        )}
                      </div>
                      <span
                        className={`mt-2 text-xs sm:text-sm transition-colors duration-200 ${
                          isActive ? 'font-semibold' : 'text-neutral-600 font-normal'
                        }`}
                        style={isActive ? { color: activeColor } : undefined}
                      >
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {tabs.length > 1 && indicatorMetrics.ready && (
                <div
                  dir="ltr"
                  onClick={handleTrackClick}
                  className="relative w-full h-6 mt-4 cursor-pointer select-none"
                >
                  <div
                    className="absolute top-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      left: `${indicatorMetrics.trackLeft}px`,
                      width: `${indicatorMetrics.trackWidth}px`,
                      height: '3px',
                      background: `linear-gradient(to right, ${trackStart}, ${trackEnd})`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full shadow-md pointer-events-none"
                    style={{
                      left: `${indicatorMetrics.knobLeft}px`,
                      width: '14px',
                      height: '14px',
                      backgroundColor: knobColor,
                      border: '2px solid #ffffff',
                      transition: 'left 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: Math.min(limit, cardsPerView) }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          productsLayout === 'slider' ? (
            <div className="s-products-carousel s-products-carousel--vertical">
              <ScrollCarousel
                prevLabel={t('blocks.home.previous_products', 'Previous products')}
                nextLabel={t('blocks.home.next_products', 'Next products')}
              >
                {products.map((item) => (
                  <div
                    key={item.id}
                    className="shrink-0"
                    style={{
                      flex: `0 0 ${slideBasisDesktop}`,
                      minWidth: '220px',
                    }}
                  >
                    <ProductCard product={item} layout="vertical" />
                  </div>
                ))}
              </ScrollCarousel>
            </div>
          ) : (
            <div
              className="grid grid-cols-2 gap-4 sm:gap-6"
              style={{
                gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, 230px), 1fr))`,
              }}
            >
              {products.map((item) => (
                <ProductCard key={item.id} product={item} layout={cardLayout} />
              ))}
            </div>
          )
        ) : (
          <div className="py-12 text-center text-neutral-400">
            <p className="text-sm sm:text-base">
              {t('blocks.home.no_products_in_tab', 'No products found in this section')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
