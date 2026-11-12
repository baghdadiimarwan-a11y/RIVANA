import { memo, useState, useCallback, useMemo } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';

export interface RV_FAQItem {
  question?: string;
  answer?: string;
  [key: string]: unknown;
}

export interface RV_FAQData {
  subtitle?: string;
  title?: string;
  description?: string;
  button_text?: string;
  button_url?: string;
  show_button?: boolean;
  allow_multiple?: boolean;
  bg_color?: string;
  card_bg_color?: string;
  text_color?: string;
  button_bg_color?: string;
  button_text_color?: string;
  items?: RV_FAQItem[];
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

export const RV_FAQ = memo(function RV_FAQ({ data }: { data: RV_FAQData }) {
  const subtitle = data?.subtitle;
  const title = data?.title;
  const description = data?.description;
  const buttonText = data?.button_text;
  const buttonUrl = data?.button_url || '#';
  const showButton = data?.show_button !== false && Boolean(buttonText);
  const allowMultiple = Boolean(data?.allow_multiple);

  const bgColor = data?.bg_color;
  const cardBgColor = data?.card_bg_color || '#f4efe6';
  const textColor = data?.text_color || '#1c1917';
  const buttonBgColor = data?.button_bg_color || '#1c3f39';
  const buttonTextColor = data?.button_text_color || '#ffffff';

  const items = useMemo(() => {
    return Array.isArray(data?.items) ? data.items.filter((it) => it.question || it.answer) : [];
  }, [data?.items]);

  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleItem = useCallback(
    (index: number) => {
      setOpenIndices((prev) => {
        if (allowMultiple) {
          return prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index];
        }
        return prev.includes(index) ? [] : [index];
      });
    },
    [allowMultiple]
  );

  if (!title && !items.length) {
    return null;
  }

  return (
    <section
      className="s-block rv-faq-block py-10 md:py-16 px-4"
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-16">
          {/* Header Column (Title, Description, Button) */}
          <div className="w-full lg:w-5/12 text-start">
            {subtitle && (
              <p
                className="text-xs sm:text-sm font-medium tracking-wider uppercase mb-2.5"
                style={{ color: textColor, opacity: 0.75 }}
              >
                {subtitle}
              </p>
            )}

            {title && (
              <h2
                className="font-serif italic text-3xl sm:text-4xl md:text-5xl leading-tight font-normal mb-4"
                style={{ color: textColor }}
              >
                {title}
              </h2>
            )}

            {description && (
              <p
                className="text-xs sm:text-sm md:text-base leading-relaxed mb-8 max-w-md"
                style={{ color: textColor, opacity: 0.8 }}
              >
                {description}
              </p>
            )}

            {showButton && buttonText && (
              <Link
                to={buttonUrl}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 shadow-sm"
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

          {/* Accordion Questions Column */}
          <div className="w-full lg:w-7/12 flex flex-col gap-3 sm:gap-3.5">
            {items.map((item, index) => {
              const isOpen = openIndices.includes(index);
              const question = item.question || '';
              const answer = item.answer || '';

              return (
                <div
                  key={index}
                  className="rounded-xl sm:rounded-2xl transition-all duration-300 overflow-hidden"
                  style={{ backgroundColor: cardBgColor }}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(index)}
                    aria-expanded={isOpen}
                    className="w-full py-4 sm:py-5 px-5 sm:px-6 flex items-center justify-between gap-4 text-start outline-none cursor-pointer select-none transition-opacity hover:opacity-90"
                  >
                    <span
                      className="text-sm sm:text-base font-medium leading-snug"
                      style={{ color: textColor }}
                    >
                      {question}
                    </span>
                    <span
                      className="shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-300"
                      style={{
                        color: textColor,
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                      aria-hidden="true"
                    >
                      <svg
                        className="w-4 h-4 stroke-current stroke-2"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M6 9L12 15L18 9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
                        <p
                          className="text-xs sm:text-sm leading-relaxed"
                          style={{ color: textColor, opacity: 0.8 }}
                        >
                          {answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
});

