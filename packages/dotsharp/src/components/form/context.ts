import type { ComputedRef, InjectionKey } from "vue";

/**
 * 验证函数的返回值：
 * - `false`：通过，外观不变（本库没有“正确”样式）；
 * - `true`：不通过，只显示错误状态，没有错误文案；
 * - `string`：不通过，字符串就是错误提示。
 */
export type FormValidateResult = boolean | string;

/** 表单校验函数：接收当前值，返回 `FormValidateResult`。 */
export type FormValidator<Value = unknown> = (value: Value) => FormValidateResult;

/** 自动校验的时机：`input` 在用户改变值时，`blur` 在失焦时。 */
export type FormValidateTrigger = "input" | "blur";

/** 字段交给 `Form` 的句柄；`validate()` 返回是否通过（`true` = 通过）。 */
export interface FormFieldHandle {
  validate: () => boolean;
  clearValidate: () => void;
}

export interface FormContext {
  register: (field: FormFieldHandle) => void;
  unregister: (field: FormFieldHandle) => void;
}

export interface FormItemContext {
  /** `FormItem` 标签元素的 `id`；没有渲染标签时为 `undefined`。 */
  labelId: ComputedRef<string | undefined>;
  /** `FormItem` 的 `required`，字段可据此补充 `aria-required`。 */
  required: ComputedRef<boolean>;
}

export const formContextKey: InjectionKey<FormContext> = Symbol("dotsharp-form");

export const formItemContextKey: InjectionKey<FormItemContext> = Symbol("dotsharp-form-item");
