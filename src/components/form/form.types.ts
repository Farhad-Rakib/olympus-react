/** A single value produced by a DynamicForm field (inputs, selects, checkboxes). */
export type FormFieldValue = string | number | boolean;

/** Values submitted by a DynamicForm, keyed by field name. */
export type FormValues = Record<string, FormFieldValue>;
