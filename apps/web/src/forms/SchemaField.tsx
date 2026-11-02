import { useId, useState, type ReactNode } from 'react';

import { Toggle } from '../components/ui';
import type { IssueIndex } from './issues';
import {
  classify,
  defaultValue,
  isPlainObject,
  pickVariant,
  variantLabel,
  withField,
  type FieldKind,
  type JsonSchema,
  type Scalar,
} from './json-schema';
import { fieldLabel, valueLabel } from './labels';

/**
 * Un campo di un modulo, disegnato da quello che dice lo schema (`json-schema.ts`). È ricorsivo:
 * un gruppo contiene campi, una mappa contiene valori, e così via. Non decide niente e non
 * controlla niente: mostra il valore, lo cambia e mostra i problemi che gli arrivano (`issues`,
 * calcolati con lo schema Zod vero).
 *
 * `onChange(undefined)` vuol dire «togli questo campo»: così un campo facoltativo svuotato sparisce
 * invece di restare come testo vuoto.
 */
export interface SchemaFieldProps {
  schema: JsonSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  path: string;
  /** Il nome del campo nello schema: da lui si ricava l'etichetta. */
  name: string;
  /** Per le voci di una mappa o di un elenco, che hanno un nome loro invece di quello dello schema. */
  label?: string;
  required: boolean;
  issues: IssueIndex;
}

const MULTILINE_FIELDS = new Set(['description', 'hint', 'endFrameHint']);

export function SchemaField(props: SchemaFieldProps) {
  const kind = classify(props.schema);
  const label = props.label ?? fieldLabel(props.name);

  switch (kind.kind) {
    case 'switch':
      return (
        <div className="field">
          <Toggle label={label} checked={props.value === true} onChange={props.onChange} />
          <Messages {...props} />
        </div>
      );
    case 'fixed':
      return (
        <p className="hint">
          {label}: {valueLabel(String(kind.value))}
        </p>
      );
    case 'group':
      return (
        <fieldset className="group">
          {label === '' ? null : <legend>{label}</legend>}
          <GroupFields {...props} kind={kind} />
          <Messages {...props} />
        </fieldset>
      );
    case 'map':
      return (
        <fieldset className="group">
          <legend>{label}</legend>
          <MapFields {...props} kind={kind} />
          <Messages {...props} />
        </fieldset>
      );
    case 'list':
      return (
        <fieldset className="group">
          <legend>{label}</legend>
          <ListItems {...props} kind={kind} />
          <Messages {...props} />
        </fieldset>
      );
    case 'variants':
      return <Variants {...props} label={label} variants={kind.variants} />;
    default:
      return (
        <Labelled {...props} label={label}>
          {(id) => <Input {...props} id={id} kind={kind} label={label} />}
        </Labelled>
      );
  }
}

function Messages({ issues, path }: Pick<SchemaFieldProps, 'issues' | 'path'>) {
  return (issues.get(path) ?? []).map((message) => (
    <p key={message} className="field-error" role="alert">
      {message}
    </p>
  ));
}

function Labelled({
  label,
  name,
  children,
  ...rest
}: Pick<SchemaFieldProps, 'issues' | 'path' | 'name'> & {
  label: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className="field" data-invalid={rest.issues.has(rest.path)}>
      <label htmlFor={id}>
        {label}
        {label === name ? null : <span className="tech">{name}</span>}
      </label>
      {children(id)}
      <Messages {...rest} />
    </div>
  );
}

function Input({
  id,
  kind,
  label,
  ...props
}: SchemaFieldProps & { id: string; kind: FieldKind; label: string }) {
  switch (kind.kind) {
    case 'text': {
      const text = typeof props.value === 'string' ? props.value : '';
      const change = (next: string) => {
        props.onChange(next === '' && !props.required ? undefined : next);
      };
      return MULTILINE_FIELDS.has(props.name) ? (
        <textarea
          id={id}
          value={text}
          rows={3}
          onChange={(event) => {
            change(event.target.value);
          }}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={text}
          onChange={(event) => {
            change(event.target.value);
          }}
        />
      );
    }
    case 'number':
      return (
        <input
          id={id}
          type="number"
          step={kind.integer ? 1 : 'any'}
          {...(kind.min === undefined ? {} : { min: kind.min })}
          {...(kind.max === undefined ? {} : { max: kind.max })}
          value={typeof props.value === 'number' ? props.value : ''}
          onChange={(event) => {
            props.onChange(event.target.value === '' ? undefined : Number(event.target.value));
          }}
        />
      );
    case 'choice':
      return (
        <ChoiceInput
          id={id}
          options={kind.options}
          value={props.value}
          required={props.required}
          onChange={props.onChange}
        />
      );
    default:
      return <RawInput id={id} label={label} value={props.value} onChange={props.onChange} />;
  }
}

function ChoiceInput({
  id,
  options,
  value,
  required,
  onChange,
}: {
  id: string;
  options: Scalar[];
  value: unknown;
  required: boolean;
  onChange: (value: unknown) => void;
}) {
  const current = options.find((option) => option === value);
  return (
    <select
      id={id}
      value={current === undefined ? '' : String(current)}
      onChange={(event) => {
        onChange(options.find((option) => String(option) === event.target.value));
      }}
    >
      {required && current !== undefined ? null : <option value="">—</option>}
      {options.map((option) => (
        <option key={String(option)} value={String(option)}>
          {valueLabel(option)}
        </option>
      ))}
    </select>
  );
}

/** Un valore libero (come `quality`): si scrive come JSON e si applica quando si esce dal campo. */
function RawInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const [text, setText] = useState(() => JSON.stringify(value ?? {}, null, 2));
  const [invalid, setInvalid] = useState(false);

  const apply = () => {
    try {
      onChange(JSON.parse(text) as unknown);
      setInvalid(false);
    } catch {
      // Non è JSON: si lascia il testo com'è e si dice cosa non va, senza toccare il valore.
      setInvalid(true);
    }
  };

  return (
    <>
      <textarea
        id={id}
        aria-label={label}
        rows={4}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
        }}
        onBlur={apply}
      />
      {invalid ? (
        <p className="field-error" role="alert">
          Questo non è un valore valido: controlla le parentesi e le virgolette.
        </p>
      ) : null}
    </>
  );
}

function childPath(path: string, key: string | number): string {
  return path === '' ? String(key) : `${path}.${String(key)}`;
}

const COMPOUND = new Set<FieldKind['kind']>(['group', 'map', 'list', 'variants', 'raw']);

function GroupFields({
  kind,
  ...props
}: SchemaFieldProps & { kind: Extract<FieldKind, { kind: 'group' }> }) {
  const current = isPlainObject(props.value) ? props.value : {};

  return kind.fields.map((field) => {
    const fieldValue = current[field.name];
    const optionalCompound = !field.required && COMPOUND.has(classify(field.schema).kind);
    const change = (next: unknown) => {
      props.onChange(withField(current, field.name, next));
    };

    if (optionalCompound && fieldValue === undefined) {
      return (
        <div key={field.name} className="field">
          <span>{fieldLabel(field.name)}</span>
          <button
            type="button"
            className="button"
            onClick={() => {
              change(defaultValue(field.schema));
            }}
          >
            Aggiungi
          </button>
        </div>
      );
    }

    return (
      <div key={field.name}>
        <SchemaField
          schema={field.schema}
          value={fieldValue}
          onChange={change}
          path={childPath(props.path, field.name)}
          name={field.name}
          required={field.required}
          issues={props.issues}
        />
        {optionalCompound ? (
          <button
            type="button"
            className="button"
            onClick={() => {
              change(undefined);
            }}
          >
            Togli {fieldLabel(field.name).toLowerCase()}
          </button>
        ) : null}
      </div>
    );
  });
}

function MapFields({
  kind,
  ...props
}: SchemaFieldProps & { kind: Extract<FieldKind, { kind: 'map' }> }) {
  const current = isPlainObject(props.value) ? props.value : {};
  const [newKey, setNewKey] = useState('');
  const missingKeys = kind.keys?.filter((key) => !(key in current));

  const add = (key: string) => {
    if (key === '' || key in current) return;
    props.onChange(withField(current, key, defaultValue(kind.value)));
    setNewKey('');
  };

  return (
    <>
      {Object.entries(current).map(([key, entry]) => (
        <div key={key} className="entry">
          <SchemaField
            schema={kind.value}
            value={entry}
            onChange={(next) => {
              props.onChange(withField(current, key, next));
            }}
            path={childPath(props.path, key)}
            name={key}
            label={key}
            required
            issues={props.issues}
          />
          <button
            type="button"
            className="button"
            onClick={() => {
              props.onChange(withField(current, key, undefined));
            }}
          >
            Togli {key}
          </button>
        </div>
      ))}
      <div className="actions">
        {missingKeys === undefined ? (
          <input
            type="text"
            aria-label="Nome della nuova voce"
            value={newKey}
            onChange={(event) => {
              setNewKey(event.target.value.trim());
            }}
          />
        ) : (
          <select
            aria-label="Voce da aggiungere"
            value={newKey}
            onChange={(event) => {
              setNewKey(event.target.value);
            }}
          >
            <option value="">—</option>
            {missingKeys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          className="button"
          disabled={newKey === ''}
          onClick={() => {
            add(newKey);
          }}
        >
          Aggiungi
        </button>
      </div>
    </>
  );
}

function ListItems({
  kind,
  ...props
}: SchemaFieldProps & { kind: Extract<FieldKind, { kind: 'list' }> }) {
  const items = Array.isArray(props.value) ? (props.value as unknown[]) : [];

  return (
    <>
      {items.map((item, index) => (
        // L'indice è la chiave giusta: gli elementi non hanno un'identità loro e si tolgono per posto.
        <div key={index} className="entry">
          <SchemaField
            schema={kind.item}
            value={item}
            onChange={(next) => {
              props.onChange(items.map((old, at) => (at === index ? next : old)));
            }}
            path={childPath(props.path, index)}
            name={props.name}
            label={String(index + 1)}
            required
            issues={props.issues}
          />
          <button
            type="button"
            className="button"
            onClick={() => {
              props.onChange(items.filter((_, at) => at !== index));
            }}
          >
            Togli {String(index + 1)}
          </button>
        </div>
      ))}
      <button
        type="button"
        className="button"
        onClick={() => {
          props.onChange([...items, defaultValue(kind.item)]);
        }}
      >
        Aggiungi
      </button>
    </>
  );
}

function Variants({
  variants,
  label,
  ...props
}: SchemaFieldProps & { variants: JsonSchema[]; label: string }) {
  const id = useId();
  const selected = pickVariant(variants, props.value);
  const variant = variants[selected];

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={selected}
        onChange={(event) => {
          const next = variants[Number(event.target.value)];
          if (next !== undefined) props.onChange(defaultValue(next));
        }}
      >
        {variants.map((candidate, index) => (
          <option key={variantLabel(candidate, index)} value={index}>
            {valueLabel(variantLabel(candidate, index))}
          </option>
        ))}
      </select>
      {variant === undefined ? null : <SchemaField {...props} schema={variant} label="" />}
    </div>
  );
}
