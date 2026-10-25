import { computed, inject, onBeforeUnmount, ref, type Ref } from "vue";
import {
  formContextKey,
  type FormValidateResult,
  type FormValidateTrigger,
  type FormValidator,
} from "../components/form/context";

/** 默认在失焦与用户改变值时各校验一次。 */
const DEFAULT_TRIGGERS: readonly FormValidateTrigger[] = ["input", "blur"];

interface UseFieldValidationOptions<Value> {
  /** 读取当前值；校验时调用。 */
  value: () => Value;
  /** 验证函数；省略时字段不参与校验。 */
  validator: () => FormValidator<Value> | undefined;
  /** 触发时机；省略时用默认值 `["input", "blur"]`，传 `[]` 关闭自动校验。 */
  triggers?: () => FormValidateTrigger | readonly FormValidateTrigger[] | undefined;
}

export interface UseFieldValidationReturn {
  /** 最近一次校验是否不通过。 */
  invalid: Ref<boolean>;
  /** 不通过时的错误文案；验证函数返回 `true` 或未校验时为 `undefined`。 */
  message: Ref<string | undefined>;
  /** 立即校验一次，返回是否通过（`true` = 通过）。 */
  validate: (value?: unknown) => boolean;
  /** 清空校验结果，不修改值。 */
  clearValidate: () => void;
  /** 按配置的时机触发校验；该时机未启用时什么也不做。 */
  trigger: (when: FormValidateTrigger, value?: unknown) => void;
}

/**
 * 把验证函数、触发时机与表单级联系统接到一个字段上。
 *
 * 验证函数返回 `false` 表示通过；返回 `true` 或字符串表示不通过，字符串作为错误文案。
 * 挂载在 `Form` 内时会自动注册，`Form` 的 `validate()` 会一起校验。
 */
export function useFieldValidation<Value>(
  options: UseFieldValidationOptions<Value>,
): UseFieldValidationReturn {
  const invalid = ref(false);
  const message = ref<string | undefined>(undefined);
  const form = inject(formContextKey, null);

  const triggers = computed<readonly FormValidateTrigger[]>(() => {
    const configured = options.triggers?.();
    if (configured === undefined) return DEFAULT_TRIGGERS;
    return typeof configured === "string" ? [configured] : configured;
  });

  function clearValidate(): void {
    invalid.value = false;
    message.value = undefined;
  }

  function validate(value?: unknown): boolean {
    const validateValue = options.validator?.();
    if (!validateValue) {
      clearValidate();
      return true;
    }

    let result: FormValidateResult;
    try {
      result = validateValue(value === undefined ? options.value() : (value as Value));
    } catch (error) {
      // 验证函数抛错时按不通过处理，并把异常信息当成错误文案，避免错误被静默吞掉。
      result = error instanceof Error ? error.message : true;
    }

    if (result === false) {
      clearValidate();
      return true;
    }

    invalid.value = true;
    message.value = typeof result === "string" ? result : undefined;
    return false;
  }

  function trigger(when: FormValidateTrigger, value?: unknown): void {
    if (triggers.value.includes(when)) validate(value);
  }

  const handle = { validate, clearValidate };
  if (form) {
    form.register(handle);
    onBeforeUnmount(() => form.unregister(handle));
  }

  return { invalid, message, validate, clearValidate, trigger };
}
