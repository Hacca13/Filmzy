import type { ProjectChoice, ScenePlan, ShotPlans } from '@filmzy/contracts';
import { useCallback, useState } from 'react';

import { ApiError } from '../../api/client';
import { fetchCast } from '../../api/cast';
import { fetchLocations } from '../../api/locations';
import { changeShotMovement, estimateScenePlan, fetchShotPlans, planScene } from '../../api/shots';
import { Chip, Notice } from '../../components/ui';
import { formatEstimate } from '../../lib/format';
import { useLastReady } from '../../lib/use-last-ready';
import { useResource } from '../../lib/use-resource';
import { describeError } from '../../settings/messages';
import { useGuardedRun } from '../../settings/spend/use-guarded-run';
import { useAction } from '../../settings/use-action';
import { WriteOutcome } from '../WriteOutcome';
import { useLiveJobs } from '../use-live-jobs';
import { FlagNote } from './FlagNote';
import { ShotCard } from './ShotCard';
import { ScriptCheckSection } from './ScriptCheckSection';
import { ShotImagesPanel } from './ShotImagesPanel';
import { sceneChip, type Names } from './model';

/** I lavori che cambiano ciò che la striscia mostra. */
const LIVE_KINDS = ['take_generate', 'storyboard_images'];

const isNotFound = (error: unknown) =>
  error instanceof ApiError && error.serverCode === 'not_found';

/**
 * «Le inquadrature» (T3.9, §3.1): l'aiuto regista divide ogni scena della sceneggiatura finale in
 * inquadrature, una scena alla volta, e l'utente le vede in una striscia di card e sceglie il
 * movimento di macchina. Pensarle costa: la stima si vede prima e un limite di spesa si chiede
 * come ovunque (D30).
 */
export function ShotsPanel({ filmId }: { filmId: string }) {
  const load = useCallback((signal: AbortSignal) => fetchShotPlans(filmId, signal), [filmId]);
  const plans = useResource(load);
  // Mentre si ricarica resta il piano di prima: la striscia non si smonta.
  const data = useLastReady(plans.state);
  // Quando un video o uno storyboard di questo film cambia stato (T4.4) la striscia si aggiorna da sola:
  // la card passa da «in lavorazione» a «pronto» anche con il riquadro dell'inquadratura chiuso.
  useLiveJobs({ kinds: LIVE_KINDS, projectId: filmId }, plans.reload);

  return (
    <section className="panel shots" id="le-inquadrature">
      <h2>Le inquadrature</h2>
      {plans.state.status === 'error' ? (
        isNotFound(plans.state.error) ? (
          <>
            <p className="hint">
              Quando avrai la sceneggiatura finale, qui ogni scena si divide in inquadrature.
            </p>
            <div className="actions">
              <button type="button" className="button" onClick={plans.reload}>
                Controlla di nuovo
              </button>
            </div>
          </>
        ) : (
          <Notice tone="error">{describeError(plans.state.error)}</Notice>
        )
      ) : data === undefined ? (
        <p className="hint">Un attimo…</p>
      ) : (
        <ShotsView filmId={filmId} plans={data} reload={plans.reload} />
      )}
    </section>
  );
}

interface ViewProps {
  filmId: string;
  plans: ShotPlans;
  reload: () => void;
}

function ShotsView({ filmId, plans, reload }: ViewProps) {
  const [active, setActive] = useState<number>();
  const written = useGuardedRun<ScenePlan>(reload);
  const names = useNames(filmId);
  // Le scene che la segretaria di edizione può leggere: pensate, e con un piano che vale ancora.
  const plannedScenes = plans.scenes.filter((scene) => scene.planned && !scene.stale);
  const checkStamp = [
    plans.finalVersionId,
    ...plannedScenes.flatMap((scene) => scene.shots.map((shot) => shot.id)),
  ].join(',');

  return (
    <>
      <p className="hint">
        Ogni scena si gira in poche inquadrature. Lo spazio fra una e l&apos;altra lo tiene
        l&apos;aiuto regista: dove entra e dove esce ciascuna deve combaciare con la vicina. Il
        movimento di macchina lo puoi cambiare tu.
      </p>
      {plannedScenes.length === 0 ? null : (
        <ScriptCheckSection filmId={filmId} stamp={checkStamp} onChecked={reload} />
      )}
      {plans.scenes.map((scene) => (
        <SceneSection
          key={scene.sceneNumber}
          filmId={filmId}
          scene={scene}
          movements={plans.cameraMovements}
          names={names}
          written={written}
          showOutcome={active === scene.sceneNumber}
          onPlan={() => {
            setActive(scene.sceneNumber);
            written.run((spendConfirmed) =>
              planScene(filmId, { sceneNumber: scene.sceneNumber, spendConfirmed }),
            );
          }}
          reload={reload}
        />
      ))}
    </>
  );
}

/** I nomi del cast e dei luoghi, per scrivere «con Anna» e non un id. Senza, le card non li nominano. */
function useNames(filmId: string): Names {
  const loadCast = useCallback((signal: AbortSignal) => fetchCast(filmId, signal), [filmId]);
  const loadLocations = useCallback(
    (signal: AbortSignal) => fetchLocations(filmId, signal),
    [filmId],
  );
  const cast = useResource(loadCast);
  const locations = useResource(loadLocations);
  return {
    characters: cast.state.status === 'ready' ? cast.state.data.characters : [],
    locations: locations.state.status === 'ready' ? locations.state.data.locations : [],
  };
}

interface SceneProps {
  filmId: string;
  scene: ScenePlan;
  movements: readonly ProjectChoice[];
  names: Names;
  written: ReturnType<typeof useGuardedRun<ScenePlan>>;
  /** Il limite di spesa e l'errore si mostrano sotto la scena che li ha provocati. */
  showOutcome: boolean;
  onPlan: () => void;
  reload: () => void;
}

function SceneSection({
  filmId,
  scene,
  movements,
  names,
  written,
  showOutcome,
  onPlan,
  reload,
}: SceneProps) {
  const action = useAction();
  const [storyboardShotId, setStoryboardShotId] = useState<string>();
  const estimateUsd = useSceneEstimate(filmId, scene);
  const verb = scene.planned ? 'Rifai le inquadrature' : 'Pensa le inquadrature';
  const working = written.running && showOutcome;
  const chip = sceneChip(scene);
  // Se il piano è rifatto l'inquadratura aperta sparisce, e con lei il suo storyboard.
  const storyboardShot = scene.shots.find((shot) => shot.id === storyboardShotId);

  return (
    <section className="scene-shots">
      <div className="scene-head">
        <h3>
          Scena {scene.sceneNumber} · {scene.heading}
        </h3>
        <Chip tone={chip.tone}>{chip.label}</Chip>
      </div>
      {scene.planned ? null : (
        <p className="hint">
          La scena è pronta. L&apos;aiuto regista deve ancora pensare come girarla.
        </p>
      )}
      {working ? <Chip tone="info">L&apos;aiuto regista sta pensando</Chip> : null}
      {scene.sceneFlags.map((flag) => (
        <FlagNote key={`${flag.code}:${flag.reason}`} flag={flag} />
      ))}
      {scene.stale ? (
        <Notice tone="info" title="Informazione">
          Dopo aver pensato le inquadrature è cambiato qualcosa: la scena, oppure un personaggio o
          un luogo che citano. Rifalle per tenerle allineate.
        </Notice>
      ) : null}
      {scene.shots.length === 0 ? null : (
        <ol className="shot-strip">
          {scene.shots.map((shot) => (
            <ShotCard
              key={shot.id}
              shot={shot}
              movements={movements}
              names={names}
              busy={action.busy || written.running}
              onMovement={(movementId) => {
                action.run(async () => {
                  await changeShotMovement(filmId, shot.id, { cameraMovement: movementId });
                  reload();
                });
              }}
              storyboardAssetId={scene.chosenStoryboards[shot.id]}
              clipAssetId={scene.clips[shot.id]}
              working={scene.working[shot.id]}
              flags={scene.flags[shot.id]}
              storyboardOpen={shot.id === storyboardShotId}
              canStoryboard={!scene.stale}
              onStoryboard={() => {
                setStoryboardShotId(shot.id === storyboardShotId ? undefined : shot.id);
              }}
            />
          ))}
        </ol>
      )}
      {storyboardShot === undefined ? null : (
        <ShotImagesPanel
          key={storyboardShot.id}
          filmId={filmId}
          shot={storyboardShot}
          onChanged={reload}
          onClose={() => {
            setStoryboardShotId(undefined);
          }}
        />
      )}
      {scene.notes === undefined ? null : <p className="hint">Note: {scene.notes}</p>}
      <div className="actions">
        <button
          type="button"
          className="button"
          data-kind={scene.planned ? undefined : 'primary'}
          disabled={written.running}
          onClick={onPlan}
        >
          {working
            ? 'Sto pensando…'
            : estimateUsd === undefined
              ? verb
              : `${verb} · circa ${formatEstimate(estimateUsd)}`}
        </button>
      </div>
      {action.problem === undefined ? null : <Notice tone="error">{action.problem}</Notice>}
      {showOutcome ? <WriteOutcome written={written} /> : null}
    </section>
  );
}

/** Quanto costerebbe pensare le inquadrature di questa scena, riletto quando il piano cambia (D30). */
function useSceneEstimate(filmId: string, scene: ScenePlan): number | undefined {
  const stamp = `${String(scene.planned)}:${scene.shots[0]?.id ?? ''}`;
  const load = useCallback(
    (signal: AbortSignal) => estimateScenePlan(filmId, scene.sceneNumber, signal),
    [filmId, scene.sceneNumber, stamp],
  );
  const { state } = useResource(load);
  // Una stima che non arriva non blocca niente: si pensa lo stesso, solo senza la cifra.
  return state.status === 'ready' ? state.data.estimate.estimatedCostUsd : undefined;
}
