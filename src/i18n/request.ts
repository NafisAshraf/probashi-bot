import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // Read locale from cookie or default to 'en'
  let locale = "en";
  if (typeof window === "undefined") {
    // On server, try to read from cookies
    const { cookies } = require("next/headers");
    const cookieStore = await cookies();
    locale = (await cookieStore.get("NEXT_LOCALE"))?.value || "en";
  } else {
    // On client, try to read from document.cookie
    locale =
      document.cookie.replace(
        /(?:(?:^|.*;\s*)NEXT_LOCALE\s*\=\s*([^;]*).*$)|^.*$/,
        "$1"
      ) || "en";
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
