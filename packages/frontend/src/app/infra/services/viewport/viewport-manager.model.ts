export type ViewportSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const viewportSizes: { [K in ViewportSize]: string } = {
  sm: 'only screen and (min-width: 640px) and (max-width: 767px)',
  md: 'only screen and (min-width: 768px) and (max-width: 1023px)',
  lg: 'only screen and (min-width: 1024px) and (max-width: 1279px)',
  xl: 'only screen and (min-width: 1280px) and (max-width: 1535px)',
  '2xl': 'only screen and (min-width: 1536px)',
};
