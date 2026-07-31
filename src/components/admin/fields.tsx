import { cn } from "@/lib/utils";

const fieldClasses =
  "min-h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 py-2 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20 disabled:bg-herbal-soft disabled:text-herbal-muted read-only:bg-herbal-soft";

type BaseFieldProps = {
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  help?: string;
  label: string;
  name: string;
  readOnly?: boolean;
  required?: boolean;
};

// Shared by admin filter bars and the tanaman / zona / HerbaCode edit forms
// -- previously each defined its own near-identical TextField/TextAreaField/
// SelectField.
export function TextField({
  className,
  defaultValue,
  disabled,
  help,
  label,
  name,
  readOnly,
  required,
  type = "text",
}: BaseFieldProps & { type?: "date" | "search" | "text" }) {
  const helpId = help ? `${name}-help` : undefined;

  return (
    <div className={cn("grid gap-2", className)}>
      <label className="text-sm font-semibold text-herbal-ink" htmlFor={name}>
        {label}
      </label>
      <input
        aria-describedby={helpId}
        className={fieldClasses}
        defaultValue={defaultValue}
        disabled={disabled}
        id={name}
        name={name}
        readOnly={readOnly}
        required={required}
        type={type}
      />
      {help ? (
        <p className="text-xs leading-5 text-herbal-muted" id={helpId}>
          {help}
        </p>
      ) : null}
    </div>
  );
}

export function TextAreaField({
  className,
  defaultValue,
  disabled,
  help,
  label,
  name,
  required,
  rows = 4,
}: BaseFieldProps & { rows?: number }) {
  const helpId = help ? `${name}-help` : undefined;

  return (
    <div className={cn("grid gap-2", className)}>
      <label className="text-sm font-semibold text-herbal-ink" htmlFor={name}>
        {label}
      </label>
      <textarea
        aria-describedby={helpId}
        className={cn(fieldClasses, "min-h-28 resize-y leading-6")}
        defaultValue={defaultValue}
        disabled={disabled}
        id={name}
        name={name}
        required={required}
        rows={rows}
      />
      {help ? (
        <p className="text-xs leading-5 text-herbal-muted" id={helpId}>
          {help}
        </p>
      ) : null}
    </div>
  );
}

type SelectFieldProps<T extends string> = {
  className?: string;
  defaultValue: T;
  disabled?: boolean;
  label: string;
  name: string;
  options: Array<{ label: string; value: T }>;
};

export function SelectField<T extends string>({
  className,
  defaultValue,
  disabled,
  label,
  name,
  options,
}: SelectFieldProps<T>) {
  return (
    <div className={cn("grid gap-2", className)}>
      <label className="text-sm font-semibold text-herbal-ink" htmlFor={name}>
        {label}
      </label>
      <select
        className={fieldClasses}
        defaultValue={defaultValue}
        disabled={disabled}
        id={name}
        name={name}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
