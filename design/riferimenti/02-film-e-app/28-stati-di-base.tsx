const imgClapperboard = "https://www.figma.com/api/mcp/asset/921c9a9d-5093-460c-8140-ad5b68b5da7c.svg";
const imgPlus = "https://www.figma.com/api/mcp/asset/c9e756d0-5585-4bcd-adaa-a3658e71cb94.svg";
const imgLoadingAnimation = "https://www.figma.com/api/mcp/asset/c5bc0ee2-25cd-4e83-9375-91d0ae76d9d1.svg";
const imgFilm = "https://www.figma.com/api/mcp/asset/93b2a4f1-77cb-45fd-ac2c-43b676a90fb0.svg";
const imgPencil = "https://www.figma.com/api/mcp/asset/2c5d722b-0437-41eb-8093-78dae8914186.svg";
const imgPencil1 = "https://www.figma.com/api/mcp/asset/3ca04ecd-7bb5-477f-9589-c2c835b62ddd.svg";
const imgLoader = "https://www.figma.com/api/mcp/asset/2dac3df0-6196-40ae-b7d9-c02d26906abf.svg";
const imgCheck = "https://www.figma.com/api/mcp/asset/2a558310-08c0-479c-9069-6d63e07eb068.svg";
const imgLockKeyhole = "https://www.figma.com/api/mcp/asset/8c74cc51-0b84-4fb7-affd-1367a7e3cbf3.svg";

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

export default function StatiDiBase() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col gap-[32px] items-start p-[48px] relative size-full" data-node-id="2:23296" data-name="Stati di base">
      <div className="[word-break:break-word] content-stretch flex flex-col font-normal gap-[10px] items-start leading-[normal] overflow-clip relative shrink-0 w-full" data-node-id="2:23297" data-name="Sheet introduction">
        <p className="font-['Inter:Regular'] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[214px]" data-node-id="2:23298">
          FILMZY · APP DESKTOP GRATUITA
        </p>
        <p className="font-['Manrope:Regular'] relative shrink-0 text-[#f5f1e8] text-[32px] whitespace-nowrap" data-node-id="2:23299">
          Stati chiari, parole gentili e sempre un prossimo passo.
        </p>
        <p className="font-['Inter:Regular'] not-italic relative shrink-0 text-[#aaa99e] text-[14px] whitespace-nowrap" data-node-id="2:23300">
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
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[160px]" data-node-id="2:23319">
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
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[153px]" data-node-id="2:23328">
            Salvato sul tuo computer
          </p>
        </div>
      </div>
      <div className="content-stretch flex flex-col gap-[18px] items-start overflow-clip pt-[8px] relative shrink-0 w-full" data-node-id="2:23329" data-name="Shared elements">
        <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[147px]" data-node-id="2:23330">
          ELEMENTI RICORRENTI
        </p>
        <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="2:23331" data-name="Component samples">
          <div className="content-stretch flex gap-[12px] items-start overflow-clip relative shrink-0" data-node-id="2:23332" data-name="Button samples">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[163px]" etichetta="Genera · circa 0,42 $" />
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
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
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[71px]" data-node-id="2:23344">
                Storyboard
              </p>
            </div>
            <div className="bg-[#352b19] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="2:23345" data-name="Status">
              <div className="relative shrink-0 size-[12px]" data-node-id="2:23790" data-name="loader">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLoader} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[88px]" data-node-id="2:23347">
                In lavorazione
              </p>
            </div>
            <div className="bg-[#22231f] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="2:23348" data-name="Status">
              <div className="relative shrink-0 size-[12px]" data-node-id="2:23793" data-name="check">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[42px]" data-node-id="2:23350">
                Pronto
              </p>
            </div>
            <div className="bg-[#352b19] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="2:23351" data-name="Status">
              <div className="relative shrink-0 size-[12px]" data-node-id="2:23796" data-name="lock-keyhole">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLockKeyhole} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[91px]" data-node-id="2:23353">
                Volto bloccato
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}