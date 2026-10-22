const imgCircleAlert = "https://www.figma.com/api/mcp/asset/b8018df2-913f-4da8-ad5e-0a5cdacd76ad.svg";
const imgTriangleAlert = "https://www.figma.com/api/mcp/asset/925dc042-956d-40a8-ae94-468385c4b2e8.svg";
const imgCircleCheck = "https://www.figma.com/api/mcp/asset/13a33a07-5c44-4ffa-b92b-ef4b90e0b0c7.svg";
const imgTriangleAlert1 = "https://www.figma.com/api/mcp/asset/60073520-a653-4500-82fa-ed86a7a83ca7.svg";
const imgInfo = "https://www.figma.com/api/mcp/asset/f69123d6-f8e5-4a76-9474-c4e5537adf46.svg";
const imgCiak = "https://www.figma.com/api/mcp/asset/c892fc46-d888-41fe-8d62-0277133be028.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/f362f880-f99d-49ec-97c2-f7255c989fba.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/08bb8145-9ad1-4023-845b-9b270ab57522.svg";
const imgX = "https://www.figma.com/api/mcp/asset/9451f6a7-5490-4236-ba2b-5dfb7fab01a4.svg";

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

type FilmzyChipErroreProps = {
  className?: string;
  etichetta?: string;
};

function FilmzyChipErrore({ className, etichetta = "Non riuscito" }: FilmzyChipErroreProps) {
  return (
    <div className={className || "bg-[#392321] content-stretch flex gap-[8px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px]"} data-node-id="49:2996" data-name="Filmzy/Chip/Errore">
      <div className="relative shrink-0 size-[16px]" data-node-id="49:2718" data-name="circle-alert">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCircleAlert} />
      </div>
      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f7a49e] text-[13px] whitespace-nowrap" data-node-id="49:2369">
        {etichetta}
      </p>
    </div>
  );
}

type FilmzyChipLimiteRaggiuntoProps = {
  className?: string;
  etichetta?: string;
};

function FilmzyChipLimiteRaggiunto({ className, etichetta = "100% · Limite raggiunto" }: FilmzyChipLimiteRaggiuntoProps) {
  return (
    <div className={className || "bg-[#f5b544] content-stretch flex gap-[8px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px]"} data-node-id="49:2999" data-name="Filmzy/Chip/Limite raggiunto">
      <div className="relative shrink-0 size-[16px]" data-node-id="49:2727" data-name="triangle-alert">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTriangleAlert} />
      </div>
      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[13px] whitespace-nowrap" data-node-id="49:2378">
        {etichetta}
      </p>
    </div>
  );
}

type FilmzyChipConfermatoProps = {
  className?: string;
  etichetta?: string;
};

function FilmzyChipConfermato({ className, etichetta = "Pronto" }: FilmzyChipConfermatoProps) {
  return (
    <div className={className || "bg-[#233328] content-stretch flex gap-[8px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px]"} data-node-id="49:2994" data-name="Filmzy/Chip/Confermato">
      <div className="relative shrink-0 size-[16px]" data-node-id="49:2712" data-name="circle-check">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCircleCheck} />
      </div>
      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#b0d6b6] text-[13px] whitespace-nowrap" data-node-id="49:2363">
        {etichetta}
      </p>
    </div>
  );
}

type FilmzyChipLimiteVicinoProps = {
  className?: string;
  etichetta?: string;
};

function FilmzyChipLimiteVicino({ className, etichetta = "80% del limite" }: FilmzyChipLimiteVicinoProps) {
  return (
    <div className={className || "bg-[#352b19] content-stretch flex gap-[8px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px]"} data-node-id="49:2998" data-name="Filmzy/Chip/Limite vicino">
      <div className="relative shrink-0 size-[16px]" data-node-id="49:2724" data-name="triangle-alert">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTriangleAlert1} />
      </div>
      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:2375">
        {etichetta}
      </p>
    </div>
  );
}

type FilmzyChipInformazioneProps = {
  className?: string;
  etichetta?: string;
};

function FilmzyChipInformazione({ className, etichetta = "Informazione" }: FilmzyChipInformazioneProps) {
  return (
    <div className={className || "bg-[#233142] content-stretch flex gap-[8px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px]"} data-node-id="49:2997" data-name="Filmzy/Chip/Informazione">
      <div className="relative shrink-0 size-[16px]" data-node-id="49:2721" data-name="info">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgInfo} />
      </div>
      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#b1cff4] text-[13px] whitespace-nowrap" data-node-id="49:2372">
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

export default function Connessioni() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="27:72394" data-name="Connessioni">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <div className="[word-break:break-word] content-stretch flex font-['Inter:Semi_Bold'] font-semibold h-[72px] items-center justify-between not-italic overflow-clip px-[36px] relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:72404" data-name="Navigazione">
        <p className="flex-[1_0_0] leading-[1.55] min-w-px relative text-[20px]" data-node-id="27:72405">
          Impostazioni
        </p>
        <div className="flex flex-col justify-center leading-[0] relative shrink-0 text-[13px] w-[86px]" data-node-id="27:72406">
          <p className="leading-[normal]">← Torna al film</p>
        </div>
      </div>
      <div className="content-stretch flex items-start min-h-[890px] overflow-clip relative shrink-0 w-full" data-node-id="27:72407" data-name="Impostazioni e contenuto">
        <div className="[word-break:break-word] border-[#34362e] border-r border-solid content-stretch flex flex-col font-['Inter:Regular'] font-normal gap-[24px] items-start not-italic overflow-clip p-[32px] relative self-stretch shrink-0 w-[240px]" data-node-id="27:72408" data-name="Menu impostazioni">
          <div className="leading-[0] relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72409">
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[48px] mb-0 text-[#f5b544]">• Connessioni</p>
            <p className="leading-[48px] mb-0">Chi fa cosa</p>
            <p className="leading-[48px] mb-0">Spese e tetti</p>
            <p className="leading-[48px] mb-0">Generazione</p>
            <p className="leading-[48px] mb-0">Prudenza</p>
            <p className="leading-[48px] mb-0">Aggiornamenti</p>
            <p className="leading-[48px] mb-0">I tuoi dati</p>
            <p className="leading-[48px] mb-0">Avanzate</p>
            <p className="leading-[48px]">Informazioni</p>
          </div>
          <p className="leading-[1.55] relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:72410">
            Filmzy 0.3.2 · Sul tuo computer
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[28px] items-start min-w-px overflow-clip p-[40px] relative" data-node-id="27:72411" data-name="Contenuto impostazioni">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72412" data-name="Introduction">
            <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:72413">
              Connessioni
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72414">
              I tuoi fornitori, le tue chiavi. Scegli quali usare e controlla che sia tutto pronto.
            </p>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72415" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72416">
              Testo
            </p>
            <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72417" data-name="Azioni">
              <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72418" data-name="Indicatore">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[127px]" data-node-id="27:72419">
                  OpenAI · Predefinito
                </p>
              </div>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[165px]" etichetta="Aggiungi un fornitore" />
            </div>
            <div className="bg-[#22231f] content-stretch flex flex-col gap-[14px] items-start overflow-clip p-[18px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72421" data-name="Fornitore collegato">
              <div className="content-stretch flex gap-[14px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72422" data-name="Identità e stato">
                <div className="bg-[#111211] content-stretch flex items-center justify-center overflow-clip relative rounded-[10px] shrink-0 size-[38px]" data-node-id="27:72423" data-name="Logo del fornitore">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[17px] whitespace-nowrap" data-node-id="27:72424">
                    O
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative" data-node-id="27:72425" data-name="Dettagli fornitore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:72426">
                    OpenAI
                  </p>
                  <FilmzyChipConfermato className="bg-[#233328] content-stretch flex gap-[8px] h-[32px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0 w-[108px]" etichetta="✓ Collegato" />
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:72427">
                    Ultimo controllo: oggi, 09:42
                  </p>
                </div>
                <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72428" data-name="Indicatore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[70px]" data-node-id="27:72429">
                    Predefinito
                  </p>
                </div>
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[84px]" etichetta="Gestisci" />
              </div>
              <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal gap-[20px] items-start leading-[1.55] not-italic overflow-clip relative shrink-0 w-full" data-node-id="27:72431" data-name="Modello e spesa">
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative" data-node-id="27:72432" data-name="Modello">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72433">
                    Servizio predefinito
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72434">
                    GPT-4.1 mini ⌄
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative text-[13px]" data-node-id="27:72435" data-name="Spesa mensile">
                  <p className="relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:72436">
                    Speso questo mese 8,00 $
                  </p>
                  <p className="relative shrink-0 text-[#b2b2a8] w-full" data-node-id="27:72437">
                    Nessun limite impostato
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#22231f] content-stretch flex flex-col gap-[14px] items-start overflow-clip p-[18px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72438" data-name="Fornitore collegato">
              <div className="content-stretch flex gap-[14px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72439" data-name="Identità e stato">
                <div className="bg-[#111211] content-stretch flex items-center justify-center overflow-clip relative rounded-[10px] shrink-0 size-[38px]" data-node-id="27:72440" data-name="Logo del fornitore">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[17px] whitespace-nowrap" data-node-id="27:72441">
                    A
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative" data-node-id="27:72442" data-name="Dettagli fornitore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:72443">
                    Anthropic
                  </p>
                  <FilmzyChipInformazione className="bg-[#233142] content-stretch flex gap-[8px] h-[32px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0 w-[158px]" etichetta="🔑 Chiave mancante" />
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:72444">
                    Ultimo controllo: mai
                  </p>
                </div>
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[84px]" etichetta="Gestisci" />
              </div>
              <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal gap-[20px] items-start leading-[1.55] not-italic overflow-clip relative shrink-0 w-full" data-node-id="27:72446" data-name="Modello e spesa">
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative" data-node-id="27:72447" data-name="Modello">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72448">
                    Servizio predefinito
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72449">
                    Claude Sonnet 4 ⌄
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative text-[13px]" data-node-id="27:72450" data-name="Spesa mensile">
                  <p className="relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:72451">
                    Speso questo mese 0,00 $
                  </p>
                  <p className="relative shrink-0 text-[#b2b2a8] w-full" data-node-id="27:72452">
                    Nessun limite impostato
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72453" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72454">
              Lettura immagini
            </p>
            <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72455" data-name="Azioni">
              <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72456" data-name="Indicatore">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[127px]" data-node-id="27:72457">
                  OpenAI · Predefinito
                </p>
              </div>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[165px]" etichetta="Aggiungi un fornitore" />
            </div>
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72459" data-name="Avviso">
              <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px] whitespace-pre-wrap" data-node-id="27:72460">{`✦  Riutilizziamo i fornitori e le chiavi del Testo: non devi collegarli due volte.`}</p>
            </div>
            <div className="bg-[#22231f] content-stretch flex flex-col gap-[14px] items-start overflow-clip p-[18px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72461" data-name="Fornitore collegato">
              <div className="content-stretch flex gap-[14px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72462" data-name="Identità e stato">
                <div className="bg-[#111211] content-stretch flex items-center justify-center overflow-clip relative rounded-[10px] shrink-0 size-[38px]" data-node-id="27:72463" data-name="Logo del fornitore">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[17px] whitespace-nowrap" data-node-id="27:72464">
                    O
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative" data-node-id="27:72465" data-name="Dettagli fornitore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:72466">
                    OpenAI
                  </p>
                  <FilmzyChipConfermato className="bg-[#233328] content-stretch flex gap-[8px] h-[32px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0 w-[108px]" etichetta="✓ Collegato" />
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:72467">
                    Ultimo controllo: oggi, 09:42
                  </p>
                </div>
                <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72468" data-name="Indicatore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[70px]" data-node-id="27:72469">
                    Predefinito
                  </p>
                </div>
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[84px]" etichetta="Gestisci" />
              </div>
              <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal gap-[20px] items-start leading-[1.55] not-italic overflow-clip relative shrink-0 w-full" data-node-id="27:72471" data-name="Modello e spesa">
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative" data-node-id="27:72472" data-name="Modello">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72473">
                    Servizio predefinito
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72474">
                    GPT-4.1 ⌄
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative text-[13px]" data-node-id="27:72475" data-name="Spesa mensile">
                  <p className="relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:72476">
                    Speso questo mese 8,00 $
                  </p>
                  <p className="relative shrink-0 text-[#b2b2a8] w-full" data-node-id="27:72477">
                    Nessun limite impostato
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72478" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72479">
              Immagini
            </p>
            <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72480" data-name="Azioni">
              <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72481" data-name="Indicatore">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[110px]" data-node-id="27:72482">
                  fal.ai · Predefinito
                </p>
              </div>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[165px]" etichetta="Aggiungi un fornitore" />
            </div>
            <div className="bg-[#22231f] content-stretch flex flex-col gap-[14px] items-start overflow-clip p-[18px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72484" data-name="Fornitore collegato">
              <div className="content-stretch flex gap-[14px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72485" data-name="Identità e stato">
                <div className="bg-[#111211] content-stretch flex items-center justify-center overflow-clip relative rounded-[10px] shrink-0 size-[38px]" data-node-id="27:72486" data-name="Logo del fornitore">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[17px] whitespace-nowrap" data-node-id="27:72487">
                    f
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative" data-node-id="27:72488" data-name="Dettagli fornitore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:72489">
                    fal.ai
                  </p>
                  <FilmzyChipConfermato className="bg-[#233328] content-stretch flex gap-[8px] h-[32px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0 w-[108px]" etichetta="✓ Collegato" />
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:72490">
                    Ultimo controllo: oggi, 09:42
                  </p>
                </div>
                <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72491" data-name="Indicatore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[70px]" data-node-id="27:72492">
                    Predefinito
                  </p>
                </div>
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[84px]" etichetta="Gestisci" />
              </div>
              <div className="content-stretch flex gap-[20px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72494" data-name="Modello e spesa">
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col font-['Inter:Regular'] font-normal gap-[4px] items-start leading-[1.55] min-w-px not-italic overflow-clip relative" data-node-id="27:72495" data-name="Modello">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72496">
                    Servizio predefinito
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72497">
                    FLUX.1 Kontext ⌄
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative" data-node-id="27:72498" data-name="Spesa mensile">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-full" data-node-id="27:72499">
                    Speso questo mese 12,40 $
                  </p>
                  <div className="bg-[#34362e] content-stretch flex h-[4px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72500" data-name="Avanzamento">
                    <div className="absolute bg-[#f5b544] h-[4px] left-0 right-[75.2%] rounded-[4px] top-0" data-node-id="27:72501" data-name="Completato" />
                  </div>
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:72502">
                    mancano 37,60 $ · tetto scelto: 50 $
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#22231f] content-stretch flex flex-col gap-[14px] items-start overflow-clip p-[18px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72503" data-name="Fornitore collegato">
              <div className="content-stretch flex gap-[14px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72504" data-name="Identità e stato">
                <div className="bg-[#111211] content-stretch flex items-center justify-center overflow-clip relative rounded-[10px] shrink-0 size-[38px]" data-node-id="27:72505" data-name="Logo del fornitore">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[17px] whitespace-nowrap" data-node-id="27:72506">
                    S
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative" data-node-id="27:72507" data-name="Dettagli fornitore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:72508">
                    Stability AI
                  </p>
                  <FilmzyChipConfermato className="bg-[#233328] content-stretch flex gap-[8px] h-[32px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0 w-[108px]" etichetta="✓ Collegato" />
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:72509">
                    Ultimo controllo: oggi, 09:42
                  </p>
                </div>
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[84px]" etichetta="Gestisci" />
              </div>
              <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal gap-[20px] items-start leading-[1.55] not-italic overflow-clip relative shrink-0 w-full" data-node-id="27:72511" data-name="Modello e spesa">
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative" data-node-id="27:72512" data-name="Modello">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72513">
                    Servizio predefinito
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72514">
                    Stable Image Ultra ⌄
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative text-[13px]" data-node-id="27:72515" data-name="Spesa mensile">
                  <p className="relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:72516">
                    Speso questo mese 1,00 $
                  </p>
                  <p className="relative shrink-0 text-[#b2b2a8] w-full" data-node-id="27:72517">
                    Nessun limite impostato
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72518" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72519">
              Video
            </p>
            <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72520" data-name="Azioni">
              <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72521" data-name="Indicatore">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[110px]" data-node-id="27:72522">
                  fal.ai · Predefinito
                </p>
              </div>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[165px]" etichetta="Aggiungi un fornitore" />
            </div>
            <div className="bg-[#22231f] content-stretch flex flex-col gap-[14px] items-start overflow-clip p-[18px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72524" data-name="Fornitore collegato">
              <div className="content-stretch flex gap-[14px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72525" data-name="Identità e stato">
                <div className="bg-[#111211] content-stretch flex items-center justify-center overflow-clip relative rounded-[10px] shrink-0 size-[38px]" data-node-id="27:72526" data-name="Logo del fornitore">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[17px] whitespace-nowrap" data-node-id="27:72527">
                    f
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative" data-node-id="27:72528" data-name="Dettagli fornitore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:72529">
                    fal.ai
                  </p>
                  <FilmzyChipConfermato className="bg-[#233328] content-stretch flex gap-[8px] h-[32px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0 w-[108px]" etichetta="✓ Collegato" />
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:72530">
                    Ultimo controllo: oggi, 09:42
                  </p>
                </div>
                <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72531" data-name="Indicatore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[70px]" data-node-id="27:72532">
                    Predefinito
                  </p>
                </div>
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[84px]" etichetta="Gestisci" />
              </div>
              <div className="content-stretch flex gap-[20px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72534" data-name="Modello e spesa">
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col font-['Inter:Regular'] font-normal gap-[4px] items-start leading-[1.55] min-w-px not-italic overflow-clip relative" data-node-id="27:72535" data-name="Modello">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72536">
                    Servizio predefinito
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72537">
                    Kling · Standard ⌄
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative" data-node-id="27:72538" data-name="Spesa mensile">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-full" data-node-id="27:72539">
                    Speso questo mese 12,40 $
                  </p>
                  <div className="bg-[#34362e] content-stretch flex h-[4px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72540" data-name="Avanzamento">
                    <div className="absolute bg-[#f5b544] h-[4px] left-0 right-[75.2%] rounded-[4px] top-0" data-node-id="27:72541" data-name="Completato" />
                  </div>
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:72542">
                    mancano 37,60 $ · tetto scelto: 50 $
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#22231f] content-stretch flex flex-col gap-[14px] items-start overflow-clip p-[18px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72543" data-name="Fornitore collegato">
              <div className="content-stretch flex gap-[14px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72544" data-name="Identità e stato">
                <div className="bg-[#111211] content-stretch flex items-center justify-center overflow-clip relative rounded-[10px] shrink-0 size-[38px]" data-node-id="27:72545" data-name="Logo del fornitore">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[17px] whitespace-nowrap" data-node-id="27:72546">
                    R
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative" data-node-id="27:72547" data-name="Dettagli fornitore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:72548">
                    Replicate
                  </p>
                  <FilmzyChipConfermato className="bg-[#233328] content-stretch flex gap-[8px] h-[32px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0 w-[108px]" etichetta="✓ Collegato" />
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:72549">
                    Ultimo controllo: oggi, 09:42
                  </p>
                </div>
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[84px]" etichetta="Gestisci" />
              </div>
              <div className="content-stretch flex gap-[20px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72551" data-name="Modello e spesa">
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col font-['Inter:Regular'] font-normal gap-[4px] items-start leading-[1.55] min-w-px not-italic overflow-clip relative" data-node-id="27:72552" data-name="Modello">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72553">
                    Servizio predefinito
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72554">
                    Seedance · Veloce ⌄
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative" data-node-id="27:72555" data-name="Spesa mensile">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[min-content]" data-node-id="27:72556">
                    Speso questo mese 4,00 $
                  </p>
                  <div className="bg-[#34362e] content-stretch flex h-[4px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72557" data-name="Avanzamento">
                    <div className="absolute bg-[#f5b544] h-[4px] left-0 right-[20%] rounded-[4px] top-0" data-node-id="27:72558" data-name="Completato" />
                  </div>
                  <FilmzyChipLimiteVicino className="bg-[#352b19] content-stretch flex gap-[8px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0 w-[195px]" etichetta="80% · Manca poco al limite" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72561" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72562">
              Musica ed effetti
            </p>
            <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72563" data-name="Azioni">
              <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72564" data-name="Indicatore">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[152px]" data-node-id="27:72565">
                  ElevenLabs · Predefinito
                </p>
              </div>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[165px]" etichetta="Aggiungi un fornitore" />
            </div>
            <div className="bg-[#22231f] content-stretch flex flex-col gap-[14px] items-start overflow-clip p-[18px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72567" data-name="Fornitore collegato">
              <div className="content-stretch flex gap-[14px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72568" data-name="Identità e stato">
                <div className="bg-[#111211] content-stretch flex items-center justify-center overflow-clip relative rounded-[10px] shrink-0 size-[38px]" data-node-id="27:72569" data-name="Logo del fornitore">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[17px] whitespace-nowrap" data-node-id="27:72570">
                    E
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative" data-node-id="27:72571" data-name="Dettagli fornitore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:72572">
                    ElevenLabs
                  </p>
                  <FilmzyChipConfermato className="bg-[#233328] content-stretch flex gap-[8px] h-[32px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0 w-[108px]" etichetta="✓ Collegato" />
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:72573">
                    Ultimo controllo: oggi, 09:42
                  </p>
                </div>
                <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72574" data-name="Indicatore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[70px]" data-node-id="27:72575">
                    Predefinito
                  </p>
                </div>
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[84px]" etichetta="Gestisci" />
              </div>
              <div className="content-stretch flex gap-[20px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72577" data-name="Modello e spesa">
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col font-['Inter:Regular'] font-normal gap-[4px] items-start leading-[1.55] min-w-px not-italic overflow-clip relative" data-node-id="27:72578" data-name="Modello">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72579">
                    Servizio predefinito
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72580">
                    Sound Effects ⌄
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative" data-node-id="27:72581" data-name="Spesa mensile">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[min-content]" data-node-id="27:72582">
                    Speso questo mese 2,00 $
                  </p>
                  <div className="bg-[#34362e] content-stretch flex h-[4px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72583" data-name="Avanzamento">
                    <div className="absolute bg-[#f5b544] h-[4px] left-0 right-0 rounded-[4px] top-0" data-node-id="27:72584" data-name="Completato" />
                  </div>
                  <FilmzyChipLimiteRaggiunto className="bg-[#f5b544] content-stretch flex gap-[8px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0 w-[192px]" etichetta="⚠ 100% · Limite raggiunto" />
                </div>
              </div>
            </div>
            <div className="bg-[#22231f] content-stretch flex flex-col gap-[14px] items-start overflow-clip p-[18px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72587" data-name="Fornitore collegato">
              <div className="content-stretch flex gap-[14px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72588" data-name="Identità e stato">
                <div className="bg-[#111211] content-stretch flex items-center justify-center overflow-clip relative rounded-[10px] shrink-0 size-[38px]" data-node-id="27:72589" data-name="Logo del fornitore">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[17px] whitespace-nowrap" data-node-id="27:72590">
                    S
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative" data-node-id="27:72591" data-name="Dettagli fornitore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:72592">
                    Stability AI
                  </p>
                  <FilmzyChipConfermato className="bg-[#233328] content-stretch flex gap-[8px] h-[32px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0 w-[108px]" etichetta="✓ Collegato" />
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:72593">
                    Ultimo controllo: oggi, 09:42
                  </p>
                </div>
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[84px]" etichetta="Gestisci" />
              </div>
              <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal gap-[20px] items-start leading-[1.55] not-italic overflow-clip relative shrink-0 w-full" data-node-id="27:72595" data-name="Modello e spesa">
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative" data-node-id="27:72596" data-name="Modello">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72597">
                    Servizio predefinito
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72598">
                    Stable Audio ⌄
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative text-[13px]" data-node-id="27:72599" data-name="Spesa mensile">
                  <p className="relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:72600">
                    Speso questo mese 1,00 $
                  </p>
                  <p className="relative shrink-0 text-[#b2b2a8] w-full" data-node-id="27:72601">
                    Nessun limite impostato
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72602" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72603">
              Voci
            </p>
            <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72604" data-name="Azioni">
              <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72605" data-name="Indicatore">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[152px]" data-node-id="27:72606">
                  ElevenLabs · Predefinito
                </p>
              </div>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[165px]" etichetta="Aggiungi un fornitore" />
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72608">
              Puoi collegare un servizio per il futuro. I personaggi parlanti non sono ancora disponibili.
            </p>
            <div className="bg-[#22231f] content-stretch flex flex-col gap-[14px] items-start overflow-clip p-[18px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72609" data-name="Fornitore collegato">
              <div className="content-stretch flex gap-[14px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72610" data-name="Identità e stato">
                <div className="bg-[#111211] content-stretch flex items-center justify-center overflow-clip relative rounded-[10px] shrink-0 size-[38px]" data-node-id="27:72611" data-name="Logo del fornitore">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[17px] whitespace-nowrap" data-node-id="27:72612">
                    E
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative" data-node-id="27:72613" data-name="Dettagli fornitore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:72614">
                    ElevenLabs
                  </p>
                  <FilmzyChipConfermato className="bg-[#233328] content-stretch flex gap-[8px] h-[32px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0 w-[108px]" etichetta="✓ Collegato" />
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:72615">
                    Ultimo controllo: oggi, 09:42
                  </p>
                </div>
                <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72616" data-name="Indicatore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[70px]" data-node-id="27:72617">
                    Predefinito
                  </p>
                </div>
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[84px]" etichetta="Gestisci" />
              </div>
              <div className="content-stretch flex gap-[20px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72619" data-name="Modello e spesa">
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col font-['Inter:Regular'] font-normal gap-[4px] items-start leading-[1.55] min-w-px not-italic overflow-clip relative" data-node-id="27:72620" data-name="Modello">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72621">
                    Servizio predefinito
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72622">
                    Multilingual v2 ⌄
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative" data-node-id="27:72623" data-name="Spesa mensile">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[min-content]" data-node-id="27:72624">
                    Speso questo mese 2,00 $
                  </p>
                  <div className="bg-[#34362e] content-stretch flex h-[4px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72625" data-name="Avanzamento">
                    <div className="absolute bg-[#f5b544] h-[4px] left-0 right-0 rounded-[4px] top-0" data-node-id="27:72626" data-name="Completato" />
                  </div>
                  <FilmzyChipLimiteRaggiunto className="bg-[#f5b544] content-stretch flex gap-[8px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0 w-[192px]" etichetta="⚠ 100% · Limite raggiunto" />
                </div>
              </div>
            </div>
            <div className="bg-[#22231f] content-stretch flex flex-col gap-[14px] items-start overflow-clip p-[18px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72629" data-name="Fornitore collegato">
              <div className="content-stretch flex gap-[14px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72630" data-name="Identità e stato">
                <div className="bg-[#111211] content-stretch flex items-center justify-center overflow-clip relative rounded-[10px] shrink-0 size-[38px]" data-node-id="27:72631" data-name="Logo del fornitore">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[17px] whitespace-nowrap" data-node-id="27:72632">
                    O
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative" data-node-id="27:72633" data-name="Dettagli fornitore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:72634">
                    OpenAI
                  </p>
                  <FilmzyChipErrore className="bg-[#392321] content-stretch flex gap-[8px] h-[32px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0 w-[132px]" etichetta="⚠ Non funziona" />
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:72635">
                    Ultimo controllo: oggi, 09:42
                  </p>
                </div>
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[84px]" etichetta="Gestisci" />
              </div>
              <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal gap-[20px] items-start leading-[1.55] not-italic overflow-clip relative shrink-0 w-full" data-node-id="27:72637" data-name="Modello e spesa">
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative" data-node-id="27:72638" data-name="Modello">
                  <p className="relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72639">
                    Servizio predefinito
                  </p>
                  <p className="relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72640">
                    TTS ⌄
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative text-[13px]" data-node-id="27:72641" data-name="Spesa mensile">
                  <p className="relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:72642">
                    Speso questo mese 8,00 $
                  </p>
                  <p className="relative shrink-0 text-[#b2b2a8] w-full" data-node-id="27:72643">
                    Nessun limite impostato
                  </p>
                </div>
              </div>
            </div>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:72644">
            La spesa è per fornitore: lo stesso importo può comparire in più gruppi, ma non viene contato due volte.
          </p>
        </div>
      </div>
      <div className="content-stretch flex items-start overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:72645" data-name="Stato locale">
        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[153px]" data-node-id="27:72646">
          Salvato sul tuo computer
        </p>
      </div>
    </div>
  );
}