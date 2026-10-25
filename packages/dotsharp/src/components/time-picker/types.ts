import type { TimeFormat } from "../../i18n";

/** 时钟格式与国际化共用同一套定义，从包入口一并导出。 */
export type { TimeFormat };

/** 一天中的某个时刻：小时 0–23，分钟 0–59；`second` 只在启用秒时出现。 */
export interface TimeValue {
  hour: number;
  minute: number;
  second?: number;
}
