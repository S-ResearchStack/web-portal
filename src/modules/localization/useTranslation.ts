import * as en from "src/assets/i18n/en.json";

export type TranslationId = keyof typeof en;
export const useTranslation = () => {
  const t = (id: TranslationId, params?: object, defaultValue?: string) => {
    let ret = en[id]
    if(params && ret) {
      const entries = Object.entries(params)

      entries.forEach(entry => {
        ret = ret.replace(`$\{${entry[0]}}`, entry[1])
      })

    }
    return ret || defaultValue || id;
  }
  return { t };
}
