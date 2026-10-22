const imgCerchio2 = "https://www.figma.com/api/mcp/asset/d17afb07-ea32-4b8b-be66-d7aec61b59bc.png";
const imgCerchio = "https://www.figma.com/api/mcp/asset/52fd62f1-45fd-4de6-837b-23cfe7d83c79.svg";
const imgCerchio1 = "https://www.figma.com/api/mcp/asset/c1220bca-79b2-4a1a-8b4a-4cc01c03dce5.svg";
const imgCerchio3 = "https://www.figma.com/api/mcp/asset/8dc79cd2-8796-405b-9451-95e744b6b999.svg";
const imgChevronRight = "https://www.figma.com/api/mcp/asset/d9761ea5-edf9-4b0b-a354-9f28f40a6868.svg";
const imgLayers = "https://www.figma.com/api/mcp/asset/d6c1f3c2-3b14-4674-aa4d-ec8fe0e4ec84.svg";
const imgCiak = "https://www.figma.com/api/mcp/asset/c165babf-845e-41fd-9b66-933db65e38e1.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/54ac7918-1834-476c-8f0c-98f8702c6223.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/5d21acae-2550-4d99-ae58-74806b39c2e7.svg";
const imgX = "https://www.figma.com/api/mcp/asset/2ee46290-f13e-42fd-b523-a1bab57ca756.svg";
const imgImmagineCinematografica = "https://www.figma.com/api/mcp/asset/8389e52b-32f9-4c13-8bf6-4191fbbeebff.png";

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

function FilmzyStepperLaStoria({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[#1a1b19] content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] w-[1472px]"} data-node-id="49:3021" data-name="Filmzy/Stepper/La storia">
      <div className="content-stretch flex gap-[20px] h-[88px] items-center overflow-clip px-[32px] relative shrink-0 w-full" data-node-id="49:3022" data-name="Percorso di creazione">
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3023" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3024" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3025" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3026" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3065">
                ✓
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3028">
              La tua idea
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3029" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3030" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3031" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3032" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3033" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio1} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3066">
                2
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="49:3035">
              La storia
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3036" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3037" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3038" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3039" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3040" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" height="28" src={imgCerchio2} width="28" />
              </div>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3041">
              Moodboard
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3042" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3043" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3044" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3045" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3046" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio3} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3067">
                3
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3048">
              Personaggi
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3049" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:3050" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3051" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3052" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3053" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio3} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3068">
                4
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3055">
              Luoghi
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3056" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex items-center overflow-clip relative shrink-0" data-node-id="49:3057" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3058" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3059" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3060" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio3} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3069">
                5
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3062">
              Riepilogo
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[#34362e] content-stretch flex h-[3px] items-start overflow-clip relative shrink-0 w-full" data-node-id="49:3063" data-name="Traccia di avanzamento">
        <div className="bg-[#f5b544] h-[3px] relative shrink-0 w-[490.667px]" data-node-id="49:3064" data-name="Percorso completato" />
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

export default function LaStoria() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="27:71264" data-name="La storia">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <FilmzyIntestazioneFilm className="border-[#34362e] border-b border-solid content-stretch flex h-[80px] items-center justify-between overflow-clip px-[24px] relative shrink-0 w-full" lavoriInCorso={false} />
      <FilmzyStepperLaStoria className="bg-[#1a1b19] content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] shrink-0 w-full" />
      <div className="content-stretch flex flex-col gap-[28px] items-start min-h-[780px] overflow-clip p-[48px] relative shrink-0 w-full" data-node-id="27:71305" data-name="Spazio di lavoro">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:71306" data-name="Introduction">
          <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:71307">
            PASSO 2 DI 5 · LA STORIA
          </p>
          <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:71308">
            La tua idea ha trovato una storia.
          </p>
          <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:71309">
            Una prima versione da leggere, cambiare e fare tua.
          </p>
        </div>
        <div className="content-stretch flex gap-[28px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:71310" data-name="Bozza e ispirazione">
          <div className="content-stretch flex flex-[1_0_0] flex-col gap-[24px] items-start min-w-px overflow-clip relative" data-node-id="27:71311" data-name="Storia e dialogo">
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:71312" data-name="Pannello">
              <div className="[word-break:break-word] content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:71313" data-name="Intestazione della storia">
                <div className="content-center flex flex-[1_0_0] flex-wrap gap-[10px] items-center leading-[normal] min-w-px overflow-clip relative" data-node-id="27:71314" data-name="Azioni">
                  <p className="font-['Manrope:Regular'] font-normal relative shrink-0 text-[#f5f1e8] text-[26px] whitespace-nowrap" data-node-id="27:71315">
                    L’ultima corsa
                  </p>
                  <p className="font-['Inter:Medium'] font-medium not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[39px]" data-node-id="27:71316">
                    Bozza
                  </p>
                </div>
                <div className="flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[71px]" data-node-id="27:71317">
                  <p className="leading-[normal]">Versione 2 ⌄</p>
                </div>
              </div>
              <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71318" data-name="Azioni">
                <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[65px]" data-node-id="27:71319">
                  Versione 1
                </p>
                <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:71320" data-name="Indicatore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[67px]" data-node-id="27:71321">
                    Versione 2
                  </p>
                </div>
              </div>
              <p className="[word-break:break-word] font-['Lora:Regular'] font-normal leading-[1.55] relative shrink-0 text-[#f5f1e8] text-[16px] w-full" data-node-id="27:71322">
                Una bobina dimenticata. Un cinema da salvare. Una notte per ritrovare la strada di casa.
              </p>
              <div className="border-[#34362e] border-b border-solid content-stretch flex gap-[16px] items-start overflow-clip py-[16px] relative shrink-0 w-full" data-node-id="27:71323" data-name="Scena della bozza">
                <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:71324" data-name="Indicatore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[7px]" data-node-id="27:71325">
                    1
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px not-italic overflow-clip relative" data-node-id="27:71326" data-name="Riassunto">
                  <div className="content-stretch flex items-start justify-between leading-[normal] overflow-clip relative shrink-0 w-full" data-node-id="27:71327" data-name="Titolo e durata">
                    <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[15px] whitespace-nowrap" data-node-id="27:71328">
                      L’ultima fermata
                    </p>
                    <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-[25px]" data-node-id="27:71329">
                      18 s
                    </p>
                  </div>
                  <div className="font-['Inter:Regular'] font-normal leading-[0] relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:71330">
                    <p className="leading-[1.55] mb-0">Alla Stazione di San Luca, Marco trova una bobina dimenticata.</p>
                    <p className="leading-[1.55]">È il film che suo padre non ha mai finito.</p>
                  </div>
                </div>
              </div>
              <div className="border-[#34362e] border-b border-solid content-stretch flex gap-[16px] items-start overflow-clip py-[16px] relative shrink-0 w-full" data-node-id="27:71331" data-name="Scena della bozza">
                <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:71332" data-name="Indicatore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[9px]" data-node-id="27:71333">
                    2
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px not-italic overflow-clip relative" data-node-id="27:71334" data-name="Riassunto">
                  <div className="content-stretch flex items-start justify-between leading-[normal] overflow-clip relative shrink-0 w-full" data-node-id="27:71335" data-name="Titolo e durata">
                    <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[15px] whitespace-nowrap" data-node-id="27:71336">
                      Una luce ancora accesa
                    </p>
                    <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-[25px]" data-node-id="27:71337">
                      16 s
                    </p>
                  </div>
                  <div className="font-['Inter:Regular'] font-normal leading-[0] relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:71338">
                    <p className="leading-[1.55] mb-0">Giulia lo aspetta al Cinema Aurora.</p>
                    <p className="leading-[1.55]">Marco lascia la giacca blu sulla bici: c’è ancora una notte per salvare il cinema.</p>
                  </div>
                </div>
              </div>
              <div className="border-[#34362e] border-b border-solid content-stretch flex gap-[16px] items-start overflow-clip py-[16px] relative shrink-0 w-full" data-node-id="27:71339" data-name="Scena della bozza">
                <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:71340" data-name="Indicatore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[9px]" data-node-id="27:71341">
                    3
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px not-italic overflow-clip relative" data-node-id="27:71342" data-name="Riassunto">
                  <div className="content-stretch flex items-start justify-between leading-[normal] overflow-clip relative shrink-0 w-full" data-node-id="27:71343" data-name="Titolo e durata">
                    <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[15px] whitespace-nowrap" data-node-id="27:71344">
                      La promessa ritrovata
                    </p>
                    <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-[25px]" data-node-id="27:71345">
                      14 s
                    </p>
                  </div>
                  <div className="font-['Inter:Regular'] font-normal leading-[0] relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:71346">
                    <p className="leading-[1.55] mb-0">Nel foyer, Marco e Giulia trovano un biglietto del padre.</p>
                    <p className="leading-[1.55]">Una piccola chiave apre la strada alla cabina di proiezione.</p>
                  </div>
                </div>
              </div>
              <div className="border-[#34362e] border-b border-solid content-stretch flex gap-[16px] items-start overflow-clip py-[16px] relative shrink-0 w-full" data-node-id="27:71347" data-name="Scena della bozza">
                <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:71348" data-name="Indicatore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[9px]" data-node-id="27:71349">
                    4
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px not-italic overflow-clip relative" data-node-id="27:71350" data-name="Riassunto">
                  <div className="content-stretch flex items-start justify-between leading-[normal] overflow-clip relative shrink-0 w-full" data-node-id="27:71351" data-name="Titolo e durata">
                    <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[15px] whitespace-nowrap" data-node-id="27:71352">
                      Il primo fotogramma
                    </p>
                    <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-[25px]" data-node-id="27:71353">
                      12 s
                    </p>
                  </div>
                  <div className="font-['Inter:Regular'] font-normal leading-[0] relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:71354">
                    <p className="leading-[1.55] mb-0">Marco infila la pellicola nel proiettore.</p>
                    <p className="leading-[1.55]">Giulia gli resta accanto mentre il primo fascio di luce attraversa il buio.</p>
                  </div>
                </div>
              </div>
              <div className="border-[#34362e] border-b border-solid content-stretch flex gap-[16px] items-start overflow-clip py-[16px] relative shrink-0 w-full" data-node-id="27:71355" data-name="Scena della bozza">
                <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:71356" data-name="Indicatore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[9px]" data-node-id="27:71357">
                    5
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px not-italic overflow-clip relative" data-node-id="27:71358" data-name="Riassunto">
                  <div className="content-stretch flex items-start justify-between leading-[normal] overflow-clip relative shrink-0 w-full" data-node-id="27:71359" data-name="Titolo e durata">
                    <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[15px] whitespace-nowrap" data-node-id="27:71360">
                      Una sala, mille ricordi
                    </p>
                    <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-[25px]" data-node-id="27:71361">
                      16 s
                    </p>
                  </div>
                  <div className="font-['Inter:Regular'] font-normal leading-[0] relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:71362">
                    <p className="leading-[1.55] mb-0">Soli nella sala del Cinema Aurora, i due amici guardano il film del padre.</p>
                    <p className="leading-[1.55]">Un ricordo diventa una promessa per il futuro.</p>
                  </div>
                </div>
              </div>
              <div className="border-[#34362e] border-b border-solid content-stretch flex gap-[16px] items-start overflow-clip py-[16px] relative shrink-0 w-full" data-node-id="27:71363" data-name="Scena della bozza">
                <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:71364" data-name="Indicatore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[9px]" data-node-id="27:71365">
                    6
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px not-italic overflow-clip relative" data-node-id="27:71366" data-name="Riassunto">
                  <div className="content-stretch flex items-start justify-between leading-[normal] overflow-clip relative shrink-0 w-full" data-node-id="27:71367" data-name="Titolo e durata">
                    <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[15px] whitespace-nowrap" data-node-id="27:71368">
                      La prima corsa
                    </p>
                    <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-[25px]" data-node-id="27:71369">
                      10 s
                    </p>
                  </div>
                  <div className="font-['Inter:Regular'] font-normal leading-[0] relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:71370">
                    <p className="leading-[1.55] mb-0">All’alba, Marco e Giulia escono dal cinema e cambiano l’insegna in «Aperto».</p>
                    <p className="leading-[1.55]">Per la prima volta, restare sembra un nuovo inizio.</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#352b19] content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:71371" data-name="Avviso">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px] whitespace-pre-wrap" data-node-id="27:71372">{`✦  È solo una bozza: la rifiniamo dopo aver scelto personaggi e luoghi`}</p>
              </div>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:71373" data-name="Pannello">
              <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:71374">
                Parla con lo sceneggiatore
              </p>
              <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:71375" data-name="Campo">
                <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full" data-node-id="27:71376">
                  <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Cosa vorresti cambiare?</p>
                  <p className="leading-[1.65] text-[14px]">Vorrei che l’ultima scena lasciasse più spazio alla speranza.</p>
                </div>
              </div>
              <div className="[word-break:break-word] content-center flex flex-wrap font-['Inter:Semi_Bold'] font-semibold gap-[10px] items-center leading-[0] not-italic overflow-clip relative shrink-0 text-[#f5f1e8] text-[13px] w-full" data-node-id="27:71377" data-name="Azioni">
                <div className="flex flex-col justify-center relative shrink-0 w-[132px]" data-node-id="27:71378">
                  <p className="leading-[normal]">Rendi il finale più triste</p>
                </div>
                <div className="flex flex-col justify-center relative shrink-0 w-[113px]" data-node-id="27:71379">
                  <p className="leading-[normal]">Aggiungi un cattivo</p>
                </div>
                <div className="flex flex-col justify-center relative shrink-0 w-[54px]" data-node-id="27:71380">
                  <p className="leading-[normal]">Più breve</p>
                </div>
              </div>
              <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71381" data-name="Azioni">
                <div className="bg-[#f5b544] border border-[#f5b544] border-solid content-stretch flex h-[46px] items-center justify-center overflow-clip px-[18px] relative rounded-[12px] shrink-0" data-node-id="27:71382" data-name="Azione">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[14px] whitespace-nowrap" data-node-id="27:71383">
                    Modifica la storia · circa 0,02 $
                  </p>
                </div>
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[24px] items-start overflow-clip relative shrink-0 w-[300px]" data-node-id="27:71385" data-name="Il film prende forma">
            <div className="h-[220px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71386" data-name="Immagine cinematografica">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[22px] w-full" data-node-id="27:71387">
              Una notte. Una promessa.
            </p>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:71388">
              Marco e Giulia, tra l’ultima fermata e la prima luce del mattino.
            </p>
            <div className="[word-break:break-word] content-center flex flex-wrap font-['Inter:Medium'] font-medium gap-[10px] items-center leading-[normal] not-italic overflow-clip relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:71389" data-name="Azioni">
              <p className="relative shrink-0 w-[50px]" data-node-id="27:71390">
                6 scene
              </p>
              <p className="relative shrink-0 w-[63px]" data-node-id="27:71391">
                1 min 26 s
              </p>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:71392" data-name="Pannello">
              <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:71393">
                Il prossimo passo
              </p>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:71394">
                Prima dei personaggi, puoi raccogliere colori e immagini nel moodboard.
              </p>
              <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:71395" data-name="Indicatore">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[150px]" data-node-id="27:71396">
                  Moodboard · facoltativo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-[#34362e] border-solid border-t content-stretch flex items-center justify-between overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:71397" data-name="Azioni della pagina">
        <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[81px]" />
        <div className="content-stretch flex gap-[24px] items-center overflow-clip relative shrink-0" data-node-id="27:71399" data-name="Salvataggio e continua">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[153px]" data-node-id="27:71400">
            Salvato sul tuo computer
          </p>
          <div className="bg-[#f5b544] border border-[#f5b544] border-solid content-stretch flex h-[46px] items-center justify-center overflow-clip px-[18px] relative rounded-[12px] shrink-0" data-node-id="27:71401" data-name="Azione">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[14px] whitespace-nowrap" data-node-id="27:71402">
              Mi piace, avanti →
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}