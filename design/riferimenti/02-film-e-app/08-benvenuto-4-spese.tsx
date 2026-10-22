const imgCerchio = "https://www.figma.com/api/mcp/asset/06663b96-852c-48a6-a270-16457eb6ca87.svg";
const imgCerchio1 = "https://www.figma.com/api/mcp/asset/09b44b61-7ae3-4274-b752-2042b5e04dde.svg";
const imgCiak = "https://www.figma.com/api/mcp/asset/249d15f1-71a4-40b3-9b82-ddad8bbdbbc5.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/2e1e8348-37fa-4f73-8e36-4f7c55662e46.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/542392b6-9d97-49fa-8771-895ffabf4e57.svg";
const imgX = "https://www.figma.com/api/mcp/asset/b1aa0186-a6b3-4a71-a393-15c0f18ebc39.svg";

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

function FilmzyPrimoAvvio4({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[#1a1b19] content-stretch flex gap-[20px] h-[72px] items-center overflow-clip px-[32px] relative rounded-[12px] w-[1472px]"} data-node-id="49:3372" data-name="Filmzy/Primo avvio/4">
      <div className="content-stretch flex flex-[1_0_0] gap-[24px] items-center min-w-px overflow-clip relative" data-node-id="49:3373" data-name="Tappa">
        <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3374" data-name="Passo di creazione">
          <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3375" data-name="Indicatore del passo">
            <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3376" data-name="Cerchio">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#f5b545] text-[13px] whitespace-nowrap" data-node-id="49:3377">
              ✓
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:3378">
            Fornitori
          </p>
        </div>
        <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3379" data-name="Collegamento" />
      </div>
      <div className="content-stretch flex flex-[1_0_0] gap-[24px] items-center min-w-px overflow-clip relative" data-node-id="49:3380" data-name="Tappa">
        <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3381" data-name="Passo di creazione">
          <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3382" data-name="Indicatore del passo">
            <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3383" data-name="Cerchio">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#f5b545] text-[13px] whitespace-nowrap" data-node-id="49:3384">
              ✓
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="49:3385">
            Chiave
          </p>
        </div>
        <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3386" data-name="Collegamento" />
      </div>
      <div className="content-stretch flex flex-[1_0_0] gap-[24px] items-center min-w-px overflow-clip relative" data-node-id="49:3387" data-name="Tappa">
        <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3388" data-name="Passo di creazione">
          <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3389" data-name="Indicatore del passo">
            <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3390" data-name="Cerchio">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#f5b545] text-[13px] whitespace-nowrap" data-node-id="49:3391">
              ✓
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:3392">
            Servizi
          </p>
        </div>
        <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3393" data-name="Collegamento" />
      </div>
      <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip relative" data-node-id="49:3394" data-name="Tappa">
        <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3395" data-name="Passo di creazione">
          <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3396" data-name="Indicatore del passo">
            <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3397" data-name="Cerchio">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio1} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#f5b545] text-[13px] whitespace-nowrap" data-node-id="49:3398">
              4
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:3399">
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

export default function BenvenutoInFilmzySpese() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="27:72347" data-name="Benvenuto in Filmzy · Spese">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <FilmzyPrimoAvvio4 className="bg-[#1a1b19] content-stretch flex gap-[20px] h-[72px] items-center overflow-clip px-[32px] relative rounded-[12px] shrink-0 w-full" />
      <div className="content-stretch flex gap-[56px] items-start min-h-[840px] overflow-clip px-[140px] py-[40px] relative shrink-0 w-full" data-node-id="27:72363" data-name="Primo avvio">
        <div className="content-stretch flex flex-col gap-[24px] items-start overflow-clip relative shrink-0 w-[330px]" data-node-id="27:72364" data-name="Introduzione">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[min-content]" data-node-id="27:72365">
            INIZIA CON FILMZY
          </p>
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72366" data-name="Introduction">
            <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:72367">
              Vuoi mettere un limite di spesa?
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72368">
              Una precauzione in più, se ti fa stare tranquilla. Nessun tetto è impostato in partenza.
            </p>
          </div>
          <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:72369" data-name="Separatore" />
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:72370">
            Il tuo piccolo grande cinema. Nessun account Filmzy, nessun abbonamento.
          </p>
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72371" data-name="Indicatore">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[77px]" data-node-id="27:72372">
              Passo 4 di 4
            </p>
          </div>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[24px] items-start min-w-px overflow-clip relative" data-node-id="27:72373" data-name="Configurazione">
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72374" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:72375">
              Decidi tu quanto spendere
            </p>
            <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72376" data-name="Campo">
              <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full whitespace-pre-wrap" data-node-id="27:72377">
                <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Limite per film</p>
                <p className="leading-[1.65] mb-0 text-[14px]">{` `}</p>
                <p className="leading-[1.65] text-[#aaa99e] text-[11px]">Facoltativo · importo in $ · vuoto significa nessun limite</p>
              </div>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:72378">
              Filmzy ti mostra una stima prima di ogni generazione. Se scegli un limite, ti avvisa quando stai per superarlo.
            </p>
            <div className="content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72379" data-name="Avviso">
              <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:72380">
                Puoi saltarlo e cambiarlo quando vuoi
              </p>
            </div>
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold h-[46px] justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[185px]" data-node-id="27:72381">
              <p className="leading-[normal]">Salta, non mettere un limite</p>
            </div>
          </div>
          <div className="[word-break:break-word] bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72382" data-name="Pannello">
            <p className="font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72383">
              Tutto pronto per la tua prima storia
            </p>
            <div className="font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72384">
              <p className="leading-[1.55] mb-0">✓ OpenAI collegato · testo</p>
              <p className="leading-[1.55]">✓ fal.ai collegato · immagini e video</p>
            </div>
            <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72385">
              ✓ Servizi scelti
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72386">
              Le tue idee e i tuoi film restano sul tuo computer.
            </p>
          </div>
        </div>
      </div>
      <div className="border-[#34362e] border-solid border-t content-stretch flex items-center justify-between overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:72387" data-name="Azioni della pagina">
        <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[81px]" />
        <div className="content-stretch flex gap-[24px] items-center overflow-clip relative shrink-0" data-node-id="27:72389" data-name="Salvataggio e continua">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[153px]" data-node-id="27:72390">
            Salvato sul tuo computer
          </p>
          <FilmzyPulsantePrimarioNormale className="bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[166px]" etichetta="Inizia il tuo primo film" />
        </div>
      </div>
    </div>
  );
}