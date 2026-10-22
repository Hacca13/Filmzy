const imgCerchio = "https://www.figma.com/api/mcp/asset/b5afa335-d797-4af7-b35e-6ba0faef4dfa.svg";
const imgCerchio1 = "https://www.figma.com/api/mcp/asset/84f64891-f5d0-46bf-83c4-2984283b9535.svg";
const imgCiak = "https://www.figma.com/api/mcp/asset/4b2d6de9-87cf-48ed-8abe-437325e3a916.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/9f6f3509-03f9-4077-8159-56ca4d63ffd6.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/9087ce2d-fdf0-47c2-82fa-b905185168bb.svg";
const imgX = "https://www.figma.com/api/mcp/asset/b717ff40-c834-4d6c-87b7-cbd35481cbcf.svg";

type FilmzyPulsantePrimarioDisabilitatoProps = {
  className?: string;
  etichetta?: string;
};

function FilmzyPulsantePrimarioDisabilitato({ className, etichetta = "Continua" }: FilmzyPulsantePrimarioDisabilitatoProps) {
  return (
    <div className={className || "bg-[#292a26] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px]"} data-node-id="49:2981" data-name="Filmzy/Pulsante/Primario/Disabilitato">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:2306">
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

function FilmzyPrimoAvvio1({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[#1a1b19] content-stretch flex gap-[20px] h-[72px] items-center overflow-clip px-[32px] relative rounded-[12px] w-[1472px]"} data-node-id="49:3315" data-name="Filmzy/Primo avvio/1">
      <div className="content-stretch flex flex-[1_0_0] gap-[24px] items-center min-w-px overflow-clip relative" data-node-id="49:2585" data-name="Tappa">
        <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:2586" data-name="Passo di creazione">
          <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:2587" data-name="Indicatore del passo">
            <div className="absolute left-0 size-[28px] top-0" data-node-id="49:2588" data-name="Cerchio">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#f5b545] text-[13px] whitespace-nowrap" data-node-id="49:2589">
              1
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:2590">
            Fornitori
          </p>
        </div>
        <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:2591" data-name="Collegamento" />
      </div>
      <div className="content-stretch flex flex-[1_0_0] gap-[24px] items-center min-w-px overflow-clip relative" data-node-id="49:2592" data-name="Tappa">
        <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:2593" data-name="Passo di creazione">
          <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:2594" data-name="Indicatore del passo">
            <div className="absolute left-0 size-[28px] top-0" data-node-id="49:2595" data-name="Cerchio">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio1} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:2596">
              2
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="49:2597">
            Chiave
          </p>
        </div>
        <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:2598" data-name="Collegamento" />
      </div>
      <div className="content-stretch flex flex-[1_0_0] gap-[24px] items-center min-w-px overflow-clip relative" data-node-id="49:2599" data-name="Tappa">
        <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:2600" data-name="Passo di creazione">
          <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:2601" data-name="Indicatore del passo">
            <div className="absolute left-0 size-[28px] top-0" data-node-id="49:2602" data-name="Cerchio">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio1} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:2603">
              3
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:2604">
            Servizi
          </p>
        </div>
        <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:2605" data-name="Collegamento" />
      </div>
      <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip relative" data-node-id="49:2606" data-name="Tappa">
        <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:2607" data-name="Passo di creazione">
          <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:2608" data-name="Indicatore del passo">
            <div className="absolute left-0 size-[28px] top-0" data-node-id="49:2609" data-name="Cerchio">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio1} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:2610">
              4
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:2611">
            Spese
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

export default function BenvenutoInFilmzyFornitori() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="27:72149" data-name="Benvenuto in Filmzy · Fornitori">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <FilmzyPrimoAvvio1 className="bg-[#1a1b19] content-stretch flex gap-[20px] h-[72px] items-center overflow-clip px-[32px] relative rounded-[12px] shrink-0 w-full" />
      <div className="content-stretch flex gap-[56px] items-start min-h-[840px] overflow-clip px-[140px] py-[40px] relative shrink-0 w-full" data-node-id="27:72165" data-name="Primo avvio">
        <div className="content-stretch flex flex-col gap-[24px] items-start overflow-clip relative shrink-0 w-[330px]" data-node-id="27:72166" data-name="Introduzione">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[min-content]" data-node-id="27:72167">
            INIZIA CON FILMZY
          </p>
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72168" data-name="Introduction">
            <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:72169">
              Collega i tuoi fornitori
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72170">
              Filmzy è gratuito. Per cominciare servono un fornitore per il testo e uno per immagini e video. Collega le tue chiavi personali: paghi solo l’utilizzo dei servizi scelti.
            </p>
          </div>
          <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:72171" data-name="Separatore" />
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:72172">
            Il tuo piccolo grande cinema. Nessun account Filmzy, nessun abbonamento.
          </p>
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72173" data-name="Indicatore">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[75px]" data-node-id="27:72174">
              Passo 1 di 4
            </p>
          </div>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[24px] items-start min-w-px overflow-clip relative" data-node-id="27:72175" data-name="Configurazione">
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72176" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72177">
              Testo
            </p>
            <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72178" data-name="Servizio disponibile">
              <div className="bg-[#22231f] content-stretch flex items-center justify-center overflow-clip relative rounded-[10px] shrink-0 size-[36px]" data-node-id="27:72179" data-name="Logo del fornitore">
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[10px]" data-node-id="27:72180">
                  O
                </p>
              </div>
              <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[5px] items-start leading-[1.55] min-w-px not-italic overflow-clip relative" data-node-id="27:72181" data-name="Fornitore">
                <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72182">
                  OpenAI
                </p>
                <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:72183">
                  Come ottengo la chiave? ↗
                </p>
              </div>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[87px]" etichetta="✓ Scelto" />
            </div>
            <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72186" data-name="Servizio disponibile">
              <div className="bg-[#22231f] content-stretch flex items-center justify-center overflow-clip relative rounded-[10px] shrink-0 size-[36px]" data-node-id="27:72187" data-name="Logo del fornitore">
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[9px]" data-node-id="27:72188">
                  A
                </p>
              </div>
              <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[5px] items-start leading-[1.55] min-w-px not-italic overflow-clip relative" data-node-id="27:72189" data-name="Fornitore">
                <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72190">
                  Anthropic
                </p>
                <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:72191">
                  Come ottengo la chiave? ↗
                </p>
              </div>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Scegli" />
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72193" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72194">
              Immagini e video
            </p>
            <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72195" data-name="Servizio disponibile">
              <div className="bg-[#22231f] content-stretch flex items-center justify-center overflow-clip relative rounded-[10px] shrink-0 size-[36px]" data-node-id="27:72196" data-name="Logo del fornitore">
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[5px]" data-node-id="27:72197">
                  f
                </p>
              </div>
              <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[5px] items-start leading-[1.55] min-w-px not-italic overflow-clip relative" data-node-id="27:72198" data-name="Fornitore">
                <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72199">
                  fal.ai
                </p>
                <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:72200">
                  Come ottengo la chiave? ↗
                </p>
              </div>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Scegli" />
            </div>
            <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72203" data-name="Servizio disponibile">
              <div className="bg-[#22231f] content-stretch flex items-center justify-center overflow-clip relative rounded-[10px] shrink-0 size-[36px]" data-node-id="27:72204" data-name="Logo del fornitore">
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[9px]" data-node-id="27:72205">
                  R
                </p>
              </div>
              <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[5px] items-start leading-[1.55] min-w-px not-italic overflow-clip relative" data-node-id="27:72206" data-name="Fornitore">
                <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72207">
                  Replicate
                </p>
                <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:72208">
                  Come ottengo la chiave? ↗
                </p>
              </div>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Scegli" />
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72210" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72211">
              Musica
            </p>
            <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72212" data-name="Servizio disponibile">
              <div className="bg-[#22231f] content-stretch flex items-center justify-center overflow-clip relative rounded-[10px] shrink-0 size-[36px]" data-node-id="27:72213" data-name="Logo del fornitore">
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[8px]" data-node-id="27:72214">
                  E
                </p>
              </div>
              <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[5px] items-start leading-[1.55] min-w-px not-italic overflow-clip relative" data-node-id="27:72215" data-name="Fornitore">
                <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72216">
                  ElevenLabs
                </p>
                <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:72217">
                  Come ottengo la chiave? ↗
                </p>
              </div>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Scegli" />
            </div>
            <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72220" data-name="Servizio disponibile">
              <div className="bg-[#22231f] content-stretch flex items-center justify-center overflow-clip relative rounded-[10px] shrink-0 size-[36px]" data-node-id="27:72221" data-name="Logo del fornitore">
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[9px]" data-node-id="27:72222">
                  S
                </p>
              </div>
              <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[5px] items-start leading-[1.55] min-w-px not-italic overflow-clip relative" data-node-id="27:72223" data-name="Fornitore">
                <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72224">
                  Stability AI
                </p>
                <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:72225">
                  Come ottengo la chiave? ↗
                </p>
              </div>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Scegli" />
            </div>
          </div>
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72227" data-name="Avviso">
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px] whitespace-pre-wrap" data-node-id="27:72228">{`✦  Le chiavi restano sul tuo computer. Puoi collegare altri servizi più avanti, nelle Impostazioni.`}</p>
          </div>
        </div>
      </div>
      <div className="border-[#34362e] border-solid border-t content-stretch flex items-center justify-between overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:72229" data-name="Azioni della pagina">
        <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[81px]" />
        <div className="content-stretch flex gap-[24px] items-center overflow-clip relative shrink-0" data-node-id="27:72231" data-name="Salvataggio e continua">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[153px]" data-node-id="27:72232">
            Salvato sul tuo computer
          </p>
          <FilmzyPulsantePrimarioDisabilitato className="bg-[#292a26] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[90px]" />
        </div>
      </div>
    </div>
  );
}