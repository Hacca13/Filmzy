const imgCiak = "https://www.figma.com/api/mcp/asset/0df7005f-0f91-4580-9ac4-aa4c2ed359c1.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/7e756170-b5f9-4541-8981-2fae7ac43e27.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/ab350baa-f8ca-4ffc-9c02-ffc4423d0e19.svg";
const imgX = "https://www.figma.com/api/mcp/asset/772ef786-a972-4301-aac6-9680d9052c6e.svg";
const imgCursore = "https://www.figma.com/api/mcp/asset/41192059-0202-47f5-9224-957b342985dc.svg";
const imgCursore1 = "https://www.figma.com/api/mcp/asset/ccbed36e-b68c-4487-bfa8-aa2f10719a3c.svg";

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

export default function Prudenza() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="27:72935" data-name="Prudenza">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <div className="[word-break:break-word] content-stretch flex font-['Inter:Semi_Bold'] font-semibold h-[72px] items-center justify-between not-italic overflow-clip px-[36px] relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:72945" data-name="Navigazione">
        <p className="flex-[1_0_0] leading-[1.55] min-w-px relative text-[20px]" data-node-id="27:72946">
          Impostazioni
        </p>
        <div className="flex flex-col justify-center leading-[0] relative shrink-0 text-[13px] w-[86px]" data-node-id="27:72947">
          <p className="leading-[normal]">← Torna al film</p>
        </div>
      </div>
      <div className="content-stretch flex items-start min-h-[890px] overflow-clip relative shrink-0 w-full" data-node-id="27:72948" data-name="Impostazioni e contenuto">
        <div className="[word-break:break-word] border-[#34362e] border-r border-solid content-stretch flex flex-col font-['Inter:Regular'] font-normal gap-[24px] items-start not-italic overflow-clip p-[32px] relative self-stretch shrink-0 w-[240px]" data-node-id="27:72949" data-name="Menu impostazioni">
          <div className="leading-[0] relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72950">
            <p className="leading-[48px] mb-0">Connessioni</p>
            <p className="leading-[48px] mb-0">Chi fa cosa</p>
            <p className="leading-[48px] mb-0">Spese e tetti</p>
            <p className="leading-[48px] mb-0">Generazione</p>
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[48px] mb-0 text-[#f5b544]">• Prudenza</p>
            <p className="leading-[48px] mb-0">Aggiornamenti</p>
            <p className="leading-[48px] mb-0">I tuoi dati</p>
            <p className="leading-[48px] mb-0">Avanzate</p>
            <p className="leading-[48px]">Informazioni</p>
          </div>
          <p className="leading-[1.55] relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:72951">
            Filmzy 0.3.2 · Sul tuo computer
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[28px] items-start min-w-px overflow-clip p-[40px] relative" data-node-id="27:72952" data-name="Contenuto impostazioni">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72953" data-name="Introduction">
            <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:72954">
              Prudenza
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72955">
              Tre accortezze per creare con più consapevolezza. Sono tutte attive all’inizio.
            </p>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72956" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72957">
              Prima di creare
            </p>
            <div className="content-stretch flex gap-[20px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72958" data-name="Interruttore">
              <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:72959">
                <p className="mb-0">
                  <span className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] not-italic text-[14px]">Controlla i testi prima di ogni spesa</span>
                  <span className="leading-[1.55] text-[#aaa99e] text-[11px]">{` · Attivo`}</span>
                </p>
                <p className="leading-[1.55] text-[#aaa99e] text-[13px]">Il moderatore controlla la richiesta prima che venga inviata al servizio scelto.</p>
              </div>
              <div className="h-[24px] relative shrink-0 w-[40px]" data-node-id="27:72960" data-name="Cursore">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCursore} />
              </div>
            </div>
            <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:72962" data-name="Separatore" />
            <div className="content-stretch flex gap-[20px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72963" data-name="Interruttore">
              <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:72964">
                <p className="mb-0">
                  <span className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] not-italic text-[14px]">Accetta solo personaggi generati da Filmzy</span>
                  <span className="leading-[1.55] text-[#aaa99e] text-[11px]">{` · Attivo`}</span>
                </p>
                <p className="leading-[1.55] text-[#aaa99e] text-[13px]">Per i personaggi usiamo volti creati in Filmzy. Nei moodboard, le foto con persone possono servire solo all’analisi di atmosfera e colori.</p>
              </div>
              <div className="h-[24px] relative shrink-0 w-[40px]" data-node-id="27:72965" data-name="Cursore">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCursore} />
              </div>
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72967" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72968">
              Quando condividi il film
            </p>
            <div className="content-stretch flex gap-[20px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72969" data-name="Interruttore">
              <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:72970">
                <p className="mb-0">
                  <span className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] not-italic text-[14px]">Aggiungi nei titoli la dicitura «Contiene contenuti generati con intelligenza artificiale»</span>
                  <span className="leading-[1.55] text-[#aaa99e] text-[11px]">{` · Attivo`}</span>
                </p>
                <p className="leading-[1.55] text-[#aaa99e] text-[13px]">Una dicitura semplice nei titoli di coda del film esportato.</p>
              </div>
              <div className="h-[24px] relative shrink-0 w-[40px]" data-node-id="27:72971" data-name="Cursore">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCursore} />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72973" data-name="Avviso">
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:72974">
              La prudenza aiuta, ma non sostituisce il tuo giudizio: controlla i diritti dei materiali e le condizioni dei servizi che scegli.
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72975">
            Puoi cambiare queste opzioni in qualsiasi momento. Le scelte hanno effetto subito.
          </p>
        </div>
      </div>
      <div className="content-stretch flex items-start overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:72976" data-name="Stato locale">
        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[153px]" data-node-id="27:72977">
          Salvato sul tuo computer
        </p>
      </div>
      <div className="absolute bg-[rgba(0,0,0,0.72)] h-[1036px] left-0 top-[44px] w-[1440px]" data-node-id="51:1367" data-name="Sfondo della conferma Prudenza" />
      <div className="absolute bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] h-[265px] items-start left-[430px] overflow-clip p-[24px] rounded-[18px] top-[407.5px] w-[580px]" data-node-id="27:74257" data-name="Pannello">
        <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:74258">
          Prudenza · Conferma lo spegnimento
        </p>
        <div className="content-stretch flex gap-[20px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:74259" data-name="Interruttore">
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:74260">
            <span className="font-['Inter:Semi_Bold'] font-semibold leading-[1.55] text-[14px]">Controlla i testi prima di ogni spesa</span>
            <span className="leading-[1.55] text-[#aaa99e] text-[11px]">{` · Spento`}</span>
          </p>
          <div className="h-[24px] relative shrink-0 w-[40px]" data-node-id="27:74261" data-name="Cursore">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCursore1} />
          </div>
        </div>
        <div className="bg-[#302d1a] content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:74263" data-name="Avviso">
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#ffe34d] text-[14px] whitespace-pre-wrap" data-node-id="27:74264">{`⚠  Se lo spegni te ne assumi la responsabilità e il tuo account presso il servizio potrebbe essere bloccato.`}</p>
        </div>
        <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:74265" data-name="Azioni">
          <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[112px]" etichetta="Lascia attivo" />
          <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[146px]" etichetta="Spegni comunque" />
        </div>
      </div>
    </div>
  );
}