const imgCiak = "https://www.figma.com/api/mcp/asset/c3511701-b02c-4151-923f-df1cc6c2590f.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/fc550536-ee86-434b-84dd-63bfd04f1481.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/3755f560-b72e-46eb-9ebe-cf2a53f954fe.svg";
const imgX = "https://www.figma.com/api/mcp/asset/026ba1c4-d9c5-407e-beb6-067d3c1e4b9d.svg";

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

export default function Avanzate() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="27:73064" data-name="Avanzate">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <div className="[word-break:break-word] content-stretch flex font-['Inter:Semi_Bold'] font-semibold h-[72px] items-center justify-between not-italic overflow-clip px-[36px] relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:73074" data-name="Navigazione">
        <p className="flex-[1_0_0] leading-[1.55] min-w-px relative text-[20px]" data-node-id="27:73075">
          Impostazioni
        </p>
        <div className="flex flex-col justify-center leading-[0] relative shrink-0 text-[13px] w-[86px]" data-node-id="27:73076">
          <p className="leading-[normal]">← Torna al film</p>
        </div>
      </div>
      <div className="content-stretch flex items-start min-h-[890px] overflow-clip relative shrink-0 w-full" data-node-id="27:73077" data-name="Impostazioni e contenuto">
        <div className="[word-break:break-word] border-[#34362e] border-r border-solid content-stretch flex flex-col font-['Inter:Regular'] font-normal gap-[24px] items-start not-italic overflow-clip p-[32px] relative self-stretch shrink-0 w-[240px]" data-node-id="27:73078" data-name="Menu impostazioni">
          <div className="leading-[0] relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:73079">
            <p className="leading-[48px] mb-0">Connessioni</p>
            <p className="leading-[48px] mb-0">Chi fa cosa</p>
            <p className="leading-[48px] mb-0">Spese e tetti</p>
            <p className="leading-[48px] mb-0">Generazione</p>
            <p className="leading-[48px] mb-0">Prudenza</p>
            <p className="leading-[48px] mb-0">Aggiornamenti</p>
            <p className="leading-[48px] mb-0">I tuoi dati</p>
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[48px] mb-0 text-[#f5b544]">• Avanzate</p>
            <p className="leading-[48px]">Informazioni</p>
          </div>
          <p className="leading-[1.55] relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:73080">
            Filmzy 0.3.2 · Sul tuo computer
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[28px] items-start min-w-px overflow-clip p-[40px] relative" data-node-id="27:73081" data-name="Contenuto impostazioni">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73082" data-name="Introduction">
            <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:73083">
              Avanzate
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:73084">
              Configurazione tecnica del programma. Lavora su una bozza, provala e pubblicala solo quando sei pronta.
            </p>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73085" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:73086">
              Configurazione attiva
            </p>
            <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73087" data-name="Azioni">
              <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73088" data-name="Indicatore">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[114px]" data-node-id="27:73089">
                  Versione 7 · Attiva
                </p>
              </div>
              <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#aaa99e] text-[13px]" data-node-id="27:73090">
                20 ottobre 2026, 15:20 · Servizi e stili aggiornati
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:73091">
              È separata dalla bozza qui sotto. Le impostazioni dei singoli ruoli in «Chi fa cosa» hanno invece effetto immediato.
            </p>
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73092" data-name="Azioni">
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73093" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[39px]" data-node-id="27:73094">
                Bozza
              </p>
            </div>
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:73095">
              →
            </p>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Prova" />
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:73097">
              →
            </p>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[87px]" etichetta="Pubblica" />
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:73099">
              →
            </p>
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[42px]" data-node-id="27:73100">
              <p className="leading-[normal]">Storico</p>
            </div>
          </div>
          <div className="content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:73101" data-name="Avviso">
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:73102">
              Hai modifiche non pubblicate
            </p>
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73103" data-name="Azioni">
            <div className="bg-[#f5b544] border border-[#f5b544] border-solid content-stretch flex h-[46px] items-center justify-center overflow-clip px-[18px] relative rounded-[12px] shrink-0" data-node-id="27:73104" data-name="Azione">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[14px] whitespace-nowrap" data-node-id="27:73105">
                Prova con un esempio fisso
              </p>
            </div>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[87px]" etichetta="Pubblica" />
            <FilmzyPulsanteDistruttivoNormale className="bg-[#b83e38] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[168px]" etichetta="Butta via le modifiche" />
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:73108">
            La prova esegue l’esempio fisso del ruolo selezionato · circa 0,004 $ · Cambia servizio ⌄
          </p>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73109" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73110">
              Bozza · Modelli
            </p>
            <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73111" data-name="Tabella modificabile">
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[2] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full whitespace-pre-wrap" data-node-id="27:73112">{`Nome　 ·　 Fornitore　 ·　 Tipo　 ·　 Prezzo per uso　 ·　 Modifica`}</p>
              <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:73113" data-name="Riga modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:73114">{`GPT-4.1 mini　 ·　 OpenAI　 ·　 Testo　 ·　 0,004 $　 ·　 ✎ Attivo`}</p>
              </div>
              <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:73115" data-name="Riga modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:73116">{`Kling · Standard　 ·　 fal.ai　 ·　 Video　 ·　 0,42 $　 ·　 ✎ Attivo`}</p>
              </div>
              <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:73117" data-name="Riga modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:73118">{`Seedance · Veloce　 ·　 Replicate　 ·　 Video　 ·　 0,90 $　 ·　 ✎ Attivo`}</p>
              </div>
            </div>
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[113px]" data-node-id="27:73119">
              <p className="leading-[normal]">+ Aggiungi modello</p>
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73120" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:73121">
              Bozza · Ruoli
            </p>
            <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73122" data-name="Tabella modificabile">
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[2] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full whitespace-pre-wrap" data-node-id="27:73123">{`Ruolo　 ·　 Fornitore e modello　 ·　 Istruzioni　 ·　 Modifica`}</p>
              <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:73124" data-name="Riga modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:73125">{`Sceneggiatore　 ·　 OpenAI · GPT-4.1 mini　 ·　 Versione 2　 ·　 ✎ Cambia`}</p>
              </div>
              <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:73126" data-name="Riga modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:73127">{`Storyboard　 ·　 fal.ai · FLUX.1 Kontext　 ·　 Versione 2　 ·　 ✎ Cambia`}</p>
              </div>
              <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:73128" data-name="Riga modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:73129">{`Operatore di ripresa　 ·　 fal.ai · Kling · Standard　 ·　 Versione 1　 ·　 ✎ Cambia`}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73130" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73131">
              Bozza · Preset
            </p>
            <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73132" data-name="Tabella modificabile">
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[2] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full whitespace-pre-wrap" data-node-id="27:73133">{`Categoria　 ·　 Nome　 ·　 Contenuto modificabile`}</p>
              <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:73134" data-name="Riga modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:73135">{`Stili　 ·　 Realistico　 ·　 Luce naturale, texture cinematografica ✎`}</p>
              </div>
              <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:73136" data-name="Riga modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:73137">{`Generi　 ·　 Drammatico　 ·　 Conflitti personali, emozioni misurate ✎`}</p>
              </div>
              <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:73138" data-name="Riga modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:73139">{`Toni　 ·　 Emozionante　 ·　 Attesa, speranza e nostalgia ✎`}</p>
              </div>
              <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:73140" data-name="Riga modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:73141">{`Fotografia　 ·　 Classica　 ·　 Composizioni pulite, movimenti lenti ✎`}</p>
              </div>
              <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:73142" data-name="Riga modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:73143">{`Tag personaggi　 ·　 Protagonista　 ·　 Guida la storia e compie la scelta ✎`}</p>
              </div>
              <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:73144" data-name="Riga modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:73145">{`Movimenti macchina　 ·　 Avvicinati　 ·　 Avvicinamento lento al soggetto ✎`}</p>
              </div>
            </div>
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[104px]" data-node-id="27:73146">
              <p className="leading-[normal]">+ Aggiungi preset</p>
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73147" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:73148">
              Bozza · Funzioni e limiti
            </p>
            <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73149" data-name="Tabella modificabile">
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[2] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full whitespace-pre-wrap" data-node-id="27:73150">{`Funzione　 ·　 Disponibile　 ·　 Limite modificabile`}</p>
              <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:73151" data-name="Riga modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:73152">{`Immagine iniziale e finale　 ·　 Kling · Standard　 ·　 2 immagini ✎`}</p>
              </div>
              <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:73153" data-name="Riga modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:73154">{`Durata video　 ·　 Kling · Standard　 ·　 5–10 secondi ✎`}</p>
              </div>
              <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:73155" data-name="Riga modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:73156">{`Audio nelle clip　 ·　 Veo 3　 ·　 Sempre attivo ✎`}</p>
              </div>
              <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:73157" data-name="Riga modificabile">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:73158">{`Riferimenti dal moodboard　 ·　 FLUX.1 Kontext　 ·　 Solo immagini idonee ✎`}</p>
              </div>
            </div>
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73159" data-name="Azioni">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[232px]" etichetta="Riparti dai valori del programma" />
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[107px]" etichetta="Salva su file" />
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:73162">
            I commenti dei file originali non vengono conservati quando salvi su file.
          </p>
        </div>
      </div>
      <div className="content-stretch flex items-start overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:73163" data-name="Stato locale">
        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[153px]" data-node-id="27:73164">
          Salvato sul tuo computer
        </p>
      </div>
    </div>
  );
}