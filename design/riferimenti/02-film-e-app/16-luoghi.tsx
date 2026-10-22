const imgCerchio1 = "https://www.figma.com/api/mcp/asset/c9d4c9db-14e9-42a6-95c0-f3464e4e81f3.png";
const imgCerchio = "https://www.figma.com/api/mcp/asset/c4054875-98af-4a7d-87c4-ee4d56344fa4.svg";
const imgCerchio2 = "https://www.figma.com/api/mcp/asset/c5714578-9ed0-4735-86bf-a308d45a9313.svg";
const imgCerchio3 = "https://www.figma.com/api/mcp/asset/5d33b6f4-494a-4196-b8a7-51ff8409a69c.svg";
const imgChevronRight = "https://www.figma.com/api/mcp/asset/57997ba4-fb8f-4a3e-904d-4702bc0f4903.svg";
const imgLayers = "https://www.figma.com/api/mcp/asset/adbd46a0-0f20-4e07-9be3-30bb899dce6b.svg";
const imgCiak = "https://www.figma.com/api/mcp/asset/6162d024-8eff-4192-9464-0609db324c96.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/6e704a44-5943-417a-beb3-0076f6e6e366.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/b8e39f90-ced3-46de-ae82-f3f2dc15258a.svg";
const imgX = "https://www.figma.com/api/mcp/asset/10507b32-b84a-4ea3-8884-9a58278c542d.svg";
const imgImmagineCinematografica = "https://www.figma.com/api/mcp/asset/c1bba837-8774-4781-b63c-eda62dc1cf8c.png";
const imgImmagineCinematografica1 = "https://www.figma.com/api/mcp/asset/ae850aad-7170-4c57-b5a6-2a37140e0a7f.png";
const imgImmagineCinematografica2 = "https://www.figma.com/api/mcp/asset/d002642a-d3d3-4c1d-90f5-2831239440a5.png";
const imgImmagineCinematografica3 = "https://www.figma.com/api/mcp/asset/a26f43fd-c231-4718-a1c1-0b6cb8c64851.png";
const imgImmagineCinematografica4 = "https://www.figma.com/api/mcp/asset/73f3c88c-f628-44cc-bd37-798c17552b40.png";
const imgImmagineCinematografica5 = "https://www.figma.com/api/mcp/asset/c1de7871-007a-439e-a5d0-37fafb574850.png";
const imgImmagineCinematografica6 = "https://www.figma.com/api/mcp/asset/1b7473ef-cf99-44da-9dde-95b8f7c65c93.png";
const imgImmagineCinematografica7 = "https://www.figma.com/api/mcp/asset/ded56846-2740-4cf7-974f-c63eea868a67.png";
const imgImmagineCinematografica8 = "https://www.figma.com/api/mcp/asset/037e3ba9-1beb-48ff-90d9-3cd09706a067.png";

type FilmzyPulsanteSecondarioNormaleProps = {
  className?: string;
  etichetta?: string;
};

function FilmzyPulsanteSecondarioNormale({ className, etichetta = "Indietro" }: FilmzyPulsanteSecondarioNormaleProps) {
  return (
    <div className={className || "bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px]"} data-node-id="49:2982" data-name="Filmzy/Pulsante/Secondario/Normale">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="49:2313">
        {etichetta}
      </p>
    </div>
  );
}

function FilmzyStepperLuoghi({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[#1a1b19] content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] w-[1472px]"} data-node-id="49:3168" data-name="Filmzy/Stepper/Luoghi">
      <div className="content-stretch flex gap-[20px] h-[88px] items-center overflow-clip px-[32px] relative shrink-0 w-full" data-node-id="49:3169" data-name="Percorso di creazione">
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3170" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3171" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3172" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3173" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3212">
                ✓
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3175">
              La tua idea
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3176" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3177" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3178" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3179" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3180" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3213">
                ✓
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3182">
              La storia
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3183" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3184" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3185" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3186" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3187" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" height="28" src={imgCerchio1} width="28" />
              </div>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3188">
              Moodboard
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3189" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3190" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3191" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3192" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3193" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3214">
                ✓
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3195">
              Personaggi
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3196" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3197" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3198" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3199" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3200" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio2} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3215">
                4
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="49:3202">
              Luoghi
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3203" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex items-center overflow-clip relative shrink-0" data-node-id="49:3204" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3205" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3206" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3207" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio3} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3216">
                5
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3209">
              Riepilogo
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[#34362e] content-stretch flex h-[3px] items-start overflow-clip relative shrink-0 w-full" data-node-id="49:3210" data-name="Traccia di avanzamento">
        <div className="bg-[#f5b544] h-[3px] relative shrink-0 w-[1226.667px]" data-node-id="49:3211" data-name="Percorso completato" />
      </div>
    </div>
  );
}

type FilmzyIntestazioneFilmProps = {
  className?: string;
  lavoriInCorso?: boolean;
};

function FilmzyIntestazioneFilm({ className, lavoriInCorso = true }: FilmzyIntestazioneFilmProps) {
  return (
    <div className={className || "border-[#34362e] border-b border-solid content-stretch flex h-[80px] items-center justify-between overflow-clip px-[24px] relative w-[1472px]"} data-node-id="49:3014" data-name="Filmzy/Intestazione film">
      <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0" data-node-id="49:2489" data-name="Breadcrumb">
        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:2490">
          I miei film
        </p>
        <div className="relative shrink-0 size-[14px]" data-node-id="49:2742" data-name="chevron-right">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChevronRight} />
        </div>
        <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="49:2492">
          L’ultima corsa
        </p>
      </div>
      <div className="content-stretch flex gap-[12px] items-center overflow-clip relative shrink-0" data-node-id="49:2493" data-name="Azioni del film">
        {lavoriInCorso && (
          <div className="bg-[#22231f] content-stretch flex gap-[8px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0" data-node-id="49:2494" data-name="Chip">
            <div className="relative shrink-0 size-[16px]" data-node-id="49:2745" data-name="layers">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLayers} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="49:2496">
              2 lavori in corso
            </p>
          </div>
        )}
        <div className="bg-[#352b19] content-stretch flex items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0" data-node-id="49:2497" data-name="Chip">
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:2498">
            Questo film: 12,40 $
          </p>
        </div>
        <div className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0" data-node-id="49:2499" data-name="Pulsante">
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] whitespace-nowrap" data-node-id="49:2500">
            Questo film ⌄
          </p>
        </div>
        <div className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0" data-node-id="49:2501" data-name="Pulsante">
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] whitespace-nowrap" data-node-id="49:2502">
            Impostazioni
          </p>
        </div>
      </div>
    </div>
  );
}

function FilmzyFinestraDesktop({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative w-[1472px]"} data-node-id="49:3013" data-name="Filmzy/Finestra desktop">
      <div className="content-stretch flex items-center overflow-clip relative shrink-0" data-node-id="49:2470" data-name="Titolo della finestra">
        <div className="content-stretch flex gap-[8px] items-center overflow-clip relative shrink-0" data-node-id="49:2471" data-name="Marchio Filmzy">
          <div className="relative shrink-0 size-[24px]" data-node-id="49:2472" data-name="Ciak">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCiak} />
          </div>
          <p className="[word-break:break-word] font-['Manrope:ExtraBold'] font-extrabold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[14px] whitespace-nowrap" data-node-id="49:2474">
            filmzy
          </p>
        </div>
      </div>
      <div className="content-stretch flex gap-[6px] items-start overflow-clip relative shrink-0" data-node-id="49:2476" data-name="Controlli finestra">
        <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex items-center justify-center overflow-clip relative rounded-[6px] shrink-0 size-[24px]" data-node-id="49:2477" data-name="Controllo finestra">
          <div className="relative shrink-0 size-[12px]" data-node-id="49:2733" data-name="minus">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgMinus} />
          </div>
        </div>
        <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex items-center justify-center overflow-clip relative rounded-[6px] shrink-0 size-[24px]" data-node-id="49:2479" data-name="Controllo finestra">
          <div className="relative shrink-0 size-[12px]" data-node-id="49:2736" data-name="square">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSquare} />
          </div>
        </div>
        <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex items-center justify-center overflow-clip relative rounded-[6px] shrink-0 size-[24px]" data-node-id="49:2481" data-name="Controllo finestra">
          <div className="relative shrink-0 size-[12px]" data-node-id="49:2739" data-name="x">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgX} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Luoghi() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="27:71404" data-name="Luoghi">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <FilmzyIntestazioneFilm className="border-[#34362e] border-b border-solid content-stretch flex h-[80px] items-center justify-between overflow-clip px-[24px] relative shrink-0 w-full" lavoriInCorso={false} />
      <FilmzyStepperLuoghi className="bg-[#1a1b19] content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] shrink-0 w-full" />
      <div className="content-stretch flex flex-col gap-[28px] items-start min-h-[780px] overflow-clip p-[48px] relative shrink-0 w-full" data-node-id="27:71445" data-name="Spazio di lavoro">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:71446" data-name="Introduction">
          <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:71447">
            PASSO 4 DI 5 · LUOGHI
          </p>
          <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:71448">
            Dai un posto alla tua storia.
          </p>
          <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:71449">
            Scegli un’immagine per ogni luogo. La ritroveremo in tutte le scene in cui compare.
          </p>
        </div>
        <div className="content-stretch flex flex-col gap-[18px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:71450" data-name="Scelta del luogo">
          <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:71451" data-name="Intestazione del luogo">
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start leading-[1.55] not-italic overflow-clip relative shrink-0 w-[600px]" data-node-id="27:71452" data-name="Identità">
              <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[23px] w-full" data-node-id="27:71453">
                Stazione di San Luca
              </p>
              <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:71454">
                Scena 1 · Esterno, notte
              </p>
            </div>
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:71455" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[138px]" data-node-id="27:71456">
                ✓ Un’immagine scelta
              </p>
            </div>
          </div>
          <div className="content-stretch flex gap-[20px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:71457" data-name="Varianti del luogo">
            <div className="bg-[#1a1b19] border border-[#f5b544] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:71458" data-name="Variante">
              <div className="h-[208px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71459" data-name="Immagine cinematografica">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica} />
              </div>
              <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:71460" data-name="Scelta">
                <div className="content-center flex flex-wrap gap-y-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71461" data-name="Azioni">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:71462">
                    Il binario
                  </p>
                </div>
                <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71463" data-name="Azioni">
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[87px]" etichetta="✓ Scelta" />
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Ritocca" />
                </div>
              </div>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:71467" data-name="Variante">
              <div className="h-[208px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71468" data-name="Immagine cinematografica">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica1} />
              </div>
              <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:71469" data-name="Scelta">
                <div className="content-center flex flex-wrap gap-y-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71470" data-name="Azioni">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:71471">
                    La pensilina
                  </p>
                </div>
                <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71472" data-name="Azioni">
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Scegli" />
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Ritocca" />
                </div>
              </div>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:71475" data-name="Variante">
              <div className="h-[208px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71476" data-name="Immagine cinematografica">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica2} />
              </div>
              <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:71477" data-name="Scelta">
                <div className="content-center flex flex-wrap gap-y-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71478" data-name="Azioni">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:71479">
                    La sala d’attesa
                  </p>
                </div>
                <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71480" data-name="Azioni">
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Scegli" />
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Ritocca" />
                </div>
              </div>
            </div>
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71483" data-name="Azioni">
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold h-[46px] justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[228px]" data-node-id="27:71484">
              <p className="leading-[normal]">Rigenera le proposte · circa 0,15 $</p>
            </div>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[18px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:71486" data-name="Scelta del luogo">
          <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:71487" data-name="Intestazione del luogo">
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start leading-[1.55] not-italic overflow-clip relative shrink-0 w-[600px]" data-node-id="27:71488" data-name="Identità">
              <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[23px] w-full" data-node-id="27:71489">
                Cinema Aurora
              </p>
              <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:71490">
                Scene 2, 3, 5 e 6 · Notte e alba
              </p>
            </div>
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:71491" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[138px]" data-node-id="27:71492">
                ✓ Un’immagine scelta
              </p>
            </div>
          </div>
          <div className="content-stretch flex gap-[20px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:71493" data-name="Varianti del luogo">
            <div className="bg-[#1a1b19] border border-[#f5b544] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:71494" data-name="Variante">
              <div className="h-[208px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71495" data-name="Immagine cinematografica">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica3} />
              </div>
              <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:71496" data-name="Scelta">
                <div className="content-center flex flex-wrap gap-y-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71497" data-name="Azioni">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:71498">
                    L’ingresso
                  </p>
                </div>
                <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71499" data-name="Azioni">
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[87px]" etichetta="✓ Scelta" />
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Ritocca" />
                </div>
              </div>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:71503" data-name="Variante">
              <div className="h-[208px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71504" data-name="Immagine cinematografica">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica4} />
              </div>
              <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:71505" data-name="Scelta">
                <div className="content-center flex flex-wrap gap-y-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71506" data-name="Azioni">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:71507">
                    Il foyer
                  </p>
                </div>
                <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71508" data-name="Azioni">
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Scegli" />
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Ritocca" />
                </div>
              </div>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:71511" data-name="Variante">
              <div className="h-[208px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71512" data-name="Immagine cinematografica">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica5} />
              </div>
              <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:71513" data-name="Scelta">
                <div className="content-center flex flex-wrap gap-y-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71514" data-name="Azioni">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:71515">
                    La sala
                  </p>
                </div>
                <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71516" data-name="Azioni">
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Scegli" />
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Ritocca" />
                </div>
              </div>
            </div>
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71519" data-name="Azioni">
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold h-[46px] justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[228px]" data-node-id="27:71520">
              <p className="leading-[normal]">Rigenera le proposte · circa 0,15 $</p>
            </div>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[18px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:71522" data-name="Scelta del luogo">
          <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:71523" data-name="Intestazione del luogo">
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start leading-[1.55] not-italic overflow-clip relative shrink-0 w-[600px]" data-node-id="27:71524" data-name="Identità">
              <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[23px] w-full" data-node-id="27:71525">
                Cabina di proiezione
              </p>
              <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:71526">
                Scena 4 · Interno, notte
              </p>
            </div>
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:71527" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[138px]" data-node-id="27:71528">
                ✓ Un’immagine scelta
              </p>
            </div>
          </div>
          <div className="content-stretch flex gap-[20px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:71529" data-name="Varianti del luogo">
            <div className="bg-[#1a1b19] border border-[#f5b544] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:71530" data-name="Variante">
              <div className="h-[208px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71531" data-name="Immagine cinematografica">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica6} />
              </div>
              <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:71532" data-name="Scelta">
                <div className="content-center flex flex-wrap gap-y-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71533" data-name="Azioni">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:71534">
                    Il proiettore
                  </p>
                </div>
                <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71535" data-name="Azioni">
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[87px]" etichetta="✓ Scelta" />
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Ritocca" />
                </div>
              </div>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:71539" data-name="Variante">
              <div className="h-[208px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71540" data-name="Immagine cinematografica">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica7} />
              </div>
              <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:71541" data-name="Scelta">
                <div className="content-center flex flex-wrap gap-y-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71542" data-name="Azioni">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:71543">
                    La finestra
                  </p>
                </div>
                <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71544" data-name="Azioni">
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Scegli" />
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Ritocca" />
                </div>
              </div>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:71547" data-name="Variante">
              <div className="h-[208px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71548" data-name="Immagine cinematografica">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica8} />
              </div>
              <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:71549" data-name="Scelta">
                <div className="content-center flex flex-wrap gap-y-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71550" data-name="Azioni">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:71551">
                    Le bobine
                  </p>
                </div>
                <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71552" data-name="Azioni">
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Scegli" />
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Ritocca" />
                </div>
              </div>
            </div>
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71555" data-name="Azioni">
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold h-[46px] justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[228px]" data-node-id="27:71556">
              <p className="leading-[normal]">Rigenera le proposte · circa 0,15 $</p>
            </div>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
          </div>
        </div>
      </div>
      <div className="border-[#34362e] border-solid border-t content-stretch flex items-center justify-between overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:71558" data-name="Azioni della pagina">
        <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[81px]" />
        <div className="content-stretch flex gap-[24px] items-center overflow-clip relative shrink-0" data-node-id="27:71560" data-name="Salvataggio e continua">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[153px]" data-node-id="27:71561">
            Salvato sul tuo computer
          </p>
          <div className="bg-[#f5b544] border border-[#f5b544] border-solid content-stretch flex h-[46px] items-center justify-center overflow-clip px-[18px] relative rounded-[12px] shrink-0" data-node-id="27:71562" data-name="Azione">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[14px] whitespace-nowrap" data-node-id="27:71563">
              Al riepilogo →
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}