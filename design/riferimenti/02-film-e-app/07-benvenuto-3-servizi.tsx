const imgCerchio = "https://www.figma.com/api/mcp/asset/1b0e0022-f9a1-41af-a9db-43847d6bdf41.svg";
const imgCerchio1 = "https://www.figma.com/api/mcp/asset/9c51da62-481e-40ed-914d-4dae470c44ef.svg";
const imgCerchio2 = "https://www.figma.com/api/mcp/asset/cda7a4f4-2c04-43dd-8c2e-0d40ccab94f6.svg";
const imgCiak = "https://www.figma.com/api/mcp/asset/0411ccdd-ab47-4154-b282-b3bf0804655b.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/0e444314-ce83-420b-8420-e52bec51417e.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/facb8380-405d-48af-8a0a-11b901264c00.svg";
const imgX = "https://www.figma.com/api/mcp/asset/8f6cc20c-caed-4cc3-8c94-447869724473.svg";

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

function FilmzyPrimoAvvio3({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[#1a1b19] content-stretch flex gap-[20px] h-[72px] items-center overflow-clip px-[32px] relative rounded-[12px] w-[1472px]"} data-node-id="49:3344" data-name="Filmzy/Primo avvio/3">
      <div className="content-stretch flex flex-[1_0_0] gap-[24px] items-center min-w-px overflow-clip relative" data-node-id="49:3345" data-name="Tappa">
        <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3346" data-name="Passo di creazione">
          <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3347" data-name="Indicatore del passo">
            <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3348" data-name="Cerchio">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#f5b545] text-[13px] whitespace-nowrap" data-node-id="49:3349">
              ✓
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:3350">
            Fornitori
          </p>
        </div>
        <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3351" data-name="Collegamento" />
      </div>
      <div className="content-stretch flex flex-[1_0_0] gap-[24px] items-center min-w-px overflow-clip relative" data-node-id="49:3352" data-name="Tappa">
        <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3353" data-name="Passo di creazione">
          <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3354" data-name="Indicatore del passo">
            <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3355" data-name="Cerchio">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#f5b545] text-[13px] whitespace-nowrap" data-node-id="49:3356">
              ✓
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="49:3357">
            Chiave
          </p>
        </div>
        <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3358" data-name="Collegamento" />
      </div>
      <div className="content-stretch flex flex-[1_0_0] gap-[24px] items-center min-w-px overflow-clip relative" data-node-id="49:3359" data-name="Tappa">
        <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3360" data-name="Passo di creazione">
          <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3361" data-name="Indicatore del passo">
            <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3362" data-name="Cerchio">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio1} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#f5b545] text-[13px] whitespace-nowrap" data-node-id="49:3363">
              3
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:3364">
            Servizi
          </p>
        </div>
        <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3365" data-name="Collegamento" />
      </div>
      <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip relative" data-node-id="49:3366" data-name="Tappa">
        <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3367" data-name="Passo di creazione">
          <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3368" data-name="Indicatore del passo">
            <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3369" data-name="Cerchio">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio2} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3370">
              4
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:3371">
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

export default function BenvenutoInFilmzyServizi() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="27:72284" data-name="Benvenuto in Filmzy · Servizi">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <FilmzyPrimoAvvio3 className="bg-[#1a1b19] content-stretch flex gap-[20px] h-[72px] items-center overflow-clip px-[32px] relative rounded-[12px] shrink-0 w-full" />
      <div className="content-stretch flex gap-[56px] items-start min-h-[840px] overflow-clip px-[140px] py-[40px] relative shrink-0 w-full" data-node-id="27:72300" data-name="Primo avvio">
        <div className="content-stretch flex flex-col gap-[24px] items-start overflow-clip relative shrink-0 w-[330px]" data-node-id="27:72301" data-name="Introduzione">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[min-content]" data-node-id="27:72302">
            INIZIA CON FILMZY
          </p>
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72303" data-name="Introduction">
            <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:72304">
              Scegli i servizi da usare
            </p>
            <div className="font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72305">
              <p className="leading-[1.55] mb-0">Fornitore 1 di 3 · OpenAI</p>
              <p className="leading-[1.55]">Scegli i servizi da usare per questo fornitore. Dopo passerai alla chiave e ai servizi del fornitore 2 di 3.</p>
            </div>
          </div>
          <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:72306" data-name="Separatore" />
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:72307">
            Il tuo piccolo grande cinema. Nessun account Filmzy, nessun abbonamento.
          </p>
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72308" data-name="Indicatore">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[77px]" data-node-id="27:72309">
              Passo 3 di 4
            </p>
          </div>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[24px] items-start min-w-px overflow-clip relative" data-node-id="27:72310" data-name="Configurazione">
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72311" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:72312">
              OpenAI · Servizi
            </p>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:72313">
              I prezzi sono indicativi e dipendono dal contenuto richiesto.
            </p>
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[12px] items-start not-italic overflow-clip relative shrink-0 w-full" data-node-id="27:72314" data-name="Modelli disponibili">
              <div className="bg-[#22231f] content-stretch flex gap-[16px] items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72315" data-name="Modello">
                <p className="font-['Inter:Regular'] font-normal leading-[normal] relative shrink-0 text-[#f5b544] text-[18px] whitespace-nowrap" data-node-id="27:72316">
                  ☑
                </p>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[1.55] min-w-px overflow-clip relative" data-node-id="27:72317" data-name="Dettagli">
                  <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72318">
                    GPT-4.1 mini
                  </p>
                  <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72319">
                    Testo
                  </p>
                </div>
                <p className="font-['Inter:Regular'] font-normal leading-[normal] relative shrink-0 text-[#aaa99e] text-[13px] w-[128px]" data-node-id="27:72320">
                  circa 0,004 $ / prova
                </p>
              </div>
              <div className="bg-[#22231f] content-stretch flex gap-[16px] items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72321" data-name="Modello">
                <p className="font-['Inter:Regular'] font-normal leading-[normal] relative shrink-0 text-[#f5b544] text-[18px] whitespace-nowrap" data-node-id="27:72322">
                  ☑
                </p>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[1.55] min-w-px overflow-clip relative" data-node-id="27:72323" data-name="Dettagli">
                  <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72324">
                    GPT-4.1
                  </p>
                  <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72325">
                    Testo e lettura immagini
                  </p>
                </div>
                <p className="font-['Inter:Regular'] font-normal leading-[normal] relative shrink-0 text-[#aaa99e] text-[13px] w-[119px]" data-node-id="27:72326">
                  circa 0,02 $ / prova
                </p>
              </div>
              <div className="bg-[#22231f] content-stretch flex gap-[16px] items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72327" data-name="Modello">
                <p className="font-['Inter:Regular'] font-normal leading-[normal] relative shrink-0 text-[#f5b544] text-[18px] whitespace-nowrap" data-node-id="27:72328">
                  ☐
                </p>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[1.55] min-w-px overflow-clip relative" data-node-id="27:72329" data-name="Dettagli">
                  <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72330">
                    GPT Image 1
                  </p>
                  <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72331">
                    Immagini
                  </p>
                </div>
                <p className="font-['Inter:Regular'] font-normal leading-[normal] relative shrink-0 text-[#aaa99e] text-[13px] w-[144px]" data-node-id="27:72332">
                  circa 0,05 $ / immagine
                </p>
              </div>
            </div>
            <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72333" data-name="Campo">
              <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72334">
                <p className="leading-[1.65] mb-0">Servizio predefinito</p>
                <p className="leading-[1.65]">GPT-4.1 mini ⌄</p>
              </div>
            </div>
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72335" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[144px]" data-node-id="27:72336">
                Predefinito per OpenAI
              </p>
            </div>
            <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72337" data-name="Campo">
              <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full whitespace-pre-wrap" data-node-id="27:72338">
                <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Limite di spesa mensile (facoltativo)</p>
                <p className="leading-[1.65] mb-0 text-[14px]">{` `}</p>
                <p className="leading-[1.65] text-[#aaa99e] text-[11px]">Lascia vuoto per non impostare un limite. Importo in $.</p>
              </div>
            </div>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72339">
            I servizi attivi compaiono subito in «Cambia servizio». Ripeti Chiave e Servizi per ogni fornitore scelto.
          </p>
        </div>
      </div>
      <div className="border-[#34362e] border-solid border-t content-stretch flex items-center justify-between overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:72340" data-name="Azioni della pagina">
        <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[81px]" />
        <div className="content-stretch flex gap-[24px] items-center overflow-clip relative shrink-0" data-node-id="27:72342" data-name="Salvataggio e continua">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[153px]" data-node-id="27:72343">
            Salvato sul tuo computer
          </p>
          <FilmzyPulsantePrimarioNormale className="bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[90px]" />
        </div>
      </div>
    </div>
  );
}