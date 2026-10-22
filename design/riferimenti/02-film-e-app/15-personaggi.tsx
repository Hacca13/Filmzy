const imgCerchio1 = "https://www.figma.com/api/mcp/asset/3b9d5405-76ad-4fdb-baa5-77a9c839bc72.png";
const imgCerchio = "https://www.figma.com/api/mcp/asset/ae7af6fa-96b7-4c2c-aeb5-8080c7d3bbbc.svg";
const imgCerchio2 = "https://www.figma.com/api/mcp/asset/a5abff1a-2472-4d0c-a0af-7fcb9448ae51.svg";
const imgCerchio3 = "https://www.figma.com/api/mcp/asset/ca6aacc7-b853-4307-ab15-8cce435f0bac.svg";
const imgChevronRight = "https://www.figma.com/api/mcp/asset/e133c0d5-72eb-48b1-808f-dd4dc43d1cd6.svg";
const imgLayers = "https://www.figma.com/api/mcp/asset/0c89b4a6-cf8f-4e9b-ace7-0e438c4068fa.svg";
const imgCiak = "https://www.figma.com/api/mcp/asset/338596b1-5870-409c-bd2e-e970df426882.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/d42bfcac-919c-4bd8-acbe-ad0ca87a8f28.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/ba2ae94c-48f9-4252-8fa0-a2f62826851f.svg";
const imgX = "https://www.figma.com/api/mcp/asset/595cdec3-6c60-4ec0-9fd1-a32212c04065.svg";
const imgFilmFrame = "https://www.figma.com/api/mcp/asset/d82bf292-6000-4e66-99e1-6a45eac3cea1.png";
const imgFilmFrame1 = "https://www.figma.com/api/mcp/asset/d2dfdb7a-2b80-4851-9a07-1e4d5ac5be66.png";
const imgSparkles = "https://www.figma.com/api/mcp/asset/f64ed846-fd16-4779-af08-d32d6cdb958b.svg";
const imgLockKeyhole = "https://www.figma.com/api/mcp/asset/7de4d7cb-9dce-4948-b813-cb6b1c65e4b5.svg";
const imgChevronDown = "https://www.figma.com/api/mcp/asset/ac0c90ea-18f5-40d3-b1a0-4b19906fcec4.svg";
const imgLockKeyhole1 = "https://www.figma.com/api/mcp/asset/b9f06fdf-2a1b-4f76-b9e6-10bb392ba178.svg";
const imgArrowLeft = "https://www.figma.com/api/mcp/asset/1ea7328b-48b8-44d4-a99f-ea718776daf0.svg";
const imgCloudCheck = "https://www.figma.com/api/mcp/asset/08240aa4-a68e-4780-be38-3759a0a80638.svg";

type FilmzyPulsantePrimarioNormaleProps = {
  className?: string;
  etichetta?: string;
};

function FilmzyPulsantePrimarioNormale({ className, etichetta = "Continua" }: FilmzyPulsantePrimarioNormaleProps) {
  return (
    <div className={className || "bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px]"} data-node-id="49:2978" data-name="Filmzy/Pulsante/Primario/Normale">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[13px] whitespace-nowrap" data-node-id="49:2297">
        {etichetta}
      </p>
    </div>
  );
}

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

function FilmzyStepperPersonaggi({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[#1a1b19] content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] w-[1472px]"} data-node-id="49:3119" data-name="Filmzy/Stepper/Personaggi">
      <div className="content-stretch flex gap-[20px] h-[88px] items-center overflow-clip px-[32px] relative shrink-0 w-full" data-node-id="49:3120" data-name="Percorso di creazione">
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3121" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3122" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3123" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3124" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3163">
                ✓
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3126">
              La tua idea
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3127" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3128" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3129" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3130" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3131" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3164">
                ✓
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3133">
              La storia
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3134" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3135" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3136" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3137" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3138" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" height="28" src={imgCerchio1} width="28" />
              </div>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3139">
              Moodboard
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3140" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3141" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3142" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3143" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3144" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio2} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3165">
                3
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="49:3146">
              Personaggi
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3147" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3148" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3149" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3150" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3151" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio3} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3166">
                4
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3153">
              Luoghi
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3154" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex items-center overflow-clip relative shrink-0" data-node-id="49:3155" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3156" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3157" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3158" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio3} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3167">
                5
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3160">
              Riepilogo
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[#34362e] content-stretch flex h-[3px] items-start overflow-clip relative shrink-0 w-full" data-node-id="49:3161" data-name="Traccia di avanzamento">
        <div className="bg-[#f5b544] h-[3px] relative shrink-0 w-[981.333px]" data-node-id="49:3162" data-name="Percorso completato" />
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

export default function Personaggi() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="2:22261" data-name="Personaggi">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <FilmzyIntestazioneFilm className="border-[#34362e] border-b border-solid content-stretch flex h-[80px] items-center justify-between overflow-clip px-[24px] relative shrink-0 w-full" lavoriInCorso={false} />
      <FilmzyStepperPersonaggi className="bg-[#1a1b19] content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] shrink-0 w-full" />
      <div className="content-stretch flex flex-col gap-[28px] items-start overflow-clip px-[48px] py-[36px] relative shrink-0 w-full" data-node-id="27:239" data-name="Personaggi workspace">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full" data-node-id="27:240" data-name="Page introduction">
          <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[179px]" data-node-id="27:241">
            PASSO 3 DI 5 · PERSONAGGI
          </p>
          <p className="font-['Manrope:Bold'] font-bold leading-[1.2] min-w-full relative shrink-0 text-[#f5f1e8] text-[36px] w-[min-content]" data-node-id="27:242">
            Definisci i personaggi della tua storia.
          </p>
          <p className="font-['Inter:Regular'] font-normal leading-[1.5] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:243">
            Hai scelto 2 personaggi. Puoi aggiungere dettagli, rigenerare i volti e bloccare l’aspetto per mantenere la continuità.
          </p>
        </div>
        <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-node-id="27:244" data-name="Count selector">
          <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex items-center px-[16px] py-[10px] relative rounded-[12px] shrink-0" data-node-id="27:245" data-name="Count 1">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="27:246">
              1 personaggio
            </p>
          </div>
          <div className="bg-[#f5b544] content-stretch flex items-center px-[16px] py-[10px] relative rounded-[12px] shrink-0" data-node-id="27:247" data-name="Count 2 selected">
            <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[13px] whitespace-nowrap" data-node-id="27:248">
              2 personaggi
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[12px] items-center overflow-clip p-[18px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:249" data-name="Suggestions banner">
          <div className="relative shrink-0 size-[20px]" data-node-id="27:250" data-name="sparkles">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSparkles} />
          </div>
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#b2b2a8] text-[14px]" data-node-id="27:252">
            Ti suggeriamo questi personaggi per la tua storia
          </p>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[154px]" data-node-id="27:253">
            2 personaggi selezionati
          </p>
        </div>
        <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:254" data-name="Character cards">
          <div className="bg-[#1a1b19] border border-[#f5b544] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:255" data-name="Character card">
            <div className="content-stretch flex flex-col h-[272px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:256" data-name="Character views">
              <div className="h-[272px] relative shrink-0 w-full" data-node-id="27:257" data-name="Film frame">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame} />
              </div>
              <div className="absolute content-stretch flex items-start left-[14px] overflow-clip top-[14px]" data-node-id="27:258" data-name="Locked appearance">
                <div className="bg-[#352b19] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:259" data-name="Status">
                  <div className="relative shrink-0 size-[12px]" data-node-id="27:260" data-name="lock-keyhole">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLockKeyhole} />
                  </div>
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[91px]" data-node-id="27:262">
                    Volto bloccato
                  </p>
                </div>
              </div>
              <div className="[word-break:break-word] absolute bg-[rgba(17,18,17,0.72)] bottom-0 content-stretch flex font-['Inter:Regular'] font-normal h-[30px] items-start leading-[0] left-0 not-italic overflow-clip right-0 text-[#f5f1e8] text-[13px] text-center" data-node-id="27:263" data-name="View labels">
                <div className="flex flex-[1_0_0] flex-col justify-center min-w-px relative" data-node-id="27:264">
                  <p className="leading-[normal]">Frontale</p>
                </div>
                <div className="flex flex-[1_0_0] flex-col justify-center min-w-px relative" data-node-id="27:265">
                  <p className="leading-[normal]">Profilo</p>
                </div>
                <div className="flex flex-[1_0_0] flex-col justify-center min-w-px relative" data-node-id="27:266">
                  <p className="leading-[normal]">Tre quarti</p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative shrink-0 w-full" data-node-id="27:267" data-name="Character information">
              <div className="[word-break:break-word] content-stretch flex font-normal items-center justify-between leading-[normal] relative shrink-0 w-full whitespace-nowrap" data-node-id="27:268" data-name="Identity">
                <p className="font-['Manrope:Regular'] relative shrink-0 text-[#f5f1e8] text-[26px]" data-node-id="27:269">
                  Marco
                </p>
                <p className="font-['Inter:Regular'] not-italic relative shrink-0 text-[#aaa99e] text-[13px]" data-node-id="27:270">
                  32 anni
                </p>
              </div>
              <div className="bg-[#352b19] border border-[#f5b544] border-solid content-stretch flex items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:271" data-name="Role chip">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[102px]" data-node-id="27:272">
                  PROTAGONISTA
                </p>
              </div>
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[1.5] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:273">
                Proiezionista per caso, sognatore per eredità.
              </p>
              <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:274" data-name="Divider" />
              <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="27:275" data-name="Character actions">
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[89px]" etichetta="Aggiungi" />
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Cambia" />
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[74px]" etichetta="Scarta" />
              </div>
              <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-node-id="27:286" data-name="Portrait generation">
                <div className="[word-break:break-word] content-stretch flex gap-[8px] items-center leading-[normal] not-italic relative shrink-0 text-[13px]" data-node-id="27:287" data-name="Frame">
                  <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] w-[46px]" data-node-id="27:288">
                    Genera
                  </p>
                  <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] w-[80px]" data-node-id="27:289">
                    · circa 0,05 $
                  </p>
                </div>
                <div className="content-stretch flex items-center relative shrink-0" data-node-id="27:290" data-name="Frame">
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
                </div>
              </div>
              <div className="[word-break:break-word] content-stretch flex flex-col gap-[12px] items-start not-italic relative shrink-0 text-[13px] w-full" data-node-id="27:294" data-name="Details section">
                <div className="content-stretch flex items-center justify-between leading-[normal] relative shrink-0 w-full" data-node-id="27:295" data-name="Details header">
                  <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] whitespace-nowrap" data-node-id="27:296">
                    Aggiungi dettagli
                  </p>
                  <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] w-[68px]" data-node-id="27:297">
                    Facoltativo
                  </p>
                </div>
                <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col gap-[12px] items-start p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:298" data-name="Details expanded">
                  <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-node-id="27:299" data-name="Frame">
                    <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] relative shrink-0 text-[#f5b544] w-[78px]" data-node-id="27:300">
                      CARATTERE
                    </p>
                    <p className="font-['Inter:Regular'] font-normal leading-[1.5] min-w-full relative shrink-0 text-[#f5f1e8] w-[min-content]" data-node-id="27:301">
                      Determinato, emotivo e legato al passato del cinema.
                    </p>
                  </div>
                  <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-node-id="27:302" data-name="Frame">
                    <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] relative shrink-0 text-[#f5b544] w-[134px]" data-node-id="27:303">
                      COME SI COMPORTA
                    </p>
                    <p className="font-['Inter:Regular'] font-normal leading-[1.5] min-w-full relative shrink-0 text-[#f5f1e8] w-[min-content]" data-node-id="27:304">
                      Ascolta, osserva e si lascia guidare dalle persone che incontra.
                    </p>
                  </div>
                  <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-node-id="27:305" data-name="Frame">
                    <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] relative shrink-0 text-[#f5b544] w-[85px]" data-node-id="27:306">
                      COSA VUOLE
                    </p>
                    <p className="font-['Inter:Regular'] font-normal leading-[1.5] min-w-full relative shrink-0 text-[#f5f1e8] w-[min-content]" data-node-id="27:307">
                      Finire il film che suo padre non ha mai potuto mostrare.
                    </p>
                  </div>
                </div>
                <p className="font-['Inter:Regular'] font-normal leading-[1.5] relative shrink-0 text-[#aaa99e] w-full" data-node-id="27:308">
                  Servono a tenere il personaggio coerente in tutto il film. Puoi saltarli.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:309" data-name="Character card">
            <div className="content-stretch flex flex-col h-[272px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:310" data-name="Character views">
              <div className="h-[272px] relative shrink-0 w-full" data-node-id="27:311" data-name="Film frame">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame1} />
              </div>
              <div className="[word-break:break-word] absolute bg-[rgba(17,18,17,0.72)] bottom-0 content-stretch flex font-['Inter:Regular'] font-normal h-[30px] items-start leading-[0] left-0 not-italic overflow-clip right-0 text-[#f5f1e8] text-[13px] text-center" data-node-id="27:312" data-name="View labels">
                <div className="flex flex-[1_0_0] flex-col justify-center min-w-px relative" data-node-id="27:313">
                  <p className="leading-[normal]">Frontale</p>
                </div>
                <div className="flex flex-[1_0_0] flex-col justify-center min-w-px relative" data-node-id="27:314">
                  <p className="leading-[normal]">Profilo</p>
                </div>
                <div className="flex flex-[1_0_0] flex-col justify-center min-w-px relative" data-node-id="27:315">
                  <p className="leading-[normal]">Tre quarti</p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative shrink-0 w-full" data-node-id="27:316" data-name="Character information">
              <div className="[word-break:break-word] content-stretch flex font-normal items-center justify-between leading-[normal] relative shrink-0 w-full whitespace-nowrap" data-node-id="27:317" data-name="Identity">
                <p className="font-['Manrope:Regular'] relative shrink-0 text-[#f5f1e8] text-[26px]" data-node-id="27:318">
                  Giulia
                </p>
                <p className="font-['Inter:Regular'] not-italic relative shrink-0 text-[#aaa99e] text-[13px]" data-node-id="27:319">
                  30 anni
                </p>
              </div>
              <div className="bg-[#352b19] border border-[#f5b544] border-solid content-stretch flex items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:320" data-name="Role chip">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[59px]" data-node-id="27:321">
                  ALLEATO
                </p>
              </div>
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[1.5] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:322">
                Amica di sempre. È lei a rimetterlo in viaggio.
              </p>
              <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:323" data-name="Divider" />
              <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="27:324" data-name="Character actions">
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[89px]" etichetta="Aggiungi" />
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Cambia" />
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[74px]" etichetta="Scarta" />
              </div>
              <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-node-id="27:335" data-name="Portrait generation">
                <div className="[word-break:break-word] content-stretch flex gap-[8px] items-center leading-[normal] not-italic relative shrink-0 text-[13px]" data-node-id="27:336" data-name="Frame">
                  <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] w-[56px]" data-node-id="27:337">
                    Rigenera
                  </p>
                  <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] w-[80px]" data-node-id="27:338">
                    · circa 0,05 $
                  </p>
                </div>
                <div className="content-stretch flex items-center relative shrink-0" data-node-id="27:339" data-name="Frame">
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-node-id="27:343" data-name="Details section">
                <div className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] not-italic relative shrink-0 text-[13px] w-full" data-node-id="27:344" data-name="Details header">
                  <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] whitespace-nowrap" data-node-id="27:345">
                    Aggiungi dettagli
                  </p>
                  <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] w-[68px]" data-node-id="27:346">
                    Facoltativo
                  </p>
                </div>
                <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex gap-[8px] items-center px-[14px] py-[12px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:347" data-name="Details collapsed">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.5] min-w-px not-italic relative text-[#aaa99e] text-[13px]" data-node-id="27:348">
                    Carattere, come si comporta, cosa vuole
                  </p>
                  <div className="relative shrink-0 size-[14px]" data-node-id="27:349" data-name="chevron-down">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChevronDown} />
                  </div>
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.5] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:351">
                  Servono a tenere il personaggio coerente in tutto il film. Puoi saltarli.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1b19] content-stretch flex gap-[16px] items-center overflow-clip p-[20px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:352" data-name="Continuity note">
          <div className="bg-[#22231f] content-stretch flex items-center justify-center overflow-clip relative rounded-[12px] shrink-0 size-[40px]" data-node-id="27:353" data-name="Lock symbol">
            <div className="relative shrink-0 size-[18px]" data-node-id="27:354" data-name="lock-keyhole">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLockKeyhole1} />
            </div>
          </div>
          <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start leading-[normal] min-w-px not-italic relative text-[13px]" data-node-id="27:356" data-name="Face consistency">
            <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] whitespace-nowrap" data-node-id="27:357">
              Un volto riconoscibile, in ogni scena.
            </p>
            <p className="font-['Inter:Regular'] font-normal min-w-full relative shrink-0 text-[#aaa99e] w-[min-content]" data-node-id="27:358">
              Blocca il volto che ti piace: Marco resterà Marco, dall’inizio ai titoli di coda.
            </p>
          </div>
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#f5b544] text-[13px] text-right" data-node-id="27:359">
            Come funziona ↗
          </p>
        </div>
      </div>
      <div className="border-[#34362e] border-solid border-t content-stretch flex items-center justify-between px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:360" data-name="Page actions">
        <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex gap-[8px] h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0" data-node-id="27:361" data-name="Back action">
          <div className="relative shrink-0 size-[18px]" data-node-id="27:362" data-name="arrow-left">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowLeft} />
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] whitespace-nowrap" data-node-id="27:364">
            La storia
          </p>
        </div>
        <div className="content-stretch flex gap-[24px] items-center relative shrink-0" data-node-id="27:365" data-name="Continue">
          <div className="content-stretch flex gap-[7px] items-center relative shrink-0" data-node-id="27:366" data-name="Save status">
            <div className="relative shrink-0 size-[16px]" data-node-id="27:367" data-name="cloud-check">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCloudCheck} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[153px]" data-node-id="27:369">
              Salvato sul tuo computer
            </p>
          </div>
          <FilmzyPulsantePrimarioNormale className="bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[87px]" etichetta="Ai luoghi" />
        </div>
      </div>
    </div>
  );
}