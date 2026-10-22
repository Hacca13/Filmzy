const imgFilmzyInterruttoreSpentoNormale = "https://www.figma.com/api/mcp/asset/3219310f-6643-4201-92b9-ce3bf597af73.svg";
const imgChevronRight = "https://www.figma.com/api/mcp/asset/7388cb51-8aa9-4085-9a9e-393ddb4243ee.svg";
const imgLayers = "https://www.figma.com/api/mcp/asset/4e2d69ce-5b60-43ff-867b-c6890c63de7d.svg";
const imgCiak = "https://www.figma.com/api/mcp/asset/8d2614b0-4b17-47aa-9db4-a62836cd4af1.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/83e208bd-f7fc-4748-9ea8-525968d5321c.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/57447dc6-780f-4c89-b925-c8b6bf33d998.svg";
const imgX = "https://www.figma.com/api/mcp/asset/c9715680-afbd-4b02-b1f6-4825ada5041e.svg";
const imgImmagineCinematografica = "https://www.figma.com/api/mcp/asset/5c8d70cb-a56c-4237-b46b-05103e896dd1.png";
const imgImmagineCinematografica1 = "https://www.figma.com/api/mcp/asset/81734a61-c265-4271-829f-f837ba7cbb0b.png";
const imgImmagineCinematografica2 = "https://www.figma.com/api/mcp/asset/1755429d-a2e9-48ab-a5c2-c4c704e636d8.png";
const imgImmagineCinematografica3 = "https://www.figma.com/api/mcp/asset/1c8f1bad-b952-463b-bded-353cc204c75a.png";
const imgImmagineCinematografica4 = "https://www.figma.com/api/mcp/asset/1fb44482-af2c-40fa-8bd0-109af4ac9eeb.png";
const imgCursore = "https://www.figma.com/api/mcp/asset/6cf25114-7c43-4aa3-88b0-d1422ee29d53.svg";

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

export default function LeSceneImpostaLeImmagini() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="27:71877" data-name="Le scene · Imposta le immagini">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <FilmzyIntestazioneFilm className="border-[#34362e] border-b border-solid content-stretch flex h-[80px] items-center justify-between overflow-clip px-[24px] relative shrink-0 w-full" />
      <div className="content-stretch flex flex-col gap-[28px] items-start min-h-[780px] overflow-clip p-[48px] relative shrink-0 w-full" data-node-id="27:71895" data-name="Spazio di lavoro">
        <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71896" data-name="Azioni">
          <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[152px]" data-node-id="27:71897">
            ✓ Creazione completata
          </p>
          <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[85px]" data-node-id="27:71898">
            <p className="leading-[normal]">Sceneggiatura</p>
          </div>
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:71899" data-name="Indicatore">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[89px]" etichetta="Le scene" />
          </div>
          <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[129px]" data-node-id="27:71901">
            <p className="leading-[normal]">Montaggio ed esporta</p>
          </div>
        </div>
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:71902" data-name="Introduction">
          <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:71903">
            LE SCENE · 6 SCENE · 1:26
          </p>
          <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:71904">
            Ogni ripresa comincia da un’immagine.
          </p>
          <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:71905">
            Scena 2 · Una luce ancora accesa · Cinema Aurora, notte
          </p>
        </div>
        <div className="content-stretch flex gap-[28px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:71906" data-name="Striscia e impostazioni">
          <div className="content-stretch flex flex-col gap-[20px] items-start overflow-clip relative shrink-0 w-[480px]" data-node-id="27:71907" data-name="Contesto delle inquadrature">
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:71908" data-name="Pannello">
              <div className="content-center flex flex-wrap gap-y-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71909" data-name="Azioni">
                <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[99px]" data-node-id="27:71910">
                  Storyboard · 5 s
                </p>
              </div>
              <div className="h-[150px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71911" data-name="Immagine cinematografica">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[18px] w-full" data-node-id="27:71912">
                La porta si apre
              </p>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:71913">
                Il disegno è pronto. Trasformalo nella prossima ripresa.
              </p>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:71914" data-name="Pannello">
              <div className="content-center flex flex-wrap gap-y-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71915" data-name="Azioni">
                <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:71916" data-name="Indicatore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[137px]" data-node-id="27:71917">
                    ◌ In lavorazione · 64%
                  </p>
                </div>
              </div>
              <div className="h-[150px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71918" data-name="Immagine cinematografica">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica1} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[18px] w-full" data-node-id="27:71919">
                Un ricordo tra le mani
              </p>
              <div className="bg-[#34362e] content-stretch flex h-[4px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:71920" data-name="Avanzamento">
                <div className="absolute bg-[#f5b544] h-[4px] left-0 right-[36%] rounded-[4px] top-0" data-node-id="27:71921" data-name="Completato" />
              </div>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:71922" data-name="Pannello">
              <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71923" data-name="Azioni">
                <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[86px]" data-node-id="27:71924">
                  ✓ Pronto · 6 s
                </p>
                <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:71925" data-name="Indicatore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[74px]" data-node-id="27:71926">
                    Selezionata
                  </p>
                </div>
              </div>
              <div className="h-[150px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71927" data-name="Immagine cinematografica">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica2} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[18px] w-[min-content]" data-node-id="27:71928">
                Siamo ancora in tempo
              </p>
              <div className="bg-[#302d1a] content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:71929" data-name="Avviso">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#ffe34d] text-[14px] whitespace-pre-wrap" data-node-id="27:71930">{`⚠  Attenzione: qui Marco ha ancora la giacca blu`}</p>
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:71931">
                Fatto con Kling · Standard
              </p>
              <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[255px]" data-node-id="27:71932">
                <p className="leading-[normal]">Usa un fotogramma come punto di partenza</p>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-[1_0_0] flex-col gap-[24px] items-start min-w-px overflow-clip relative" data-node-id="27:71933" data-name="Imposta le immagini">
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:71934" data-name="Pannello">
              <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:71935">
                Imposta le immagini · facoltativo
              </p>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:71936">
                Scegli dove comincia e dove finisce la ripresa. Puoi anche usare una sola immagine come ispirazione.
              </p>
              <div className="content-stretch flex gap-[16px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:71937" data-name="Estremi della ripresa">
                <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:71938" data-name="Pannello">
                  <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:71939">
                    Da qui parte
                  </p>
                  <div className="h-[160px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71940" data-name="Immagine cinematografica">
                    <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica3} />
                  </div>
                  <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71941" data-name="Azioni">
                    <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[163px]" etichetta="Genera · circa 0,05 $" />
                    <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
                  </div>
                  <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71945" data-name="Azioni">
                    <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[73px]" etichetta="Carica" />
                    <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[89px]" data-node-id="27:71947">
                      <p className="leading-[normal]">Dal moodboard</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:71948" data-name="Pannello">
                  <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:71949">
                    Qui finisce
                  </p>
                  <div className="h-[160px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71950" data-name="Immagine cinematografica">
                    <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica2} />
                  </div>
                  <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71951" data-name="Azioni">
                    <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[163px]" etichetta="Genera · circa 0,05 $" />
                    <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
                  </div>
                  <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71955" data-name="Azioni">
                    <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[73px]" etichetta="Carica" />
                    <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[89px]" data-node-id="27:71957">
                      <p className="leading-[normal]">Dal moodboard</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex gap-[20px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71958" data-name="Interruttore">
                <div className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:71959">
                  <p className="mb-0">
                    <span className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] not-italic text-[14px]">Usa come ispirazione</span>
                    <span className="leading-[1.55] text-[#aaa99e] text-[11px]">{` · Attivo`}</span>
                  </p>
                  <p className="leading-[1.55] text-[#aaa99e] text-[13px]">L’immagine guida atmosfera e composizione, senza fissare un fotogramma esatto.</p>
                </div>
                <div className="h-[24px] relative shrink-0 w-[40px]" data-node-id="27:71960" data-name="Cursore">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCursore} />
                </div>
              </div>
              <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:71962" data-name="Campo">
                <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full" data-node-id="27:71963">
                  <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Movimento</p>
                  <p className="leading-[1.65] text-[14px]">Avvicinati ⌄</p>
                </div>
              </div>
              <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71964" data-name="Azioni">
                <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[76px]" data-node-id="27:71965">
                  Resta fermo
                </p>
                <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:71966" data-name="Indicatore">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[62px]" data-node-id="27:71967">
                    Avvicinati
                  </p>
                </div>
                <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[67px]" data-node-id="27:71968">
                  Allontanati
                </p>
                <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[74px]" data-node-id="27:71969">
                  Panoramica
                </p>
              </div>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:71970" data-name="Pannello">
              <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:71971">
                Dal moodboard
              </p>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:71972">
                Immagini utilizzabili per questa ripresa
              </p>
              <div className="content-stretch flex gap-[14px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:71973" data-name="Immagini idonee">
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px overflow-clip relative" data-node-id="27:71974" data-name="Ispirazione">
                  <div className="h-[120px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71975" data-name="Immagine cinematografica">
                    <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica2} />
                  </div>
                  <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:71976" data-name="Indicatore">
                    <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[127px]" data-node-id="27:71977">
                      ✓ Ambra · Nostalgia
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px overflow-clip relative" data-node-id="27:71978" data-name="Ispirazione">
                  <div className="h-[120px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:71979" data-name="Immagine cinematografica">
                    <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImmagineCinematografica4} />
                  </div>
                  <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[109px]" data-node-id="27:71980">
                    Pellicola · Intimità
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:71981" data-name="Pannello">
              <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:71982">
                Dai vita alla ripresa
              </p>
              <div className="content-stretch flex gap-[12px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71983" data-name="Interruttore">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="52:1446">
                  Genera anche l’audio · + circa 0,14 $
                </p>
                <FilmzyInterruttoreSpentoNormale className="h-[26px] relative shrink-0 w-[44px]" />
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[16px] whitespace-nowrap" data-node-id="52:1449">
                  ⓘ
                </p>
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:71987">
                Senza audio: circa 0,42 $ · Con audio: circa 0,56 $
              </p>
              <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:71988" data-name="Azioni">
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[163px]" etichetta="Genera · circa 0,42 $" />
                <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:71992">
                Kling · Standard · 6 secondi
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-[#34362e] border-solid border-t content-stretch flex items-center justify-between overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="27:71993" data-name="Azioni della pagina">
        <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[81px]" />
        <div className="content-stretch flex gap-[24px] items-center overflow-clip relative shrink-0" data-node-id="27:71995" data-name="Salvataggio e continua">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[153px]" data-node-id="27:71996">
            Salvato sul tuo computer
          </p>
          <div className="bg-[#f5b544] border border-[#f5b544] border-solid content-stretch flex h-[46px] items-center justify-center overflow-clip px-[18px] relative rounded-[12px] shrink-0" data-node-id="27:71997" data-name="Azione">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[14px] whitespace-nowrap" data-node-id="27:71998">
              Vai al montaggio →
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}