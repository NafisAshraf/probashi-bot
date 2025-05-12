import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale();

  function setLocale(newLocale: string) {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 rounded-full border px-1 py-1 text-xs">
      <button
        className={`hover:cursor-pointer px-4 py-2 rounded-full font-bold ${
          locale === "en"
            ? "bg-emerald-700 text-white"
            : "text-gray-700 dark:text-gray-300"
        }`}
        onClick={() => setLocale("en")}
      >
        English
      </button>
      <button
        className={`hover:cursor-pointer px-4 py-2 rounded-full font-bold ${
          locale === "bn"
            ? "bg-emerald-700 text-white"
            : "text-gray-700 dark:text-gray-300"
        }`}
        onClick={() => setLocale("bn")}
      >
        বাংলা
      </button>
    </div>
  );
}

export default LanguageSwitcher;
