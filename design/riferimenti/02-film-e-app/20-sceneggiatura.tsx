const imgCerchio1 = "https://www.figma.com/api/mcp/asset/c029c143-0d4e-4e72-bd74-f88fac7e8b43.png";
const imgCerchio = "https://www.figma.com/api/mcp/asset/607a7575-bb70-4abc-9ed2-7e8346c47bdb.svg";
const imgChevronRight = "https://www.figma.com/api/mcp/asset/2df411e0-8a30-4b39-881f-eb6dd502e31e.svg";
const imgLayers = "https://www.figma.com/api/mcp/asset/593fd489-9acc-40b1-8daf-d8c2a79a7908.svg";
const imgCiak = "https://www.figma.com/api/mcp/asset/801c1f94-d4f3-48ea-b552-13f1b5200fa6.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/3ec96c58-5c6a-4891-bfda-e787a57d8863.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/ee6cecbc-c3b4-416d-9ec9-b13ff6759fbb.svg";
const imgX = "https://www.figma.com/api/mcp/asset/be166b0b-ff00-4854-a218-42ccf28d4386.svg";
const imgFilmFrame = "https://www.figma.com/api/mcp/asset/683fba39-2b7b-47aa-b240-9f7863be7613.png";
const imgFilmFrame1 = "https://www.figma.com/api/mcp/asset/9bc6c777-5c5e-440b-b927-d55830daed0a.png";
const imgFilmFrame2 = "https://www.figma.com/api/mcp/asset/d642a2f6-d244-4e61-9598-2d8e8f3cd3b2.png";
const imgRefreshCw = "https://www.figma.com/api/mcp/asset/c1d4fb01-e078-4722-8926-a84599bcc506.svg";
const imgPlus = "https://www.figma.com/api/mcp/asset/f5637fb0-4d3c-4841-9fd0-3f54a8004544.svg";
const imgPencil = "https://www.figma.com/api/mcp/asset/2af09666-4a54-4a1f-9c91-2e0a60a9ff56.svg";
const imgPencil1 = "https://www.figma.com/api/mcp/asset/d4a61f87-3800-4cf4-9c74-4bbe1ed2982b.svg";
const imgPencil2 = "https://www.figma.com/api/mcp/asset/352c56f4-153a-4fa7-a585-83b5bbaf13b1.svg";
const imgFeather = "https://www.figma.com/api/mcp/asset/325fcd3c-3a7d-40c6-b1e5-ea25d9e6d3c8.svg";
const imgArrowLeft = "https://www.figma.com/api/mcp/asset/ead3819a-e34e-420e-b5b8-d2736a532565.svg";
const imgCloudCheck = "https://www.figma.com/api/mcp/asset/4624ccd6-002f-4bd6-8dd5-7248c890cddb.svg";

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

function FilmzyStepperFinale({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[#1a1b19] content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] w-[1472px]"} data-node-id="49:3266" data-name="Filmzy/Stepper/Finale">
      <div className="content-stretch flex gap-[20px] h-[88px] items-center overflow-clip px-[32px] relative shrink-0 w-full" data-node-id="49:3267" data-name="Percorso di creazione">
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3268" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3269" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3270" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3271" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3310">
                ✓
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3273">
              La tua idea
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3274" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3275" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3276" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3277" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3278" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3311">
                ✓
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3280">
              La storia
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3281" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3282" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3283" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3284" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3285" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" height="28" src={imgCerchio1} width="28" />
              </div>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3286">
              Moodboard
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3287" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3288" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3289" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3290" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3291" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3312">
                ✓
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3293">
              Personaggi
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3294" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3295" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3296" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3297" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3298" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3313">
                ✓
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3300">
              Luoghi
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3301" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex items-center overflow-clip relative shrink-0" data-node-id="49:3302" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3303" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3304" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3305" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3314">
                ✓
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3307">
              Riepilogo
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[#34362e] content-stretch flex h-[3px] items-start overflow-clip relative shrink-0 w-full" data-node-id="49:3308" data-name="Traccia di avanzamento">
        <div className="bg-[#f5b544] h-[3px] relative shrink-0 w-[1472px]" data-node-id="49:3309" data-name="Percorso completato" />
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

export default function Sceneggiatura() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="2:22415" data-name="Sceneggiatura">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <FilmzyIntestazioneFilm className="border-[#34362e] border-b border-solid content-stretch flex h-[80px] items-center justify-between overflow-clip px-[24px] relative shrink-0 w-full" lavoriInCorso={false} />
      <FilmzyStepperFinale className="bg-[#1a1b19] content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] shrink-0 w-full" />
      <div className="content-stretch flex flex-col gap-[28px] items-start overflow-clip px-[48px] py-[36px] relative shrink-0 w-full" data-node-id="2:22457" data-name="Writing workspace">
        <div className="content-stretch flex items-end justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:439" data-name="Page introduction">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[10px] items-start overflow-clip relative shrink-0 w-[930px]" data-node-id="27:440" data-name="Introduction">
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[236px]" data-node-id="27:441">
              SCENEGGIATURA · VERSIONE FINALE
            </p>
            <p className="font-['Manrope:Bold'] font-bold leading-[1.2] min-w-full relative shrink-0 text-[#f5f1e8] text-[36px] w-[min-content]" data-node-id="27:442">
              La tua storia, pronta per le scene.
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.5] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:443">
              La sceneggiatura finale è completa. Puoi ancora modificare ogni scena, poi passa alle scene per portare il film in vita.
            </p>
          </div>
          <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex gap-[8px] h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0" data-node-id="27:444" data-name="Action">
            <div className="relative shrink-0 size-[18px]" data-node-id="27:445" data-name="refresh-cw">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRefreshCw} />
            </div>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[132px]" etichetta="Riscrivi la storia" />
          </div>
        </div>
        <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:448" data-name="Script editor">
          <div className="content-stretch flex flex-col gap-[18px] items-start overflow-clip pt-[16px] relative shrink-0 w-[188px]" data-node-id="27:449" data-name="Scene outline">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[92px]" data-node-id="27:450">
              LE TUE SCENE
            </p>
            <div className="[word-break:break-word] bg-[#352b19] border-[#f5b544] border-l-2 border-solid content-stretch flex flex-col gap-[7px] items-start not-italic overflow-clip p-[12px] relative rounded-[12px] shrink-0 text-[13px] w-full" data-node-id="27:451" data-name="Outline item">
              <div className="content-stretch flex items-start justify-between leading-[normal] overflow-clip relative shrink-0 w-full" data-node-id="27:452" data-name="Scene index">
                <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5b544] w-[49px]" data-node-id="27:453">
                  Scena 1
                </p>
                <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#b2b2a8] w-[25px]" data-node-id="27:454">
                  18 s
                </p>
              </div>
              <p className="font-['Inter:Regular'] font-normal leading-[1.5] relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:455">
                L’ultima fermata
              </p>
            </div>
            <div className="[word-break:break-word] bg-[rgba(0,0,0,0)] border-[rgba(0,0,0,0)] border-l-2 border-solid content-stretch flex flex-col gap-[7px] items-start not-italic overflow-clip p-[12px] relative rounded-[12px] shrink-0 text-[13px] w-full" data-node-id="27:456" data-name="Outline item">
              <div className="content-stretch flex items-start justify-between leading-[normal] overflow-clip relative shrink-0 w-full" data-node-id="27:457" data-name="Scene index">
                <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#aaa99e] w-[51px]" data-node-id="27:458">
                  Scena 2
                </p>
                <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#b2b2a8] w-[25px]" data-node-id="27:459">
                  16 s
                </p>
              </div>
              <p className="font-['Inter:Regular'] font-normal leading-[1.5] relative shrink-0 text-[#aaa99e] w-full" data-node-id="27:460">
                Una luce ancora accesa
              </p>
            </div>
            <div className="[word-break:break-word] bg-[rgba(0,0,0,0)] border-[rgba(0,0,0,0)] border-l-2 border-solid content-stretch flex flex-col gap-[7px] items-start not-italic overflow-clip p-[12px] relative rounded-[12px] shrink-0 text-[13px] w-full" data-node-id="27:461" data-name="Outline item">
              <div className="content-stretch flex items-start justify-between leading-[normal] overflow-clip relative shrink-0 w-full" data-node-id="27:462" data-name="Scene index">
                <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#aaa99e] w-[51px]" data-node-id="27:463">
                  Scena 3
                </p>
                <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#b2b2a8] w-[25px]" data-node-id="27:464">
                  14 s
                </p>
              </div>
              <p className="font-['Inter:Regular'] font-normal leading-[1.5] relative shrink-0 text-[#aaa99e] w-full" data-node-id="27:465">
                La promessa ritrovata
              </p>
            </div>
            <div className="[word-break:break-word] bg-[rgba(0,0,0,0)] border-[rgba(0,0,0,0)] border-l-2 border-solid content-stretch flex flex-col gap-[7px] items-start not-italic overflow-clip p-[12px] relative rounded-[12px] shrink-0 text-[13px] w-full" data-node-id="27:466" data-name="Outline item">
              <div className="content-stretch flex items-start justify-between leading-[normal] overflow-clip relative shrink-0 w-full" data-node-id="27:467" data-name="Scene index">
                <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#aaa99e] w-[51px]" data-node-id="27:468">
                  Scena 4
                </p>
                <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#b2b2a8] w-[25px]" data-node-id="27:469">
                  12 s
                </p>
              </div>
              <p className="font-['Inter:Regular'] font-normal leading-[1.5] relative shrink-0 text-[#aaa99e] w-full" data-node-id="27:470">
                Il primo fotogramma
              </p>
            </div>
            <div className="[word-break:break-word] bg-[rgba(0,0,0,0)] border-[rgba(0,0,0,0)] border-l-2 border-solid content-stretch flex flex-col gap-[7px] items-start not-italic overflow-clip p-[12px] relative rounded-[12px] shrink-0 text-[13px] w-full" data-node-id="27:471" data-name="Outline item">
              <div className="content-stretch flex items-start justify-between leading-[normal] overflow-clip relative shrink-0 w-full" data-node-id="27:472" data-name="Scene index">
                <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#aaa99e] w-[51px]" data-node-id="27:473">
                  Scena 5
                </p>
                <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#b2b2a8] w-[25px]" data-node-id="27:474">
                  16 s
                </p>
              </div>
              <p className="font-['Inter:Regular'] font-normal leading-[1.5] relative shrink-0 text-[#aaa99e] w-full" data-node-id="27:475">
                Una sala, mille ricordi
              </p>
            </div>
            <div className="[word-break:break-word] bg-[rgba(0,0,0,0)] border-[rgba(0,0,0,0)] border-l-2 border-solid content-stretch flex flex-col gap-[7px] items-start not-italic overflow-clip p-[12px] relative rounded-[12px] shrink-0 text-[13px] w-full" data-node-id="27:476" data-name="Outline item">
              <div className="content-stretch flex items-start justify-between leading-[normal] overflow-clip relative shrink-0 w-full" data-node-id="27:477" data-name="Scene index">
                <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#aaa99e] w-[51px]" data-node-id="27:478">
                  Scena 6
                </p>
                <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#b2b2a8] w-[25px]" data-node-id="27:479">
                  10 s
                </p>
              </div>
              <p className="font-['Inter:Regular'] font-normal leading-[1.5] relative shrink-0 text-[#aaa99e] w-full" data-node-id="27:480">
                La prima corsa
              </p>
            </div>
            <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex gap-[8px] h-[36px] items-center justify-center overflow-clip px-[14px] relative rounded-[12px] shrink-0" data-node-id="27:481" data-name="Action">
              <div className="relative shrink-0 size-[16px]" data-node-id="27:482" data-name="plus">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPlus} />
              </div>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[130px]" etichetta="Aggiungi scena" />
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.7] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[155px]" data-node-id="27:485">
              6 scene · circa 1 min 26 s
            </p>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:486" data-name="Screenplay document">
            <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:487" data-name="Document header">
              <div className="[word-break:break-word] content-stretch flex flex-col font-normal gap-[7px] items-start leading-[normal] overflow-clip relative shrink-0" data-node-id="27:488" data-name="Film title">
                <p className="font-['Manrope:Regular'] relative shrink-0 text-[#f5f1e8] text-[25px] whitespace-nowrap" data-node-id="27:489">
                  L’ultima corsa
                </p>
                <p className="font-['Inter:Regular'] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[191px]" data-node-id="27:490">
                  Sceneggiatura · Versione finale
                </p>
              </div>
              <div className="bg-[#352b19] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:491" data-name="Status">
                <div className="relative shrink-0 size-[12px]" data-node-id="27:492" data-name="pencil">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPencil} />
                </div>
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[78px]" data-node-id="27:494">
                  Modificabile
                </p>
              </div>
            </div>
            <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:495" data-name="Document rule" />
            <div className="bg-[#22231f] border border-[#f5b544] border-solid content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[20px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:496" data-name="Editable scene">
              <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:497" data-name="Scene heading">
                <div className="[word-break:break-word] content-stretch flex gap-[10px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 text-[13px]" data-node-id="27:498" data-name="Scene identity">
                  <p className="font-['Inter:Bold'] font-bold relative shrink-0 text-[#f5b544] w-[49px]" data-node-id="27:499">
                    Scena 1
                  </p>
                  <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#f5f1e8] whitespace-nowrap" data-node-id="27:500">
                    L’ultima fermata
                  </p>
                </div>
                <div className="content-stretch flex gap-[7px] items-center overflow-clip relative shrink-0" data-node-id="27:501" data-name="Edit scene">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[25px]" data-node-id="27:502">
                    18 s
                  </p>
                  <div className="relative shrink-0 size-[13px]" data-node-id="27:503" data-name="pencil">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPencil1} />
                  </div>
                </div>
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[237px]" data-node-id="27:505">
                EST. STAZIONE DI SAN LUCA · NOTTE
              </p>
              <p className="[word-break:break-word] font-['Lora:Regular'] font-normal leading-[1.65] min-w-full relative shrink-0 text-[#f5f1e8] text-[15px] w-[min-content]" data-node-id="27:506">
                L’ultimo treno scompare. Marco, giacca blu e occhi stanchi, nota una bobina dimenticata sulla panchina. La apre. Dentro, un biglietto nella calligrafia di suo padre. |
              </p>
              <div className="[word-break:break-word] content-stretch flex flex-col font-normal gap-[6px] items-center leading-[normal] overflow-clip relative shrink-0 w-full" data-node-id="27:507" data-name="Dialogue">
                <p className="font-['Inter:Regular'] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[49px]" data-node-id="27:508">
                  MARCO
                </p>
                <p className="font-['Lora:Italic'] italic relative shrink-0 text-[#f5f1e8] text-[15px] whitespace-nowrap" data-node-id="27:509">
                  «Allora non l’avevi buttato via.»
                </p>
              </div>
              <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:510" data-name="Editing controls">
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[189px]" data-node-id="27:511">
                  Stai modificando questa scena
                </p>
                <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0" data-node-id="27:512" data-name="Edit actions">
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Annulla" />
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Salva" />
                </div>
              </div>
            </div>
            <div className="bg-[rgba(0,0,0,0)] border-[#34362e] border-b border-solid content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[20px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:517" data-name="Editable scene">
              <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:518" data-name="Scene heading">
                <div className="[word-break:break-word] content-stretch flex gap-[10px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 text-[13px]" data-node-id="27:519" data-name="Scene identity">
                  <p className="font-['Inter:Bold'] font-bold relative shrink-0 text-[#f5b544] w-[51px]" data-node-id="27:520">
                    Scena 2
                  </p>
                  <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#f5f1e8] whitespace-nowrap" data-node-id="27:521">
                    Una luce ancora accesa
                  </p>
                </div>
                <div className="content-stretch flex gap-[7px] items-center overflow-clip relative shrink-0" data-node-id="27:522" data-name="Edit scene">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[25px]" data-node-id="27:523">
                    16 s
                  </p>
                  <div className="relative shrink-0 size-[13px]" data-node-id="27:524" data-name="pencil">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPencil2} />
                  </div>
                </div>
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[197px]" data-node-id="27:526">
                EST. CINEMA AURORA · NOTTE
              </p>
              <p className="[word-break:break-word] font-['Lora:Regular'] font-normal leading-[1.65] min-w-full relative shrink-0 text-[#f5f1e8] text-[15px] w-[min-content]" data-node-id="27:527">
                Giulia lo aspetta davanti al cinema. Marco si sfila la giacca blu e la lascia sulla sua bici. Tiene la bobina stretta al petto. L’insegna si accende, una lettera alla volta.
              </p>
              <div className="[word-break:break-word] content-stretch flex flex-col font-normal gap-[6px] items-center leading-[normal] overflow-clip relative shrink-0 w-full" data-node-id="27:528" data-name="Dialogue">
                <p className="font-['Inter:Regular'] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[43px]" data-node-id="27:529">
                  GIULIA
                </p>
                <p className="font-['Lora:Italic'] italic relative shrink-0 text-[#f5f1e8] text-[15px] whitespace-nowrap" data-node-id="27:530">
                  «Se corriamo, siamo ancora in tempo.»
                </p>
              </div>
            </div>
            <div className="bg-[rgba(0,0,0,0)] border-[#34362e] border-b border-solid content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[20px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:531" data-name="Editable scene">
              <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:532" data-name="Scene heading">
                <div className="[word-break:break-word] content-stretch flex gap-[10px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 text-[13px]" data-node-id="27:533" data-name="Scene identity">
                  <p className="font-['Inter:Bold'] font-bold relative shrink-0 text-[#f5b544] w-[52px]" data-node-id="27:534">
                    Scena 3
                  </p>
                  <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#f5f1e8] whitespace-nowrap" data-node-id="27:535">
                    La promessa ritrovata
                  </p>
                </div>
                <div className="content-stretch flex gap-[7px] items-center overflow-clip relative shrink-0" data-node-id="27:536" data-name="Edit scene">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[25px]" data-node-id="27:537">
                    14 s
                  </p>
                  <div className="relative shrink-0 size-[13px]" data-node-id="27:538" data-name="pencil">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPencil2} />
                  </div>
                </div>
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[239px]" data-node-id="27:540">
                INT. FOYER CINEMA AURORA · NOTTE
              </p>
              <p className="[word-break:break-word] font-['Lora:Regular'] font-normal leading-[1.65] min-w-full relative shrink-0 text-[#f5f1e8] text-[15px] w-[min-content]" data-node-id="27:541">
                Marco e Giulia entrano nel foyer. Trovano il biglietto del padre e la chiave della cabina di proiezione. Sul muro, una vecchia fotografia mostra il padre tra locandine sbiadite.
              </p>
              <div className="[word-break:break-word] content-stretch flex flex-col font-normal gap-[6px] items-center leading-[normal] overflow-clip relative shrink-0 w-full" data-node-id="27:542" data-name="Dialogue">
                <p className="font-['Inter:Regular'] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[43px]" data-node-id="27:543">
                  GIULIA
                </p>
                <p className="font-['Lora:Italic'] italic relative shrink-0 text-[#f5f1e8] text-[15px] whitespace-nowrap" data-node-id="27:544">
                  «Sembra che qualcuno ti stia aspettando.»
                </p>
              </div>
            </div>
            <div className="bg-[rgba(0,0,0,0)] border-[#34362e] border-b border-solid content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[20px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:545" data-name="Editable scene">
              <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:546" data-name="Scene heading">
                <div className="[word-break:break-word] content-stretch flex gap-[10px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 text-[13px]" data-node-id="27:547" data-name="Scene identity">
                  <p className="font-['Inter:Bold'] font-bold relative shrink-0 text-[#f5b544] w-[52px]" data-node-id="27:548">
                    Scena 4
                  </p>
                  <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#f5f1e8] whitespace-nowrap" data-node-id="27:549">
                    Il primo fotogramma
                  </p>
                </div>
                <div className="content-stretch flex gap-[7px] items-center overflow-clip relative shrink-0" data-node-id="27:550" data-name="Edit scene">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[25px]" data-node-id="27:551">
                    12 s
                  </p>
                  <div className="relative shrink-0 size-[13px]" data-node-id="27:552" data-name="pencil">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPencil2} />
                  </div>
                </div>
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[231px]" data-node-id="27:554">
                INT. CABINA DI PROIEZIONE · NOTTE
              </p>
              <p className="[word-break:break-word] font-['Lora:Regular'] font-normal leading-[1.65] min-w-full relative shrink-0 text-[#f5f1e8] text-[15px] w-[min-content]" data-node-id="27:555">
                Marco, in camicia chiara, infila la pellicola nel proiettore. Le mani tremano. Giulia gli sfiora la spalla. Un fascio di luce attraversa il buio.
              </p>
            </div>
            <div className="bg-[rgba(0,0,0,0)] border-[#34362e] border-b border-solid content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[20px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:556" data-name="Editable scene">
              <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:557" data-name="Scene heading">
                <div className="[word-break:break-word] content-stretch flex gap-[10px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 text-[13px]" data-node-id="27:558" data-name="Scene identity">
                  <p className="font-['Inter:Bold'] font-bold relative shrink-0 text-[#f5b544] w-[51px]" data-node-id="27:559">
                    Scena 5
                  </p>
                  <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#f5f1e8] whitespace-nowrap" data-node-id="27:560">
                    Una sala, mille ricordi
                  </p>
                </div>
                <div className="content-stretch flex gap-[7px] items-center overflow-clip relative shrink-0" data-node-id="27:561" data-name="Edit scene">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[25px]" data-node-id="27:562">
                    16 s
                  </p>
                  <div className="relative shrink-0 size-[13px]" data-node-id="27:563" data-name="pencil">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPencil2} />
                  </div>
                </div>
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[201px]" data-node-id="27:565">
                INT. SALA DEL CINEMA · NOTTE
              </p>
              <p className="[word-break:break-word] font-['Lora:Regular'] font-normal leading-[1.65] min-w-full relative shrink-0 text-[#f5f1e8] text-[15px] w-[min-content]" data-node-id="27:566">
                Il film del padre illumina lo schermo. Marco e Giulia siedono vicini, soli nella grande sala. Per un attimo, nessuno dei due vuole andare via.
              </p>
            </div>
            <div className="bg-[rgba(0,0,0,0)] border-[#34362e] border-b border-solid content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[20px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:567" data-name="Editable scene">
              <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:568" data-name="Scene heading">
                <div className="[word-break:break-word] content-stretch flex gap-[10px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 text-[13px]" data-node-id="27:569" data-name="Scene identity">
                  <p className="font-['Inter:Bold'] font-bold relative shrink-0 text-[#f5b544] w-[52px]" data-node-id="27:570">
                    Scena 6
                  </p>
                  <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#f5f1e8] whitespace-nowrap" data-node-id="27:571">
                    La prima corsa
                  </p>
                </div>
                <div className="content-stretch flex gap-[7px] items-center overflow-clip relative shrink-0" data-node-id="27:572" data-name="Edit scene">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[25px]" data-node-id="27:573">
                    10 s
                  </p>
                  <div className="relative shrink-0 size-[13px]" data-node-id="27:574" data-name="pencil">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPencil2} />
                  </div>
                </div>
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[187px]" data-node-id="27:576">
                EST. CINEMA AURORA · ALBA
              </p>
              <p className="[word-break:break-word] font-['Lora:Regular'] font-normal leading-[1.65] min-w-full relative shrink-0 text-[#f5f1e8] text-[15px] w-[min-content]" data-node-id="27:577">
                Marco e Giulia escono nella luce del mattino. Sull’insegna, cambiano una sola parola: «Aperto». Marco sorride. La città ricomincia a muoversi.
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] text-center w-full" data-node-id="27:578">
              FINE
            </p>
          </div>
          <div className="content-stretch flex flex-col gap-[24px] items-start overflow-clip relative shrink-0 w-[268px]" data-node-id="27:579" data-name="Story reference">
            <div className="bg-[#1a1b19] content-stretch flex flex-col gap-[20px] items-start overflow-clip p-[20px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:580" data-name="Characters">
              <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 w-full" data-node-id="27:581" data-name="Section heading">
                <p className="relative shrink-0 text-[#f5f1e8] text-[14px] whitespace-nowrap" data-node-id="27:582">
                  Personaggi
                </p>
                <p className="relative shrink-0 text-[#b2b2a8] text-[13px] w-[8px]" data-node-id="27:583">
                  2
                </p>
              </div>
              <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:584" data-name="Character reference">
                <div className="bg-[#352b19] content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[34px]" data-node-id="27:585" data-name="Avatar">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="27:586">
                    M
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[5px] items-start leading-[normal] min-w-px not-italic overflow-clip relative text-[13px]" data-node-id="27:587" data-name="Identity">
                  <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] w-[40px]" data-node-id="27:588">
                    Marco
                  </p>
                  <p className="font-['Inter:Regular'] font-normal min-w-full relative shrink-0 text-[#aaa99e] w-[min-content]" data-node-id="27:589">
                    Protagonista · Volto bloccato
                  </p>
                </div>
              </div>
              <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:590" data-name="Character reference">
                <div className="bg-[#352b19] content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[34px]" data-node-id="27:591" data-name="Avatar">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="27:592">
                    G
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[5px] items-start leading-[normal] min-w-px not-italic overflow-clip relative text-[13px]" data-node-id="27:593" data-name="Identity">
                  <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] w-[36px]" data-node-id="27:594">
                    Giulia
                  </p>
                  <p className="font-['Inter:Regular'] font-normal min-w-full relative shrink-0 text-[#aaa99e] w-[min-content]" data-node-id="27:595">
                    Alleata · Amica di Marco
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#1a1b19] content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[20px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:596" data-name="Locations">
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] whitespace-nowrap" data-node-id="27:597">
                Luoghi
              </p>
              <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:598" data-name="Location">
                <div className="h-[90px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:599" data-name="Film frame">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[8px] size-full" src={imgFilmFrame} />
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[129px]" data-node-id="27:600">
                  Stazione di San Luca
                </p>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[146px]" data-node-id="27:601">
                  Scena 1 · Esterno, notte
                </p>
              </div>
              <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:602" data-name="Location">
                <div className="h-[90px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:603" data-name="Film frame">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[8px] size-full" src={imgFilmFrame1} />
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[91px]" data-node-id="27:604">
                  Cinema Aurora
                </p>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[96px]" data-node-id="27:605">
                  Scene 2, 3, 5, 6
                </p>
              </div>
              <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:606" data-name="Location">
                <div className="h-[90px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:607" data-name="Film frame">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[8px] size-full" src={imgFilmFrame2} />
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[126px]" data-node-id="27:608">
                  Cabina di proiezione
                </p>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[144px]" data-node-id="27:609">
                  Scena 4 · Interno, notte
                </p>
              </div>
            </div>
            <div className="content-stretch flex gap-[10px] items-start overflow-clip p-[14px] relative shrink-0 w-full" data-node-id="27:610" data-name="Writing tip">
              <div className="relative shrink-0 size-[18px]" data-node-id="27:611" data-name="feather">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFeather} />
              </div>
              <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.7] min-w-px not-italic relative text-[#aaa99e] text-[13px]" data-node-id="27:613">
                Un gesto può raccontare più di mille parole. Lascia spazio alle immagini.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-[#34362e] border-solid border-t content-stretch flex items-center justify-between overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="2:22629" data-name="Page actions">
        <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex gap-[8px] h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0" data-node-id="27:614" data-name="Action">
          <div className="relative shrink-0 size-[18px]" data-node-id="27:615" data-name="arrow-left">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowLeft} />
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] whitespace-nowrap" data-node-id="27:617">
            Riepilogo
          </p>
        </div>
        <div className="content-stretch flex gap-[24px] items-center overflow-clip relative shrink-0" data-node-id="27:618" data-name="Continue">
          <div className="content-stretch flex gap-[7px] items-center overflow-clip relative shrink-0" data-node-id="27:619" data-name="Save status">
            <div className="relative shrink-0 size-[16px]" data-node-id="27:620" data-name="cloud-check">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCloudCheck} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[153px]" data-node-id="27:622">
              Salvato sul tuo computer
            </p>
          </div>
          <FilmzyPulsantePrimarioNormale className="bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[89px]" etichetta="Le scene" />
        </div>
      </div>
    </div>
  );
}