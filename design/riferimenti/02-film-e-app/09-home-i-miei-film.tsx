const imgCiak = "https://www.figma.com/api/mcp/asset/4a67574f-fec5-487f-9ef9-33873690b5a0.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/812d6529-f11f-4591-abe2-f746235ac857.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/5376cda9-e481-4e44-9b9c-2bea4d0fa6f5.svg";
const imgX = "https://www.figma.com/api/mcp/asset/83bc0406-3493-4071-b1aa-28c7b1af7647.svg";
const imgFeaturedFilm = "https://www.figma.com/api/mcp/asset/746b0226-2897-4fa6-87c9-ad74a16bb245.png";
const imgFilmFrame = "https://www.figma.com/api/mcp/asset/7097a82a-34ac-4d1a-94ad-59db70a03592.png";
const imgFilmFrame1 = "https://www.figma.com/api/mcp/asset/4b61cc1d-4215-4444-94a3-dca639512594.png";
const imgFilmFrame2 = "https://www.figma.com/api/mcp/asset/e14fe049-5e6b-4cac-9207-72552b774c84.png";
const imgClapperboard = "https://www.figma.com/api/mcp/asset/ab5f13ee-d8a4-4d8a-ae71-1902dc714d68.svg";
const imgClapperboard1 = "https://www.figma.com/api/mcp/asset/4dd5b78a-2528-460d-a4e7-4937c8e0195f.svg";
const imgArrowRight = "https://www.figma.com/api/mcp/asset/061d2eec-db2e-45d1-aa9a-6de727a2b991.svg";
const imgArrowDownWideNarrow = "https://www.figma.com/api/mcp/asset/b90f3eee-4e6f-4f4e-8547-5d1648b9ce39.svg";
const imgLoader = "https://www.figma.com/api/mcp/asset/0997854e-9f85-4233-bb97-413d1bfcd8c3.svg";
const imgEllipsis = "https://www.figma.com/api/mcp/asset/b73bf37c-b926-4adf-883d-e26f2eb09a5c.svg";
const imgArrowUpRight = "https://www.figma.com/api/mcp/asset/127086fc-b1f4-4988-ae84-6bc17de51915.svg";
const imgCheck = "https://www.figma.com/api/mcp/asset/c51c6b09-cb9e-4982-bf06-4e5c62b73df2.svg";
const imgPlay = "https://www.figma.com/api/mcp/asset/c0fdc3e3-b636-4bfa-a3f4-7a1a254b4a01.svg";
const imgDownload = "https://www.figma.com/api/mcp/asset/3a86c5e2-ffeb-45ff-bf48-f9b07244ad6f.svg";
const imgCircleHelp = "https://www.figma.com/api/mcp/asset/67a6ae44-339c-41d8-9c03-393893ec50ef.svg";
const imgCircleHelp1 = "https://www.figma.com/api/mcp/asset/c9df69d9-4868-4afb-bdcb-287f682126df.svg";
const imgEllipse = "https://www.figma.com/api/mcp/asset/8af7a48f-9ce3-4e55-a948-b1c9ab98c742.svg";

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

type FilmzyPulsanteDistruttivoNormaleProps = {
  className?: string;
  etichetta?: string;
};

function FilmzyPulsanteDistruttivoNormale({ className, etichetta = "Elimina" }: FilmzyPulsanteDistruttivoNormaleProps) {
  return (
    <div className={className || "bg-[#b83e38] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px]"} data-node-id="49:2990" data-name="Filmzy/Pulsante/Distruttivo/Normale">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="49:2345">
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

export default function IMieiFilm() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="2:21975" data-name="I miei film">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <div className="border-[#34362e] border-b border-solid content-stretch flex h-[80px] items-center justify-between overflow-clip px-[48px] relative shrink-0 w-full" data-node-id="2:21976" data-name="Filmzy navigation">
        <div className="content-stretch flex gap-[32px] items-center overflow-clip relative shrink-0" data-node-id="2:21977" data-name="Brand and context">
          <div className="content-stretch flex gap-[9px] items-center overflow-clip relative shrink-0" data-node-id="2:21978" data-name="Filmzy">
            <div className="bg-[#f5b544] content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[9px] shrink-0 size-[32px]" data-node-id="2:21979" data-name="Brand mark">
              <div className="relative shrink-0 size-[21px]" data-node-id="2:23355" data-name="clapperboard">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgClapperboard} />
              </div>
            </div>
            <p className="[word-break:break-word] font-['Manrope:ExtraBold'] font-extrabold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[26px] whitespace-nowrap" data-node-id="2:21981">
              filmzy
            </p>
          </div>
          <div className="content-stretch flex items-center overflow-clip relative shrink-0" data-node-id="2:21982" data-name="Project breadcrumb">
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="2:21983">
              I miei film
            </p>
          </div>
        </div>
        <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[10px] relative rounded-[9px] shrink-0" data-node-id="27:1624" data-name="Impostazioni">
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[81px]" data-node-id="27:1625">
            Impostazioni
          </p>
        </div>
      </div>
      <div className="content-stretch flex flex-col gap-[32px] items-start overflow-clip pb-[36px] pt-[40px] px-[48px] relative shrink-0 w-full" data-node-id="2:21990" data-name="Film library">
        <div className="content-stretch flex items-end justify-between overflow-clip relative shrink-0 w-full" data-node-id="2:21991" data-name="Page introduction">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[10px] items-start overflow-clip relative shrink-0 w-[930px]" data-node-id="2:21992" data-name="Introduction">
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[217px]" data-node-id="2:21993">
              IL TUO PICCOLO GRANDE CINEMA
            </p>
            <p className="font-['Manrope:Bold'] font-bold leading-[1.2] min-w-full relative shrink-0 text-[#f5f1e8] text-[36px] w-[min-content]" data-node-id="2:21994">
              I tuoi film
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.5] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="2:21995">
              Un’idea, qualche scena, il tuo prossimo film. Da dove ripartiamo?
            </p>
          </div>
          <div className="content-stretch flex gap-[12px] items-center overflow-clip relative shrink-0" data-node-id="2:21996" data-name="Actions">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[153px]" etichetta="Apri un film salvato" />
            <FilmzyPulsantePrimarioNormale className="bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[99px]" etichetta="Nuovo film" />
          </div>
        </div>
        <div className="bg-[#1a1b19] content-stretch flex h-[310px] items-start overflow-clip relative rounded-[24px] shrink-0 w-full" data-node-id="2:21999" data-name="Continue your story">
          <div className="absolute h-[310px] left-0 top-0 w-[1344px]" data-node-id="2:22000" data-name="Featured film">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFeaturedFilm} />
          </div>
          <div className="absolute bg-gradient-to-r from-[rgba(17,18,17,0.96)] h-[310px] left-0 to-[85%] to-[rgba(17,18,17,0.06)] top-0 via-[44.2%] via-[rgba(17,18,17,0.66)] w-[1344px]" data-node-id="2:22001" data-name="Readability gradient" />
          <div className="content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[34px] relative shrink-0 w-[570px]" data-node-id="2:22002" data-name="Featured story">
            <div className="bg-[#352b19] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="2:22003" data-name="Status">
              <div className="relative shrink-0 size-[12px]" data-node-id="2:23364" data-name="clapperboard">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgClapperboard1} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[173px]" data-node-id="2:22005">
                LA TUA STORIA CONTINUA
              </p>
            </div>
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[34px] whitespace-nowrap" data-node-id="2:22006">
              L’ultima corsa
            </p>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.6] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="2:22007">
              Una bobina dimenticata. Un cinema da salvare. Una notte per ritrovare la strada di casa.
            </p>
            <div className="bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex gap-[8px] h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0" data-node-id="2:22008" data-name="Action">
              <div className="relative shrink-0 size-[18px]" data-node-id="2:23367" data-name="arrow-right">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowRight} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[14px] whitespace-nowrap" data-node-id="2:22010">
                Riprendi dalle scene
              </p>
            </div>
          </div>
          <div className="absolute bottom-[26px] content-stretch flex gap-[10px] items-start overflow-clip right-[28px]" data-node-id="2:22011" data-name="Film metadata">
            <div className="bg-[#22231f] content-stretch flex items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="2:22012" data-name="Status">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[77px]" data-node-id="2:22013">
                Drammatico
              </p>
            </div>
            <div className="bg-[#352b19] content-stretch flex items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="2:22014" data-name="Status">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[121px]" data-node-id="2:22015">
                4 di 6 scene pronte
              </p>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[20px] items-start overflow-clip relative shrink-0 w-full" data-node-id="2:22016" data-name="All projects">
          <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="2:22017" data-name="Library controls">
            <div className="content-stretch flex gap-[8px] items-center overflow-clip relative shrink-0" data-node-id="2:22018" data-name="Filters">
              <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[22px] whitespace-nowrap" data-node-id="2:22019">
                I miei film
              </p>
              <div className="bg-[#22231f] content-stretch flex items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="2:22020" data-name="Status">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[9px]" data-node-id="2:22021">
                  3
                </p>
              </div>
              <div className="h-px relative shrink-0 w-[16px]" data-node-id="2:22022" data-name="Filter divider" />
              <div className="bg-[#352b19] content-stretch flex items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="2:22023" data-name="Status">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[29px]" data-node-id="2:22024">
                  Tutti
                </p>
              </div>
              <div className="bg-[#22231f] content-stretch flex items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="2:22025" data-name="Status">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[88px]" data-node-id="2:22026">
                  In lavorazione
                </p>
              </div>
              <div className="bg-[#22231f] content-stretch flex items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="2:22027" data-name="Status">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[38px]" data-node-id="2:22028">
                  Pronti
                </p>
              </div>
            </div>
            <div className="content-stretch flex gap-[8px] items-center overflow-clip relative shrink-0" data-node-id="2:22029" data-name="Sort">
              <div className="relative shrink-0 size-[16px]" data-node-id="2:23370" data-name="arrow-down-wide-narrow">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowDownWideNarrow} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[96px]" data-node-id="2:22031">
                Ultima modifica
              </p>
            </div>
          </div>
          <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="2:22032" data-name="Project grid">
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="2:22033" data-name="Film project">
              <div className="content-stretch flex flex-col h-[228px] items-start overflow-clip relative shrink-0 w-full" data-node-id="2:22034" data-name="Poster">
                <div className="h-[228px] relative shrink-0 w-full" data-node-id="2:22035" data-name="Film frame">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame} />
                </div>
                <div className="absolute content-stretch flex items-start left-[16px] overflow-clip top-[16px]" data-node-id="2:22036" data-name="Poster badges">
                  <div className="bg-[#352b19] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="2:22037" data-name="Status">
                    <div className="relative shrink-0 size-[12px]" data-node-id="2:23373" data-name="loader">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLoader} />
                    </div>
                    <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[88px]" data-node-id="2:22039">
                      In lavorazione
                    </p>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[14px] items-start overflow-clip p-[22px] relative shrink-0 w-full" data-node-id="2:22040" data-name="Project details">
                <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="2:22041" data-name="Title and menu">
                  <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] whitespace-nowrap" data-node-id="2:22042">
                    L’ultima corsa
                  </p>
                  <div className="relative shrink-0 size-[20px]" data-node-id="2:23376" data-name="ellipsis">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipsis} />
                  </div>
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[134px]" data-node-id="2:22044">
                  Drammatico · 6 scene
                </p>
                <div className="bg-[#34362e] content-stretch flex flex-col h-[4px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="2:22045" data-name="Progress track">
                  <div className="bg-[#f5b544] h-[4px] relative rounded-[4px] shrink-0 w-[250px]" data-node-id="2:22046" data-name="Completed" />
                </div>
                <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="2:22047" data-name="Project status">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[123px]" data-node-id="2:22048">
                    4 scene su 6 pronte
                  </p>
                  <div className="relative shrink-0 size-[16px]" data-node-id="2:23379" data-name="arrow-up-right">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowUpRight} />
                  </div>
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[140px]" data-node-id="2:22050">
                  Modificato 12 minuti fa
                </p>
              </div>
              <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col gap-[8px] items-start overflow-clip p-[12px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:1626" data-name="Menu del film">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[min-content] whitespace-pre-wrap" data-node-id="27:1627">{`⋯  Menu del film`}</p>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[min-content]" data-node-id="27:1628">
                  Salva una copia del film
                </p>
                <FilmzyPulsanteDistruttivoNormale className="bg-[#b83e38] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[78px]" />
              </div>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="2:22051" data-name="Film project">
              <div className="content-stretch flex flex-col h-[228px] items-start overflow-clip relative shrink-0 w-full" data-node-id="2:22052" data-name="Poster">
                <div className="h-[228px] relative shrink-0 w-full" data-node-id="2:22053" data-name="Film frame">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame1} />
                </div>
                <div className="absolute content-stretch flex items-start left-[16px] overflow-clip top-[16px]" data-node-id="2:22054" data-name="Poster badges">
                  <div className="bg-[#22231f] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="2:22055" data-name="Status">
                    <div className="relative shrink-0 size-[12px]" data-node-id="2:23382" data-name="check">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
                    </div>
                    <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[42px]" data-node-id="2:22057">
                      Pronto
                    </p>
                  </div>
                </div>
                <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[rgba(17,18,17,0.72)] content-stretch flex flex-col items-center justify-center left-1/2 overflow-clip rounded-[100px] size-[42px] top-1/2" data-node-id="2:22058" data-name="Play">
                  <div className="relative shrink-0 size-[18px]" data-node-id="2:23385" data-name="play">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPlay} />
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[14px] items-start overflow-clip p-[22px] relative shrink-0 w-full" data-node-id="2:22060" data-name="Project details">
                <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="2:22061" data-name="Title and menu">
                  <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] whitespace-nowrap" data-node-id="2:22062">
                    Dove finisce il mare
                  </p>
                  <div className="relative shrink-0 size-[20px]" data-node-id="2:23388" data-name="ellipsis">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipsis} />
                  </div>
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[135px]" data-node-id="2:22064">
                  Avventura · 1 min 42 s
                </p>
                <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="2:22065" data-name="Divider" />
                <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="2:22066" data-name="Project status">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[206px]" data-node-id="2:22067">
                    Il tuo film è pronto da condividere
                  </p>
                  <div className="relative shrink-0 size-[16px]" data-node-id="2:23391" data-name="download">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDownload} />
                  </div>
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[118px]" data-node-id="2:22069">
                  Creato il 16 ottobre
                </p>
              </div>
              <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col gap-[8px] items-start overflow-clip p-[12px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:1630" data-name="Menu del film">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[min-content] whitespace-pre-wrap" data-node-id="27:1631">{`⋯  Menu del film`}</p>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[min-content]" data-node-id="27:1632">
                  Salva una copia del film
                </p>
                <FilmzyPulsanteDistruttivoNormale className="bg-[#b83e38] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[78px]" />
              </div>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="2:22070" data-name="Film project">
              <div className="content-stretch flex flex-col h-[228px] items-start overflow-clip relative shrink-0 w-full" data-node-id="2:22071" data-name="Poster">
                <div className="h-[228px] relative shrink-0 w-full" data-node-id="2:22072" data-name="Film frame">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame2} />
                </div>
                <div className="absolute content-stretch flex items-start left-[16px] overflow-clip top-[16px]" data-node-id="2:22073" data-name="Poster badges">
                  <div className="bg-[#22231f] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="2:22074" data-name="Status">
                    <div className="relative shrink-0 size-[12px]" data-node-id="2:23394" data-name="check">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
                    </div>
                    <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[42px]" data-node-id="2:22076">
                      Pronto
                    </p>
                  </div>
                </div>
                <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[rgba(17,18,17,0.72)] content-stretch flex flex-col items-center justify-center left-1/2 overflow-clip rounded-[100px] size-[42px] top-1/2" data-node-id="2:22077" data-name="Play">
                  <div className="relative shrink-0 size-[18px]" data-node-id="2:23397" data-name="play">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPlay} />
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[14px] items-start overflow-clip p-[22px] relative shrink-0 w-full" data-node-id="2:22079" data-name="Project details">
                <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="2:22080" data-name="Title and menu">
                  <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] whitespace-nowrap" data-node-id="2:22081">
                    La luna in tasca
                  </p>
                  <div className="relative shrink-0 size-[20px]" data-node-id="2:23400" data-name="ellipsis">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipsis} />
                  </div>
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[86px]" data-node-id="2:22083">
                  Fantasy · 58 s
                </p>
                <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="2:22084" data-name="Divider" />
                <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="2:22085" data-name="Project status">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[206px]" data-node-id="2:22086">
                    Il tuo film è pronto da condividere
                  </p>
                  <div className="relative shrink-0 size-[16px]" data-node-id="2:23403" data-name="download">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDownload} />
                  </div>
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[118px]" data-node-id="2:22088">
                  Creato il 12 ottobre
                </p>
              </div>
              <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col gap-[8px] items-start overflow-clip p-[12px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:1634" data-name="Menu del film">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[min-content] whitespace-pre-wrap" data-node-id="27:1635">{`⋯  Menu del film`}</p>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[min-content]" data-node-id="27:1636">
                  Salva una copia del film
                </p>
                <FilmzyPulsanteDistruttivoNormale className="bg-[#b83e38] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[78px]" />
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="2:22089" data-name="Library footer">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[293px]" data-node-id="2:22090">
            Ogni grande film comincia con una piccola idea.
          </p>
          <div className="content-stretch flex gap-[7px] items-start overflow-clip relative shrink-0" data-node-id="2:22091" data-name="Help">
            <div className="relative shrink-0 size-[15px]" data-node-id="2:23406" data-name="circle-help">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCircleHelp} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[120px]" data-node-id="2:22093">
              Ti serve una mano?
            </p>
          </div>
        </div>
      </div>
      <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:37" data-name="Bottom status">
        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[153px]" data-node-id="27:38">
          Salvato sul tuo computer
        </p>
        <div className="content-stretch flex gap-[7px] items-center overflow-clip relative shrink-0" data-node-id="27:39" data-name="Help entry">
          <div className="relative shrink-0 size-[15px]" data-node-id="27:40" data-name="circle-help">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCircleHelp1} />
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[32px]" data-node-id="27:42">
            Aiuto
          </p>
        </div>
      </div>
      <div className="absolute backdrop-blur-[3px] bg-[rgba(0,0,0,0.5)] inset-[44px_0_0_0]" data-node-id="31:4" data-name="Modal overlay" />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[20px] items-start left-1/2 overflow-clip p-[24px] rounded-[24px] shadow-[0px_16px_40px_0px_rgba(0,0,0,0.4)] top-[calc(50%+22px)] w-[760px]" data-node-id="31:5" data-name="Update modal">
        <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="31:6" data-name="Modal header">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start leading-[normal] overflow-clip relative shrink-0 w-[620px]" data-node-id="31:7" data-name="Modal copy">
            <p className="font-['Inter:Semi_Bold'] font-semibold not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[118px]" data-node-id="31:8">
              AGGIORNAMENTO
            </p>
            <p className="font-['Manrope:Bold'] font-bold min-w-full relative shrink-0 text-[#f5f1e8] text-[24px] w-[min-content]" data-node-id="31:9">{`C'è una versione nuova di Filmzy: 0.4.0`}</p>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip relative shrink-0 w-full" data-node-id="31:13" data-name="What changes">
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[93px]" data-node-id="31:14">
            COSA CAMBIA
          </p>
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="31:15" data-name="Frame">
            <div className="relative shrink-0 size-[6px]" data-node-id="31:16" data-name="Ellipse">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse} />
            </div>
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.5] min-w-px not-italic relative text-[#aaa99e] text-[13px]" data-node-id="31:17">
              Moodboard per ogni scena
            </p>
          </div>
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="31:18" data-name="Frame">
            <div className="relative shrink-0 size-[6px]" data-node-id="31:19" data-name="Ellipse">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse} />
            </div>
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.5] min-w-px not-italic relative text-[#aaa99e] text-[13px]" data-node-id="31:20">
              Scelta delle immagini iniziali e finali
            </p>
          </div>
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="31:21" data-name="Frame">
            <div className="relative shrink-0 size-[6px]" data-node-id="31:22" data-name="Ellipse">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse} />
            </div>
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.5] min-w-px not-italic relative text-[#aaa99e] text-[13px]" data-node-id="31:23">
              Spese più chiare per ogni servizio
            </p>
          </div>
        </div>
        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.5] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="31:24">
          I tuoi film restano dove sono.
        </p>
        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="31:25">
          Tutte le novità ↗
        </p>
        <div className="content-center flex flex-wrap gap-[10px_12px] items-center overflow-clip relative shrink-0 w-full" data-node-id="31:26" data-name="Modal actions">
          <FilmzyPulsantePrimarioNormale className="bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[113px]" etichetta="Aggiorna ora" />
          <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[166px]" etichetta="Ricordamelo più tardi" />
          <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[168px]" etichetta="Salta questa versione" />
        </div>
        <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="31:33">
          <p className="leading-[1.5] mb-0">Ricordamelo più tardi: te lo ripropongo al prossimo avvio.</p>
          <p className="leading-[1.5]">Salta questa versione: non te lo ripropongo finché non ne esce una più nuova.</p>
        </div>
      </div>
    </div>
  );
}