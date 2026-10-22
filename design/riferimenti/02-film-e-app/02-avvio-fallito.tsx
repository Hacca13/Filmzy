const imgCiak = "https://www.figma.com/api/mcp/asset/7a82cfba-205b-4f63-b57e-9ae17480b218.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/346cb372-1450-4384-b1c1-77f80ac59c52.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/3cc66fdf-1f5b-46f3-ac69-7f901b03b656.svg";
const imgX = "https://www.figma.com/api/mcp/asset/a29a1a07-31ec-4b9c-8671-9fe43e43514c.svg";
const imgCiak1 = "https://www.figma.com/api/mcp/asset/55bd9181-c918-461f-9267-d9f4157f423a.svg";
const imgCircleAlert = "https://www.figma.com/api/mcp/asset/9477a555-3715-481b-9233-dea2786e541f.svg";

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

export default function AvvioAvvioFallito() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="49:2248" data-name="Avvio · Avvio fallito">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px overflow-clip relative w-full" data-node-id="49:2258" data-name="Avvio fallito">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[650px] left-1/2 top-[calc(50%-44px)] w-[880px]" data-node-id="49:2259" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 880 650' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(0 32.5 44 0 440 325)'><stop stop-color='rgba(245,181,68,0.047059)' offset='0'/><stop stop-color='rgba(245,181,68,0)' offset='1'/></radialGradient></defs></svg>\")" }} data-name="Luce del proiettore" />
        <div className="content-stretch flex flex-col gap-[32px] items-center overflow-clip pb-[40px] relative shrink-0 w-[560px]" data-node-id="49:2260" data-name="Identità e messaggio">
          <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0" data-node-id="49:2261" data-name="Marchio Filmzy">
            <div className="relative shrink-0 size-[64px]" data-node-id="49:2262" data-name="Ciak">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCiak1} />
            </div>
            <p className="[word-break:break-word] font-['Manrope:ExtraBold'] font-extrabold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[52px] whitespace-nowrap" data-node-id="49:2264">
              filmzy
            </p>
          </div>
          <div className="content-stretch flex flex-col gap-[16px] items-center overflow-clip relative shrink-0 w-full" data-node-id="49:2265" data-name="Messaggio di errore">
            <div className="bg-[#352b19] content-stretch flex items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[40px]" data-node-id="49:2266" data-name="Errore di avvio">
              <div className="relative shrink-0 size-[22px]" data-node-id="49:2709" data-name="circle-alert">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCircleAlert} />
              </div>
            </div>
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[24px] text-center w-[min-content]" data-node-id="49:2268">
              Filmzy non riesce a partire
            </p>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.5] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[16px] text-center w-[min-content]" data-node-id="49:2269">
              Chiudi il programma e riaprilo.
            </p>
          </div>
          <FilmzyPulsantePrimarioNormale className="bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[73px]" etichetta="Chiudi" />
        </div>
      </div>
    </div>
  );
}