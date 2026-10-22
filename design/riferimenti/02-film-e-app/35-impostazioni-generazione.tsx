const imgCiak = "https://www.figma.com/api/mcp/asset/c3d01da7-edb7-4eb4-ae0a-886b5cb360c1.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/d8ae6bca-2469-4768-a623-f094629b21ca.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/da55dca8-9acd-4553-b0d5-a639bca5ac79.svg";
const imgX = "https://www.figma.com/api/mcp/asset/e8178289-9b1e-49d0-9408-d56227e15f32.svg";
const imgCursore = "https://www.figma.com/api/mcp/asset/1da71b27-e4ea-4085-a772-5ec473547417.svg";

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

export default function Generazione() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="27:72889" data-name="Generazione">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <div className="[word-break:break-word] content-stretch flex font-['Inter:Semi_Bold'] font-semibold h-[72px] items-center justify-between not-italic overflow-clip px-[36px] relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:72899" data-name="Navigazione">
        <p className="flex-[1_0_0] leading-[1.55] min-w-px relative text-[20px]" data-node-id="27:72900">
          Impostazioni
        </p>
        <div className="flex flex-col justify-center leading-[0] relative shrink-0 text-[13px] w-[86px]" data-node-id="27:72901">
          <p className="leading-[normal]">← Torna al film</p>
        </div>
      </div>
      <div className="content-stretch flex items-start min-h-[890px] overflow-clip relative shrink-0 w-full" data-node-id="27:72902" data-name="Impostazioni e contenuto">
        <div className="[word-break:break-word] border-[#34362e] border-r border-solid content-stretch flex flex-col font-['Inter:Regular'] font-normal gap-[24px] items-start not-italic overflow-clip p-[32px] relative self-stretch shrink-0 w-[240px]" data-node-id="27:72903" data-name="Menu impostazioni">
          <div className="leading-[0] relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72904">
            <p className="leading-[48px] mb-0">Connessioni</p>
            <p className="leading-[48px] mb-0">Chi fa cosa</p>
            <p className="leading-[48px] mb-0">Spese e tetti</p>
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[48px] mb-0 text-[#f5b544]">• Generazione</p>
            <p className="leading-[48px] mb-0">Prudenza</p>
            <p className="leading-[48px] mb-0">Aggiornamenti</p>
            <p className="leading-[48px] mb-0">I tuoi dati</p>
            <p className="leading-[48px] mb-0">Avanzate</p>
            <p className="leading-[48px]">Informazioni</p>
          </div>
          <p className="leading-[1.55] relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:72905">
            Filmzy 0.3.2 · Sul tuo computer
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[28px] items-start min-w-px overflow-clip p-[40px] relative" data-node-id="27:72906" data-name="Contenuto impostazioni">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:72907" data-name="Introduction">
            <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:72908">
              Generazione
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72909">
              Piccole preferenze di partenza. Puoi sempre scegliere per ogni ripresa.
            </p>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72910" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72911">
              Video
            </p>
            <div className="content-stretch flex gap-[20px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:72912" data-name="Interruttore">
              <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:72913">
                <p className="mb-0">
                  <span className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] not-italic text-[14px]">Audio nelle clip video</span>
                  <span className="leading-[1.55] text-[#aaa99e] text-[11px]">{` · Spento`}</span>
                </p>
                <p className="leading-[1.55] text-[#aaa99e] text-[13px]">La voce cambia da una clip all’altra e su alcuni servizi costa di più. Lo puoi cambiare quando generi.</p>
              </div>
              <div className="h-[24px] relative shrink-0 w-[40px]" data-node-id="27:72914" data-name="Cursore">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCursore} />
              </div>
            </div>
            <div className="content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72916" data-name="Avviso">
              <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:72917">
                Questa scelta imposta solo il valore iniziale di «Genera anche l’audio» nelle inquadrature.
              </p>
            </div>
            <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:72918" data-name="Separatore" />
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:72923" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:72924">
              Immagini e attese
            </p>
            <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:72925" data-name="Campo">
              <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full" data-node-id="27:72926">
                <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Proposte per ogni luogo</p>
                <p className="leading-[1.65] mb-0 text-[14px]">3 immagini ⌄</p>
                <p className="leading-[1.65] text-[#aaa99e] text-[11px]">Più proposte significano più possibilità, ma anche più spesa.</p>
              </div>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:72931">
              Se un servizio non risponde, decidi tu se riprovare o cambiarlo. Filmzy non passa automaticamente a un altro servizio.
            </p>
          </div>
        </div>
      </div>
      <div className="content-stretch flex items-start overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:72932" data-name="Stato locale">
        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[153px]" data-node-id="27:72933">
          Salvato sul tuo computer
        </p>
      </div>
    </div>
  );
}