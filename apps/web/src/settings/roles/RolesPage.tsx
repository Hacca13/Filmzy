import type { RoleChangeResult, RoleState } from '@filmzy/contracts';
import { useState } from 'react';

import { fetchRoles, setRoleService, setRoleTemperature } from '../../api/roles';
import { Notice, Panel } from '../../components/ui';
import { useResource } from '../../lib/use-resource';
import { describeError } from '../messages';
import { useAction } from '../use-action';
import {
  AS_DEFAULT,
  parseTemperature,
  roleSummary,
  selectedService,
  temperatureToField,
} from './model';

/**
 * «Chi fa cosa» (T2.7, D38): per ogni ruolo, quale fornitore e quale servizio lavorano, la
 * creatività (solo dove il servizio la accetta) e la versione delle istruzioni. Le scelte valgono
 * subito, senza pubblicare, e vincono sul predefinito e sulla release.
 */
export function RolesPage() {
  const { state, setData } = useResource(fetchRoles);
  const [open, setOpen] = useState<string>();
  const [notice, setNotice] = useState<string>();

  if (state.status === 'loading') return <p className="hint">Un attimo…</p>;
  if (state.status === 'error') return <Notice tone="error">{describeError(state.error)}</Notice>;

  const applied = (result: RoleChangeResult) => {
    setData(result.overview);
    setNotice(
      result.discarded.includes('temperature')
        ? 'La creatività che avevi scelto non vale per questo servizio: l’ho tolta.'
        : undefined,
    );
  };

  return (
    <Panel title="Chi fa cosa">
      <p className="hint">
        Per ogni ruolo puoi scegliere un altro servizio. Le scelte valgono subito: non serve
        pubblicare.
      </p>
      {notice === undefined ? null : <Notice tone="info">{notice}</Notice>}
      {state.data.roles.map((role) => (
        <RoleRow
          key={role.roleId}
          role={role}
          open={open === role.roleId}
          onToggle={() => {
            setOpen(open === role.roleId ? undefined : role.roleId);
          }}
          onApplied={applied}
        />
      ))}
    </Panel>
  );
}

interface RowProps {
  role: RoleState;
  open: boolean;
  onToggle: () => void;
  onApplied: (result: RoleChangeResult) => void;
}

export function RoleRow({ role, open, onToggle, onApplied }: RowProps) {
  const action = useAction();

  return (
    <div className="row" data-open={open}>
      <div className="row-head">
        <p>{roleSummary(role)}</p>
        <button type="button" className="button" aria-expanded={open} onClick={onToggle}>
          {open ? 'Chiudi' : 'Cambia'}
        </button>
      </div>
      {open ? (
        <div className="row-form">
          <ServiceChoice
            role={role}
            busy={action.busy}
            onChoose={(modelId) => {
              action.run(async () => {
                onApplied(await setRoleService(role.roleId, modelId));
              });
            }}
          />
          {role.temperature === undefined ? null : (
            <TemperatureChoice
              role={role}
              temperature={role.temperature}
              busy={action.busy}
              onApply={(value) => {
                action.run(async () => {
                  onApplied(await setRoleTemperature(role.roleId, value));
                });
              }}
            />
          )}
          {role.instructions === undefined ? null : (
            <p className="hint">
              Istruzioni: {role.instructions.label}
              {role.instructions.recommended ? ' · consigliata' : ''}
              {role.instructions.newerAvailable ? ' · c’è una versione più nuova' : ''} ·{' '}
              <a href="#/impostazioni/istruzioni">Cambia le istruzioni</a>
            </p>
          )}
          {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
        </div>
      ) : null}
    </div>
  );
}

function ServiceChoice({
  role,
  busy,
  onChoose,
}: {
  role: RoleState;
  busy: boolean;
  onChoose: (modelId: string | null) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={`service-${role.roleId}`}>Fornitore e servizio</label>
      <select
        id={`service-${role.roleId}`}
        value={selectedService(role)}
        disabled={busy}
        onChange={(event) => {
          onChoose(event.target.value === AS_DEFAULT ? null : event.target.value);
        }}
      >
        <option value={AS_DEFAULT}>Come da programma</option>
        {role.providers.map((provider) => (
          <optgroup key={provider.connectionId} label={provider.label}>
            {provider.services.map((service) => (
              <option key={service.modelId} value={service.modelId}>
                {service.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {role.providers.length === 0 ? (
        <p className="hint">Nessun servizio adatto: attivane uno in Connessioni.</p>
      ) : null}
    </div>
  );
}

function TemperatureChoice({
  role,
  temperature,
  busy,
  onApply,
}: {
  role: RoleState;
  temperature: NonNullable<RoleState['temperature']>;
  busy: boolean;
  onApply: (value: number | null) => void;
}) {
  const [text, setText] = useState(temperatureToField(temperature.value));
  const value = parseTemperature(text, temperature);

  return (
    <div className="field">
      <label htmlFor={`creativity-${role.roleId}`}>
        Creatività
        {temperature.min === undefined || temperature.max === undefined
          ? ''
          : ` (da ${String(temperature.min)} a ${String(temperature.max)})`}
      </label>
      <div className="actions">
        <input
          id={`creativity-${role.roleId}`}
          type="text"
          inputMode="decimal"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
          }}
        />
        <button
          type="button"
          className="button"
          disabled={busy || value === undefined}
          onClick={() => {
            if (value !== undefined) onApply(value);
          }}
        >
          Applica
        </button>
        {temperature.chosen ? (
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={() => {
              setText('');
              onApply(null);
            }}
          >
            Torna al valore del programma
          </button>
        ) : null}
      </div>
      {value === undefined ? (
        <p className="field-error">Scrivi un numero dentro i limiti del servizio.</p>
      ) : null}
    </div>
  );
}
