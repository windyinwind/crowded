'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as string;

  const switchLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-2 py-2 flex gap-2">
        <button
          onClick={() => switchLanguage('ja')}
          className={`
            px-4 py-2 rounded-full font-medium transition-all
            ${currentLocale === 'ja'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
            }
          `}
        >
          🇯🇵 日本語
        </button>
        <button
          onClick={() => switchLanguage('en')}
          className={`
            px-4 py-2 rounded-full font-medium transition-all
            ${currentLocale === 'en'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
            }
          `}
        >
          🇬🇧 English
        </button>
      </div>
    </div>
  );
}
