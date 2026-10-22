const imgChevronRight = "https://www.figma.com/api/mcp/asset/fbd0a69c-8a6c-43d6-9c92-2559c1305328.svg";
const imgLayers = "https://www.figma.com/api/mcp/asset/4b36281e-acdd-4ece-b196-31496b7f7db7.svg";
const imgCiak = "https://www.figma.com/api/mcp/asset/29c3f0ed-9ad0-48a5-a3a7-ae8c38e6121d.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/2cbdc1c5-a1f6-441d-a761-e21d3cce57cb.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/bf49030a-702f-4280-a195-b5e1f4fbd68a.svg";
const imgX = "https://www.figma.com/api/mcp/asset/ae3ea468-5f65-4c92-90d4-f84cb040005b.svg";
const imgAlertTriangle = "https://www.figma.com/api/mcp/asset/0bc83c89-4432-467d-8259-8b68270d9647.svg";
const imgArrowRight = "https://www.figma.com/api/mcp/asset/c6ce85d1-0ed2-4ad4-94ce-b39fcce61337.svg";

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

export default function QuantoHoSpeso() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="27:72000" data-name="Quanto ho speso">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <FilmzyIntestazioneFilm className="border-[#34362e] border-b border-solid content-stretch flex h-[80px] items-center justify-between overflow-clip px-[24px] relative shrink-0 w-full" lavoriInCorso={false} />
      <div className="content-stretch flex flex-col gap-[28px] items-start min-h-[780px] overflow-clip p-[48px] relative shrink-0 w-full" data-node-id="27:72017" data-name="Spazio di lavoro">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72018" data-name="Introduction">
          <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:72019">
            SPESE · OTTOBRE 2026
          </p>
          <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:72020">
            Quanto ho speso
          </p>
          <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72021">
            Le spese dei tuoi servizi, raccolte qui. Filmzy è gratuito: gli addebiti arrivano direttamente dai fornitori.
          </p>
        </div>
        <div className="[word-break:break-word] content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72022" data-name="Totali">
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:72023" data-name="Pannello">
            <p className="font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72024">
              Questo film
            </p>
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[40px] w-full" data-node-id="27:72025">
              12,40 $
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72026">
              L’ultima corsa · dall’inizio del film
            </p>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:72027" data-name="Pannello">
            <p className="font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72028">
              Tutti i film, questo mese
            </p>
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[40px] w-full" data-node-id="27:72029">
              27,40 $
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72030">
              3 film · 5 servizi utilizzati
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72031" data-name="Grafici delle spese">
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:72032" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72033">
              Per film · questo mese
            </p>
            <div className="content-stretch flex flex-col gap-[20px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72034" data-name="Ripartizione">
              <div className="content-stretch flex flex-col gap-[9px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72035" data-name="Spesa">
                <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="27:72036" data-name="Importo">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px]" data-node-id="27:72037">
                    L’ultima corsa
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px]" data-node-id="27:72038">
                    12,40 $
                  </p>
                </div>
                <div className="bg-[#22231f] content-stretch flex h-[7px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72039" data-name="Barra">
                  <div className="bg-[#f5b544] h-[7px] relative rounded-[4px] shrink-0 w-[350px]" data-node-id="27:72040" data-name="Speso" />
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[9px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72041" data-name="Spesa">
                <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="27:72042" data-name="Importo">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px]" data-node-id="27:72043">
                    Dove finisce il mare
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px]" data-node-id="27:72044">
                    9,00 $
                  </p>
                </div>
                <div className="bg-[#22231f] content-stretch flex h-[7px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72045" data-name="Barra">
                  <div className="bg-[#f5b544] h-[7px] relative rounded-[4px] shrink-0 w-[255.5px]" data-node-id="27:72046" data-name="Speso" />
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[9px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72047" data-name="Spesa">
                <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="27:72048" data-name="Importo">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px]" data-node-id="27:72049">
                    La luna in tasca
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px]" data-node-id="27:72050">
                    6,00 $
                  </p>
                </div>
                <div className="bg-[#22231f] content-stretch flex h-[7px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72051" data-name="Barra">
                  <div className="bg-[#f5b544] h-[7px] relative rounded-[4px] shrink-0 w-[168px]" data-node-id="27:72052" data-name="Speso" />
                </div>
              </div>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:72053">
              Totale del mese: 27,40 $
            </p>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:72054" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72055">
              Per ruolo · questo film
            </p>
            <div className="content-stretch flex flex-col gap-[20px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72056" data-name="Ripartizione">
              <div className="content-stretch flex flex-col gap-[9px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72057" data-name="Spesa">
                <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="27:72058" data-name="Importo">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px]" data-node-id="27:72059">
                    Operatore di ripresa
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px]" data-node-id="27:72060">
                    8,40 $
                  </p>
                </div>
                <div className="bg-[#22231f] content-stretch flex h-[7px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72061" data-name="Barra">
                  <div className="bg-[#f5b544] h-[7px] relative rounded-[4px] shrink-0 w-[350px]" data-node-id="27:72062" data-name="Speso" />
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[9px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72063" data-name="Spesa">
                <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="27:72064" data-name="Importo">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px]" data-node-id="27:72065">
                    Storyboard e scenografia
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px]" data-node-id="27:72066">
                    2,40 $
                  </p>
                </div>
                <div className="bg-[#22231f] content-stretch flex h-[7px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72067" data-name="Barra">
                  <div className="bg-[#f5b544] h-[7px] relative rounded-[4px] shrink-0 w-[101.5px]" data-node-id="27:72068" data-name="Speso" />
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[9px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72069" data-name="Spesa">
                <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="27:72070" data-name="Importo">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px]" data-node-id="27:72071">
                    Musica ed effetti
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px]" data-node-id="27:72072">
                    1,20 $
                  </p>
                </div>
                <div className="bg-[#22231f] content-stretch flex h-[7px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72073" data-name="Barra">
                  <div className="bg-[#f5b544] h-[7px] relative rounded-[4px] shrink-0 w-[49px]" data-node-id="27:72074" data-name="Speso" />
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[9px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72075" data-name="Spesa">
                <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="27:72076" data-name="Importo">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px]" data-node-id="27:72077">
                    Scrittura e controlli
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px]" data-node-id="27:72078">
                    0,40 $
                  </p>
                </div>
                <div className="bg-[#22231f] content-stretch flex h-[7px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72079" data-name="Barra">
                  <div className="bg-[#f5b544] h-[7px] relative rounded-[4px] shrink-0 w-[17.5px]" data-node-id="27:72080" data-name="Speso" />
                </div>
              </div>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:72081">
              Totale del film: 12,40 $
            </p>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:72082" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72083">
              Per servizio · questo film
            </p>
            <div className="content-stretch flex flex-col gap-[20px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72084" data-name="Ripartizione">
              <div className="content-stretch flex flex-col gap-[9px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72085" data-name="Spesa">
                <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="27:72086" data-name="Importo">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px]" data-node-id="27:72087">
                    fal.ai
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px]" data-node-id="27:72088">
                    8,80 $
                  </p>
                </div>
                <div className="bg-[#22231f] content-stretch flex h-[7px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72089" data-name="Barra">
                  <div className="bg-[#f5b544] h-[7px] relative rounded-[4px] shrink-0 w-[350px]" data-node-id="27:72090" data-name="Speso" />
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[9px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72091" data-name="Spesa">
                <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="27:72092" data-name="Importo">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px]" data-node-id="27:72093">
                    OpenAI
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px]" data-node-id="27:72094">
                    0,40 $
                  </p>
                </div>
                <div className="bg-[#22231f] content-stretch flex h-[7px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72095" data-name="Barra">
                  <div className="bg-[#f5b544] h-[7px] relative rounded-[4px] shrink-0 w-[17.5px]" data-node-id="27:72096" data-name="Speso" />
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[9px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72097" data-name="Spesa">
                <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="27:72098" data-name="Importo">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px]" data-node-id="27:72099">
                    Replicate
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px]" data-node-id="27:72100">
                    2,00 $
                  </p>
                </div>
                <div className="bg-[#22231f] content-stretch flex h-[7px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72101" data-name="Barra">
                  <div className="bg-[#f5b544] h-[7px] relative rounded-[4px] shrink-0 w-[80.5px]" data-node-id="27:72102" data-name="Speso" />
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[9px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72103" data-name="Spesa">
                <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="27:72104" data-name="Importo">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px]" data-node-id="27:72105">
                    ElevenLabs
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px]" data-node-id="27:72106">
                    0,80 $
                  </p>
                </div>
                <div className="bg-[#22231f] content-stretch flex h-[7px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72107" data-name="Barra">
                  <div className="bg-[#f5b544] h-[7px] relative rounded-[4px] shrink-0 w-[31.5px]" data-node-id="27:72108" data-name="Speso" />
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[9px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72109" data-name="Spesa">
                <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="27:72110" data-name="Importo">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px]" data-node-id="27:72111">
                    Stability AI
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px]" data-node-id="27:72112">
                    0,40 $
                  </p>
                </div>
                <div className="bg-[#22231f] content-stretch flex h-[7px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72113" data-name="Barra">
                  <div className="bg-[#f5b544] h-[7px] relative rounded-[4px] shrink-0 w-[17.5px]" data-node-id="27:72114" data-name="Speso" />
                </div>
              </div>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:72115">
              Totale del film: 12,40 $
            </p>
          </div>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72116" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72117">
            Questo mese, per servizio
          </p>
          <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72118" data-name="Servizi collegati">
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:72119" data-name="Pannello">
              <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:72120">
                fal.ai
              </p>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:72121">
                Speso: 12,40 $ di 50 $
              </p>
              <div className="bg-[#34362e] content-stretch flex h-[4px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72122" data-name="Avanzamento">
                <div className="absolute bg-[#f5b544] h-[4px] left-0 right-[75.2%] rounded-[4px] top-0" data-node-id="27:72123" data-name="Completato" />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5b544] text-[14px] w-[min-content]" data-node-id="27:72124">
                mancano 37,60 $
              </p>
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[139px]" data-node-id="27:72125">
                Limite impostato da te
              </p>
            </div>
            <div className="[word-break:break-word] bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:72126" data-name="Pannello">
              <p className="font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72127">
                OpenAI
              </p>
              <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72128">
                Speso: 8,00 $
              </p>
              <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72129">
                Nessun limite impostato
              </p>
              <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="49:2905">
                Nota: senza limite impostato, il servizio continua a funzionare.
              </p>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:72130" data-name="Pannello">
              <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:72131">
                Replicate
              </p>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:72132">
                Speso: 4,00 $ di 5,00 $
              </p>
              <div className="bg-[#34362e] content-stretch flex h-[4px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72133" data-name="Avanzamento">
                <div className="absolute bg-[#f5b544] h-[4px] left-0 right-[20%] rounded-[4px] top-0" data-node-id="27:72134" data-name="Completato" />
              </div>
              <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72135" data-name="Indicatore">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[167px]" data-node-id="27:72136">
                  80% · Manca poco al limite
                </p>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72137" data-name="Azioni">
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[20px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72138" data-name="ElevenLabs card">
              <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="49:2907" data-name="Header">
                <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] whitespace-nowrap" data-node-id="27:72139">
                  ElevenLabs
                </p>
                <div className="bg-[#f5b544] content-stretch flex gap-[8px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="49:2908" data-name="Chip limite">
                  <div className="relative shrink-0 size-[14px]" data-node-id="49:2930" data-name="alert-triangle">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgAlertTriangle} />
                  </div>
                  <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[13px] whitespace-nowrap" data-node-id="49:2910">
                    Limite raggiunto
                  </p>
                </div>
              </div>
              <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="49:2911" data-name="Amounts">
                <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="49:2912" data-name="Speso">
                  <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px]" data-node-id="49:2913">
                    Speso
                  </p>
                  <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px]" data-node-id="49:2914">
                    2,00 $
                  </p>
                </div>
                <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="49:2915" data-name="Limite">
                  <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px]" data-node-id="49:2916">
                    Limite mensile
                  </p>
                  <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px]" data-node-id="49:2917">
                    2,00 $
                  </p>
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="49:2918" data-name="Progress">
                <div className="bg-[#34362e] content-stretch flex h-[4px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="49:2919" data-name="Track">
                  <div className="absolute bg-[#f5b544] h-[4px] left-0 right-0 rounded-[4px] top-0" data-node-id="49:2920" data-name="Completato" />
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:2921">
                  100% utilizzato
                </p>
              </div>
              <div className="content-stretch flex gap-[8px] items-center overflow-clip relative shrink-0 w-full" data-node-id="49:2922" data-name="Azione">
                <div className="relative shrink-0 size-[16px]" data-node-id="49:2933" data-name="arrow-right">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowRight} />
                </div>
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[127px]" etichetta="Aggiorna limite" />
              </div>
            </div>
            <div className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] not-italic overflow-clip relative shrink-0 text-[#aaa99e] text-[13px] w-full whitespace-nowrap" data-node-id="49:2925" data-name="Stability AI">
              <div className="content-stretch flex flex-col gap-[2px] items-start overflow-clip relative shrink-0" data-node-id="49:2926" data-name="Left">
                <p className="font-['Inter:Medium'] font-medium relative shrink-0" data-node-id="27:72140">
                  Stability AI
                </p>
                <p className="font-['Inter:Regular'] font-normal relative shrink-0" data-node-id="49:2927">
                  Speso: 1,00 $
                </p>
              </div>
              <p className="font-['Inter:Medium'] font-medium relative shrink-0" data-node-id="49:2928">
                Nessun limite impostato
              </p>
            </div>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:72141">
            Totale servizi del mese: 27,40 $
          </p>
        </div>
        <div className="bg-[#352b19] content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72142" data-name="Avviso">
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:72143">
            ✦ Imposta un limite di spesa anche nel pannello di ogni servizio
          </p>
        </div>
      </div>
      <div className="border-[#34362e] border-solid border-t content-stretch flex items-center justify-between overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:72144" data-name="Azioni della pagina">
        <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[81px]" />
        <div className="content-stretch flex items-center overflow-clip relative shrink-0" data-node-id="27:72146" data-name="Salvataggio e continua">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[153px]" data-node-id="27:72147">
            Salvato sul tuo computer
          </p>
        </div>
      </div>
    </div>
  );
}