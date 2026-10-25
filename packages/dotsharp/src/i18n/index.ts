import { computed, readonly, ref, type ComputedRef, type Ref } from "vue";

/**
 * 日期组件的文本。每种语言只描述“怎么说”，月份与星期的名字来自 `Intl`，
 * 所以自定义语言不需要（也不能）手抄一份月名表。
 */
export interface LocaleMessages {
  /** 日期输入框的浮动标签。 */
  date: string;
  /** 输入模式的大标题，例如「Enter date」。 */
  enterDate: string;
  /** 选择模式的标题。 */
  selectDate: string;
  /** 无效日期的错误信息。 */
  invalidDate: string;
  cancel: string;
  ok: string;
  previousMonth: string;
  nextMonth: string;
  chooseMonth: string;
  chooseYear: string;
  /** 日历按钮的无障碍名称。 */
  calendar: string;
}

/** 数字日期的书写顺序：月/日/年、日/月/年、年/月/日。 */
export type DateOrder = "mdy" | "dmy" | "ymd";

export interface LocaleOptions {
  /** 输入框中的数字顺序，默认 `mdy`。 */
  order?: DateOrder;
  /** 一周的第一天，1 = 周一 … 7 = 周日；缺省时使用 `Intl` 的区域周信息。 */
  firstDayOfWeek?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

interface RegisteredLocale {
  messages: LocaleMessages;
  order: DateOrder;
  firstDayOfWeek?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

/** 内置语言：`en`、`zh-Hans`、`zh-Hant`、`ja`。 */
const en: LocaleMessages = {
  date: "Date",
  enterDate: "Enter date",
  selectDate: "Select date",
  invalidDate: "Enter a valid date",
  cancel: "Cancel",
  ok: "OK",
  previousMonth: "Previous month",
  nextMonth: "Next month",
  chooseMonth: "Choose month",
  chooseYear: "Choose year",
  calendar: "Open calendar",
};

const builtins: Record<string, { messages: LocaleMessages; options: LocaleOptions }> = {
  en: { messages: en, options: { order: "mdy" } },
  "zh-Hans": {
    messages: {
      date: "日期",
      enterDate: "输入日期",
      selectDate: "选择日期",
      invalidDate: "请输入有效日期",
      cancel: "取消",
      ok: "确定",
      previousMonth: "上个月",
      nextMonth: "下个月",
      chooseMonth: "选择月份",
      chooseYear: "选择年份",
      calendar: "打开日历",
    },
    options: { order: "ymd" },
  },
  "zh-Hant": {
    messages: {
      date: "日期",
      enterDate: "輸入日期",
      selectDate: "選擇日期",
      invalidDate: "請輸入有效日期",
      cancel: "取消",
      ok: "確定",
      previousMonth: "上個月",
      nextMonth: "下個月",
      chooseMonth: "選擇月份",
      chooseYear: "選擇年份",
      calendar: "開啟日曆",
    },
    options: { order: "ymd" },
  },
  ja: {
    messages: {
      date: "日付",
      enterDate: "日付を入力",
      selectDate: "日付を選択",
      invalidDate: "有効な日付を入力してください",
      cancel: "キャンセル",
      ok: "OK",
      previousMonth: "前月",
      nextMonth: "翌月",
      chooseMonth: "月を選択",
      chooseYear: "年を選択",
      calendar: "カレンダーを開く",
    },
    options: { order: "ymd" },
  },
};

const DEFAULT_LOCALE = "en";

const registry = new Map<string, RegisteredLocale>();

/** 语言代码统一成 `Intl` 的规范拼写（`zh-hant` → `zh-Hant`）；非法代码原样保留。 */
export function canonicalLocale(code: string): string {
  try {
    return Intl.getCanonicalLocales(code)[0] ?? code;
  } catch {
    return code;
  }
}

function entry(code: string): RegisteredLocale {
  const key = canonicalLocale(code);
  const registered = registry.get(key) ?? registry.get(code);
  if (registered) return registered;

  const builtin = builtins[key];
  if (builtin) return { messages: builtin.messages, order: builtin.options.order ?? "mdy" };

  return { messages: en, order: "mdy" };
}

for (const [code, builtin] of Object.entries(builtins)) {
  registry.set(canonicalLocale(code), {
    messages: builtin.messages,
    order: builtin.options.order ?? "mdy",
    firstDayOfWeek: builtin.options.firstDayOfWeek,
  });
}

const locale = ref(DEFAULT_LOCALE);

/** 当前语言代码（只读）；用 `setLocale` 切换。 */
export const currentLocale: Readonly<Ref<string>> = readonly(locale);

function warnUnknown(code: string): void {
  if (typeof console !== "undefined") {
    console.warn(`[dotsharp] Unknown locale "${code}". Register it with registerLocale() first.`);
  }
}

export function isLocaleRegistered(code: string): boolean {
  const key = canonicalLocale(code);
  return registry.has(key);
}

/**
 * 注册（或覆盖）一种语言。`messages` 只需给出想覆盖的字段，其余回退到英文；
 * 月份、星期名仍由 `Intl` 按语言代码生成，因此代码应当是合法的 BCP 47 标签。
 */
export function registerLocale(
  code: string,
  messages: Partial<LocaleMessages> = {},
  options: LocaleOptions = {},
): void {
  const key = canonicalLocale(code);
  const previous = registry.get(key);
  registry.set(key, {
    messages: { ...en, ...previous?.messages, ...messages },
    order: options.order ?? previous?.order ?? "mdy",
    firstDayOfWeek: options.firstDayOfWeek ?? previous?.firstDayOfWeek,
  });
}

/** 切换当前语言；未注册的代码会被忽略并给出警告，返回是否切换成功。 */
export function setLocale(code: string): boolean {
  const key = canonicalLocale(code);
  if (!registry.has(key)) {
    warnUnknown(code);
    return false;
  }
  locale.value = key;
  return true;
}

/** 当前语言下的文本。 */
export function t(key: keyof LocaleMessages): string {
  return entry(locale.value).messages[key];
}

/** 当前语言的数字日期顺序。 */
export function getDateOrder(): DateOrder {
  return entry(locale.value).order;
}

/** 当前语言一周的第一天（1 = 周一 … 7 = 周日）。 */
export function getFirstDayOfWeek(): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const fixed = entry(locale.value).firstDayOfWeek;
  if (fixed) return fixed;
  return intlFirstDayOfWeek(locale.value) ?? 7;
}

/** 把语言代码交给 `Intl` 用；非法代码回退到 `en`。 */
export function intlLocale(code: string): string {
  try {
    return Intl.getCanonicalLocales(code)[0] ?? DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

/**
 * 从 `Intl.Locale` 的区域周信息里取一周的第一天。该 API 在不同引擎里叫
 * `weekInfo` 或 `getWeekInfo`，也可能不存在，因此都探测一遍。
 */
function intlFirstDayOfWeek(code: string): 1 | 2 | 3 | 4 | 5 | 6 | 7 | undefined {
  try {
    const intl = new Intl.Locale(intlLocale(code)) as Intl.Locale & {
      weekInfo?: { firstDay?: number };
      getWeekInfo?: () => { firstDay?: number };
    };
    const info = intl.weekInfo ?? intl.getWeekInfo?.();
    const first = info?.firstDay;
    if (first === 1 || first === 2 || first === 3 || first === 4 || first === 5 || first === 6) {
      return first;
    }
    if (first === 7) return 7;
  } catch {
    // 忽略：回退到周日。
  }
  return undefined;
}

interface TagParts {
  language?: string;
  script?: string;
  region?: string;
}

/** 用 `Intl.Locale.maximize()` 补全语言标签，让 `zh-TW` 得到 `zh-Hant`。 */
function tagParts(tag: string): TagParts | null {
  try {
    const intl = new Intl.Locale(tag);
    const max = typeof intl.maximize === "function" ? intl.maximize() : intl;
    return {
      language: max.language,
      script: max.script,
      region: max.region,
    };
  } catch {
    return null;
  }
}

function browserLocales(): readonly string[] {
  if (typeof navigator === "undefined") return [];
  return navigator.languages ?? (navigator.language ? [navigator.language] : []);
}

/**
 * 在 `supported` 里为浏览器（或显式给出的 `requested`）语言挑一个最合适的代码。
 * 先用 `Intl` 规范化并补全标签，再按 完整匹配 → 同语言同书写系统 → 同语言同地区 →
 * 同语言唯一候选 的顺序匹配；没有候选时返回 `undefined`，由调用方决定回退。
 *
 * 这与 `Intl.DateTimeFormat.supportedLocalesOf` 的 localeMatcher 思路一致，
 * 但只针对组件库自己登记的语言，而不是 `Intl` 支持的完整列表。
 */
export function matchLocale(
  supported: readonly string[],
  requested: readonly string[] = browserLocales(),
): string | undefined {
  if (!supported.length) return undefined;

  const pool = supported.map((code) => ({
    code,
    canonical: canonicalLocale(code),
    parts: tagParts(canonicalLocale(code)),
  }));

  const wanted = requested.map(canonicalLocale);

  for (const tag of wanted) {
    const exact = pool.find((candidate) => candidate.canonical === tag);
    if (exact) return exact.code;
  }

  for (const tag of wanted) {
    const want = tagParts(tag);
    if (!want) continue;

    const sameScript = pool.find(
      (candidate) =>
        candidate.parts?.language === want.language &&
        candidate.parts?.script &&
        candidate.parts.script === want.script,
    );
    if (sameScript) return sameScript.code;

    const sameRegion = pool.find(
      (candidate) =>
        candidate.parts?.language === want.language &&
        candidate.parts?.region &&
        candidate.parts.region === want.region,
    );
    if (sameRegion) return sameRegion.code;

    const sameLanguage = pool.filter((candidate) => candidate.parts?.language === want.language);
    if (sameLanguage.length === 1) return sameLanguage[0]!.code;
    if (sameLanguage.length > 1) {
      const withScript = sameLanguage.find((candidate) => candidate.parts?.script === want.script);
      return (withScript ?? sameLanguage[0])!.code;
    }
  }

  return undefined;
}

export interface UseI18nReturn {
  /** 当前语言代码。 */
  locale: Readonly<Ref<string>>;
  /** 交给 `Intl` 的语言代码（总是合法标签）。 */
  intlLocale: ComputedRef<string>;
  /** 数字日期顺序。 */
  order: ComputedRef<DateOrder>;
  /** 一周的第一天，1 = 周一 … 7 = 周日。 */
  firstDayOfWeek: ComputedRef<1 | 2 | 3 | 4 | 5 | 6 | 7>;
  setLocale: typeof setLocale;
  registerLocale: typeof registerLocale;
  t: typeof t;
  matchLocale: typeof matchLocale;
}

/** 组件库内部的国际化入口；状态是模块级单例，与 `useTheme` 相同。 */
export function useI18n(): UseI18nReturn {
  return {
    locale: currentLocale,
    intlLocale: computed(() => intlLocale(locale.value)),
    order: computed(() => getDateOrder()),
    firstDayOfWeek: computed(() => getFirstDayOfWeek()),
    setLocale,
    registerLocale,
    t,
    matchLocale,
  };
}
