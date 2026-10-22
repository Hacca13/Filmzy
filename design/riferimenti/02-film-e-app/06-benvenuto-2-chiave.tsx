const imgCerchio = "https://www.figma.com/api/mcp/asset/21c8329d-62d3-42e1-bf3f-055c53bdac7b.svg";
const imgCerchio1 = "https://www.figma.com/api/mcp/asset/0b06b493-9e2f-4894-9c51-9c04a6e3d826.svg";
const imgCerchio2 = "https://www.figma.com/api/mcp/asset/01385011-ea59-471b-8809-df8b99dcc911.svg";
const imgCiak = "https://www.figma.com/api/mcp/asset/3d64057b-d122-471e-bbdb-0aaf2a85640a.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/fccf694b-7463-45a5-82b4-37037e573430.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/085a9867-3f47-41b6-b02c-e6f8e836c74f.svg";
const imgX = "https://www.figma.com/api/mcp/asset/dc03b289-4d0b-4d0d-bd9d-6e09de186b82.svg";

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

type FilmzyCampoApplicazioneNormaleProps = {
  className?: string;
  aiuto?: string;
  etichetta?: string;
  valore?: string;
};

function FilmzyCampoApplicazioneNormale({ className, aiuto = "La chiave resta sul tuo computer.", etichetta = "Chiave personale", valore = "••••••••••••1a2b" }: FilmzyCampoApplicazioneNormaleProps) {
  return (
    <div className={className || "content-stretch flex flex-col gap-[10px] h-[2018px] items-start overflow-clip relative w-[500px]"} data-node-id="54:1409" data-name="Filmzy/Campo applicazione/Normale">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] whitespace-nowrap" data-node-id="54:1411">
        {etichetta}
      </p>
      <div className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[48px] items-center overflow-clip px-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="54:1412" data-name="Inserimento">
        <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="54:1413">
          {valore}
        </p>
      </div>
      <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.5] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="54:1414">
        {aiuto}
      </p>
    </div>
  );
}

function FilmzyPrimoAvvio2({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[#1a1b19] content-stretch flex gap-[20px] h-[72px] items-center overflow-clip px-[32px] relative rounded-[12px] w-[1472px]"} data-node-id="49:3316" data-name="Filmzy/Primo avvio/2">
      <div className="content-stretch flex flex-[1_0_0] gap-[24px] items-center min-w-px overflow-clip relative" data-node-id="49:3317" data-name="Tappa">
        <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3318" data-name="Passo di creazione">
          <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3319" data-name="Indicatore del passo">
            <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3320" data-name="Cerchio">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#f5b545] text-[13px] whitespace-nowrap" data-node-id="49:3321">
              ✓
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:3322">
            Fornitori
          </p>
        </div>
        <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3323" data-name="Collegamento" />
      </div>
      <div className="content-stretch flex flex-[1_0_0] gap-[24px] items-center min-w-px overflow-clip relative" data-node-id="49:3324" data-name="Tappa">
        <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3325" data-name="Passo di creazione">
          <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3326" data-name="Indicatore del passo">
            <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3327" data-name="Cerchio">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio1} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#f5b545] text-[13px] whitespace-nowrap" data-node-id="49:3328">
              2
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="49:3329">
            Chiave
          </p>
        </div>
        <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3330" data-name="Collegamento" />
      </div>
      <div className="content-stretch flex flex-[1_0_0] gap-[24px] items-center min-w-px overflow-clip relative" data-node-id="49:3331" data-name="Tappa">
        <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3332" data-name="Passo di creazione">
          <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3333" data-name="Indicatore del passo">
            <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3334" data-name="Cerchio">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio2} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3335">
              3
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:3336">
            Servizi
          </p>
        </div>
        <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:3337" data-name="Collegamento" />
      </div>
      <div className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip relative" data-node-id="49:3338" data-name="Tappa">
        <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3339" data-name="Passo di creazione">
          <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:3340" data-name="Indicatore del passo">
            <div className="absolute left-0 size-[28px] top-0" data-node-id="49:3341" data-name="Cerchio">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio2} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3342">
              4
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:3343">
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

export default function BenvenutoInFilmzyChiave() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="27:72236" data-name="Benvenuto in Filmzy · Chiave">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <FilmzyPrimoAvvio2 className="bg-[#1a1b19] content-stretch flex gap-[20px] h-[72px] items-center overflow-clip px-[32px] relative rounded-[12px] shrink-0 w-full" />
      <div className="content-stretch flex gap-[56px] items-start min-h-[840px] overflow-clip px-[140px] py-[40px] relative shrink-0 w-full" data-node-id="27:72252" data-name="Primo avvio">
        <div className="content-stretch flex flex-col gap-[24px] items-start overflow-clip relative shrink-0 w-[330px]" data-node-id="27:72253" data-name="Introduzione">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[min-content]" data-node-id="27:72254">
            INIZIA CON FILMZY
          </p>
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72255" data-name="Introduction">
            <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:72256">
              Collega la tua chiave
            </p>
            <div className="font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72257">
              <p className="leading-[1.55] mb-0">Fornitore 1 di 3 · OpenAI</p>
              <p className="leading-[1.55]">Collega OpenAI per scrivere la tua storia. La chiave viene salvata solo su questo computer.</p>
            </div>
          </div>
          <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:72258" data-name="Separatore" />
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:72259">
            Il tuo piccolo grande cinema. Nessun account Filmzy, nessun abbonamento.
          </p>
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72260" data-name="Indicatore">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[76px]" data-node-id="27:72261">
              Passo 2 di 4
            </p>
          </div>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[24px] items-start min-w-px overflow-clip relative" data-node-id="27:72262" data-name="Configurazione">
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72263" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:72264">
              OpenAI
            </p>
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72265" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[151px]" data-node-id="27:72266">
                Testo e lettura immagini
              </p>
            </div>
            <FilmzyCampoApplicazioneNormale className="content-stretch flex flex-col gap-[10px] h-px items-start overflow-clip relative shrink-0 w-full" />
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5b544] text-[14px] w-[min-content]" data-node-id="27:72269">
              Come ottengo la chiave? ↗
            </p>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[166px]" etichetta="Prova la connessione" />
            <div className="content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72271" data-name="Avviso">
              <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:72272">
                ✓ Funziona
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:72273">
              Connessione verificata adesso. Per la lettura delle immagini useremo la stessa chiave, senza chiedertela di nuovo.
            </p>
          </div>
          <div className="[word-break:break-word] bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72274" data-name="Pannello">
            <p className="font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72275">
              Tu scegli, tu controlli
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72276">
              Filmzy non vende utilizzi o abbonamenti. I costi delle generazioni vengono addebitati direttamente dal servizio scelto.
            </p>
          </div>
        </div>
      </div>
      <div className="border-[#34362e] border-solid border-t content-stretch flex items-center justify-between overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:72277" data-name="Azioni della pagina">
        <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[81px]" />
        <div className="content-stretch flex gap-[24px] items-center overflow-clip relative shrink-0" data-node-id="27:72279" data-name="Salvataggio e continua">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[153px]" data-node-id="27:72280">
            Salvato sul tuo computer
          </p>
          <FilmzyPulsantePrimarioNormale className="bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[90px]" />
        </div>
      </div>
    </div>
  );
}