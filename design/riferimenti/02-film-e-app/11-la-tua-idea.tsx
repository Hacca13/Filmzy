const imgCerchio2 = "https://www.figma.com/api/mcp/asset/b7334204-127f-4c40-9ae5-2fdd68a545eb.png";
const imgCerchio = "https://www.figma.com/api/mcp/asset/77fb4502-915e-466f-a5b9-6a3d09fe100e.svg";
const imgCerchio1 = "https://www.figma.com/api/mcp/asset/f016a1ae-1249-409f-82dc-fcc1000b247a.svg";
const imgChevronRight = "https://www.figma.com/api/mcp/asset/4d03b5c3-e033-441b-aa08-48f4a7854b8a.svg";
const imgLayers = "https://www.figma.com/api/mcp/asset/44f9f1dd-b2e7-4119-a482-51afc528c83d.svg";
const imgCiak = "https://www.figma.com/api/mcp/asset/3ac3aab9-eca8-4b71-9c0e-e611533c9a07.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/c5fa0eb1-4999-4a98-bfc5-5c935458c85a.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/54b7ed51-8c36-4dba-b486-ac290377fe52.svg";
const imgX = "https://www.figma.com/api/mcp/asset/9e60c9e3-d844-482c-b3d3-6556e27f87db.svg";
const imgFilmFrame = "https://www.figma.com/api/mcp/asset/716504d2-0d92-47b7-bab4-1332ca1f4d66.png";
const imgFilmFrame1 = "https://www.figma.com/api/mcp/asset/f16a95dd-24d2-49de-b7e5-3f843c6e498d.png";
const imgFilmFrame2 = "https://www.figma.com/api/mcp/asset/92b9d655-0dd1-4c23-bf96-1f42fa982f17.png";
const imgFilmFrame3 = "https://www.figma.com/api/mcp/asset/65dbf836-6094-4693-baf8-dedb4af24bc0.png";
const imgFilmFrame4 = "https://www.figma.com/api/mcp/asset/c56f1eb0-c516-4a75-bb5f-9adeaee1cb26.png";
const imgFilmFrame5 = "https://www.figma.com/api/mcp/asset/395baa79-0b86-4478-8057-3f828dadbe33.png";
const imgFilmFrame6 = "https://www.figma.com/api/mcp/asset/6d38912f-3259-474a-b9c6-283deab11fc2.png";
const imgFilmFrame7 = "https://www.figma.com/api/mcp/asset/6ed7ae20-8d96-4bf6-80f3-decea3f58476.png";
const imgCheck = "https://www.figma.com/api/mcp/asset/6e01aefc-1510-4f2c-828d-64fabf9c1dad.svg";
const imgCheck1 = "https://www.figma.com/api/mcp/asset/13ecc49f-8b0e-4d2e-afb6-20ff5fd1c646.svg";
const imgLightbulb = "https://www.figma.com/api/mcp/asset/07700730-0072-493f-b559-3a7fc3c0eda9.svg";
const imgArrowLeft = "https://www.figma.com/api/mcp/asset/eeb7cbd1-40cd-42bf-8124-896595e9f698.svg";
const imgCloudCheck = "https://www.figma.com/api/mcp/asset/f8f72650-0156-44cd-8a8d-3d216945b348.svg";

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

function FilmzyStepperLaTuaIdea({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[#1a1b19] content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] w-[1472px]"} data-node-id="49:3020" data-name="Filmzy/Stepper/La tua idea">
      <div className="content-stretch flex gap-[20px] h-[88px] items-center overflow-clip px-[32px] relative shrink-0 w-full" data-node-id="49:2517" data-name="Percorso di creazione">
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:2518" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:2519" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:2520" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:2521" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3015">
                1
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="49:2523">
              La tua idea
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:2524" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:2525" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:2526" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:2527" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:2528" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio1} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3016">
                2
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:2530">
              La storia
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:2531" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:2532" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:2533" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:2534" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:2535" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" height="28" src={imgCerchio2} width="28" />
              </div>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:2536">
              Moodboard
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:2537" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:2538" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:2539" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:2540" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:2541" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio1} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3017">
                3
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:2543">
              Personaggi
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:2544" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex flex-[1_0_0] gap-[20px] items-center min-w-px overflow-clip relative" data-node-id="49:2545" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:2546" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:2547" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:2548" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio1} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3018">
                4
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:2550">
              Luoghi
            </p>
          </div>
          <div className="bg-[#34362e] flex-[1_0_0] h-px min-w-px relative" data-node-id="49:2551" data-name="Collegamento" />
        </div>
        <div className="content-stretch flex items-center overflow-clip relative shrink-0" data-node-id="49:2552" data-name="Passo e collegamento">
          <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:2553" data-name="Passo di creazione">
            <div className="content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[28px]" data-node-id="49:2554" data-name="Indicatore del passo">
              <div className="absolute left-0 size-[28px] top-0" data-node-id="49:2555" data-name="Cerchio">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCerchio1} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:3019">
                5
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] whitespace-nowrap" data-node-id="49:2557">
              Riepilogo
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[#34362e] content-stretch flex h-[3px] items-start overflow-clip relative shrink-0 w-full" data-node-id="49:2558" data-name="Traccia di avanzamento">
        <div className="bg-[#f5b544] h-[3px] relative shrink-0 w-[245.333px]" data-node-id="49:2559" data-name="Percorso completato" />
      </div>
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

export default function LaTuaIdea() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="2:22095" data-name="La tua idea">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <FilmzyIntestazioneFilm className="border-[#34362e] border-b border-solid content-stretch flex h-[80px] items-center justify-between overflow-clip px-[24px] relative shrink-0 w-full" lavoriInCorso={false} />
      <FilmzyStepperLaTuaIdea className="bg-[#1a1b19] content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] shrink-0 w-full" />
      <div className="content-stretch flex flex-col gap-[30px] items-start overflow-clip px-[48px] py-[36px] relative shrink-0 w-full" data-node-id="2:22137" data-name="Idea workspace">
        <div className="content-stretch flex items-end justify-between overflow-clip relative shrink-0 w-full" data-node-id="2:22138" data-name="Page introduction">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[10px] items-start overflow-clip relative shrink-0 w-[930px]" data-node-id="2:22139" data-name="Introduction">
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[173px]" data-node-id="2:22140">
              PASSO 1 DI 5 · LA TUA IDEA
            </p>
            <p className="font-['Manrope:Bold'] font-bold leading-[1.2] min-w-full relative shrink-0 text-[#f5f1e8] text-[36px] w-[min-content]" data-node-id="2:22141">
              Ogni film inizia con un «e se…»
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.5] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="2:22142">
              Raccontaci la storia che hai in testa. Al resto diamo forma insieme.
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[32px] items-start overflow-clip relative shrink-0 w-full" data-node-id="2:22143" data-name="Idea and inspiration">
          <div className="content-stretch flex flex-[1_0_0] flex-col gap-[24px] items-start min-w-px overflow-clip relative" data-node-id="2:22144" data-name="Story choices">
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[12px] items-start not-italic overflow-clip relative shrink-0 w-full" data-node-id="2:22145" data-name="Idea field">
              <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[15px] whitespace-nowrap" data-node-id="2:22146">
                Racconta la tua idea in poche righe
              </p>
              <div className="bg-[#1a1b19] border border-[#f5b544] border-solid content-stretch flex flex-col font-['Inter:Regular'] font-normal gap-[20px] items-start min-h-[170px] overflow-clip p-[20px] relative rounded-[12px] shrink-0 w-full" data-node-id="2:22147" data-name="Story textarea">
                <p className="leading-[1.75] relative shrink-0 text-[#f5f1e8] text-[15px] w-full" data-node-id="2:22148">
                  Marco trova una vecchia bobina sull’ultimo treno della sera. Dentro c’è il film mai finito di suo padre. Con l’aiuto di Giulia, ha una sola notte per portarlo al cinema del quartiere, prima che chiuda per sempre.
                </p>
                <div className="content-stretch flex items-start justify-between leading-[normal] overflow-clip relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="2:22149" data-name="Field footer">
                  <p className="relative shrink-0 w-[270px]" data-node-id="2:22150">
                    Non serve scrivere tutto: basta una scintilla.
                  </p>
                  <p className="relative shrink-0 w-[72px]" data-node-id="2:22151">
                    248 / 2.000
                  </p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip relative shrink-0 w-full" data-node-id="2:22152" data-name="Genre">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[15px] whitespace-nowrap" data-node-id="2:22153">
                Genere
              </p>
              <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0" data-node-id="2:22154" data-name="Genre choices">
                <div className="bg-[#352b19] border border-[#f5b544] border-solid content-stretch flex gap-[7px] items-center overflow-clip px-[16px] py-[10px] relative rounded-[100px] shrink-0" data-node-id="2:22155" data-name="Choice">
                  <div className="relative shrink-0 size-[13px]" data-node-id="2:23418" data-name="check">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
                  </div>
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[77px]" data-node-id="2:22157">
                    Drammatico
                  </p>
                </div>
                <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-center overflow-clip px-[16px] py-[10px] relative rounded-[100px] shrink-0" data-node-id="2:22158" data-name="Choice">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[66px]" data-node-id="2:22159">
                    Commedia
                  </p>
                </div>
                <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-center overflow-clip px-[16px] py-[10px] relative rounded-[100px] shrink-0" data-node-id="2:22160" data-name="Choice">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[43px]" data-node-id="2:22161">
                    Thriller
                  </p>
                </div>
                <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-center overflow-clip px-[16px] py-[10px] relative rounded-[100px] shrink-0" data-node-id="2:22162" data-name="Choice">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[49px]" data-node-id="2:22163">
                    Fantasy
                  </p>
                </div>
                <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-center overflow-clip px-[16px] py-[10px] relative rounded-[100px] shrink-0" data-node-id="2:22164" data-name="Choice">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[62px]" data-node-id="2:22165">
                    Avventura
                  </p>
                </div>
                <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-center overflow-clip px-[16px] py-[10px] relative rounded-[100px] shrink-0" data-node-id="2:22166" data-name="Choice">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[66px]" data-node-id="2:22167">
                    Romantico
                  </p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip relative shrink-0 w-full" data-node-id="2:22168" data-name="Tone">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[15px] whitespace-nowrap" data-node-id="2:22169">
                Tono
              </p>
              <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0" data-node-id="2:22170" data-name="Tone choices">
                <div className="bg-[#352b19] border border-[#f5b544] border-solid content-stretch flex gap-[7px] items-center overflow-clip px-[16px] py-[10px] relative rounded-[100px] shrink-0" data-node-id="2:22171" data-name="Choice">
                  <div className="relative shrink-0 size-[13px]" data-node-id="2:23421" data-name="check">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
                  </div>
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[82px]" data-node-id="2:22173">
                    Emozionante
                  </p>
                </div>
                <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-center overflow-clip px-[16px] py-[10px] relative rounded-[100px] shrink-0" data-node-id="2:22174" data-name="Choice">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[51px]" data-node-id="2:22175">
                    Leggero
                  </p>
                </div>
                <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-center overflow-clip px-[16px] py-[10px] relative rounded-[100px] shrink-0" data-node-id="2:22176" data-name="Choice">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[33px]" data-node-id="2:22177">
                    Cupo
                  </p>
                </div>
                <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-center overflow-clip px-[16px] py-[10px] relative rounded-[100px] shrink-0" data-node-id="2:22178" data-name="Choice">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[42px]" data-node-id="2:22179">
                    Ironico
                  </p>
                </div>
                <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex items-center overflow-clip px-[16px] py-[10px] relative rounded-[100px] shrink-0" data-node-id="2:22180" data-name="Choice">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[66px]" data-node-id="2:22181">
                    Nostalgico
                  </p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip relative shrink-0 w-full" data-node-id="2:22182" data-name="Visual style">
              <div className="[word-break:break-word] content-stretch flex items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 w-full" data-node-id="2:22183" data-name="Field heading">
                <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[15px] whitespace-nowrap" data-node-id="2:22184">
                  Stile visivo
                </p>
                <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#b2b2a8] text-[13px] w-[181px]" data-node-id="2:22185">
                  Come immagini il tuo mondo?
                </p>
              </div>
              <div className="content-stretch flex gap-[12px] items-start overflow-clip relative shrink-0 w-full" data-node-id="2:22186" data-name="Style choices">
                <div className="bg-[#1a1b19] border-2 border-[#f5b544] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[12px]" data-node-id="2:22187" data-name="Visual choice">
                  <div className="h-[96px] relative shrink-0 w-full" data-node-id="2:22188" data-name="Film frame">
                    <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame} />
                  </div>
                  <div className="content-stretch flex h-[40px] items-center justify-between overflow-clip px-[12px] relative shrink-0 w-full" data-node-id="2:22189" data-name="Choice label">
                    <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[62px]" data-node-id="2:22190">
                      Realistico
                    </p>
                    <div className="bg-[#f5b544] border border-[#f5b544] border-solid content-stretch flex items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[16px]" data-node-id="2:22191" data-name="Selection">
                      <div className="relative shrink-0 size-[11px]" data-node-id="2:23424" data-name="check">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck1} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[12px]" data-node-id="2:22193" data-name="Visual choice">
                  <div className="h-[96px] relative shrink-0 w-full" data-node-id="2:22194" data-name="Film frame">
                    <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame1} />
                  </div>
                  <div className="content-stretch flex h-[40px] items-center justify-between overflow-clip px-[12px] relative shrink-0 w-full" data-node-id="2:22195" data-name="Choice label">
                    <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[96px]" data-node-id="2:22196">
                      Animazione 3D
                    </p>
                    <div className="bg-[rgba(0,0,0,0)] border border-[#77796f] border-solid relative rounded-[100px] shrink-0 size-[16px]" data-node-id="2:22197" data-name="Selection" />
                  </div>
                </div>
                <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[12px]" data-node-id="2:22198" data-name="Visual choice">
                  <div className="h-[96px] relative shrink-0 w-full" data-node-id="2:22199" data-name="Film frame">
                    <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame2} />
                  </div>
                  <div className="content-stretch flex h-[40px] items-center justify-between overflow-clip px-[12px] relative shrink-0 w-full" data-node-id="2:22200" data-name="Choice label">
                    <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[56px]" data-node-id="2:22201">
                      Illustrato
                    </p>
                    <div className="bg-[rgba(0,0,0,0)] border border-[#77796f] border-solid relative rounded-[100px] shrink-0 size-[16px]" data-node-id="2:22202" data-name="Selection" />
                  </div>
                </div>
                <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[12px]" data-node-id="2:22203" data-name="Visual choice">
                  <div className="h-[96px] relative shrink-0 w-full" data-node-id="2:22204" data-name="Film frame">
                    <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame3} />
                  </div>
                  <div className="content-stretch flex h-[40px] items-center justify-between overflow-clip px-[12px] relative shrink-0 w-full" data-node-id="2:22205" data-name="Choice label">
                    <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[41px]" data-node-id="2:22206">
                      Anime
                    </p>
                    <div className="bg-[rgba(0,0,0,0)] border border-[#77796f] border-solid relative rounded-[100px] shrink-0 size-[16px]" data-node-id="2:22207" data-name="Selection" />
                  </div>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip relative shrink-0 w-full" data-node-id="2:22208" data-name="Photography">
              <div className="[word-break:break-word] content-stretch flex items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 w-full" data-node-id="2:22209" data-name="Field heading">
                <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[15px] whitespace-nowrap" data-node-id="2:22210">
                  Fotografia
                </p>
                <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#b2b2a8] text-[13px] w-[229px]" data-node-id="2:22211">
                  La luce cambia il modo di raccontare.
                </p>
              </div>
              <div className="content-stretch flex gap-[12px] items-start overflow-clip relative shrink-0 w-full" data-node-id="2:22212" data-name="Photography choices">
                <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[12px]" data-node-id="2:22213" data-name="Visual choice">
                  <div className="h-[96px] relative shrink-0 w-full" data-node-id="2:22214" data-name="Film frame">
                    <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame4} />
                  </div>
                  <div className="content-stretch flex h-[40px] items-center justify-between overflow-clip px-[12px] relative shrink-0 w-full" data-node-id="2:22215" data-name="Choice label">
                    <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[98px]" data-node-id="2:22216">
                      Camera a mano
                    </p>
                    <div className="bg-[rgba(0,0,0,0)] border border-[#77796f] border-solid relative rounded-[100px] shrink-0 size-[16px]" data-node-id="2:22217" data-name="Selection" />
                  </div>
                </div>
                <div className="bg-[#1a1b19] border-2 border-[#f5b544] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[12px]" data-node-id="2:22218" data-name="Visual choice">
                  <div className="h-[96px] relative shrink-0 w-full" data-node-id="2:22219" data-name="Film frame">
                    <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame5} />
                  </div>
                  <div className="content-stretch flex h-[40px] items-center justify-between overflow-clip px-[12px] relative shrink-0 w-full" data-node-id="2:22220" data-name="Choice label">
                    <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[54px]" data-node-id="2:22221">
                      Classica
                    </p>
                    <div className="bg-[#f5b544] border border-[#f5b544] border-solid content-stretch flex items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[16px]" data-node-id="2:22222" data-name="Selection">
                      <div className="relative shrink-0 size-[11px]" data-node-id="2:23427" data-name="check">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck1} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[12px]" data-node-id="2:22224" data-name="Visual choice">
                  <div className="h-[96px] relative shrink-0 w-full" data-node-id="2:22225" data-name="Film frame">
                    <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame6} />
                  </div>
                  <div className="content-stretch flex h-[40px] items-center justify-between overflow-clip px-[12px] relative shrink-0 w-full" data-node-id="2:22226" data-name="Choice label">
                    <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[27px]" data-node-id="2:22227">
                      Noir
                    </p>
                    <div className="bg-[rgba(0,0,0,0)] border border-[#77796f] border-solid relative rounded-[100px] shrink-0 size-[16px]" data-node-id="2:22228" data-name="Selection" />
                  </div>
                </div>
                <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[12px]" data-node-id="2:22229" data-name="Visual choice">
                  <div className="h-[96px] relative shrink-0 w-full" data-node-id="2:22230" data-name="Film frame">
                    <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame7} />
                  </div>
                  <div className="content-stretch flex h-[40px] items-center justify-between overflow-clip px-[12px] relative shrink-0 w-full" data-node-id="2:22231" data-name="Choice label">
                    <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[61px]" data-node-id="2:22232">
                      Sognante
                    </p>
                    <div className="bg-[rgba(0,0,0,0)] border border-[#77796f] border-solid relative rounded-[100px] shrink-0 size-[16px]" data-node-id="2:22233" data-name="Selection" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[18px] shrink-0 w-[320px]" data-node-id="2:22234" data-name="Story companion">
            <div className="h-[214px] relative shrink-0 w-full" data-node-id="2:22235" data-name="Film frame">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmFrame} />
            </div>
            <div className="content-stretch flex flex-col gap-[20px] items-start overflow-clip p-[24px] relative shrink-0 w-full" data-node-id="2:22236" data-name="Story summary">
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[181px]" data-node-id="2:22237">
                IL TUO FILM PRENDE FORMA
              </p>
              <p className="[word-break:break-word] font-['Manrope:Regular'] font-normal leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[27px] w-[min-content]" data-node-id="2:22238">
                L’ultima corsa
              </p>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.7] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="2:22239">
                A volte, per andare avanti, bisogna tornare all’ultima fermata.
              </p>
              <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="2:22240" data-name="Divider" />
              <div className="content-start flex flex-wrap gap-[6px] items-start overflow-clip relative shrink-0" data-node-id="2:22241" data-name="Selected atmosphere">
                <div className="bg-[#352b19] content-stretch flex items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="2:22242" data-name="Status">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[77px]" data-node-id="2:22243">
                    Drammatico
                  </p>
                </div>
                <div className="bg-[#22231f] content-stretch flex items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="2:22244" data-name="Status">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[82px]" data-node-id="2:22245">
                    Emozionante
                  </p>
                </div>
              </div>
              <div className="content-stretch flex gap-[10px] items-start overflow-clip relative shrink-0 w-full" data-node-id="2:22246" data-name="Creative reassurance">
                <div className="relative shrink-0 size-[20px]" data-node-id="2:23430" data-name="lightbulb">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLightbulb} />
                </div>
                <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.65] min-w-px not-italic relative text-[#aaa99e] text-[13px]" data-node-id="2:22248">
                  Un desiderio, un ostacolo, una scelta. Le storie più belle partono da qui.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-[#34362e] border-solid border-t content-stretch flex items-center justify-between overflow-clip px-[48px] py-[24px] relative shrink-0 w-full" data-node-id="2:22249" data-name="Page actions">
        <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex gap-[8px] h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0" data-node-id="2:22250" data-name="Action">
          <div className="relative shrink-0 size-[18px]" data-node-id="2:23433" data-name="arrow-left">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowLeft} />
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] whitespace-nowrap" data-node-id="2:22252">
            I miei film
          </p>
        </div>
        <div className="content-stretch flex gap-[24px] items-center overflow-clip relative shrink-0" data-node-id="2:22253" data-name="Continue">
          <div className="content-stretch flex gap-[7px] items-center overflow-clip relative shrink-0" data-node-id="2:22254" data-name="Save status">
            <div className="relative shrink-0 size-[16px]" data-node-id="2:23436" data-name="cloud-check">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCloudCheck} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[153px]" data-node-id="2:22256">
              Salvato sul tuo computer
            </p>
          </div>
          <FilmzyPulsantePrimarioNormale className="bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Avanti" />
        </div>
      </div>
    </div>
  );
}