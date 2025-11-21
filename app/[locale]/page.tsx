import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Home() {
  const t = useTranslations('home');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <LanguageSwitcher />
      <main className="w-full max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl p-12 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-bold text-slate-800">
              {t('title')}
            </h1>
            <p className="text-2xl text-slate-600">
              {t('subtitle')}
            </p>
            <p className="text-lg text-slate-500">
              {t('description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-8">
            <Link
              href="/status"
              className="group bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className="text-center space-y-4">
                <div className="text-5xl">📊</div>
                <h2 className="text-3xl font-bold">{t('carriageStatus')}</h2>
                <p className="text-blue-100">
                  {t('carriageStatusDesc')}
                </p>
                <div className="text-sm text-blue-100 opacity-75">
                  → {t('carriageStatusLabel')}
                </div>
              </div>
            </Link>

            <Link
              href="/live-feed"
              className="group bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className="text-center space-y-4">
                <div className="text-5xl">📹</div>
                <h2 className="text-3xl font-bold">{t('liveFeed')}</h2>
                <p className="text-purple-100">
                  {t('liveFeedDesc')}
                </p>
                <div className="text-sm text-purple-100 opacity-75">
                  → {t('liveFeedLabel')}
                </div>
              </div>
            </Link>
          </div>

          <div className="pt-8 text-center text-slate-500 text-sm">
            <p>{t('poweredBy')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
