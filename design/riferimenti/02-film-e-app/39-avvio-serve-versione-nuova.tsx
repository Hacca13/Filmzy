const imgCiak = "https://www.figma.com/api/mcp/asset/85ddd389-c673-4354-8b21-0a6f272b8e7b.svg";
const imgShieldCheck = "https://www.figma.com/api/mcp/asset/c3638f84-d21b-4b9a-b2f0-1faa589458fd.svg";

export default function AvvioServeUnaVersioneNuova() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="27:73209" data-name="Avvio · Serve una versione nuova">
      <div className="border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" data-node-id="27:73210" data-name="Barra della finestra">
        <div className="content-stretch flex gap-[12px] items-center overflow-clip relative shrink-0" data-node-id="27:73211" data-name="Titolo della finestra">
          <div className="content-stretch flex gap-[8px] items-center overflow-clip relative shrink-0" data-node-id="27:73212" data-name="Filmzy">
            <div className="relative shrink-0 size-[24px]" data-node-id="27:73213" data-name="Ciak">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCiak} />
            </div>
            <p className="[word-break:break-word] font-['Manrope:ExtraBold'] font-extrabold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[14px] whitespace-nowrap" data-node-id="27:73215">
              filmzy
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[12px] whitespace-nowrap" data-node-id="27:73216">
            Filmzy
          </p>
        </div>
        <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex h-[24px] items-center overflow-clip px-[10px] relative rounded-[6px] shrink-0" data-node-id="27:73217" data-name="Controlli finestra">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-pre" data-node-id="27:73218">{`−　 □　 ×`}</p>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center justify-center min-h-[860px] overflow-clip relative shrink-0 w-full" data-node-id="27:73219" data-name="Messaggio di avvio">
        <div className="content-stretch flex flex-col gap-[24px] items-center overflow-clip relative shrink-0 w-[660px]" data-node-id="27:73220" data-name="Avviso">
          <div className="bg-[#352b19] content-stretch flex items-center justify-center overflow-clip relative rounded-[24px] shrink-0 size-[76px]" data-node-id="27:73221" data-name="Simbolo di protezione">
            <div className="relative shrink-0 size-[32px]" data-node-id="27:74272" data-name="shield-check">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgShieldCheck} />
            </div>
          </div>
          <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73223" data-name="Introduction">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:73224">
              Questi film sono stati creati con una versione più nuova di Filmzy
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:73225">
            Per aprirli, aggiorna Filmzy. Non abbiamo cambiato niente nei tuoi film.
          </p>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73226" data-name="Azioni">
            <div className="bg-[#f5b544] border border-[#f5b544] border-solid content-stretch flex h-[46px] items-center justify-center overflow-clip px-[18px] relative rounded-[12px] shrink-0" data-node-id="27:73227" data-name="Azione">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[14px] whitespace-nowrap" data-node-id="27:73228">
                Aggiorna Filmzy
              </p>
            </div>
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold h-[46px] justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[44px]" data-node-id="27:73229">
              <p className="leading-[normal]">Chiudi</p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-[#34362e] border-solid border-t content-stretch flex items-center justify-between overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:73230" data-name="Azioni della pagina">
        <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold h-[46px] justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[61px]" data-node-id="27:73231">
          <p className="leading-[normal]">← Chiudi</p>
        </div>
        <div className="content-stretch flex items-center overflow-clip relative shrink-0" data-node-id="27:73232" data-name="Salvataggio e continua">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#77796f] text-[12px] whitespace-nowrap" data-node-id="27:73233">
            Salvato sul tuo computer
          </p>
        </div>
      </div>
    </div>
  );
}
