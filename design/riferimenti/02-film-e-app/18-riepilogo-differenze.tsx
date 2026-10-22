const imgCerchio1 = "https://www.figma.com/api/mcp/asset/fc1c95c6-4f44-452d-9508-466d314e65ab.png";
const imgCerchio = "https://www.figma.com/api/mcp/asset/6d047b46-c39b-412d-a324-28fdfa25b4d0.svg";
const imgCerchio2 = "https://www.figma.com/api/mcp/asset/dc9624a1-fdc3-4bf8-815d-b1d814f2ab87.svg";
const imgChevronRight = "https://www.figma.com/api/mcp/asset/7689b026-3f66-4d17-8f02-6b7c8b87759c.svg";
const imgLayers = "https://www.figma.com/api/mcp/asset/b2387890-b802-4e98-8b34-3f7396bfce1d.svg";
const imgCiak = "https://www.figma.com/api/mcp/asset/2ffeedb8-513b-4669-9d17-4eabb5f5d1fe.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/dcacbff5-08f5-4426-94e3-a14a70ac6318.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/b58f7999-9169-4d4b-a378-f311d7acf56a.svg";
const imgX = "https://www.figma.com/api/mcp/asset/d45c8a45-a133-4436-9b84-39da03f59a87.svg";
const imgImmagineCinematografica = "https://www.figma.com/api/mcp/asset/0cca2ee6-df07-4cfe-9324-5dca68badb5b.png";
const imgImmagineCinematografica1 = "https://www.figma.com/api/mcp/asset/a93e4e06-4d18-4fbb-98ec-47ce8e8a1a98.png";
const imgImmagineCinematografica2 = "https://www.figma.com/api/mcp/asset/a6c4122e-59b9-4a2f-af3a-93ea0ce88cf2.png";
const imgCheck = "https://www.figma.com/api/mcp/asset/0cbc5e44-fe62-4af1-819c-c2b85e89f081.svg";

type FilmzyPulsanteSecondarioDisabilitatoProps = {
  className?: string;
  etichetta?: string;
};

function FilmzyPulsanteSecondarioDisabilitato({ className, etichetta = "Indietro" }: FilmzyPulsanteSecondarioDisabilitatoProps) {
  return (
    <div className={className || "bg-[#292a26] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px]"} data-node-id="49:2985" data-name="Filmzy/Pulsante/Secondario/Disabilitato">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:2322">
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

function FilmzyStepperRiepilogo({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[#1a1b19] content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] w-[1472px]"} data-node-id="49:3217" data-name="Filmzy/Stepper/Riepilogo">
      <div className="content-stretch flex gap-[20px] h-[88px] items-center overflow-clip px-[32px] relative shrink-0 w-full" data-node-id="49:3218" data-name="Percorso di creazione">
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3219" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3220" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3221" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3222" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3261">
                ✓
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3224">
              La tua idea
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3225" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3226" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3227" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3228" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3229" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3262">
                ✓
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3231">
              La storia
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3232" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3233" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3234" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3235" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3236" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" height="28" src={imgCerchio1} width="28" />
              </div>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3237">
              Moodboard
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3238" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3239" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3240" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3241" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3242" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3263">
                ✓
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3244">
              Personaggi
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3245" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3246" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3247" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3248" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3249" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3264">
                ✓
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3251">
              Luoghi
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3252" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex items-center overflow-clip relative shrink-0" data-node-id="49:3253" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3254" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3255" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3256" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio2} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3265">
                5
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="49:3258">
              Riepilogo
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[#34362e] content-stretch flex h-[3px] items-start overflow-clip relative shrink-0 w-full" data-node-id="49:3259" data-name="Traccia di avanzamento">
        <div className="bg-[#f5b544] h-[3px] relative shrink-0 w-[1472px]" data-node-id="49:3260" data-name="Percorso completato" />
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

export default function RiepilogoDifferenzeDaRisolvere() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="27:71634" data-name="Riepilogo · Differenze da risolvere">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <FilmzyIntestazioneFilm className="border-[#34362e] border-b border-solid content-stretch flex h-[80px] items-center justify-between overflow-clip px-[24px] relative shrink-0 w-full" lavoriInCorso={false} />
      <FilmzyStepperRiepilogo className="bg-[#1a1b19] content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] shrink-0 w-full" />
      <div className="content-stretch flex flex-col gap-[28px] items-start min-h-[780px] overflow-clip p-[48px] relative shrink-0 w-full" data-node-id="27:71675" data-name="Spazio di lavoro">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:71676" data-name="Introduction">
          <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:71677">
            PASSO 5 DI 5 · RIEPILOGO
          </p>
          <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:71678">
            Facciamo tornare tutti i pezzi.
          </p>
          <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:71679">
            Questa è ancora la bozza: confrontiamola con le tue scelte prima di scrivere la sceneggiatura finale.
          </p>
        </div>
        <div className="bg-[#302d1a] content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:71680" data-name="Avviso">
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#ffe34d] text-[14px] whitespace-pre-wrap" data-node-id="27:71681">{`⚠  Ci sono 2 differenze da risolvere. Nessuna modifica è stata applicata alla storia.`}</p>
        </div>
        <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:71682" data-name="Confronto tra bozza e scelte">
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:71683" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:71684">
              Nella bozza
            </p>
            <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[146px]" data-node-id="27:71685">
              Versione 1 · da adattare
            </p>
            <p className="[word-break:break-word] font-['Lora:Regular'] font-normal leading-[1.55] min-w-full relative shrink-0 text-[#f5f1e8] text-[17px] w-[min-content]" data-node-id="27:71686">
              Marco arriva in una locanda. Un oste gli consegna la vecchia bobina di suo padre e gli indica la strada per il cinema.
            </p>
            <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:71687" data-name="Separatore" />
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:71688">
              Personaggi: Marco, Giulia, un oste
            </p>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:71689">
              Apertura: una locanda, di notte
            </p>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:71690" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:71691">
              Le tue scelte
            </p>
            <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71692" data-name="Azioni">
              <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:71693" data-name="Indicatore">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[157px]" data-node-id="27:71694">
                  Marco · 32 · Protagonista
                </p>
              </div>
              <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:71695" data-name="Indicatore">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[118px]" data-node-id="27:71696">
                  Giulia · 30 · Alleato
                </p>
              </div>
            </div>
            <div className="content-stretch flex gap-[14px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:71697" data-name="Luoghi scelti">
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px overflow-clip relative" data-node-id="27:71698" data-name="Luogo">
                <div className="h-[105px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71699" data-name="Immagine cinematografica">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica} />
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-full" data-node-id="27:71700">
                  Stazione di San Luca
                </p>
              </div>
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px overflow-clip relative" data-node-id="27:71701" data-name="Luogo">
                <div className="h-[105px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71702" data-name="Immagine cinematografica">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica1} />
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-full" data-node-id="27:71703">
                  Cinema Aurora
                </p>
              </div>
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px overflow-clip relative" data-node-id="27:71704" data-name="Luogo">
                <div className="h-[105px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71705" data-name="Immagine cinematografica">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica2} />
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-full" data-node-id="27:71706">
                  Cabina di proiezione
                </p>
              </div>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:71707">
              2 personaggi · 3 luoghi · 6 scene previste
            </p>
          </div>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:71708" data-name="Pannello">
          <div className="bg-[#111211] border border-[#34362e] border-solid content-stretch flex gap-[10px] items-center overflow-clip p-[12px] relative rounded-[12px] shrink-0 w-full" data-node-id="49:2887" data-name="Esempio risolto">
            <div className="bg-[#f5b544] content-stretch flex flex-col items-center justify-center relative rounded-[12px] shrink-0 size-[24px]" data-node-id="49:2888" data-name="Icona">
              <div className="relative shrink-0 size-[14px]" data-node-id="49:2902" data-name="check">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
              </div>
            </div>
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#aaa99e] text-[13px]" data-node-id="49:2890">
              ✓ Giulia è stata confermata come alleato.
            </p>
          </div>
          <div className="bg-[#302d1a] content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:71709" data-name="Avviso">
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#ffe34d] text-[14px] whitespace-pre-wrap" data-node-id="27:71710">{`⚠  Nella bozza c’è un oste, ma non l’hai scelto tra i personaggi`}</p>
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71711" data-name="Azioni">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[128px]" etichetta="Adatta la storia" />
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[162px]" etichetta="Cambia la mia scelta" />
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[113px]" etichetta="Va bene così" />
          </div>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:71716" data-name="Pannello">
          <div className="bg-[#302d1a] content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:71717" data-name="Avviso">
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#ffe34d] text-[14px] whitespace-pre-wrap" data-node-id="27:71718">{`⚠  La bozza si apre in una locanda, ma hai scelto la Stazione di San Luca`}</p>
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71719" data-name="Azioni">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[128px]" etichetta="Adatta la storia" />
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[162px]" etichetta="Cambia la mia scelta" />
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[113px]" etichetta="Va bene così" />
          </div>
        </div>
        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:71724">
          Dopo aver risolto queste differenze, potrai scrivere la sceneggiatura finale con Marco e Giulia e i luoghi che hai scelto.
        </p>
      </div>
      <div className="border-[#34362e] border-solid border-t content-stretch flex flex-col items-start overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:71725" data-name="Azioni della pagina">
        <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="49:2895" data-name="Azioni">
          <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[81px]" />
          <div className="content-stretch flex gap-[24px] items-center overflow-clip relative shrink-0" data-node-id="27:71727" data-name="Salvataggio e continua">
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[153px]" data-node-id="27:71728">
              Salvato sul tuo computer
            </p>
            <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-[360px]" data-node-id="49:2896" data-name="Prossimo passo disabilitato">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] min-w-full not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[min-content]" data-node-id="49:2897">
                Prossimo passo
              </p>
              <FilmzyPulsanteSecondarioDisabilitato className="bg-[#292a26] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[214px]" etichetta="Scrivi la sceneggiatura finale" />
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="49:2900">
                Ancora 2 differenze da risolvere.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}