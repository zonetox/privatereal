import { getRequestConfig } from 'next-intl/server';
import { locales } from '../navigation';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  // If not, we fallback to 'en' to avoid MODULE_NOT_FOUND errors for 'undefined.json'
  const validLocale = (locales.includes(locale as any) ? locale : 'vi') as string;

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  };
});
