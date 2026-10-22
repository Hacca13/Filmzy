const imgFilmzyInterruttoreAccesoNormale = "https://www.figma.com/api/mcp/asset/b894369e-8a27-4e4c-bcb8-6d51c78ef069.svg";
const imgFilmzyInterruttoreSpentoNormale = "https://www.figma.com/api/mcp/asset/c5611917-b528-4d70-a8f3-a303f2fd3cf5.svg";
const imgChevronRight = "https://www.figma.com/api/mcp/asset/12ccdbd9-03c0-4948-b4be-2b61077d3a5d.svg";
const imgLayers = "https://www.figma.com/api/mcp/asset/4090d8f1-f408-4187-b58c-243c14b7e44b.svg";
const imgCiak = "https://www.figma.com/api/mcp/asset/a2a33077-2871-4c4c-ae47-01cb485b7eb1.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/2ffedc94-cb4e-4143-8051-e1870c3a3a30.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/b76a8f9d-4a1f-44e6-9d12-ccc31fd96e67.svg";
const imgX = "https://www.figma.com/api/mcp/asset/3f6a0595-ed09-42a1-a874-64b7e5af974d.svg";
const imgFilmFrame = "https://www.figma.com/api/mcp/asset/2b381aa5-3118-4676-b9a8-9e919a8132c4.png";
const imgFilmFrame1 = "https://www.figma.com/api/mcp/asset/4dbc9639-5266-4bee-ae36-ee738cc8c150.png";
const imgFilmFrame2 = "https://www.figma.com/api/mcp/asset/273e9def-6c19-45f6-9db1-9591a2bd4ccd.png";
const imgFilmFrame3 = "https://www.figma.com/api/mcp/asset/606de129-7b31-47fa-bc85-0141de735503.png";
const imgFilmFrame4 = "https://www.figma.com/api/mcp/asset/40b75913-7b12-48a4-b1db-9d8e3c7379b3.png";
const imgFilmFrame5 = "https://www.figma.com/api/mcp/asset/10abcd0a-c415-4c11-95c7-697b1194fd71.png";
const imgFilmFrame6 = "https://www.figma.com/api/mcp/asset/5c1e8ca4-28b2-4d71-a677-b88d97efba9e.png";
const imgFilmFrame7 = "https://www.figma.com/api/mcp/asset/0f47740e-e416-4d9b-bbc5-31b8dfc56cae.png";
const imgChevronDown = "https://www.figma.com/api/mcp/asset/ff8b7544-9725-4cfa-8f41-3e8eafa0875c.svg";
const imgPencil = "https://www.figma.com/api/mcp/asset/0c5e0365-0038-4553-b28e-6b2fb95dec15.svg";
const imgEllipsis = "https://www.figma.com/api/mcp/asset/a99ef30b-c50c-4797-ae87-6846222f1688.svg";
const imgLoader = "https://www.figma.com/api/mcp/asset/c5ef7743-4264-4ff9-90e4-ac6ddc64ab10.svg";
const imgTrack = "https://www.figma.com/api/mcp/asset/5805e12a-c2c4-471d-b536-1748afeb3ebf.svg";
const imgAnimatedProgress = "https://www.figma.com/api/mcp/asset/c97bca3b-55bc-405c-955e-054e9dde5f97.svg";
const imgCheck = "https://www.figma.com/api/mcp/asset/dececd95-f926-4ae7-ab8b-9e6bc62639be.svg";
const imgPlay = "https://www.figma.com/api/mcp/asset/771061b2-9999-40f7-91f5-5a34cc3a5636.svg";
const imgCircleCheck = "https://www.figma.com/api/mcp/asset/b7004874-fe74-4ad0-8b78-0c2aac7f49d4.svg";
const imgTriangleAlert = "https://www.figma.com/api/mcp/asset/14074ce9-9e71-4a24-ac0a-43cd96c1c867.svg";
const imgCircleCheck1 = "https://www.figma.com/api/mcp/asset/14466cd6-79de-4d16-a8ec-552c780d2780.svg";
const imgChevronRight1 = "https://www.figma.com/api/mcp/asset/bfdc2232-6e73-4b95-a185-38ba9ec63f5e.svg";
const imgArrowLeft = "https://www.figma.com/api/mcp/asset/35fa4e08-6ee3-4697-b874-2cf2c444d355.svg";
const imgCloudCheck = "https://www.figma.com/api/mcp/asset/b7492257-edcf-427e-a68a-1f41f93414bc.svg";

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

function FilmzyInterruttoreAccesoNormale({ className }: { className?: string }) {
  return (
    <div className={className || "h-[30px] relative w-[52px]"} data-node-id="49:3001" data-name="Filmzy/Interruttore/Acceso/Normale">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFilmzyInterruttoreAccesoNormale} />
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

function FilmzyInterruttoreSpentoNormale({ className }: { className?: string }) {
  return (
    <div className={className || "h-[30px] relative w-[52px]"} data-node-id="49:3000" data-name="Filmzy/Interruttore/Spento/Normale">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFilmzyInterruttoreSpentoNormale} />
    </div>
  );
}

type FilmzyIntestazioneFilmProps = {
  className?: string;
  lavoriInCorso?: boolean;
};

function FilmzyIntestazioneFilm({ className, lavoriInCorso = true }: FilmzyIntestazioneFilmProps) {
  return (
    <div className={className || "border-[#34362e] border-b border-solid content-stretch flex h-[80px] items-center justify-between overflow-clip px-[24px] relative w-[1472px]"} data-node-id="49:3014" data-name="Filmzy/Intestazione film">
      <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0" data-node-id="49:2489" data-name="Breadcrumb">
        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:2490">
          I miei film
        </p>
        <div className="relative shrink-0 size-[14px]" data-node-id="49:2742" data-name="chevron-right">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChevronRight} />
        </div>
        <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="49:2492">
          L’ultima corsa
        </p>
      </div>
      <div className="content-stretch flex gap-[12px] items-center overflow-clip relative shrink-0" data-node-id="49:2493" data-name="Azioni del film">
        {lavoriInCorso && (
          <div className="bg-[#22231f] content-stretch flex gap-[8px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0" data-node-id="49:2494" data-name="Chip">
            <div className="relative shrink-0 size-[16px]" data-node-id="49:2745" data-name="layers">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLayers} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="49:2496">
              2 lavori in corso
            </p>
          </div>
        )}
        <div className="bg-[#352b19] content-stretch flex items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0" data-node-id="49:2497" data-name="Chip">
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:2498">
            Questo film: 12,40 $
          </p>
        </div>
        <div className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0" data-node-id="49:2499" data-name="Pulsante">
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] whitespace-nowrap" data-node-id="49:2500">
            Questo film ⌄
          </p>
        </div>
        <div className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0" data-node-id="49:2501" data-name="Pulsante">
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] whitespace-nowrap" data-node-id="49:2502">
            Impostazioni
          </p>
        </div>
      </div>
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

export default function LeScene() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="2:22641" data-name="Le scene">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <FilmzyIntestazioneFilm className="border-[#34362e] border-b border-solid content-stretch flex h-[80px] items-center justify-between overflow-clip px-[24px] relative shrink-0 w-full" />
      <div className="content-stretch flex gap-[24px] items-start overflow-clip p-[20px] relative shrink-0 w-full" data-node-id="27:1657" data-name="Destinazioni del film">
        <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#aaa99e] text-[13px]" data-node-id="27:1658">
          ✓ Creazione completata
        </p>
        <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#aaa99e] text-[13px]" data-node-id="27:1659">
          Sceneggiatura
        </p>
        <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[89px]" etichetta="Le scene" />
        <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#aaa99e] text-[13px]" data-node-id="27:1661">
          Montaggio ed esporta
        </p>
      </div>
      <div className="content-stretch flex flex-col gap-[28px] items-start overflow-clip px-[48px] py-[36px] relative shrink-0 w-full" data-node-id="27:697" data-name="Scene workspace">
        <div className="content-stretch flex items-end justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:698" data-name="Page introduction">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[10px] items-start overflow-clip relative shrink-0 w-[930px]" data-node-id="27:699" data-name="Introduction">
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[165px]" data-node-id="27:700">
              LE SCENE · 6 SCENE · 1:26
            </p>
            <p className="font-['Manrope:Bold'] font-bold leading-[1.2] min-w-full relative shrink-0 text-[#f5f1e8] text-[36px] w-[min-content]" data-node-id="27:701">
              E adesso… azione.
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.5] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:702">
              Scegli un’inquadratura, dai vita e tieni la ripresa che ti emoziona di più.
            </p>
          </div>
          <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[235px]" etichetta="Genera le mancanti · circa 3,60 $" />
        </div>
        <div className="border-[#34362e] border-b border-solid content-stretch flex h-[50px] items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:707" data-name="Scene overview">
          <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0" data-node-id="27:708" data-name="View controls">
            <div className="bg-[#352b19] content-stretch flex items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:709" data-name="Status">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[108px]" data-node-id="27:710">
                Tutte le scene · 6
              </p>
            </div>
            <div className="bg-[#22231f] content-stretch flex items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:711" data-name="Status">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[110px]" data-node-id="27:712">
                Da completare · 2
              </p>
            </div>
          </div>
          <div className="content-stretch flex gap-[18px] items-center overflow-clip relative shrink-0" data-node-id="27:713" data-name="Completion summary">
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[123px]" data-node-id="27:714">
              4 scene su 6 pronte
            </p>
            <div className="bg-[#34362e] h-[4px] relative rounded-[3px] shrink-0 w-[120px]" data-node-id="27:715" data-name="Progress track" />
            <div className="absolute bg-[#f5b544] h-[4px] left-[135px] rounded-[3px] top-[6px] w-[80px]" data-node-id="27:716" data-name="Progress fill" />
            <p className="[text-underline-position:from-font] [word-break:break-word] decoration-from-font decoration-solid font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#ffe34d] text-[13px] underline w-[153px]" data-node-id="27:717">
              1 dettaglio da controllare
            </p>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[16px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:718" data-name="Scene group">
          <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:719" data-name="Scene heading">
            <div className="content-stretch flex gap-[14px] items-center overflow-clip relative shrink-0" data-node-id="27:720" data-name="Scene identity">
              <div className="bg-[#22231f] content-stretch flex items-center justify-center overflow-clip relative rounded-[11px] shrink-0 size-[38px]" data-node-id="27:721" data-name="Scene number">
                <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="27:722">
                  1
                </p>
              </div>
              <div className="[word-break:break-word] content-stretch flex flex-col gap-[5px] items-start leading-[normal] overflow-clip relative shrink-0" data-node-id="27:723" data-name="Scene information">
                <p className="font-['Manrope:Bold'] font-bold relative shrink-0 text-[#f5f1e8] text-[19px] whitespace-nowrap" data-node-id="27:724">
                  Scena 1 · L’ultima fermata
                </p>
                <p className="font-['Inter:Regular'] font-normal not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[310px]" data-node-id="27:725">
                  Stazione di San Luca · Notte · 3 inquadrature · 18 s
                </p>
              </div>
            </div>
            <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0" data-node-id="27:726" data-name="Scene actions">
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[94px]" data-node-id="27:727">
                Modifica scena
              </p>
              <div className="relative shrink-0 size-[16px]" data-node-id="27:728" data-name="chevron-down">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChevronDown} />
              </div>
            </div>
          </div>
          <div className="content-stretch flex gap-[20px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:730" data-name="Horizontal shot strip">
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:731" data-name="Shot">
              <div className="content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" data-node-id="27:732" data-name="Shot header">
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[44px]" data-node-id="27:733">
                  INQ. 01
                </p>
                <div className="bg-[#22231f] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:734" data-name="Status">
                  <div className="relative shrink-0 size-[12px]" data-node-id="27:735" data-name="pencil">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPencil} />
                  </div>
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[71px]" data-node-id="27:737">
                    Storyboard
                  </p>
                </div>
              </div>
              <div className="content-stretch flex flex-col h-[174px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:738" data-name="Shot preview">
                <div className="h-[174px] relative shrink-0 w-full" data-node-id="27:739" data-name="Film frame">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame} />
                </div>
                <div className="absolute bg-[rgba(17,18,17,0.72)] bottom-[10px] content-stretch flex items-start overflow-clip px-[7px] py-[4px] right-[11.34px] rounded-[6px]" data-node-id="27:740" data-name="Duration badge">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[19px]" data-node-id="27:741">
                    6 s
                  </p>
                </div>
              </div>
              <div className="content-stretch flex flex-col items-start justify-between overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:742" data-name="Shot details">
                <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:743" data-name="Shot description">
                  <p className="font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[17px] whitespace-nowrap" data-node-id="27:744">
                    L’ultimo treno
                  </p>
                  <p className="font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:745">
                    Marco resta solo sul binario. In fondo, una bobina dimenticata.
                  </p>
                </div>
                <div className="content-stretch flex flex-col gap-[6px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:746" data-name="Storyboard alternatives">
                  <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 text-[13px] w-full" data-node-id="27:747" data-name="Alternative labels">
                    <p className="relative shrink-0 text-[#aaa99e] w-[125px]" data-node-id="27:748">
                      Scegli l’inquadratura
                    </p>
                    <p className="relative shrink-0 text-[#f5b544] w-[57px]" data-node-id="27:749">
                      3 varianti
                    </p>
                  </div>
                  <div className="content-stretch flex gap-[7px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:750" data-name="Variant choices">
                    <div className="border-2 border-[#f5b544] border-solid content-stretch flex flex-[1_0_0] flex-col h-[47px] items-start min-w-px overflow-clip relative rounded-[6px]" data-node-id="27:751" data-name="Variant">
                      <div className="h-[47px] relative shrink-0 w-full" data-node-id="27:752" data-name="Film frame">
                        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame} />
                      </div>
                      <div className="absolute bg-[rgba(17,18,17,0.72)] bottom-px content-stretch flex items-start left-[2px] overflow-clip p-[3px] rounded-[3px]" data-node-id="27:753" data-name="Selection label">
                        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[97px]" data-node-id="27:754">
                          ✓ Campo lungo
                        </p>
                      </div>
                    </div>
                    <div className="border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col h-[47px] items-start min-w-px overflow-clip relative rounded-[6px]" data-node-id="27:755" data-name="Variant">
                      <div className="h-[47px] relative shrink-0 w-full" data-node-id="27:756" data-name="Film frame">
                        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame1} />
                      </div>
                      <div className="absolute bg-[rgba(17,18,17,0.72)] bottom-[2px] content-stretch flex items-start left-[3px] overflow-clip p-[3px] rounded-[3px]" data-node-id="27:757" data-name="Selection label">
                        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[80px]" data-node-id="27:758">
                          Mezza figura
                        </p>
                      </div>
                    </div>
                    <div className="border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col h-[47px] items-start min-w-px overflow-clip relative rounded-[6px]" data-node-id="27:759" data-name="Variant">
                      <div className="h-[47px] relative shrink-0 w-full" data-node-id="27:760" data-name="Film frame">
                        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame2} />
                      </div>
                      <div className="absolute bg-[rgba(17,18,17,0.72)] bottom-[2px] content-stretch flex items-start left-[3px] overflow-clip p-[3px] rounded-[3px]" data-node-id="27:761" data-name="Selection label">
                        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[56px]" data-node-id="27:762">
                          Dettaglio
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex gap-[8px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:763" data-name="Shot actions">
                  <FilmzyPulsantePrimarioNormale className="bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[160px]" etichetta="Genera · circa 1,20 $" />
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
                  <div className="content-stretch flex h-[36px] items-center justify-center overflow-clip relative shrink-0 w-[32px]" data-node-id="27:768" data-name="More options">
                    <div className="relative shrink-0 size-[18px]" data-node-id="27:769" data-name="ellipsis">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipsis} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:1662" data-name="Impostazioni generazione">
                <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[10px] relative rounded-[9px] shrink-0 w-full" data-node-id="27:1663" data-name="Imposta le immagini ›">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1664">
                    Imposta le immagini ›
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1667" data-name="Audio della generazione">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1668">
                    Genera anche l’audio · + circa 0,14 $
                  </p>
                  <FilmzyInterruttoreSpentoNormale className="h-[26px] relative shrink-0 w-[44px]" />
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[16px] whitespace-nowrap" data-node-id="49:5293">
                    ⓘ
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:771" data-name="Shot">
              <div className="content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" data-node-id="27:772" data-name="Shot header">
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[46px]" data-node-id="27:773">
                  INQ. 02
                </p>
                <div className="bg-[#352b19] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:774" data-name="Status">
                  <div className="relative shrink-0 size-[12px]" data-node-id="27:775" data-name="loader">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLoader} />
                  </div>
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[88px]" data-node-id="27:777">
                    In lavorazione
                  </p>
                </div>
              </div>
              <div className="content-stretch flex flex-col h-[174px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:778" data-name="Shot preview">
                <div className="h-[174px] relative shrink-0 w-full" data-node-id="27:779" data-name="Film frame">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame3} />
                </div>
                <div className="absolute bg-[rgba(17,18,17,0.72)] content-stretch flex flex-col gap-[10px] h-[174px] items-center justify-center left-0 overflow-clip top-0 w-[432px]" data-node-id="27:780" data-name="Generation overlay">
                  <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[44px]" data-node-id="27:781" data-name="Progress ring">
                    <div className="relative shrink-0 size-[44px]" data-node-id="27:782" data-name="Track">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTrack} />
                    </div>
                    <div className="absolute left-0 size-[44px] top-0" data-node-id="27:783" data-name="Animated progress">
                      <div className="absolute inset-[0_0_0_11.7%]">
                        <img alt="" className="block max-w-none size-full" src={imgAnimatedProgress} />
                      </div>
                    </div>
                    <p className="[word-break:break-word] absolute font-['Inter:Bold'] font-bold leading-[normal] left-[8px] not-italic text-[#f5f1e8] text-[13px] top-[16px] w-[29px]" data-node-id="27:784">
                      64%
                    </p>
                  </div>
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[199px]" data-node-id="27:785">
                    Un po’ di cinema sta nascendo…
                  </p>
                  <div className="content-stretch flex gap-[4px] items-start overflow-clip relative shrink-0" data-node-id="27:786" data-name="Progress ticks">
                    <div className="bg-[#f5b544] h-[6px] opacity-40 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:787" data-name="Activity mark" />
                    <div className="bg-[#f5b544] h-[10px] opacity-52 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:788" data-name="Activity mark" />
                    <div className="bg-[#f5b544] h-[14px] opacity-64 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:789" data-name="Activity mark" />
                    <div className="bg-[#f5b544] h-[8px] opacity-76 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:790" data-name="Activity mark" />
                    <div className="bg-[#f5b544] h-[12px] opacity-88 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:791" data-name="Activity mark" />
                  </div>
                </div>
                <div className="absolute bg-[rgba(17,18,17,0.72)] bottom-[10px] content-stretch flex items-start overflow-clip px-[7px] py-[4px] right-[11.34px] rounded-[6px]" data-node-id="27:792" data-name="Duration badge">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[19px]" data-node-id="27:793">
                    6 s
                  </p>
                </div>
              </div>
              <div className="content-stretch flex flex-col items-start justify-between overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:794" data-name="Shot details">
                <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:795" data-name="Shot description">
                  <p className="font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[17px] whitespace-nowrap" data-node-id="27:796">
                    Un ricordo tra le mani
                  </p>
                  <p className="font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:797">
                    Le mani di Marco aprono la bobina. Un biglietto di suo padre.
                  </p>
                </div>
                <div className="content-stretch flex flex-col gap-[9px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:798" data-name="Generation status">
                  <div className="bg-[#34362e] content-stretch flex h-[4px] items-start overflow-clip relative rounded-[3px] shrink-0 w-full" data-node-id="27:799" data-name="Progress track">
                    <div className="bg-[#f5b544] h-[4px] relative rounded-[3px] shrink-0 w-[253px]" data-node-id="27:800" data-name="Progress" />
                  </div>
                  <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 text-[13px] w-full" data-node-id="27:801" data-name="Time estimate">
                    <p className="relative shrink-0 text-[#f5b544] w-[117px]" data-node-id="27:802">
                      64% · Quasi sul set
                    </p>
                    <p className="relative shrink-0 text-[#b2b2a8] w-[63px]" data-node-id="27:803">
                      Circa 30 s
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex gap-[8px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:804" data-name="Shot actions">
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Annulla" />
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
                  <div className="content-stretch flex h-[36px] items-center justify-center overflow-clip relative shrink-0 w-[32px]" data-node-id="27:809" data-name="More options">
                    <div className="relative shrink-0 size-[18px]" data-node-id="27:810" data-name="ellipsis">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipsis} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:1671" data-name="Impostazioni generazione">
                <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[10px] relative rounded-[9px] shrink-0 w-full" data-node-id="27:1672" data-name="Imposta le immagini ›">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1673">
                    Imposta le immagini ›
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1676" data-name="Audio della generazione">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1677">
                    Genera anche l’audio · + circa 0,14 $
                  </p>
                  <FilmzyInterruttoreSpentoNormale className="h-[26px] relative shrink-0 w-[44px]" />
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[16px] whitespace-nowrap" data-node-id="49:5296">
                    ⓘ
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:812" data-name="Shot">
              <div className="content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" data-node-id="27:813" data-name="Shot header">
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[47px]" data-node-id="27:814">
                  INQ. 03
                </p>
                <div className="bg-[#22231f] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:815" data-name="Status">
                  <div className="relative shrink-0 size-[12px]" data-node-id="27:816" data-name="check">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
                  </div>
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[42px]" data-node-id="27:818">
                    Pronto
                  </p>
                </div>
              </div>
              <div className="content-stretch flex flex-col h-[174px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:819" data-name="Shot preview">
                <div className="h-[174px] relative shrink-0 w-full" data-node-id="27:820" data-name="Film frame">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame4} />
                </div>
                <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[rgba(17,18,17,0.72)] border border-[rgba(245,241,232,0.33)] border-solid content-stretch flex items-center justify-center left-[calc(50%-0.33px)] overflow-clip rounded-[100px] size-[44px] top-1/2" data-node-id="27:821" data-name="Video play">
                  <div className="relative shrink-0 size-[18px]" data-node-id="27:822" data-name="play">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPlay} />
                  </div>
                </div>
                <div className="absolute bg-[rgba(17,18,17,0.72)] bottom-[10px] content-stretch flex items-start overflow-clip px-[7px] py-[4px] right-[11.67px] rounded-[6px]" data-node-id="27:824" data-name="Duration badge">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[19px]" data-node-id="27:825">
                    6 s
                  </p>
                </div>
              </div>
              <div className="content-stretch flex flex-col items-start justify-between overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:826" data-name="Shot details">
                <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:827" data-name="Shot description">
                  <p className="font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[17px] whitespace-nowrap" data-node-id="27:828">
                    La decisione
                  </p>
                  <p className="font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:829">
                    Marco alza lo sguardo, stringe la bobina e si mette in cammino.
                  </p>
                </div>
                <div className="content-stretch flex gap-[7px] items-center overflow-clip relative shrink-0" data-node-id="27:830" data-name="Selected take">
                  <div className="relative shrink-0 size-[14px]" data-node-id="27:831" data-name="circle-check">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCircleCheck} />
                  </div>
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[241px]" data-node-id="27:833">
                    Ripresa scelta · Pronta per il montaggio
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:834" data-name="Shot actions">
                  <FilmzyPulsantePrimarioNormale className="bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[173px]" etichetta="Rigenera · circa 0,42 $" />
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
                  <div className="content-stretch flex h-[36px] items-center justify-center overflow-clip relative shrink-0 w-[32px]" data-node-id="27:839" data-name="More options">
                    <div className="relative shrink-0 size-[18px]" data-node-id="27:840" data-name="ellipsis">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipsis} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:1680" data-name="Impostazioni generazione">
                <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[10px] relative rounded-[9px] shrink-0 w-full" data-node-id="27:1681" data-name="Imposta le immagini ›">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1682">
                    Imposta le immagini ›
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1685" data-name="Audio della generazione">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1686">
                    Genera anche l’audio · + circa 0,14 $
                  </p>
                  <FilmzyInterruttoreSpentoNormale className="h-[26px] relative shrink-0 w-[44px]" />
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[16px] whitespace-nowrap" data-node-id="49:5299">
                    ⓘ
                  </p>
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:5300">
                  Fatto con Kling · Standard
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[16px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:842" data-name="Scene group">
          <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:843" data-name="Scene heading">
            <div className="content-stretch flex gap-[14px] items-center overflow-clip relative shrink-0" data-node-id="27:844" data-name="Scene identity">
              <div className="bg-[#22231f] content-stretch flex items-center justify-center overflow-clip relative rounded-[11px] shrink-0 size-[38px]" data-node-id="27:845" data-name="Scene number">
                <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="27:846">
                  2
                </p>
              </div>
              <div className="[word-break:break-word] content-stretch flex flex-col gap-[5px] items-start leading-[normal] overflow-clip relative shrink-0" data-node-id="27:847" data-name="Scene information">
                <p className="font-['Manrope:Bold'] font-bold relative shrink-0 text-[#f5f1e8] text-[19px] whitespace-nowrap" data-node-id="27:848">
                  Scena 2 · Una luce ancora accesa
                </p>
                <p className="font-['Inter:Regular'] font-normal not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[273px]" data-node-id="27:849">
                  Cinema Aurora · Notte · 3 inquadrature · 16 s
                </p>
              </div>
            </div>
            <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0" data-node-id="27:850" data-name="Scene actions">
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[94px]" data-node-id="27:851">
                Modifica scena
              </p>
              <div className="relative shrink-0 size-[16px]" data-node-id="27:852" data-name="chevron-down">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChevronDown} />
              </div>
            </div>
          </div>
          <div className="content-stretch flex gap-[20px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:854" data-name="Horizontal shot strip">
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:855" data-name="Shot">
              <div className="content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" data-node-id="27:856" data-name="Shot header">
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[47px]" data-node-id="27:857">
                  INQ. 04
                </p>
                <div className="bg-[#22231f] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:858" data-name="Status">
                  <div className="relative shrink-0 size-[12px]" data-node-id="27:859" data-name="check">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
                  </div>
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[42px]" data-node-id="27:861">
                    Pronto
                  </p>
                </div>
              </div>
              <div className="content-stretch flex flex-col h-[174px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:862" data-name="Shot preview">
                <div className="h-[174px] relative shrink-0 w-full" data-node-id="27:863" data-name="Film frame">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame5} />
                </div>
                <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[rgba(17,18,17,0.72)] border border-[rgba(245,241,232,0.33)] border-solid content-stretch flex items-center justify-center left-1/2 overflow-clip rounded-[100px] size-[44px] top-1/2" data-node-id="27:864" data-name="Video play">
                  <div className="relative shrink-0 size-[18px]" data-node-id="27:865" data-name="play">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPlay} />
                  </div>
                </div>
                <div className="absolute bg-[rgba(17,18,17,0.72)] bottom-[10px] content-stretch flex items-start overflow-clip px-[7px] py-[4px] right-[12px] rounded-[6px]" data-node-id="27:867" data-name="Duration badge">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[19px]" data-node-id="27:868">
                    5 s
                  </p>
                </div>
              </div>
              <div className="content-stretch flex flex-col items-start justify-between overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:869" data-name="Shot details">
                <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:870" data-name="Shot description">
                  <p className="font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[17px] whitespace-nowrap" data-node-id="27:871">
                    Davanti all’Aurora
                  </p>
                  <p className="font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:872">
                    Marco lascia la giacca sulla bici. Giulia lo aspetta all’ingresso.
                  </p>
                </div>
                <div className="content-stretch flex gap-[7px] items-center overflow-clip relative shrink-0" data-node-id="27:873" data-name="Selected take">
                  <div className="relative shrink-0 size-[14px]" data-node-id="27:874" data-name="circle-check">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCircleCheck} />
                  </div>
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[241px]" data-node-id="27:876">
                    Ripresa scelta · Pronta per il montaggio
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:877" data-name="Shot actions">
                  <FilmzyPulsantePrimarioNormale className="bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[173px]" etichetta="Rigenera · circa 0,42 $" />
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
                  <div className="content-stretch flex h-[36px] items-center justify-center overflow-clip relative shrink-0 w-[32px]" data-node-id="27:882" data-name="More options">
                    <div className="relative shrink-0 size-[18px]" data-node-id="27:883" data-name="ellipsis">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipsis} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:1692" data-name="Impostazioni generazione">
                <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[10px] relative rounded-[9px] shrink-0 w-full" data-node-id="27:1693" data-name="Imposta le immagini ›">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1694">
                    Imposta le immagini ›
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1697" data-name="Audio della generazione">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1698">
                    Genera anche l’audio · + circa 0,14 $
                  </p>
                  <FilmzyInterruttoreSpentoNormale className="h-[26px] relative shrink-0 w-[44px]" />
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[16px] whitespace-nowrap" data-node-id="49:5303">
                    ⓘ
                  </p>
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:5304">
                  Fatto con Kling · Standard
                </p>
              </div>
            </div>
            <div className="bg-[#1a1b19] border-2 border-[#ffe34d] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:885" data-name="Shot">
              <div className="content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" data-node-id="27:886" data-name="Shot header">
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[46px]" data-node-id="27:887">
                  INQ. 05
                </p>
                <div className="bg-[#22231f] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:888" data-name="Status">
                  <div className="relative shrink-0 size-[12px]" data-node-id="27:889" data-name="check">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
                  </div>
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[42px]" data-node-id="27:891">
                    Pronto
                  </p>
                </div>
              </div>
              <div className="content-stretch flex flex-col h-[174px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:892" data-name="Shot preview">
                <div className="h-[174px] relative shrink-0 w-full" data-node-id="27:893" data-name="Film frame">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame6} />
                </div>
                <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[rgba(17,18,17,0.72)] border border-[rgba(245,241,232,0.33)] border-solid content-stretch flex items-center justify-center left-[calc(50%-0.5px)] overflow-clip rounded-[100px] size-[44px] top-1/2" data-node-id="27:894" data-name="Video play">
                  <div className="relative shrink-0 size-[18px]" data-node-id="27:895" data-name="play">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPlay} />
                  </div>
                </div>
                <div className="absolute bg-[rgba(17,18,17,0.72)] bottom-[10px] content-stretch flex items-start overflow-clip px-[7px] py-[4px] right-[12px] rounded-[6px]" data-node-id="27:897" data-name="Duration badge">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[19px]" data-node-id="27:898">
                    6 s
                  </p>
                </div>
              </div>
              <div className="content-stretch flex flex-col items-start justify-between overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:899" data-name="Shot details">
                <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:900" data-name="Shot description">
                  <p className="font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[17px] whitespace-nowrap" data-node-id="27:901">
                    Siamo ancora in tempo
                  </p>
                  <p className="font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:902">
                    Marco raggiunge Giulia sotto l’insegna illuminata.
                  </p>
                </div>
                <div className="bg-[#302d1a] content-stretch flex gap-[7px] items-start overflow-clip p-[10px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:903" data-name="Continuity warning">
                  <div className="relative shrink-0 size-[15px]" data-node-id="27:904" data-name="triangle-alert">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTriangleAlert} />
                  </div>
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.5] min-w-px not-italic relative text-[#ffe34d] text-[13px]" data-node-id="27:906">
                    Attenzione: qui Marco ha ancora la giacca blu
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:907" data-name="Shot actions">
                  <FilmzyPulsantePrimarioNormale className="bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[173px]" etichetta="Rigenera · circa 0,42 $" />
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
                  <div className="bg-[rgba(0,0,0,0)] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[36px] items-center justify-center overflow-clip px-[14px] relative rounded-[12px] shrink-0" data-node-id="27:912" data-name="Action">
                    <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[41px]" data-node-id="27:913">
                      Ignora
                    </p>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:1704" data-name="Impostazioni generazione">
                <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[10px] relative rounded-[9px] shrink-0 w-full" data-node-id="27:1705" data-name="Imposta le immagini ›">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1706">
                    Imposta le immagini ›
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1709" data-name="Audio della generazione">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1710">
                    Genera anche l’audio · + circa 0,14 $
                  </p>
                  <FilmzyInterruttoreSpentoNormale className="h-[26px] relative shrink-0 w-[44px]" />
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[16px] whitespace-nowrap" data-node-id="49:5307">
                    ⓘ
                  </p>
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:5308">
                  Fatto con Kling · Standard
                </p>
              </div>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:914" data-name="Shot">
              <div className="content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" data-node-id="27:915" data-name="Shot header">
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[47px]" data-node-id="27:916">
                  INQ. 06
                </p>
                <div className="bg-[#22231f] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:917" data-name="Status">
                  <div className="relative shrink-0 size-[12px]" data-node-id="27:918" data-name="pencil">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPencil} />
                  </div>
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[71px]" data-node-id="27:920">
                    Storyboard
                  </p>
                </div>
              </div>
              <div className="content-stretch flex flex-col h-[174px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:921" data-name="Shot preview">
                <div className="h-[174px] relative shrink-0 w-full" data-node-id="27:922" data-name="Film frame">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame7} />
                </div>
                <div className="absolute bg-[rgba(17,18,17,0.72)] bottom-[10px] content-stretch flex items-start overflow-clip px-[7px] py-[4px] right-[12px] rounded-[6px]" data-node-id="27:923" data-name="Duration badge">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[19px]" data-node-id="27:924">
                    5 s
                  </p>
                </div>
              </div>
              <div className="content-stretch flex flex-col items-start justify-between overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:925" data-name="Shot details">
                <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:926" data-name="Shot description">
                  <p className="font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[17px] whitespace-nowrap" data-node-id="27:927">
                    La porta si apre
                  </p>
                  <p className="font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:928">
                    Giulia apre la porta del cinema. Una luce calda li accoglie.
                  </p>
                </div>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.6] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:929">
                  Il disegno è pronto. Trasformalo nella prossima ripresa del tuo film.
                </p>
                <div className="content-stretch flex gap-[8px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:930" data-name="Shot actions">
                  <FilmzyPulsantePrimarioNormale className="bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[163px]" etichetta="Genera · circa 0,56 $" />
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
                  <div className="content-stretch flex h-[36px] items-center justify-center overflow-clip relative shrink-0 w-[32px]" data-node-id="27:935" data-name="More options">
                    <div className="relative shrink-0 size-[18px]" data-node-id="27:936" data-name="ellipsis">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipsis} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="27:1716" data-name="Impostazioni generazione">
                <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[10px] relative rounded-[9px] shrink-0 w-full" data-node-id="27:1717" data-name="Imposta le immagini ›">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1718">
                    Imposta le immagini ›
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1721" data-name="Audio della generazione">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1722">
                    Genera anche l’audio · + circa 0,14 $
                  </p>
                  <FilmzyInterruttoreAccesoNormale className="h-[26px] relative shrink-0 w-[44px]" />
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[16px] whitespace-nowrap" data-node-id="49:5311">
                    ⓘ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:938" data-name="Completed scenes">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[183px]" data-node-id="27:939">
            IL RESTO DELLA TUA STORIA
          </p>
          <div className="content-stretch flex gap-[12px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:940" data-name="Completed scene list">
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] gap-[10px] items-center min-w-px overflow-clip p-[16px] relative rounded-[12px]" data-node-id="27:941" data-name="Completed scene">
              <div className="relative shrink-0 size-[18px]" data-node-id="27:942" data-name="circle-check">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCircleCheck1} />
              </div>
              <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col font-['Inter:Regular'] font-normal gap-[6px] items-start leading-[normal] min-w-px not-italic overflow-clip relative text-[13px]" data-node-id="27:944" data-name="Summary">
                <p className="relative shrink-0 text-[#aaa99e] w-[86px]" data-node-id="27:945">
                  Scena 3 · 14 s
                </p>
                <p className="min-w-full relative shrink-0 text-[#f5f1e8] w-[min-content]" data-node-id="27:946">
                  La promessa ritrovata
                </p>
              </div>
              <div className="relative shrink-0 size-[14px]" data-node-id="27:947" data-name="chevron-right">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChevronRight1} />
              </div>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] gap-[10px] items-center min-w-px overflow-clip p-[16px] relative rounded-[12px]" data-node-id="27:949" data-name="Completed scene">
              <div className="relative shrink-0 size-[18px]" data-node-id="27:950" data-name="circle-check">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCircleCheck1} />
              </div>
              <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col font-['Inter:Regular'] font-normal gap-[6px] items-start leading-[normal] min-w-px not-italic overflow-clip relative text-[13px]" data-node-id="27:952" data-name="Summary">
                <p className="relative shrink-0 text-[#aaa99e] w-[86px]" data-node-id="27:953">
                  Scena 4 · 12 s
                </p>
                <p className="min-w-full relative shrink-0 text-[#f5f1e8] w-[min-content]" data-node-id="27:954">
                  Il primo fotogramma
                </p>
              </div>
              <div className="relative shrink-0 size-[14px]" data-node-id="27:955" data-name="chevron-right">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChevronRight1} />
              </div>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] gap-[10px] items-center min-w-px overflow-clip p-[16px] relative rounded-[12px]" data-node-id="27:957" data-name="Completed scene">
              <div className="relative shrink-0 size-[18px]" data-node-id="27:958" data-name="circle-check">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCircleCheck1} />
              </div>
              <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col font-['Inter:Regular'] font-normal gap-[6px] items-start leading-[normal] min-w-px not-italic overflow-clip relative text-[13px]" data-node-id="27:960" data-name="Summary">
                <p className="relative shrink-0 text-[#aaa99e] w-[86px]" data-node-id="27:961">
                  Scena 5 · 16 s
                </p>
                <p className="min-w-full relative shrink-0 text-[#f5f1e8] w-[min-content]" data-node-id="27:962">
                  Una sala, mille ricordi
                </p>
              </div>
              <div className="relative shrink-0 size-[14px]" data-node-id="27:963" data-name="chevron-right">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChevronRight1} />
              </div>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] gap-[10px] items-center min-w-px overflow-clip p-[16px] relative rounded-[12px]" data-node-id="27:965" data-name="Completed scene">
              <div className="relative shrink-0 size-[18px]" data-node-id="27:966" data-name="circle-check">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCircleCheck1} />
              </div>
              <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col font-['Inter:Regular'] font-normal gap-[6px] items-start leading-[normal] min-w-px not-italic overflow-clip relative text-[13px]" data-node-id="27:968" data-name="Summary">
                <p className="relative shrink-0 text-[#aaa99e] w-[86px]" data-node-id="27:969">
                  Scena 6 · 10 s
                </p>
                <p className="min-w-full relative shrink-0 text-[#f5f1e8] w-[min-content]" data-node-id="27:970">
                  La prima corsa
                </p>
              </div>
              <div className="relative shrink-0 size-[14px]" data-node-id="27:971" data-name="chevron-right">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChevronRight1} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-[#34362e] border-solid border-t content-stretch flex items-center justify-between overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:973" data-name="Page actions">
        <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex gap-[8px] h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0" data-node-id="27:974" data-name="Action">
          <div className="relative shrink-0 size-[18px]" data-node-id="27:975" data-name="arrow-left">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowLeft} />
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] whitespace-nowrap" data-node-id="27:977">
            Sceneggiatura
          </p>
        </div>
        <div className="content-stretch flex gap-[24px] items-center overflow-clip relative shrink-0" data-node-id="27:978" data-name="Continue">
          <div className="content-stretch flex gap-[7px] items-center overflow-clip relative shrink-0" data-node-id="27:979" data-name="Save status">
            <div className="relative shrink-0 size-[16px]" data-node-id="27:980" data-name="cloud-check">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCloudCheck} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[153px]" data-node-id="27:982">
              Salvato sul tuo computer
            </p>
          </div>
          <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[137px]" etichetta="Vai al montaggio" />
        </div>
      </div>
    </div>
  );
}