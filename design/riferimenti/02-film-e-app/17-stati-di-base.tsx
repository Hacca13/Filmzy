const imgClapperboard = "https://www.figma.com/api/mcp/asset/2ca12c0a-dacf-4b0f-a13e-7989e31047f1.svg";
const imgPlus = "https://www.figma.com/api/mcp/asset/cdbe2df9-2dcf-45a2-aa21-07c8a2aa7d3c.svg";
const imgLoadingAnimation = "https://www.figma.com/api/mcp/asset/46bb03f2-4a1c-4b2d-aadc-1e5144ec80b2.svg";
const imgFilm = "https://www.figma.com/api/mcp/asset/409af716-c727-481e-81f2-7a5326abb1dd.svg";
const imgPencil = "https://www.figma.com/api/mcp/asset/3f1ad317-c626-4c36-9719-9ebf49ebc9ef.svg";
const imgSparkles = "https://www.figma.com/api/mcp/asset/c75dab3e-2d4f-4680-88d3-34c6d932cb70.svg";
const imgRefreshCw = "https://www.figma.com/api/mcp/asset/9230db18-348d-4e5a-8c31-3d6f7f19789e.svg";
const imgPencil1 = "https://www.figma.com/api/mcp/asset/68520786-9e9d-48e3-9851-d5182e91bfd8.svg";
const imgLoader = "https://www.figma.com/api/mcp/asset/bc5af67f-34bc-416c-a58d-1d69a5c0215e.svg";
const imgCheck = "https://www.figma.com/api/mcp/asset/5f5e14b8-1351-410f-8555-d3b938506d4f.svg";
const imgLockKeyhole = "https://www.figma.com/api/mcp/asset/2051ee24-5541-4bca-9686-347175fa7a25.svg";

export default function StatiDiBase() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col gap-[32px] items-start p-[48px] relative size-full" data-node-id="2:23296" data-name="Stati di base">
      <div className="[word-break:break-word] content-stretch flex flex-col font-normal gap-[10px] items-start leading-[normal] overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="2:23297" data-name="Sheet introduction">
        <p className="font-['Inter:Regular'] not-italic relative shrink-0 text-[#f5b544] text-[11px]" data-node-id="2:23298">
          FILMZY · APP DESKTOP GRATUITA
        </p>
        <p className="font-['Manrope:Regular'] relative shrink-0 text-[#f5f1e8] text-[32px]" data-node-id="2:23299">
          Stati chiari, parole gentili e sempre un prossimo passo.
        </p>
        <p className="font-['Inter:Regular'] not-italic relative shrink-0 text-[#aaa99e] text-[14px]" data-node-id="2:23300">
          Un’attesa tranquilla, un messaggio chiaro e sempre un prossimo passo.
        </p>
      </div>
      <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="2:23301" data-name="Interface states">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[18px] h-[346px] items-center justify-center min-w-px overflow-clip p-[28px] relative rounded-[18px]" data-node-id="2:23302" data-name="Empty state">
          <div className="bg-[#352b19] content-stretch flex items-center justify-center overflow-clip relative rounded-[22px] shrink-0 size-[72px]" data-node-id="2:23303" data-name="Empty illustration">
            <div className="relative shrink-0 size-[36px]" data-node-id="2:23766" data-name="clapperboard">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgClapperboard} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[23px] whitespace-nowrap" data-node-id="2:23305">
            Il primo «ciak» è tuo.
          </p>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.65] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] text-center w-[min-content]" data-node-id="2:23306">
            Qui troverai tutti i tuoi film. Per ora c’è spazio per una bella idea.
          </p>
          <div className="bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex gap-[8px] h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0" data-node-id="2:23307" data-name="Action">
            <div className="relative shrink-0 size-[18px]" data-node-id="2:23769" data-name="plus">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPlus} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[14px] whitespace-nowrap" data-node-id="2:23309">
              Crea il tuo primo film
            </p>
          </div>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[18px] h-[346px] items-center justify-center min-w-px overflow-clip p-[28px] relative rounded-[18px]" data-node-id="2:23310" data-name="Loading state">
          <div className="relative shrink-0 size-[72px]" data-node-id="2:23311" data-name="Loading animation">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLoadingAnimation} />
          </div>
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[23px] whitespace-nowrap" data-node-id="2:23315">
            La magia richiede un attimo.
          </p>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.65] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] text-center w-[min-content]" data-node-id="2:23316">
            Stiamo generando la scena. Puoi continuare a lavorare sulle altre.
          </p>
          <div className="bg-[#34362e] content-stretch flex h-[5px] items-start overflow-clip relative rounded-[3px] shrink-0 w-full" data-node-id="2:23317" data-name="Progress track">
            <div className="bg-[#f5b544] h-[5px] relative rounded-[3px] shrink-0 w-[243px]" data-node-id="2:23318" data-name="Progress" />
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[11px] whitespace-nowrap" data-node-id="2:23319">
            68% · Ancora pochi istanti
          </p>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[18px] h-[346px] items-center justify-center min-w-px overflow-clip p-[28px] relative rounded-[18px]" data-node-id="2:23320" data-name="Friendly error">
          <div className="bg-[#352b19] content-stretch flex items-center justify-center overflow-clip relative rounded-[22px] shrink-0 size-[72px]" data-node-id="2:23321" data-name="Error symbol">
            <div className="relative shrink-0 size-[34px]" data-node-id="2:23775" data-name="film">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFilm} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[23px] whitespace-nowrap" data-node-id="2:23323">
            Cambiamo inquadratura?
          </p>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.65] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] text-center w-[min-content]" data-node-id="2:23324">
            Questa scena non si può generare così, prova a descriverla in un altro modo
          </p>
          <div className="bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex gap-[8px] h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0" data-node-id="2:23325" data-name="Action">
            <div className="relative shrink-0 size-[18px]" data-node-id="2:23778" data-name="pencil">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPencil} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[14px] whitespace-nowrap" data-node-id="2:23327">
              Modifica la scena
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#77796f] text-[10px] whitespace-nowrap" data-node-id="2:23328">
            Salvato sul tuo computer
          </p>
        </div>
      </div>
      <div className="content-stretch flex flex-col gap-[18px] items-start overflow-clip pt-[8px] relative shrink-0 w-full" data-node-id="2:23329" data-name="Shared elements">
        <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[11px] whitespace-nowrap" data-node-id="2:23330">
          ELEMENTI RICORRENTI
        </p>
        <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="2:23331" data-name="Component samples">
          <div className="content-stretch flex gap-[12px] items-start overflow-clip relative shrink-0" data-node-id="2:23332" data-name="Button samples">
            <div className="bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex gap-[8px] h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0" data-node-id="2:23333" data-name="Action">
              <div className="relative shrink-0 size-[18px]" data-node-id="2:23781" data-name="sparkles">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSparkles} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[14px] whitespace-nowrap" data-node-id="2:23335">
                Genera · circa 0,42 $
              </p>
            </div>
            <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex gap-[8px] h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0" data-node-id="2:23336" data-name="Action">
              <div className="relative shrink-0 size-[18px]" data-node-id="2:23784" data-name="refresh-cw">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRefreshCw} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] whitespace-nowrap" data-node-id="2:23338">
                Cambia servizio
              </p>
            </div>
            <div className="bg-[rgba(0,0,0,0)] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0" data-node-id="2:23339" data-name="Action">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] whitespace-nowrap" data-node-id="2:23340">
                Ignora
              </p>
            </div>
          </div>
          <div className="content-stretch flex gap-[10px] items-start overflow-clip relative shrink-0" data-node-id="2:23341" data-name="Status samples">
            <div className="bg-[#22231f] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="2:23342" data-name="Status">
              <div className="relative shrink-0 size-[12px]" data-node-id="2:23787" data-name="pencil">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPencil1} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[11px] whitespace-nowrap" data-node-id="2:23344">
                Storyboard
              </p>
            </div>
            <div className="bg-[#352b19] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="2:23345" data-name="Status">
              <div className="relative shrink-0 size-[12px]" data-node-id="2:23790" data-name="loader">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLoader} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[11px] whitespace-nowrap" data-node-id="2:23347">
                In lavorazione
              </p>
            </div>
            <div className="bg-[#22231f] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="2:23348" data-name="Status">
              <div className="relative shrink-0 size-[12px]" data-node-id="2:23793" data-name="check">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[11px] whitespace-nowrap" data-node-id="2:23350">
                Pronto
              </p>
            </div>
            <div className="bg-[#352b19] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="2:23351" data-name="Status">
              <div className="relative shrink-0 size-[12px]" data-node-id="2:23796" data-name="lock-keyhole">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLockKeyhole} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[11px] whitespace-nowrap" data-node-id="2:23353">
                Volto bloccato
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
