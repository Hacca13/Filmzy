const imgCiak = "https://www.figma.com/api/mcp/asset/f9674c56-2ad6-4ff6-a65e-987b6bc53f86.svg";
const imgCiak1 = "https://www.figma.com/api/mcp/asset/806c006c-745f-463f-abff-eda793d8b4f2.svg";
const imgIndicatoreDiCaricamento = "https://www.figma.com/api/mcp/asset/520a8d81-245d-4bed-abc4-5740a6585f79.svg";

export default function AvvioCaricamentoDiFilmzy() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="36:27" data-name="Avvio · Caricamento di Filmzy">
      <div className="border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" data-node-id="36:28" data-name="Barra della finestra">
        <div className="content-stretch flex gap-[12px] items-center overflow-clip relative shrink-0" data-node-id="36:29" data-name="Titolo della finestra">
          <div className="content-stretch flex gap-[8px] items-center overflow-clip relative shrink-0" data-node-id="36:30" data-name="Filmzy">
            <div className="relative shrink-0 size-[24px]" data-node-id="36:31" data-name="Ciak">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCiak} />
            </div>
            <p className="[word-break:break-word] font-['Manrope:ExtraBold'] font-extrabold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[14px] whitespace-nowrap" data-node-id="36:33">
              filmzy
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[12px] whitespace-nowrap" data-node-id="36:34">
            Filmzy
          </p>
        </div>
        <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex h-[24px] items-center overflow-clip px-[10px] relative rounded-[6px] shrink-0" data-node-id="36:35" data-name="Controlli finestra">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-pre" data-node-id="36:36">{`−  □  ×`}</p>
        </div>
      </div>
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
              Stiamo preparando Filmzy…
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
