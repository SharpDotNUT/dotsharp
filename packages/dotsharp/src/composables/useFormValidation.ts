import type { FormFieldHandle } from "../components/form/context";

export interface UseFormValidationReturn {
  /** 字段挂载时注册；`useFieldValidation` 会自动调用。 */
  register: (field: FormFieldHandle) => void;
  /** 字段卸载时注销。 */
  unregister: (field: FormFieldHandle) => void;
  /** 校验全部字段，返回整体是否通过。 */
  validate: () => boolean;
  /** 清空全部字段的校验结果，不修改值。 */
  clearValidate: () => void;
}

/** 收集字段句柄，提供整张表单的校验入口；由 `Form` 使用并放进 context。 */
export function useFormValidation(): UseFormValidationReturn {
  const fields = new Set<FormFieldHandle>();

  function register(field: FormFieldHandle): void {
    fields.add(field);
  }

  function unregister(field: FormFieldHandle): void {
    fields.delete(field);
  }

  function validate(): boolean {
    let valid = true;
    // 先跑完所有字段，保证每个字段的错误状态都得到更新。
    for (const field of fields) {
      if (!field.validate()) valid = false;
    }
    return valid;
  }

  function clearValidate(): void {
    for (const field of fields) field.clearValidate();
  }

  return { register, unregister, validate, clearValidate };
}
