import type { ConfigIssue, TroupeConfigData } from '@filmzy/contracts';
import { useState, type ReactNode } from 'react';

import { IssueList, Panel } from '../../components/ui';
import { SchemaField } from '../../forms/SchemaField';
import { validate } from '../../forms/issues';
import { classify, formSchemaOf } from '../../forms/json-schema';
import { splitIssues, type Item, type SectionDef } from './sections';

interface RowProps {
  item: Item;
  open: boolean;
  issues: readonly ConfigIssue[];
  extra?: ReactNode;
  onToggle: () => void;
  onChange: (value: unknown) => void;
  onRemove: () => void;
}

function ItemRow({ item, open, issues, extra, onToggle, onChange, onRemove }: RowProps) {
  const form = formSchemaOf(item.schema);
  // I campi sbagliati si segnano solo nella voce aperta: sono quelli che si stanno scrivendo.
  const fieldIssues = open ? validate(item.schema, item.value) : new Map<string, string[]>();

  return (
    <div className="row" data-open={open}>
      <div className="row-head">
        <p>{item.summary}</p>
        <button type="button" className="button" aria-expanded={open} onClick={onToggle}>
          {open ? 'Chiudi' : 'Modifica'}
        </button>
      </div>
      {extra}
      <IssueList issues={issues} />
      {open ? (
        <div className="row-form">
          <SchemaField
            schema={form}
            value={item.value}
            onChange={onChange}
            path=""
            name=""
            label={classify(form).kind === 'variants' ? 'Tipo' : ''}
            required
            issues={fieldIssues}
          />
          {item.removable ? (
            <button type="button" className="button" data-kind="danger" onClick={onRemove}>
              Togli questa voce
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function AddForm({
  section,
  onAdd,
}: {
  section: SectionDef;
  onAdd: (targetIndex: number, name: string) => void;
}) {
  const [target, setTarget] = useState(0);
  const [name, setName] = useState('');
  if (section.addTargets.length === 0) return null;

  return (
    <div className="actions">
      {section.addTargets.length > 1 ? (
        <select
          aria-label="Che cosa aggiungere"
          value={target}
          onChange={(event) => {
            setTarget(Number(event.target.value));
          }}
        >
          {section.addTargets.map((candidate, index) => (
            <option key={candidate.label} value={index}>
              {candidate.label}
            </option>
          ))}
        </select>
      ) : null}
      <input
        type="text"
        aria-label="Nome della voce nuova"
        placeholder="Nome (minuscole, cifre, - e _)"
        value={name}
        onChange={(event) => {
          setName(event.target.value.trim());
        }}
      />
      <button
        type="button"
        className="button"
        disabled={name === ''}
        onClick={() => {
          onAdd(target, name);
          setName('');
        }}
      >
        + Aggiungi {section.addTargets[target]?.label ?? ''}
      </button>
    </div>
  );
}

interface PanelProps {
  section: SectionDef;
  config: TroupeConfigData;
  onConfig: (config: TroupeConfigData) => void;
  issues: readonly ConfigIssue[];
  renderExtra?: (item: Item) => ReactNode;
}

export function SectionPanel({ section, config, onConfig, issues, renderExtra }: PanelProps) {
  const [openId, setOpenId] = useState<string>();
  const items = section.items(config);
  const { byItem, general } = splitIssues(section, items, issues);

  const add = (targetIndex: number, name: string) => {
    const next = section.addTargets[targetIndex]?.add(config, name);
    if (next === undefined) return;

    // Si apre la voce appena nata: è per scriverla che si è premuto «Aggiungi».
    const known = new Set(items.map((item) => item.id));
    setOpenId(section.items(next).find((item) => !known.has(item.id))?.id);
    onConfig(next);
  };

  return (
    <Panel title={`Bozza · ${section.title}`}>
      <IssueList issues={general} />
      {items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          open={openId === item.id}
          issues={byItem.get(item.id) ?? []}
          extra={renderExtra?.(item)}
          onToggle={() => {
            setOpenId(openId === item.id ? undefined : item.id);
          }}
          onChange={(value) => {
            onConfig(section.replace(config, item.id, value));
          }}
          onRemove={() => {
            setOpenId(undefined);
            onConfig(section.remove?.(config, item.id) ?? config);
          }}
        />
      ))}
      <AddForm section={section} onAdd={add} />
    </Panel>
  );
}
