import type { ProjectChoice } from '@filmzy/contracts';

interface Props {
  legend: string;
  name: string;
  choices: readonly ProjectChoice[];
  value: string | undefined;
  onChange: (id: string) => void;
}

/**
 * Una scelta tra poche voci (genere, tono, stile…), come tessere da toccare. Sono pulsanti di
 * scelta unica veri: si usano anche con la tastiera e un lettore dello schermo li annuncia.
 */
export function ChoiceGroup({ legend, name, choices, value, onChange }: Props) {
  return (
    <fieldset className="choice-group">
      <legend>{legend}</legend>
      <div className="choices">
        {choices.map((choice) => (
          <label key={choice.id} className="choice" data-selected={choice.id === value}>
            <input
              type="radio"
              name={name}
              value={choice.id}
              checked={choice.id === value}
              onChange={() => {
                onChange(choice.id);
              }}
            />
            <span className="choice-label">{choice.label}</span>
            {choice.description === undefined ? null : (
              <span className="choice-description">{choice.description}</span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
