const imgCiak = "https://www.figma.com/api/mcp/asset/c6d4e24b-4f16-4370-883c-fad5eb069961.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/4d521a3e-c102-4359-bf65-2b19c1e4cd2e.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/3c3b8648-7c14-4273-91cc-ff412c793180.svg";
const imgX = "https://www.figma.com/api/mcp/asset/1ace8758-4615-4d9b-abbf-45301cc7c667.svg";
const imgCursore = "https://www.figma.com/api/mcp/asset/fc80c6da-c366-4dfa-b08e-252172960cbc.svg";
const imgCursore1 = "https://www.figma.com/api/mcp/asset/c29bec70-6c67-4aed-bfdd-db8b769404ea.svg";

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

type FilmzyPulsanteTestoNormaleProps = {
  className?: string;
  etichetta?: string;
};

function FilmzyPulsanteTestoNormale({ className, etichetta = "Scopri di più" }: FilmzyPulsanteTestoNormaleProps) {
  return (
    <div className={className || "bg-[rgba(0,0,0,0)] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px]"} data-node-id="49:2986" data-name="Filmzy/Pulsante/Testo/Normale">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:2329">
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

export default function FornitoreServizi() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="27:72648" data-name="Fornitore · Servizi">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <div className="[word-break:break-word] content-stretch flex font-['Inter:Semi_Bold'] font-semibold h-[72px] items-center justify-between not-italic overflow-clip px-[36px] relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:72658" data-name="Navigazione">
        <p className="flex-[1_0_0] leading-[1.55] min-w-px relative text-[20px]" data-node-id="27:72659">
          Impostazioni
        </p>
        <div className="flex flex-col justify-center leading-[0] relative shrink-0 text-[13px] w-[86px]" data-node-id="27:72660">
          <p className="leading-[normal]">← Torna al film</p>
        </div>
      </div>
      <div className="content-stretch flex items-start min-h-[890px] overflow-clip relative shrink-0 w-full" data-node-id="27:72661" data-name="Impostazioni e contenuto">
        <div className="[word-break:break-word] border-[#34362e] border-r border-solid content-stretch flex flex-col font-['Inter:Regular'] font-normal gap-[24px] items-start not-italic overflow-clip p-[32px] relative self-stretch shrink-0 w-[240px]" data-node-id="27:72662" data-name="Menu impostazioni">
          <div className="leading-[0] relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72663">
            <p className="leading-[48px] mb-0 text-[#f5b544]">Connessioni</p>
            <p className="leading-[48px] mb-0">Chi fa cosa</p>
            <p className="leading-[48px] mb-0">Spese e tetti</p>
            <p className="leading-[48px] mb-0">Generazione</p>
            <p className="leading-[48px] mb-0">Prudenza</p>
            <p className="leading-[48px] mb-0">Aggiornamenti</p>
            <p className="leading-[48px] mb-0">I tuoi dati</p>
            <p className="leading-[48px] mb-0">Avanzate</p>
            <p className="leading-[48px]">Informazioni</p>
          </div>
          <p className="leading-[1.55] relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:72664">
            Filmzy 0.3.2 · Sul tuo computer
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[28px] items-start min-w-px overflow-clip p-[40px] relative" data-node-id="27:72665" data-name="Contenuto impostazioni">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72666" data-name="Introduction">
            <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:72667">
              fal.ai
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72668">
              Collegato · Ultimo controllo oggi alle 09:42 · Immagini e video
            </p>
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72669" data-name="Azioni">
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72670" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[44px]" data-node-id="27:72671">
                Servizi
              </p>
            </div>
            <FilmzyPulsanteTestoNormale className="bg-[rgba(0,0,0,0)] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Chiave" />
            <FilmzyPulsanteTestoNormale className="bg-[rgba(0,0,0,0)] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[90px]" etichetta="Chi lo usa" />
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72674" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72675">
              Servizi
            </p>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72676">
              I servizi attivi compaiono subito in «Cambia servizio». Spegni quelli che non vuoi usare: non serve pubblicare.
            </p>
            <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal items-start leading-[1.55] not-italic overflow-clip p-[12px] relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72677" data-name="Intestazione tabella">
              <p className="flex-[1_0_0] min-w-px relative" data-node-id="27:72678">
                Nome e tipo
              </p>
              <p className="flex-[1_0_0] min-w-px relative" data-node-id="27:72679">
                Prezzo indicativo per uso
              </p>
              <p className="flex-[1_0_0] min-w-px relative" data-node-id="27:72680">
                Visibile nel selettore
              </p>
            </div>
            <div className="bg-[#22231f] content-stretch flex gap-[20px] items-center overflow-clip p-[18px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72681" data-name="Modello">
              <div className="content-stretch flex flex-col gap-[5px] items-start overflow-clip relative shrink-0 w-[210px]" data-node-id="27:72682" data-name="Identità modello">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:72683">
                  Kling · Standard
                </p>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:72684">
                  Video
                </p>
                <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72685" data-name="Indicatore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[70px]" data-node-id="27:72686">
                    Predefinito
                  </p>
                </div>
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[160px]" data-node-id="27:72687">
                0,42 $ / 6 s
              </p>
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative" data-node-id="27:72688" data-name="Visibilità">
                <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72689" data-name="Interruttore">
                  <div className="h-[24px] relative shrink-0 w-[40px]" data-node-id="27:72691" data-name="Cursore">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCursore} />
                  </div>
                </div>
              </div>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Prova" />
            </div>
            <div className="bg-[#22231f] content-stretch flex gap-[20px] items-center overflow-clip p-[18px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72694" data-name="Modello">
              <div className="[word-break:break-word] content-stretch flex flex-col gap-[5px] items-start leading-[1.55] not-italic overflow-clip relative shrink-0 w-[210px]" data-node-id="27:72695" data-name="Identità modello">
                <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72696">
                  Seedance · Veloce
                </p>
                <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72697">
                  Video
                </p>
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[160px]" data-node-id="27:72698">
                0,90 $ / clip
              </p>
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative" data-node-id="27:72699" data-name="Visibilità">
                <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72700" data-name="Interruttore">
                  <div className="h-[24px] relative shrink-0 w-[40px]" data-node-id="27:72702" data-name="Cursore">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCursore} />
                  </div>
                </div>
              </div>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Prova" />
            </div>
            <div className="bg-[#22231f] content-stretch flex gap-[20px] items-center overflow-clip p-[18px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72705" data-name="Modello">
              <div className="[word-break:break-word] content-stretch flex flex-col gap-[5px] items-start leading-[1.55] not-italic overflow-clip relative shrink-0 w-[210px]" data-node-id="27:72706" data-name="Identità modello">
                <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72707">
                  FLUX.1 Kontext
                </p>
                <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72708">
                  Immagini e ritocco
                </p>
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[160px]" data-node-id="27:72709">
                0,05 $ / immagine
              </p>
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative" data-node-id="27:72710" data-name="Visibilità">
                <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72711" data-name="Interruttore">
                  <div className="h-[24px] relative shrink-0 w-[40px]" data-node-id="27:72713" data-name="Cursore">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCursore} />
                  </div>
                </div>
              </div>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Prova" />
            </div>
            <div className="bg-[#22231f] content-stretch flex gap-[20px] items-center overflow-clip p-[18px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72716" data-name="Modello">
              <div className="[word-break:break-word] content-stretch flex flex-col gap-[5px] items-start leading-[1.55] not-italic overflow-clip relative shrink-0 w-[210px]" data-node-id="27:72717" data-name="Identità modello">
                <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:72718">
                  Veo 3
                </p>
                <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72719">
                  Video con audio
                </p>
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[160px]" data-node-id="27:72720">
                1,20 $ / clip
              </p>
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative" data-node-id="27:72721" data-name="Visibilità">
                <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72722" data-name="Interruttore">
                  <div className="h-[24px] relative shrink-0 w-[40px]" data-node-id="27:72724" data-name="Cursore">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCursore1} />
                  </div>
                </div>
              </div>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Prova" />
            </div>
          </div>
          <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72727" data-name="Preferenze fornitore">
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:72728" data-name="Pannello">
              <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72729">
                Scelta predefinita
              </p>
              <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72730" data-name="Campo">
                <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72731">
                  <p className="leading-[1.65] mb-0">Servizio predefinito</p>
                  <p className="leading-[1.65]">Kling · Standard ⌄</p>
                </div>
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72732">
                Usato quando scegli fal.ai senza indicare un altro servizio.
              </p>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:72733" data-name="Pannello">
              <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:72734">
                Spese del mese
              </p>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[28px] w-[min-content]" data-node-id="27:72735">
                12,40 $ di 50 $
              </p>
              <div className="bg-[#34362e] content-stretch flex h-[4px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:72736" data-name="Avanzamento">
                <div className="absolute bg-[#f5b544] h-[4px] left-0 right-[75.2%] rounded-[4px] top-0" data-node-id="27:72737" data-name="Completato" />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5b544] text-[14px] w-[min-content]" data-node-id="27:72738">
                mancano 37,60 $
              </p>
              <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[143px]" data-node-id="27:72739">
                <p className="leading-[normal]">Modifica il limite mensile</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex items-start overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:72740" data-name="Stato locale">
        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[153px]" data-node-id="27:72741">
          Salvato sul tuo computer
        </p>
      </div>
    </div>
  );
}