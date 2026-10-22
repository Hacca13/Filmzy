const imgCerchio1 = "https://www.figma.com/api/mcp/asset/5319f64a-3e85-4b0b-974e-fe5b88b413a7.png";
const imgCerchio = "https://www.figma.com/api/mcp/asset/dece5b69-896e-47f2-8dda-a70fcc226a9e.svg";
const imgCerchio2 = "https://www.figma.com/api/mcp/asset/fd199432-ba37-4939-a2f5-d7d232f99aef.svg";
const imgChevronRight = "https://www.figma.com/api/mcp/asset/6f78d5cf-be59-4e44-9651-e1a653ead76b.svg";
const imgLayers = "https://www.figma.com/api/mcp/asset/a05786c2-6f73-4f16-ae75-c39f19d4ac86.svg";
const imgCiak = "https://www.figma.com/api/mcp/asset/4f6cba04-6cbd-4070-8a8d-1555aedf1f39.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/7af0a460-b3b1-4b08-9e7b-50188b5f7235.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/99c957e8-9441-49e2-80c7-1d4d81a98419.svg";
const imgX = "https://www.figma.com/api/mcp/asset/68f01f25-4fd2-4d38-a01f-065c91828f9b.svg";
const imgImmagineCinematografica = "https://www.figma.com/api/mcp/asset/c7166b82-312e-4581-bd20-cba4534d25e1.png";
const imgImmagineCinematografica1 = "https://www.figma.com/api/mcp/asset/7ec31c7e-5bd1-4291-936e-c37ce19ae1d2.png";
const imgImmagineCinematografica2 = "https://www.figma.com/api/mcp/asset/38f6708f-4d3c-4669-ad33-270e42ff4825.png";

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

type FilmzyPulsanteDistruttivoNormaleProps = {
  className?: string;
  etichetta?: string;
};

function FilmzyPulsanteDistruttivoNormale({ className, etichetta = "Elimina" }: FilmzyPulsanteDistruttivoNormaleProps) {
  return (
    <div className={className || "bg-[#b83e38] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px]"} data-node-id="49:2990" data-name="Filmzy/Pulsante/Distruttivo/Normale">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="49:2345">
        {etichetta}
      </p>
    </div>
  );
}

function FilmzyStepperMoodboard({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[#1a1b19] content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] w-[1472px]"} data-node-id="49:3070" data-name="Filmzy/Stepper/Moodboard">
      <div className="content-stretch flex gap-[20px] h-[88px] items-center overflow-clip px-[32px] relative shrink-0 w-full" data-node-id="49:3071" data-name="Percorso di creazione">
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3072" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3073" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3074" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3075" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3114">
                ✓
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3077">
              La tua idea
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3078" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3079" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3080" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3081" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3082" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3115">
                ✓
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3084">
              La storia
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3085" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3086" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3087" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3088" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3089" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" height="28" src={imgCerchio1} width="28" />
              </div>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="49:3090">
              Moodboard
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3091" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3092" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3093" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3094" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3095" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio2} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3116">
                3
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3097">
              Personaggi
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3098" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3099" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3100" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3101" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3102" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio2} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3117">
                4
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3104">
              Luoghi
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3105" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex items-center overflow-clip relative shrink-0" data-node-id="49:3106" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3107" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3108" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3109" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio2} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3118">
                5
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3111">
              Riepilogo
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[#34362e] content-stretch flex h-[3px] items-start overflow-clip relative shrink-0 w-full" data-node-id="49:3112" data-name="Traccia di avanzamento">
        <div className="bg-[#f5b544] h-[3px] relative shrink-0 w-[736px]" data-node-id="49:3113" data-name="Percorso completato" />
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

export default function Moodboard() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="27:71730" data-name="Moodboard">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <FilmzyIntestazioneFilm className="border-[#34362e] border-b border-solid content-stretch flex h-[80px] items-center justify-between overflow-clip px-[24px] relative shrink-0 w-full" lavoriInCorso={false} />
      <FilmzyStepperMoodboard className="bg-[#1a1b19] content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] shrink-0 w-full" />
      <div className="content-stretch flex flex-col gap-[28px] items-start min-h-[780px] overflow-clip p-[48px] relative shrink-0 w-full" data-node-id="27:71771" data-name="Spazio di lavoro">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:71772" data-name="Introduction">
          <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:71773">
            MOODBOARD · FACOLTATIVO
          </p>
          <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:71774">
            Il filo visivo del tuo film.
          </p>
          <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:71775">
            Colori, luce e piccoli riferimenti per ritrovare la stessa atmosfera, scena dopo scena.
          </p>
        </div>
        <div className="content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:71776" data-name="Avviso">
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:71777">
            Facoltativo, ma consigliato: aiuta a mantenere lo stesso stile in tutto il film
          </p>
        </div>
        <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71778" data-name="Azioni">
          <div className="content-center flex flex-[1_0_0] flex-wrap gap-[10px] items-center min-w-px overflow-clip relative" data-node-id="27:71779" data-name="Azioni">
            <div className="bg-[#f5b544] border border-[#f5b544] border-solid content-stretch flex h-[46px] items-center justify-center overflow-clip px-[18px] relative rounded-[12px] shrink-0" data-node-id="27:71780" data-name="Azione">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[14px] whitespace-nowrap" data-node-id="27:71781">
                Genera il moodboard · circa 0,04 $
              </p>
            </div>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
          </div>
          <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[171px]" etichetta="Carica le tue immagini" />
          <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[112px]" etichetta="Salta per ora" />
        </div>
        <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71785" data-name="Azioni">
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:71786" data-name="Indicatore">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[70px]" data-node-id="27:71787">
              Tutto il film
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[49px]" data-node-id="27:71788">
            Scena 1
          </p>
          <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[50px]" data-node-id="27:71789">
            Scena 2
          </p>
          <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[51px]" data-node-id="27:71790">
            Scena 3
          </p>
          <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[51px]" data-node-id="27:71791">
            Scena 4
          </p>
          <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[51px]" data-node-id="27:71792">
            Scena 5
          </p>
          <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[51px]" data-node-id="27:71793">
            Scena 6
          </p>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:71794" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:71795">
            I colori del film
          </p>
          <div className="content-stretch flex gap-[12px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:71796" data-name="Tavolozza modificabile">
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px overflow-clip relative" data-node-id="27:71797" data-name="Colore">
              <div className="bg-[#142a38] border border-[#b8b8ad] border-solid h-[66px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:71798" data-name="Campione" />
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[56px]" data-node-id="27:71799">
                #142A38
              </p>
              <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[8px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:71800" data-name="Nome modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:71801">
                  Blu notte ✎
                </p>
              </div>
            </div>
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px overflow-clip relative" data-node-id="27:71802" data-name="Colore">
              <div className="bg-[#be813d] border border-[#b8b8ad] border-solid h-[66px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:71803" data-name="Campione" />
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[57px]" data-node-id="27:71804">
                #BE813D
              </p>
              <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[8px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:71805" data-name="Nome modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:71806">
                  Ambra cinema ✎
                </p>
              </div>
            </div>
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px overflow-clip relative" data-node-id="27:71807" data-name="Colore">
              <div className="bg-[#b9522b] border border-[#b8b8ad] border-solid h-[66px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:71808" data-name="Campione" />
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[57px]" data-node-id="27:71809">
                #B9522B
              </p>
              <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[8px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:71810" data-name="Nome modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:71811">
                  Arancio Giulia ✎
                </p>
              </div>
            </div>
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px overflow-clip relative" data-node-id="27:71812" data-name="Colore">
              <div className="bg-[#403b32] border border-[#b8b8ad] border-solid h-[66px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:71813" data-name="Campione" />
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[58px]" data-node-id="27:71814">
                #403B32
              </p>
              <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[8px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:71815" data-name="Nome modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:71816">
                  Ombra calda ✎
                </p>
              </div>
            </div>
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px overflow-clip relative" data-node-id="27:71817" data-name="Colore">
              <div className="bg-[#e5d5b7] border border-[#b8b8ad] border-solid h-[66px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:71818" data-name="Campione" />
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[58px]" data-node-id="27:71819">
                #E5D5B7
              </p>
              <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[8px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:71820" data-name="Nome modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:71821">
                  Luce di carta ✎
                </p>
              </div>
            </div>
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px overflow-clip relative" data-node-id="27:71822" data-name="Colore">
              <div className="bg-[#1a1b19] border border-[#b8b8ad] border-solid h-[66px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:71823" data-name="Campione" />
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[52px]" data-node-id="27:71824">
                #1A1B19
              </p>
              <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[8px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:71825" data-name="Nome modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:71826">
                  Nero pellicola ✎
                </p>
              </div>
            </div>
          </div>
          <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[103px]" data-node-id="27:71827">
            <p className="leading-[normal]">+ Aggiungi colore</p>
          </div>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:71828" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:71829">
            Consigli
          </p>
          <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:71830" data-name="Campo">
            <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full" data-node-id="27:71831">
              <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Luce, colore, camera e ritmo · modificabile</p>
              <p className="leading-[1.65] mb-0 text-[14px]">Luci calde del cinema contro il blu della notte. Mantieni l’arancio di Giulia come punto di riferimento. Inquadrature classiche, movimenti lenti; lascia respirare i silenzi.</p>
              <p className="leading-[1.65] text-[#aaa99e] text-[11px]">Per esempio: luce morbida, colori desaturati e una camera che si avvicina piano.</p>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:71832" data-name="Riferimenti visivi">
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:71833" data-name="Riferimento">
            <div className="h-[235px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71834" data-name="Immagine cinematografica">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica} />
            </div>
            <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[20px] relative shrink-0 w-full" data-node-id="27:71835" data-name="Dettagli">
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[58px]" data-node-id="27:71836">
                Generata
              </p>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[17px] w-[min-content]" data-node-id="27:71837">
                Notte sul binario
              </p>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[min-content]" data-node-id="27:71838">
                Blu notte · Attesa
              </p>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:71839">
                Luce calda, ombre profonde e il tempo sospeso di una notte italiana.
              </p>
              <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71840" data-name="Azioni">
                <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[124px]" data-node-id="27:71841">
                  <p className="leading-[normal]">Usa come ispirazione</p>
                </div>
                <FilmzyPulsanteDistruttivoNormale className="bg-[#b83e38] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[78px]" />
              </div>
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:71843" data-name="Riferimento">
            <div className="h-[235px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71844" data-name="Immagine cinematografica">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica1} />
            </div>
            <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[20px] relative shrink-0 w-full" data-node-id="27:71845" data-name="Dettagli">
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[58px]" data-node-id="27:71846">
                Generata
              </p>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[17px] w-[min-content]" data-node-id="27:71847">
                Una luce che invita a restare
              </p>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[min-content]" data-node-id="27:71848">
                Ambra · Nostalgia
              </p>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:71849">
                Luce calda, ombre profonde e il tempo sospeso di una notte italiana.
              </p>
              <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71850" data-name="Azioni">
                <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[124px]" data-node-id="27:71851">
                  <p className="leading-[normal]">Usa come ispirazione</p>
                </div>
                <FilmzyPulsanteDistruttivoNormale className="bg-[#b83e38] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[78px]" />
              </div>
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:71853" data-name="Riferimento">
            <div className="h-[235px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71854" data-name="Immagine cinematografica">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica2} />
            </div>
            <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[20px] relative shrink-0 w-full" data-node-id="27:71855" data-name="Dettagli">
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[53px]" data-node-id="27:71856">
                Caricata
              </p>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[17px] w-[min-content]" data-node-id="27:71857">
                Il cuore del cinema
              </p>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[min-content]" data-node-id="27:71858">
                Pellicola · Intimità
              </p>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:71859">
                Luce calda, ombre profonde e il tempo sospeso di una notte italiana.
              </p>
              <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71860" data-name="Azioni">
                <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[124px]" data-node-id="27:71861">
                  <p className="leading-[normal]">Usa come ispirazione</p>
                </div>
                <FilmzyPulsanteDistruttivoNormale className="bg-[#b83e38] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[78px]" />
              </div>
            </div>
          </div>
        </div>
        <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71863" data-name="Azioni">
          <div className="content-center flex flex-[1_0_0] flex-wrap gap-[10px] items-center min-w-px overflow-clip relative" data-node-id="27:71864" data-name="Azioni">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[223px]" etichetta="Genera immagini · circa 0,30 $" />
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
          </div>
          <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[133px]" etichetta="Carica immagini" />
        </div>
        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:71869">
          Le immagini restano sul tuo computer. Per descriverle ne mandiamo una copia al servizio di testo che hai scelto.
        </p>
      </div>
      <div className="border-[#34362e] border-solid border-t content-stretch flex items-center justify-between overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:71870" data-name="Azioni della pagina">
        <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[81px]" />
        <div className="content-stretch flex gap-[24px] items-center overflow-clip relative shrink-0" data-node-id="27:71872" data-name="Salvataggio e continua">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[153px]" data-node-id="27:71873">
            Salvato sul tuo computer
          </p>
          <div className="bg-[#f5b544] border border-[#f5b544] border-solid content-stretch flex h-[46px] items-center justify-center overflow-clip px-[18px] relative rounded-[12px] shrink-0" data-node-id="27:71874" data-name="Azione">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[14px] whitespace-nowrap" data-node-id="27:71875">
              Ai personaggi →
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}