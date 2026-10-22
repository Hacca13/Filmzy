const imgCiak = "https://www.figma.com/api/mcp/asset/c91337f8-0ca0-46ab-95e5-2e86c8749347.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/7ff39203-cc52-49af-8c3e-1adf334d444c.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/22a1b81f-38cc-4270-a211-7d278083b137.svg";
const imgX = "https://www.figma.com/api/mcp/asset/4a69d4a8-76be-47eb-bf07-4d32eabe4c65.svg";

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

export default function ChiFaCosa() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="27:72743" data-name="Chi fa cosa">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <div className="[word-break:break-word] content-stretch flex font-['Inter:Semi_Bold'] font-semibold h-[72px] items-center justify-between not-italic overflow-clip px-[36px] relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:72753" data-name="Navigazione">
        <p className="flex-[1_0_0] leading-[1.55] min-w-px relative text-[20px]" data-node-id="27:72754">
          Impostazioni
        </p>
        <div className="flex flex-col justify-center leading-[0] relative shrink-0 text-[13px] w-[86px]" data-node-id="27:72755">
          <p className="leading-[normal]">← Torna al film</p>
        </div>
      </div>
      <div className="content-stretch flex items-start min-h-[890px] overflow-clip relative shrink-0 w-full" data-node-id="27:72756" data-name="Impostazioni e contenuto">
        <div className="[word-break:break-word] border-[#34362e] border-r border-solid content-stretch flex flex-col font-['Inter:Regular'] font-normal gap-[24px] items-start not-italic overflow-clip p-[32px] relative self-stretch shrink-0 w-[240px]" data-node-id="27:72757" data-name="Menu impostazioni">
          <div className="leading-[0] relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72758">
            <p className="leading-[48px] mb-0">Connessioni</p>
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[48px] mb-0 text-[#f5b544]">• Chi fa cosa</p>
            <p className="leading-[48px] mb-0">Spese e tetti</p>
            <p className="leading-[48px] mb-0">Generazione</p>
            <p className="leading-[48px] mb-0">Prudenza</p>
            <p className="leading-[48px] mb-0">Aggiornamenti</p>
            <p className="leading-[48px] mb-0">I tuoi dati</p>
            <p className="leading-[48px] mb-0">Avanzate</p>
            <p className="leading-[48px]">Informazioni</p>
          </div>
          <p className="leading-[1.55] relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:72759">
            Filmzy 0.3.2 · Sul tuo computer
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[28px] items-start min-w-px overflow-clip p-[40px] relative" data-node-id="27:72760" data-name="Contenuto impostazioni">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72761" data-name="Introduction">
            <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:72762">
              Chi fa cosa
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72763">
              Una piccola troupe per il tuo film. Ogni modifica qui vale subito, senza pubblicare.
            </p>
          </div>
          <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72764" data-name="Ruoli e configurazione">
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px overflow-clip relative" data-node-id="27:72765" data-name="Tutti i ruoli">
              <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72766" data-name="Ruolo">
                <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:72767">
                  <p className="font-['Inter:Semi_Bold'] font-semibold leading-[1.7] mb-0 text-[14px]">Moderatore　›</p>
                  <p className="leading-[1.7] text-[#aaa99e] text-[11px]">OpenAI · GPT-4.1 mini</p>
                </div>
              </div>
              <div className="bg-[#352b19] border border-[#f5b544] border-solid content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72768" data-name="Ruolo">
                <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:72769">
                  <p className="font-['Inter:Semi_Bold'] font-semibold leading-[1.7] mb-0 text-[14px]">Sceneggiatore　›</p>
                  <p className="leading-[1.7] text-[#aaa99e] text-[11px]">OpenAI · GPT-4.1 mini</p>
                </div>
              </div>
              <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72770" data-name="Ruolo">
                <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:72771">
                  <p className="font-['Inter:Semi_Bold'] font-semibold leading-[1.7] mb-0 text-[14px]">Casting　›</p>
                  <p className="leading-[1.7] text-[#aaa99e] text-[11px]">OpenAI · GPT-4.1 mini</p>
                </div>
              </div>
              <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72772" data-name="Ruolo">
                <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:72773">
                  <p className="font-['Inter:Semi_Bold'] font-semibold leading-[1.7] mb-0 text-[14px]">Aiuto regista　›</p>
                  <p className="leading-[1.7] text-[#aaa99e] text-[11px]">OpenAI · GPT-4.1 mini</p>
                </div>
              </div>
              <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72774" data-name="Ruolo">
                <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:72775">
                  <p className="font-['Inter:Semi_Bold'] font-semibold leading-[1.7] mb-0 text-[14px]">Direttore della fotografia　›</p>
                  <p className="leading-[1.7] text-[#aaa99e] text-[11px]">OpenAI · GPT-4.1 mini</p>
                </div>
              </div>
              <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72776" data-name="Ruolo">
                <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:72777">
                  <p className="font-['Inter:Semi_Bold'] font-semibold leading-[1.7] mb-0 text-[14px]">Storyboard　›</p>
                  <p className="leading-[1.7] text-[#aaa99e] text-[11px]">OpenAI · GPT-4.1 mini</p>
                </div>
              </div>
              <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72778" data-name="Ruolo">
                <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:72779">
                  <p className="font-['Inter:Semi_Bold'] font-semibold leading-[1.7] mb-0 text-[14px]">Operatore di ripresa　›</p>
                  <p className="leading-[1.7] text-[#aaa99e] text-[11px]">fal.ai · Kling · Standard</p>
                </div>
              </div>
              <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72780" data-name="Ruolo">
                <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:72781">
                  <p className="font-['Inter:Semi_Bold'] font-semibold leading-[1.7] mb-0 text-[14px]">Scenografo　›</p>
                  <p className="leading-[1.7] text-[#aaa99e] text-[11px]">fal.ai · FLUX.1 Kontext</p>
                </div>
              </div>
              <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72782" data-name="Ruolo">
                <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:72783">
                  <p className="font-['Inter:Semi_Bold'] font-semibold leading-[1.7] mb-0 text-[14px]">Moodboard　›</p>
                  <p className="leading-[1.7] text-[#aaa99e] text-[11px]">OpenAI · GPT-4.1 mini</p>
                </div>
              </div>
              <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72784" data-name="Ruolo">
                <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:72785">
                  <p className="font-['Inter:Semi_Bold'] font-semibold leading-[1.7] mb-0 text-[14px]">Analista di immagini　›</p>
                  <p className="leading-[1.7] text-[#aaa99e] text-[11px]">OpenAI · GPT-4.1 mini</p>
                </div>
              </div>
              <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72786" data-name="Ruolo">
                <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:72787">
                  <p className="font-['Inter:Semi_Bold'] font-semibold leading-[1.7] mb-0 text-[14px]">Ritocco　›</p>
                  <p className="leading-[1.7] text-[#aaa99e] text-[11px]">fal.ai · FLUX.1 Kontext</p>
                </div>
              </div>
              <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72788" data-name="Ruolo">
                <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:72789">
                  <p className="font-['Inter:Semi_Bold'] font-semibold leading-[1.7] mb-0 text-[14px]">Segretaria di edizione　›</p>
                  <p className="leading-[1.7] text-[#aaa99e] text-[11px]">OpenAI · GPT-4.1 mini</p>
                </div>
              </div>
              <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72790" data-name="Ruolo">
                <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:72791">
                  <p className="font-['Inter:Semi_Bold'] font-semibold leading-[1.7] mb-0 text-[14px]">Sound designer　›</p>
                  <p className="leading-[1.7] text-[#aaa99e] text-[11px]">ElevenLabs · Sound Effects</p>
                </div>
              </div>
              <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72792" data-name="Ruolo">
                <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:72793">
                  <p className="font-['Inter:Semi_Bold'] font-semibold leading-[1.7] mb-0 text-[14px]">Compositore　›</p>
                  <p className="leading-[1.7] text-[#aaa99e] text-[11px]">ElevenLabs · Sound Effects</p>
                </div>
              </div>
              <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72794" data-name="Ruolo">
                <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:72795">
                  <p className="font-['Inter:Semi_Bold'] font-semibold leading-[1.7] mb-0 text-[14px]">Rumorista　›</p>
                  <p className="leading-[1.7] text-[#aaa99e] text-[11px]">ElevenLabs · Sound Effects</p>
                </div>
              </div>
              <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="49:4607" data-name="Ruolo">
                <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="49:4608">
                  <p className="leading-[1.7] mb-0">Character designer　›</p>
                  <p className="leading-[1.7]">fal.ai · Seedream · Standard</p>
                </div>
              </div>
              <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="49:4609" data-name="Ruolo">
                <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="49:4610">
                  <p className="leading-[1.7] mb-0">Immagini del moodboard　›</p>
                  <p className="leading-[1.7]">fal.ai · Seedream · Standard</p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[20px] items-start overflow-clip relative shrink-0 w-[440px]" data-node-id="27:72796" data-name="Pannello del ruolo">
              <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72797" data-name="Pannello">
                <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:72798">
                  Sceneggiatore
                </p>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:72799">
                  Dà forma all’idea e scrive le scene del film.
                </p>
                <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72800" data-name="Campo">
                  <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full" data-node-id="27:72801">
                    <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Fornitore</p>
                    <p className="leading-[1.65] text-[14px]">OpenAI ⌄</p>
                  </div>
                </div>
                <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72802" data-name="Campo">
                  <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full" data-node-id="27:72803">
                    <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Modello</p>
                    <p className="leading-[1.65] text-[14px]">GPT-4.1 mini ⌄</p>
                  </div>
                </div>
                <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:72804" data-name="Indicatore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[70px]" data-node-id="27:72805">
                    Predefinito
                  </p>
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:72806">
                  Questo modello non permette di regolare la creatività
                </p>
                <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:72807" data-name="Separatore" />
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[18px] w-[min-content]" data-node-id="27:72808">
                  Istruzioni
                </p>
                <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72809" data-name="Campo">
                  <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full" data-node-id="27:72810">
                    <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Versione delle istruzioni</p>
                    <p className="leading-[1.65] text-[14px]">Versione 2 · consigliata ⌄</p>
                  </div>
                </div>
                <div className="[word-break:break-word] bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72811" data-name="Pannello">
                  <p className="font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72812">
                    Versione 2 · consigliata
                  </p>
                  <div className="font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72813">
                    <p className="leading-[1.55] mb-0">• Scene più brevi e leggibili</p>
                    <p className="leading-[1.55]">• Continuità più attenta tra abiti e luoghi</p>
                  </div>
                </div>
                <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:72814">
                  <p className="leading-[1.55] mb-0">Versione 1 · Struttura originale, descrizioni più ampie</p>
                  <p className="leading-[1.55]">File locali · Le mie istruzioni per i drammi.txt</p>
                </div>
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[173px]" etichetta="Carica le tue istruzioni" />
              </div>
              <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72816" data-name="Pannello">
                <div className="content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72817" data-name="Avviso">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:72818">
                    È disponibile una versione nuova delle istruzioni
                  </p>
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72819">
                  Versione 3 · Transizioni più naturali e finali meno prevedibili.
                </p>
                <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72820" data-name="Azioni">
                  <div className="content-stretch flex h-[36px] items-center justify-center overflow-clip px-[12px] relative rounded-[12px] shrink-0" data-node-id="27:72821" data-name="Azione">
                    <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[79px]" etichetta="Provala" />
                  </div>
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[161px]" etichetta="Resta con la vecchia" />
                </div>
              </div>
              <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72824" data-name="Pannello">
                <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:72825">
                  Prova con un esempio fisso
                </p>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:72826">
                  Esempio: una bobina dimenticata in stazione. Il test usa sempre lo stesso testo, così confronti i risultati.
                </p>
                <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold h-[46px] justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[140px]" data-node-id="27:72827">
                  <p className="leading-[normal]">Prova · circa 0,004 $</p>
                </div>
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
                <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72829" data-name="Campo">
                  <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full" data-node-id="27:72830">
                    <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Risultato</p>
                    <p className="leading-[1.65] text-[14px]">Marco trova la bobina. La luce del cinema è ancora accesa: decide di raggiungerla.</p>
                  </div>
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:72831">
                  Ultima prova · 0,004 $ · 2,1 secondi
                </p>
                <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[144px]" data-node-id="27:72832">
                  <p className="leading-[normal]">Torna ai valori predefiniti</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex items-start overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:72833" data-name="Stato locale">
        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[153px]" data-node-id="27:72834">
          Salvato sul tuo computer
        </p>
      </div>
    </div>
  );
}