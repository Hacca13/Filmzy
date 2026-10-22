const imgCiak = "https://www.figma.com/api/mcp/asset/4115a60a-bdb1-446d-b71f-0bb8f8e42155.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/d870a486-1ef2-4a3c-b298-7e774c5cc418.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/359ad4f4-cd93-4fcb-b5a4-1ce813d45000.svg";
const imgX = "https://www.figma.com/api/mcp/asset/ed07379f-0694-45d7-bee7-637a61ba8d5e.svg";
const imgCiak1 = "https://www.figma.com/api/mcp/asset/8b7acf68-a377-40a3-8108-60df9b9d374e.svg";
const imgIndicatoreDiCaricamento = "https://www.figma.com/api/mcp/asset/c3f172f5-0286-42b4-911c-d3fcfeb710e9.svg";

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

export default function AvvioCaricamento() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="36:27" data-name="Avvio · Caricamento">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px overflow-clip relative w-full" data-node-id="36:37" data-name="Attesa di avvio">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[650px] left-1/2 top-[calc(50%-44px)] w-[880px]" data-node-id="36:38" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 880 650' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(0 32.5 44 0 440 325)'><stop stop-color='rgba(245,181,68,0.047059)' offset='0'/><stop stop-color='rgba(245,181,68,0)' offset='1'/></radialGradient></defs></svg>\")" }} data-name="Luce del proiettore" />
        <div className="content-stretch flex flex-col gap-[40px] items-center overflow-clip pb-[40px] relative shrink-0 w-[480px]" data-node-id="36:39" data-name="Identità e caricamento">
          <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0" data-node-id="36:40" data-name="Marchio Filmzy">
            <div className="relative shrink-0 size-[64px]" data-node-id="36:41" data-name="Ciak">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCiak1} />
            </div>
            <p className="[word-break:break-word] font-['Manrope:ExtraBold'] font-extrabold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[52px] whitespace-nowrap" data-node-id="36:43">
              filmzy
            </p>
          </div>
          <div className="content-stretch flex flex-col gap-[24px] items-center overflow-clip relative shrink-0 w-full" data-node-id="36:44" data-name="Stato di avvio">
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.5] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[16px] text-center w-[min-content]" data-node-id="36:45">
              Sto preparando Filmzy…
            </p>
            <div className="relative shrink-0 size-[22px]" data-node-id="36:46" data-name="Indicatore di caricamento">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIndicatoreDiCaricamento} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}