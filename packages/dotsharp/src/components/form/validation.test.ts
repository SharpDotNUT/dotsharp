import { afterEach, describe, expect, it } from "vite-plus/test";
import { createApp, defineComponent, h, provide, ref, type App, type Ref } from "vue";
import { formContextKey, type FormValidateTrigger, type FormValidator } from "./context";
import {
  useFieldValidation,
  type UseFieldValidationReturn,
} from "../../composables/useFieldValidation";
import {
  useFormValidation,
  type UseFormValidationReturn,
} from "../../composables/useFormValidation";

const apps: App[] = [];

afterEach(() => {
  for (const app of apps.splice(0)) app.unmount();
});

function unmount(app: App): void {
  const index = apps.indexOf(app);
  if (index >= 0) apps.splice(index, 1);
  app.unmount();
}

interface FieldOptions {
  value: Ref<unknown>;
  validator?: FormValidator<unknown>;
  triggers?: FormValidateTrigger | readonly FormValidateTrigger[];
}

function fieldComponent(options: FieldOptions, onSetup: (field: UseFieldValidationReturn) => void) {
  return defineComponent({
    setup() {
      const field = useFieldValidation({
        value: () => options.value.value,
        validator: () => options.validator,
        triggers: () => options.triggers,
      });
      onSetup(field);
      return () => h("div");
    },
  });
}

function mountField(options: FieldOptions): UseFieldValidationReturn {
  let field!: UseFieldValidationReturn;
  const app = createApp(fieldComponent(options, (current) => (field = current)));
  apps.push(app);
  app.mount(document.createElement("div"));
  return field;
}

function mountForm(fieldOptions: FieldOptions[]): {
  app: App;
  form: UseFormValidationReturn;
  fields: UseFieldValidationReturn[];
} {
  let form!: UseFormValidationReturn;
  const fields: UseFieldValidationReturn[] = [];
  const children = fieldOptions.map((options) =>
    fieldComponent(options, (field) => fields.push(field)),
  );

  const Root = defineComponent({
    setup() {
      form = useFormValidation();
      provide(formContextKey, { register: form.register, unregister: form.unregister });
      return () => children.map((child) => h(child));
    },
  });

  const app = createApp(Root);
  apps.push(app);
  app.mount(document.createElement("div"));

  return { app, form, fields };
}

describe("form validation", () => {
  it("treats false as valid and leaves no message", () => {
    const field = mountField({ value: ref("ok"), validator: () => false });
    expect(field.validate()).toBe(true);
    expect(field.invalid.value).toBe(false);
    expect(field.message.value).toBeUndefined();
  });

  it("treats true as invalid without a message", () => {
    const field = mountField({ value: ref("bad"), validator: () => true });
    expect(field.validate()).toBe(false);
    expect(field.invalid.value).toBe(true);
    expect(field.message.value).toBeUndefined();
  });

  it("uses a returned string as the error message", () => {
    const field = mountField({ value: ref("bad"), validator: () => "格式不正确" });
    expect(field.validate()).toBe(false);
    expect(field.invalid.value).toBe(true);
    expect(field.message.value).toBe("格式不正确");
  });

  it("turns a thrown error into an invalid state with its message", () => {
    const field = mountField({
      value: ref("bad"),
      validator: () => {
        throw new Error("boom");
      },
    });
    expect(field.validate()).toBe(false);
    expect(field.invalid.value).toBe(true);
    expect(field.message.value).toBe("boom");
  });

  it("reads the latest value each time it validates", () => {
    const value = ref("ab");
    const field = mountField({
      value,
      validator: (current) => (String(current).length >= 3 ? false : "太短"),
    });
    expect(field.validate()).toBe(false);
    value.value = "abc";
    expect(field.validate()).toBe(true);
    expect(field.invalid.value).toBe(false);
  });

  it("validates with an explicitly passed value", () => {
    const value = ref("");
    const field = mountField({ value, validator: (current) => (current ? false : "必填") });
    expect(field.validate("填了")).toBe(true);
    expect(value.value).toBe("");
  });

  it("triggers on both input and blur by default", () => {
    const field = mountField({ value: ref(""), validator: () => "必填" });
    field.trigger("input");
    expect(field.invalid.value).toBe(true);
    field.clearValidate();
    field.trigger("blur");
    expect(field.invalid.value).toBe(true);
  });

  it("honours a custom trigger configuration", () => {
    const field = mountField({ value: ref(""), validator: () => "必填", triggers: "blur" });
    field.trigger("input");
    expect(field.invalid.value).toBe(false);
    field.trigger("blur");
    expect(field.invalid.value).toBe(true);
  });

  it("disables automatic validation with an empty trigger list", () => {
    const field = mountField({ value: ref(""), validator: () => "必填", triggers: [] });
    field.trigger("input");
    field.trigger("blur");
    expect(field.invalid.value).toBe(false);
    expect(field.validate()).toBe(false);
  });

  it("clears the result without touching the value", () => {
    const value = ref("x");
    const field = mountField({ value, validator: () => "错了" });
    field.validate();
    field.clearValidate();
    expect(field.invalid.value).toBe(false);
    expect(field.message.value).toBeUndefined();
    expect(value.value).toBe("x");
  });

  it("validates every registered field, even after one fails", () => {
    const { form, fields } = mountForm([
      { value: ref(""), validator: () => "第一个不通过" },
      {
        value: ref(""),
        validator: () => {
          throw new Error("第二个也不通过");
        },
      },
    ]);

    expect(form.validate()).toBe(false);
    expect(fields[0]?.message.value).toBe("第一个不通过");
    expect(fields[1]?.message.value).toBe("第二个也不通过");
  });

  it("reports success when all fields pass", () => {
    const { form } = mountForm([
      { value: ref("a"), validator: () => false },
      { value: ref("b"), validator: () => false },
    ]);
    expect(form.validate()).toBe(true);
  });

  it("clears every field", () => {
    const { form, fields } = mountForm([
      { value: ref(""), validator: () => "必填" },
      { value: ref(""), validator: () => "必填" },
    ]);
    form.validate();
    form.clearValidate();
    expect(fields[0]?.invalid.value).toBe(false);
    expect(fields[1]?.invalid.value).toBe(false);
  });

  it("unregisters fields when they unmount", () => {
    const { app, form } = mountForm([{ value: ref(""), validator: () => "必填" }]);
    expect(form.validate()).toBe(false);
    unmount(app);
    expect(form.validate()).toBe(true);
  });
});
