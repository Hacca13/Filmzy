const imgCiak = "https://www.figma.com/api/mcp/asset/a934ecd3-ea80-415d-a94e-fa290ab45c55.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/dcf6a16b-4ade-46d4-8c67-9aba0fd90ffa.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/ec49e0a8-7d62-4e2c-bbfb-3bee0eac26f7.svg";
const imgX = "https://www.figma.com/api/mcp/asset/eca7843d-cd44-4cfa-8a67-02bb600659c2.svg";

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

export default function SpeseETetti() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="27:72836" data-name="Spese e tetti">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <div className="[word-break:break-word] content-stretch flex font-['Inter:Semi_Bold'] font-semibold h-[72px] items-center justify-between not-italic overflow-clip px-[36px] relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:72846" data-name="Navigazione">
        <p className="flex-[1_0_0] leading-[1.55] min-w-px relative text-[20px]" data-node-id="27:72847">
          Impostazioni
        </p>
        <div className="flex flex-col justify-center leading-[0] relative shrink-0 text-[13px] w-[86px]" data-node-id="27:72848">
          <p className="leading-[normal]">← Torna al film</p>
        </div>
      </div>
      <div className="content-stretch flex items-start min-h-[890px] overflow-clip relative shrink-0 w-full" data-node-id="27:72849" data-name="Impostazioni e contenuto">
        <div className="[word-break:break-word] border-[#34362e] border-r border-solid content-stretch flex flex-col font-['Inter:Regular'] font-normal gap-[24px] items-start not-italic overflow-clip p-[32px] relative self-stretch shrink-0 w-[240px]" data-node-id="27:72850" data-name="Menu impostazioni">
          <div className="leading-[0] relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72851">
            <p className="leading-[48px] mb-0">Connessioni</p>
            <p className="leading-[48px] mb-0">Chi fa cosa</p>
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[48px] mb-0 text-[#f5b544]">• Spese e tetti</p>
            <p className="leading-[48px] mb-0">Generazione</p>
            <p className="leading-[48px] mb-0">Prudenza</p>
            <p className="leading-[48px] mb-0">Aggiornamenti</p>
            <p className="leading-[48px] mb-0">I tuoi dati</p>
            <p className="leading-[48px] mb-0">Avanzate</p>
            <p className="leading-[48px]">Informazioni</p>
          </div>
          <p className="leading-[1.55] relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:72852">
            Filmzy 0.3.2 · Sul tuo computer
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[28px] items-start min-w-px overflow-clip p-[40px] relative" data-node-id="27:72853" data-name="Contenuto impostazioni">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72854" data-name="Introduction">
            <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:72855">
              Spese e tetti
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72856">
              Una stima prima di ogni generazione, e un tetto solo se lo vuoi tu.
            </p>
          </div>
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72857" data-name="Avviso">
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px] whitespace-pre-wrap" data-node-id="27:72858">{`✦  Filmzy è gratuito. I costi vanno direttamente ai servizi che hai collegato.`}</p>
          </div>
          <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72859" data-name="Limiti generali">
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:72860" data-name="Pannello">
              <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72861">
                Per i tuoi film
              </p>
              <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72862" data-name="Campo">
                <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full whitespace-pre-wrap" data-node-id="27:72863">
                  <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Limite per film (facoltativo)</p>
                  <p className="leading-[1.65] mb-0 text-[14px]">{` `}</p>
                  <p className="leading-[1.65] text-[#aaa99e] text-[11px]">Importo in $ · lascia vuoto per nessun limite</p>
                </div>
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72864">
                È il valore iniziale per i nuovi film. Puoi cambiarlo anche nel singolo film.
              </p>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:72865" data-name="Pannello">
              <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72866">
                Prima di una spesa
              </p>
              <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72867" data-name="Campo">
                <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full whitespace-pre-wrap" data-node-id="27:72868">
                  <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Chiedi conferma sopra questo importo (facoltativo)</p>
                  <p className="leading-[1.65] mb-0 text-[14px]">{` `}</p>
                  <p className="leading-[1.65] text-[#aaa99e] text-[11px]">Importo in $ · nessuna soglia impostata</p>
                </div>
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72869">
                Se una generazione supera questa cifra, ti chiediamo prima di procedere.
              </p>
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72870" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72871">
              Limite mensile per servizio
            </p>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72872">
              Tutti i campi sono facoltativi e inizialmente vuoti. Non cambiano eventuali limiti impostati nel pannello del fornitore.
            </p>
            <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72873" data-name="Campo">
              <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full whitespace-pre-wrap" data-node-id="27:72874">
                <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">OpenAI</p>
                <p className="leading-[1.65] mb-0 text-[14px]">{` `}</p>
                <p className="leading-[1.65] text-[#aaa99e] text-[11px]">Nessun limite · importo in $</p>
              </div>
            </div>
            <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72875" data-name="Campo">
              <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full whitespace-pre-wrap" data-node-id="27:72876">
                <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Anthropic</p>
                <p className="leading-[1.65] mb-0 text-[14px]">{` `}</p>
                <p className="leading-[1.65] text-[#aaa99e] text-[11px]">Nessun limite · importo in $</p>
              </div>
            </div>
            <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72877" data-name="Campo">
              <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full whitespace-pre-wrap" data-node-id="27:72878">
                <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">fal.ai</p>
                <p className="leading-[1.65] mb-0 text-[14px]">{` `}</p>
                <p className="leading-[1.65] text-[#aaa99e] text-[11px]">Nessun limite · importo in $</p>
              </div>
            </div>
            <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72879" data-name="Campo">
              <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full whitespace-pre-wrap" data-node-id="27:72880">
                <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Replicate</p>
                <p className="leading-[1.65] mb-0 text-[14px]">{` `}</p>
                <p className="leading-[1.65] text-[#aaa99e] text-[11px]">Nessun limite · importo in $</p>
              </div>
            </div>
            <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72881" data-name="Campo">
              <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full whitespace-pre-wrap" data-node-id="27:72882">
                <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Stability AI</p>
                <p className="leading-[1.65] mb-0 text-[14px]">{` `}</p>
                <p className="leading-[1.65] text-[#aaa99e] text-[11px]">Nessun limite · importo in $</p>
              </div>
            </div>
            <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72883" data-name="Campo">
              <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full whitespace-pre-wrap" data-node-id="27:72884">
                <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">ElevenLabs</p>
                <p className="leading-[1.65] mb-0 text-[14px]">{` `}</p>
                <p className="leading-[1.65] text-[#aaa99e] text-[11px]">Nessun limite · importo in $</p>
              </div>
            </div>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:72885">
            Le stime non sostituiscono il rendiconto del servizio. Imposta un limite di spesa anche nel pannello di ogni servizio.
          </p>
        </div>
      </div>
      <div className="content-stretch flex items-start overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:72886" data-name="Stato locale">
        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[153px]" data-node-id="27:72887">
          Salvato sul tuo computer
        </p>
      </div>
    </div>
  );
}