const imgFilmzyInterruttoreSpentoNormale = "https://www.figma.com/api/mcp/asset/e7dbebe5-3eba-4480-958f-9ae8c3abdc61.svg";
const imgFilmzyIconaAudioOriginaleSpento = "https://www.figma.com/api/mcp/asset/f8bddada-6679-4403-a2c6-253b0c3e6f61.svg";
const imgFilmzyInterruttoreAccesoNormale = "https://www.figma.com/api/mcp/asset/e5bce4d6-15e9-42d8-9c33-0643e0836ceb.svg";
const imgChevronRight = "https://www.figma.com/api/mcp/asset/8092bfb2-0eae-4203-bab0-4244dd2c4806.svg";
const imgLayers = "https://www.figma.com/api/mcp/asset/06d6deb8-e576-4e3a-89c4-a727e73e928e.svg";
const imgCiak = "https://www.figma.com/api/mcp/asset/ad66feb8-3327-46ed-a947-edeb87dcbd5e.svg";
const imgMinus = "https://www.figma.com/api/mcp/asset/b1c6a108-df58-4dd8-87a2-66a6e4d98868.svg";
const imgSquare = "https://www.figma.com/api/mcp/asset/7e2046b4-053b-4647-9e4f-ea91f2c1c1d5.svg";
const imgX = "https://www.figma.com/api/mcp/asset/165951c2-acd6-4e92-9ce5-e3147f5b6d8a.svg";
const imgFilmBackground = "https://www.figma.com/api/mcp/asset/cd5badbe-167e-4adc-8e70-0507a3075653.png";
const imgRectangle = "https://www.figma.com/api/mcp/asset/26201587-1e73-48bf-b515-f45d9a221d60.png";
const imgRectangle1 = "https://www.figma.com/api/mcp/asset/7cd8713a-140e-425f-9905-4ec1289b9e6e.png";
const imgRectangle2 = "https://www.figma.com/api/mcp/asset/c98f3dad-b70d-4588-a222-459f3ce45b9b.png";
const imgRectangle3 = "https://www.figma.com/api/mcp/asset/7f1a3d29-e144-4468-92ee-29b5be529dbd.png";
const imgRectangle4 = "https://www.figma.com/api/mcp/asset/ca0f261f-0c04-4d01-8316-695772774fc8.png";
const imgCircleCheck = "https://www.figma.com/api/mcp/asset/03451719-e11e-4d67-8929-12970ec934eb.svg";
const imgChevronRight1 = "https://www.figma.com/api/mcp/asset/28a47308-3862-4de6-9dd0-b16fc7731266.svg";
const imgCheck = "https://www.figma.com/api/mcp/asset/79ec5271-8961-4562-8c86-f5520920d5a2.svg";
const imgPlay = "https://www.figma.com/api/mcp/asset/672a33d2-f095-4022-b49c-babeec56379d.svg";
const imgPlay1 = "https://www.figma.com/api/mcp/asset/372502ec-4c31-445a-b029-9c2b501e4a42.svg";
const imgVolume2 = "https://www.figma.com/api/mcp/asset/c5055327-a77b-4183-8014-9d35b113acd4.svg";
const imgMaximize = "https://www.figma.com/api/mcp/asset/901bb623-a95f-46e2-9565-fd791caf4973.svg";
const imgChevronDown = "https://www.figma.com/api/mcp/asset/015481fe-81f1-4435-8b1b-d09fa6d9c2f1.svg";
const imgPencil = "https://www.figma.com/api/mcp/asset/1bbdb0f8-1259-469b-96e0-1e47fe41637e.svg";
const imgVolume = "https://www.figma.com/api/mcp/asset/4d829436-b2c0-431f-846b-0b8e59a1a2a4.svg";
const imgVolume1 = "https://www.figma.com/api/mcp/asset/c529d1cf-0959-4089-a5ed-c605e719487f.svg";
const imgFrame = "https://www.figma.com/api/mcp/asset/5180239b-814b-448f-b210-3d45aefc0f98.svg";
const imgArrowLeft = "https://www.figma.com/api/mcp/asset/ecf067d7-ac96-4c67-b006-67d46ee381d2.svg";

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

type FilmzyPulsanteTestoNormaleProps = {
  className?: string;
  etichetta?: string;
};

function FilmzyPulsanteTestoNormale({ className, etichetta = "Scopri di più" }: FilmzyPulsanteTestoNormaleProps) {
  return (
    <div className={className || "bg-[rgba(0,0,0,0)] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px]"} data-node-id="49:2986" data-name="Filmzy/Pulsante/Testo/Normale">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:2329">
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

function FilmzyIconaAudioOriginaleSpento({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[18px]"} data-node-id="52:1452" data-name="Filmzy/Icona/Audio originale spento">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFilmzyIconaAudioOriginaleSpento} />
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

export default function MontaggioEdEsporta() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col items-start relative size-full" data-node-id="2:22937" data-name="Montaggio ed esporta">
      <FilmzyFinestraDesktop className="bg-[#111211] border-[#34362e] border-b border-solid content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] relative shrink-0 w-full" />
      <FilmzyIntestazioneFilm className="border-[#34362e] border-b border-solid content-stretch flex h-[80px] items-center justify-between overflow-clip px-[24px] relative shrink-0 w-full" lavoriInCorso={false} />
      <div className="border-[#34362e] border-b border-solid content-stretch flex h-[60px] items-center justify-between overflow-clip px-[48px] relative shrink-0 w-full" data-node-id="27:1020" data-name="Editing destination">
        <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="27:1021" data-name="Creation complete">
          <div className="relative shrink-0 size-[18px]" data-node-id="27:1022" data-name="circle-check">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCircleCheck} />
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[148px]" data-node-id="27:1024">
            La tua storia è completa
          </p>
          <div className="relative shrink-0 size-[14px]" data-node-id="27:1025" data-name="chevron-right">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChevronRight1} />
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[136px]" data-node-id="27:1027">
            Montaggio ed esporta
          </p>
        </div>
        <div className="bg-[#352b19] content-stretch flex gap-[6px] items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:1028" data-name="Status">
          <div className="relative shrink-0 size-[12px]" data-node-id="27:1029" data-name="check">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[95px]" data-node-id="27:1031">
            6 scene pronte
          </p>
        </div>
      </div>
      <div className="content-stretch flex flex-col gap-[28px] items-start overflow-clip px-[48px] py-[36px] relative shrink-0 w-full" data-node-id="27:1032" data-name="Editing workspace">
        <div className="content-stretch flex items-end justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:1033" data-name="Page introduction">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[10px] items-start overflow-clip relative shrink-0 w-[930px]" data-node-id="27:1034" data-name="Introduction">
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[280px]" data-node-id="27:1035">
              IL TUO FILM, QUASI SUL GRANDE SCHERMO
            </p>
            <p className="font-['Manrope:Bold'] font-bold leading-[1.2] min-w-full relative shrink-0 text-[#f5f1e8] text-[36px] w-[min-content]" data-node-id="27:1036">
              L’ultimo tocco. Poi, i popcorn.
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.5] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:1037">
              Metti in fila le emozioni, scegli la musica e porta il tuo film fuori da qui.
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[28px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1042" data-name="Preview and export">
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[18px]" data-node-id="27:1043" data-name="Film player">
            <div className="content-stretch flex flex-col gap-[18px] h-[448px] items-center justify-center overflow-clip relative shrink-0 w-full" data-node-id="27:1044" data-name="Title frame">
              <div className="absolute h-[448px] left-0 top-0 w-[932px]" data-node-id="27:1045" data-name="Film background">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmBackground} />
              </div>
              <div className="absolute bg-[rgba(17,18,17,0.4)] h-[448px] left-0 top-0 w-[932px]" data-node-id="27:1046" data-name="Title scrim" />
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[192px]" data-node-id="27:1047">
                UN FILM CREATO CON FILMZY
              </p>
              <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[64px] whitespace-nowrap" data-node-id="27:1048">
                L’ultima corsa
              </p>
              <p className="[word-break:break-word] font-['Lora:Italic'] font-normal italic leading-[normal] relative shrink-0 text-[#f5f1e8] text-[17px] whitespace-nowrap" data-node-id="27:1049">
                Certe storie aspettano solo di tornare a casa.
              </p>
              <div className="bg-[#f5b544] content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[54px]" data-node-id="27:1050" data-name="Play preview">
                <div className="relative shrink-0 size-[22px]" data-node-id="27:1051" data-name="play">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPlay} />
                </div>
              </div>
              <div className="absolute content-stretch flex items-start left-[18px] overflow-clip top-[18px]" data-node-id="27:1053" data-name="Preview badge">
                <div className="bg-[#22231f] content-stretch flex items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:1054" data-name="Status">
                  <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[115px]" data-node-id="27:1055">
                    Anteprima del film
                  </p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex gap-[16px] h-[60px] items-center overflow-clip px-[20px] relative shrink-0 w-full" data-node-id="27:1056" data-name="Playback controls">
              <div className="relative shrink-0 size-[16px]" data-node-id="27:1057" data-name="play">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPlay1} />
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[82px]" data-node-id="27:1059">
                00:00 / 01:26
              </p>
              <div className="bg-[#34362e] content-stretch flex flex-[1_0_0] flex-col h-[4px] items-start min-w-px overflow-clip relative rounded-[4px]" data-node-id="27:1060" data-name="Scrub track">
                <div className="bg-[#f5b544] h-[4px] relative shrink-0 w-[12px]" data-node-id="27:1061" data-name="Played" />
              </div>
              <div className="relative shrink-0 size-[18px]" data-node-id="27:1062" data-name="volume-2">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVolume2} />
              </div>
              <div className="relative shrink-0 size-[17px]" data-node-id="27:1064" data-name="maximize">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgMaximize} />
              </div>
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[20px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-[384px]" data-node-id="27:1066" data-name="Export settings">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] whitespace-nowrap" data-node-id="27:1067">
              Il tuo film è pronto.
            </p>
            <div className="bg-[#22231f] content-stretch flex items-start justify-between overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:1068" data-name="Quality">
              <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 text-[13px]" data-node-id="27:1069" data-name="Format">
                <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] w-[142px]" data-node-id="27:1070">
                  Qualità di esportazione
                </p>
                <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] whitespace-nowrap" data-node-id="27:1071">
                  Alta definizione · 1080p
                </p>
              </div>
              <div className="relative shrink-0 size-[16px]" data-node-id="27:1072" data-name="chevron-down">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChevronDown} />
              </div>
            </div>
            <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 text-[13px] w-full" data-node-id="27:1074" data-name="Aspect ratio">
              <p className="relative shrink-0 text-[#aaa99e] w-[51px]" data-node-id="27:1075">
                Formato
              </p>
              <p className="relative shrink-0 text-[#f5f1e8] w-[107px]" data-node-id="27:1076">
                16:9 · Orizzontale
              </p>
            </div>
            <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:1077" data-name="Divider" />
            <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1078" data-name="Credits preview">
              <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:1079" data-name="Credits heading">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[81px]" data-node-id="27:1080">
                  Titoli di coda
                </p>
                <div className="relative shrink-0 size-[14px]" data-node-id="27:1081" data-name="pencil">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPencil} />
                </div>
              </div>
              <div className="bg-[#111211] content-stretch flex flex-col gap-[10px] items-center overflow-clip px-[16px] py-[20px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:1083" data-name="End credit frame">
                <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[17px] whitespace-nowrap" data-node-id="27:1084">
                  L’ultima corsa
                </p>
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[117px]" data-node-id="27:1085">
                  Con Marco e Giulia
                </p>
                <div className="bg-[#f5b544] h-px relative shrink-0 w-[32px]" data-node-id="27:1086" data-name="Credit rule" />
                <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.6] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[13px] text-center w-[min-content]" data-node-id="27:1087">
                  Contiene contenuti generati con intelligenza artificiale
                </p>
              </div>
            </div>
            <FilmzyPulsantePrimarioNormale className="bg-[#f5b544] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[118px]" etichetta="Esporta il film" />
          </div>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[20px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:1092" data-name="Multitrack editor">
          <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:1093" data-name="Editor header">
            <div className="content-stretch flex gap-[14px] items-center overflow-clip relative shrink-0" data-node-id="27:1094" data-name="Editor heading">
              <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[19px] whitespace-nowrap" data-node-id="27:1095">
                Montaggio multitraccia
              </p>
              <div className="bg-[#22231f] content-stretch flex items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:1096" data-name="Status">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[123px]" data-node-id="27:1097">
                  6 scene · 1 min 26 s
                </p>
              </div>
            </div>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Suggerisci i suoni" />
          </div>
          <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-[1296px]" data-node-id="49:5312" data-name="Tracce e pannello laterale">
            <div className="content-stretch flex flex-col gap-[16px] items-start overflow-clip relative shrink-0 w-[916px]" data-node-id="49:5313" data-name="Linea temporale condivisa">
              <div className="content-stretch flex gap-[12px] h-[100px] items-start overflow-clip relative shrink-0 w-[916px]" data-node-id="49:5314" data-name="Scala temporale unica">
                <div className="h-[28px] relative shrink-0 w-[176px]" data-node-id="49:5315" data-name="Frame" />
                <div className="[word-break:break-word] font-['Inter:Regular'] font-normal h-[28px] leading-[normal] not-italic overflow-clip relative shrink-0 text-[#b2b2a8] text-[13px] w-[724px]" data-node-id="27:1157" data-name="Time ruler">
                  <p className="absolute left-0 top-[6px] w-[37px]" data-node-id="27:1158">
                    00:00
                  </p>
                  <p className="absolute left-[151.53px] top-[6px] w-[34px]" data-node-id="27:1159">
                    00:18
                  </p>
                  <p className="absolute left-[286.23px] top-[6px] w-[37px]" data-node-id="27:1160">
                    00:34
                  </p>
                  <p className="absolute left-[404.09px] top-[6px] w-[37px]" data-node-id="27:1161">
                    00:48
                  </p>
                  <p className="absolute left-[505.12px] top-[6px] w-[34px]" data-node-id="27:1162">
                    01:00
                  </p>
                  <p className="absolute left-[639.81px] top-[6px] w-[32px]" data-node-id="27:1163">
                    01:16
                  </p>
                  <p className="absolute left-[690px] top-[6px] w-[34px]" data-node-id="27:1164">
                    01:26
                  </p>
                </div>
              </div>
              <div className="content-stretch flex gap-[16px] items-start overflow-clip relative shrink-0 w-[916px]" data-node-id="49:5316" data-name="Video · traccia">
                <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip relative shrink-0 w-[176px]" data-node-id="49:5317" data-name="Controlli Video">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[15px] w-[min-content]" data-node-id="49:5318">
                    Video
                  </p>
                  <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0 w-[176px]" data-node-id="49:5319" data-name="Muto">
                    <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#b2b2a8] text-[13px]" data-node-id="49:5320">
                      Muto
                    </p>
                    <FilmzyInterruttoreAccesoNormale className="h-[26px] relative shrink-0 w-[44px]" />
                  </div>
                  <div className="h-[18px] relative shrink-0 w-[156px]" data-node-id="49:5323" data-name="Volume">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVolume} />
                  </div>
                </div>
                <div className="bg-[#111211] h-[180px] relative rounded-[10px] shrink-0 w-[724px]" data-node-id="27:1166" data-name="Video · blocchi nel tempo">
                  <div className="absolute bg-[#22231f] border-2 border-[#f5b544] border-solid content-stretch flex flex-col items-start left-0 overflow-clip rounded-[8px] top-[4px] w-[147.535px]" data-node-id="27:1167" data-name="Clip 1">
                    <div className="content-stretch flex flex-col h-[76px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1168" data-name="Frame">
                      <div className="h-[76px] relative shrink-0 w-full" data-node-id="27:1169" data-name="Rectangle">
                        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgRectangle} />
                      </div>
                      <div className="absolute bg-[rgba(17,18,17,0.72)] content-stretch flex items-start overflow-clip p-[4px] right-[4.53px] rounded-[4px] top-[5px] w-[33px]" data-node-id="27:1170" data-name="Frame">
                        <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1171">
                          18 s
                        </p>
                      </div>
                    </div>
                    <div className="[word-break:break-word] content-stretch flex flex-col font-['Inter:Regular'] font-normal gap-[5px] items-start leading-[normal] not-italic overflow-clip p-[10px] relative shrink-0 text-[13px] w-full" data-node-id="27:1172" data-name="Frame">
                      <p className="relative shrink-0 text-[#f5b544] w-full" data-node-id="27:1173">
                        Scena 1 · Ripresa scelta
                      </p>
                      <p className="relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:1174">
                        L’ultima fermata
                      </p>
                    </div>
                    <div className="absolute bg-[#111211] left-[113.53px] overflow-clip rounded-[6px] size-[28px] top-[2px]" data-node-id="49:5327" data-name="Audio originale spento">
                      <FilmzyIconaAudioOriginaleSpento className="absolute left-[5px] size-[18px] top-[5px]" />
                    </div>
                  </div>
                  <div className="absolute bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start left-[151.53px] overflow-clip rounded-[8px] top-[4px] w-[130.698px]" data-node-id="27:1175" data-name="Clip 2">
                    <div className="content-stretch flex flex-col h-[76px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1176" data-name="Frame">
                      <div className="h-[76px] relative shrink-0 w-full" data-node-id="27:1177" data-name="Rectangle">
                        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilmBackground} />
                      </div>
                      <div className="absolute bg-[rgba(17,18,17,0.72)] content-stretch flex items-start overflow-clip p-[4px] right-[4.7px] rounded-[4px] top-[5px] w-[33px]" data-node-id="27:1178" data-name="Frame">
                        <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1179">
                          16 s
                        </p>
                      </div>
                    </div>
                    <div className="[word-break:break-word] content-stretch flex flex-col font-['Inter:Regular'] font-normal gap-[5px] items-start leading-[normal] not-italic overflow-clip p-[10px] relative shrink-0 text-[13px] w-full" data-node-id="27:1180" data-name="Frame">
                      <p className="relative shrink-0 text-[#f5b544] w-full" data-node-id="27:1181">
                        Scena 2 · Ripresa scelta
                      </p>
                      <p className="relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:1182">
                        Una luce ancora accesa
                      </p>
                    </div>
                    <div className="absolute bg-[#111211] left-[97.7px] overflow-clip rounded-[6px] size-[28px] top-[3px]" data-node-id="49:5329" data-name="Audio originale spento">
                      <FilmzyIconaAudioOriginaleSpento className="absolute left-[5px] size-[18px] top-[5px]" />
                    </div>
                  </div>
                  <div className="absolute bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start left-[286.23px] overflow-clip rounded-[8px] top-[4px] w-[113.86px]" data-node-id="27:1183" data-name="Clip 3">
                    <div className="content-stretch flex flex-col h-[76px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1184" data-name="Frame">
                      <div className="h-[76px] relative shrink-0 w-full" data-node-id="27:1185" data-name="Rectangle">
                        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgRectangle1} />
                      </div>
                      <div className="absolute bg-[rgba(17,18,17,0.72)] content-stretch flex items-start overflow-clip p-[4px] right-[4.86px] rounded-[4px] top-[5px] w-[33px]" data-node-id="27:1186" data-name="Frame">
                        <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1187">
                          14 s
                        </p>
                      </div>
                    </div>
                    <div className="[word-break:break-word] content-stretch flex flex-col font-['Inter:Regular'] font-normal gap-[5px] items-start leading-[normal] not-italic overflow-clip p-[10px] relative shrink-0 text-[13px] w-full" data-node-id="27:1188" data-name="Frame">
                      <p className="relative shrink-0 text-[#f5b544] w-full" data-node-id="27:1189">
                        Scena 3 · Ripresa scelta
                      </p>
                      <p className="relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:1190">
                        La promessa ritrovata
                      </p>
                    </div>
                    <div className="absolute bg-[#111211] left-[80.86px] opacity-45 overflow-clip rounded-[6px] size-[28px] top-[3px]" data-node-id="49:5331" data-name="Audio non disponibile · Questa clip è stata generata senza audio">
                      <FilmzyIconaAudioOriginaleSpento className="absolute left-[5px] size-[18px] top-[5px]" />
                    </div>
                  </div>
                  <div className="absolute bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start left-[404.09px] overflow-clip rounded-[8px] top-[4px] w-[97.023px]" data-node-id="27:1191" data-name="Clip 4">
                    <div className="content-stretch flex flex-col h-[76px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1192" data-name="Frame">
                      <div className="h-[76px] relative shrink-0 w-full" data-node-id="27:1193" data-name="Rectangle">
                        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgRectangle2} />
                      </div>
                      <div className="absolute bg-[rgba(17,18,17,0.72)] content-stretch flex items-start overflow-clip p-[4px] right-[5.52px] rounded-[4px] top-[5px] w-[33px]" data-node-id="27:1194" data-name="Frame">
                        <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1195">
                          12 s
                        </p>
                      </div>
                    </div>
                    <div className="[word-break:break-word] content-stretch flex flex-col font-['Inter:Regular'] font-normal gap-[5px] items-start leading-[normal] not-italic overflow-clip p-[10px] relative shrink-0 text-[13px] w-full" data-node-id="27:1196" data-name="Frame">
                      <p className="relative shrink-0 text-[#f5b544] w-full" data-node-id="27:1197">
                        Scena 4 · Ripresa scelta
                      </p>
                      <p className="relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:1198">
                        Il primo fotogramma
                      </p>
                    </div>
                    <div className="absolute bg-[#111211] left-[64.02px] overflow-clip rounded-[6px] size-[28px] top-[3px]" data-node-id="49:5333" data-name="Audio originale spento">
                      <FilmzyIconaAudioOriginaleSpento className="absolute left-[5px] size-[18px] top-[5px]" />
                    </div>
                  </div>
                  <div className="absolute bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start left-[505.12px] overflow-clip rounded-[8px] top-[4px] w-[130.698px]" data-node-id="27:1199" data-name="Clip 5">
                    <div className="content-stretch flex flex-col h-[76px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1200" data-name="Frame">
                      <div className="h-[76px] relative shrink-0 w-full" data-node-id="27:1201" data-name="Rectangle">
                        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgRectangle3} />
                      </div>
                      <div className="absolute bg-[rgba(17,18,17,0.72)] content-stretch flex items-start overflow-clip p-[4px] right-[4.3px] rounded-[4px] top-[5px] w-[33px]" data-node-id="27:1202" data-name="Frame">
                        <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1203">
                          16 s
                        </p>
                      </div>
                    </div>
                    <div className="[word-break:break-word] content-stretch flex flex-col font-['Inter:Regular'] font-normal gap-[5px] items-start leading-[normal] not-italic overflow-clip p-[10px] relative shrink-0 text-[13px] w-full" data-node-id="27:1204" data-name="Frame">
                      <p className="relative shrink-0 text-[#f5b544] w-full" data-node-id="27:1205">
                        Scena 5 · Ripresa scelta
                      </p>
                      <p className="relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:1206">
                        Una sala mille ricordi
                      </p>
                    </div>
                    <div className="absolute bg-[#111211] left-[97.7px] overflow-clip rounded-[6px] size-[28px] top-[3px]" data-node-id="49:5335" data-name="Audio originale spento">
                      <FilmzyIconaAudioOriginaleSpento className="absolute left-[5px] size-[18px] top-[5px]" />
                    </div>
                  </div>
                  <div className="absolute bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start left-[639.81px] overflow-clip rounded-[8px] top-[4px] w-[80.186px]" data-node-id="27:1207" data-name="Clip 6">
                    <div className="content-stretch flex flex-col h-[76px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1208" data-name="Frame">
                      <div className="h-[76px] relative shrink-0 w-full" data-node-id="27:1209" data-name="Rectangle">
                        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgRectangle4} />
                      </div>
                      <div className="absolute bg-[rgba(17,18,17,0.72)] content-stretch flex items-start overflow-clip p-[4px] right-[5.19px] rounded-[4px] top-[5px] w-[33px]" data-node-id="27:1210" data-name="Frame">
                        <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1211">
                          10 s
                        </p>
                      </div>
                    </div>
                    <div className="[word-break:break-word] content-stretch flex flex-col font-['Inter:Regular'] font-normal gap-[5px] items-start leading-[normal] not-italic overflow-clip p-[10px] relative shrink-0 text-[13px] w-full" data-node-id="27:1212" data-name="Frame">
                      <p className="relative shrink-0 text-[#f5b544] w-full" data-node-id="27:1213">
                        Scena 6 · Ripresa scelta
                      </p>
                      <p className="relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:1214">
                        La prima corsa
                      </p>
                    </div>
                    <div className="absolute bg-[#111211] left-[47.19px] overflow-clip rounded-[6px] size-[28px] top-[3px]" data-node-id="49:5337" data-name="Audio originale spento">
                      <FilmzyIconaAudioOriginaleSpento className="absolute left-[5px] size-[18px] top-[5px]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex gap-[16px] items-start overflow-clip relative shrink-0 w-[916px]" data-node-id="49:5339" data-name="Dialoghi · traccia">
                <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip relative shrink-0 w-[176px]" data-node-id="49:5340" data-name="Controlli Dialoghi">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[15px] w-[min-content]" data-node-id="49:5341">
                    Dialoghi
                  </p>
                  <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0 w-[176px]" data-node-id="49:5342" data-name="Muto">
                    <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#b2b2a8] text-[13px]" data-node-id="49:5343">
                      Muto
                    </p>
                    <FilmzyInterruttoreSpentoNormale className="h-[26px] relative shrink-0 w-[44px]" />
                  </div>
                  <div className="h-[18px] relative shrink-0 w-[156px]" data-node-id="49:5346" data-name="Volume">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVolume1} />
                  </div>
                </div>
                <div className="bg-[#111211] h-[76px] relative rounded-[10px] shrink-0 w-[724px]" data-node-id="27:1215" data-name="Dialoghi · blocchi nel tempo">
                  <FilmzyPulsanteSecondarioNormale className="absolute bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center left-[20px] overflow-clip px-[20px] rounded-[12px] top-[18px] w-[206px]" etichetta="Carica una registrazione" />
                </div>
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[min-content]" data-node-id="49:5352">
                Per ora i personaggi non parlano: puoi aggiungere una voce fuori campo, e le labbra non la seguono. Le voci dei personaggi arrivano più avanti.
              </p>
              <div className="content-stretch flex gap-[16px] items-start overflow-clip relative shrink-0 w-[916px]" data-node-id="49:5353" data-name="Musica · traccia">
                <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip relative shrink-0 w-[176px]" data-node-id="49:5354" data-name="Controlli Musica">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[15px] w-[min-content]" data-node-id="49:5355">
                    Musica
                  </p>
                  <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0 w-[176px]" data-node-id="49:5356" data-name="Muto">
                    <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#b2b2a8] text-[13px]" data-node-id="49:5357">
                      Muto
                    </p>
                    <FilmzyInterruttoreSpentoNormale className="h-[26px] relative shrink-0 w-[44px]" />
                  </div>
                  <div className="h-[18px] relative shrink-0 w-[156px]" data-node-id="49:5360" data-name="Volume">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVolume1} />
                  </div>
                </div>
                <div className="bg-[#111211] h-[126px] relative rounded-[10px] shrink-0 w-[724px]" data-node-id="27:1234" data-name="Musica · blocchi nel tempo">
                  <div className="absolute bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col h-[114px] items-center left-0 overflow-clip p-[12px] rounded-[8px] top-[4px] w-[147.535px]" data-node-id="27:1235" data-name="Frame">
                    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-h-px not-italic overflow-clip relative text-[13px] w-full" data-node-id="27:1238" data-name="Frame">
                      <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:1239">
                        Tesa
                      </p>
                      <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] w-full" data-node-id="27:1240">
                        + mistero
                      </p>
                    </div>
                  </div>
                  <div className="absolute bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col h-[114px] items-center left-[151.53px] overflow-clip p-[12px] rounded-[8px] top-[4px] w-[130.698px]" data-node-id="27:1241" data-name="Frame">
                    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-h-px not-italic overflow-clip relative text-[13px] w-full" data-node-id="27:1244" data-name="Frame">
                      <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:1245">
                        Leggera
                      </p>
                      <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] w-full" data-node-id="27:1246">
                        + speranza
                      </p>
                    </div>
                  </div>
                  <div className="absolute bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col h-[114px] items-center left-[286.23px] overflow-clip p-[12px] rounded-[8px] top-[4px] w-[113.86px]" data-node-id="27:1247" data-name="Frame">
                    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-h-px not-italic overflow-clip relative text-[13px] w-full" data-node-id="27:1250" data-name="Frame">
                      <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:1251">
                        Emozionale
                      </p>
                      <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] w-full" data-node-id="27:1252">
                        + nostalgia
                      </p>
                    </div>
                  </div>
                  <div className="absolute bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col h-[114px] items-center left-[404.09px] overflow-clip p-[12px] rounded-[8px] top-[4px] w-[97.023px]" data-node-id="27:1253" data-name="Frame">
                    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-h-px not-italic overflow-clip relative text-[13px] w-full" data-node-id="27:1256" data-name="Frame">
                      <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:1257">
                        Leggera
                      </p>
                      <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] w-full" data-node-id="27:1258">
                        + attesa
                      </p>
                    </div>
                  </div>
                  <div className="absolute bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col h-[114px] items-center left-[505.12px] overflow-clip p-[12px] rounded-[8px] top-[4px] w-[130.698px]" data-node-id="27:1259" data-name="Frame">
                    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-h-px not-italic overflow-clip relative text-[13px] w-full" data-node-id="27:1262" data-name="Frame">
                      <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:1263">
                        Tesa
                      </p>
                      <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] w-full" data-node-id="27:1264">
                        + movimento
                      </p>
                    </div>
                  </div>
                  <div className="absolute bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col h-[114px] items-center left-[639.81px] overflow-clip p-[12px] rounded-[8px] top-[4px] w-[80.186px]" data-node-id="27:1265" data-name="Frame">
                    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-h-px not-italic overflow-clip relative text-[13px] w-full" data-node-id="27:1268" data-name="Frame">
                      <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:1269">
                        Finale
                      </p>
                      <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] w-full" data-node-id="27:1270">
                        + libertà
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex gap-[16px] items-start overflow-clip relative shrink-0 w-[916px]" data-node-id="49:5364" data-name="Effetti · traccia">
                <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip relative shrink-0 w-[176px]" data-node-id="49:5365" data-name="Controlli Effetti">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[15px] w-[min-content]" data-node-id="49:5366">
                    Effetti
                  </p>
                  <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0 w-[176px]" data-node-id="49:5367" data-name="Muto">
                    <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#b2b2a8] text-[13px]" data-node-id="49:5368">
                      Muto
                    </p>
                    <FilmzyInterruttoreSpentoNormale className="h-[26px] relative shrink-0 w-[44px]" />
                  </div>
                  <div className="h-[18px] relative shrink-0 w-[156px]" data-node-id="49:5371" data-name="Volume">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVolume1} />
                  </div>
                </div>
                <div className="bg-[#111211] h-[140px] relative rounded-[10px] shrink-0 w-[724px]" data-node-id="27:1271" data-name="Effetti · blocchi nel tempo">
                  <div className="absolute bg-[#22231f] border border-[#34362e] border-solid content-stretch flex h-[128px] items-center left-[16.84px] overflow-clip p-[12px] rounded-[8px] top-[4px] w-[130.698px]" data-node-id="27:1272" data-name="Frame">
                    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-w-px not-italic overflow-clip relative text-[13px]" data-node-id="27:1273" data-name="Frame">
                      <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:1274">
                        Abbaio di un cane
                      </p>
                      <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] w-full" data-node-id="27:1275">
                        · 2 s
                      </p>
                    </div>
                  </div>
                  <div className="absolute bg-[#22231f] border border-[#34362e] border-solid content-stretch flex h-[128px] items-center left-[159.95px] overflow-clip p-[12px] rounded-[8px] top-[4px] w-[122.279px]" data-node-id="27:1276" data-name="Frame">
                    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-w-px not-italic overflow-clip relative text-[13px]" data-node-id="27:1277" data-name="Frame">
                      <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:1278">
                        Porta che si apre
                      </p>
                      <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] w-full" data-node-id="27:1279">
                        · 1 s
                      </p>
                    </div>
                  </div>
                  <div className="absolute bg-[#22231f] border border-[#34362e] border-solid content-stretch flex h-[128px] items-center left-[311.49px] overflow-clip p-[12px] rounded-[8px] top-[4px] w-[88.605px]" data-node-id="27:1280" data-name="Frame">
                    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-w-px not-italic overflow-clip relative text-[13px]" data-node-id="27:1281" data-name="Frame">
                      <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:1282">
                        Fogli mossi
                      </p>
                      <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] w-full" data-node-id="27:1283">
                        · 3 s
                      </p>
                    </div>
                  </div>
                  <div className="absolute bg-[#22231f] border border-[#34362e] border-solid content-stretch flex h-[128px] items-center left-[420.93px] overflow-clip p-[12px] rounded-[8px] top-[4px] w-[80.186px]" data-node-id="27:1284" data-name="Frame">
                    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-w-px not-italic overflow-clip relative text-[13px]" data-node-id="27:1285" data-name="Frame">
                      <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:1286">
                        Click del fotogramma
                      </p>
                      <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] w-full" data-node-id="27:1287">
                        · 1 s
                      </p>
                    </div>
                  </div>
                  <div className="absolute bg-[#22231f] border border-[#34362e] border-solid content-stretch flex h-[128px] items-center left-[538.79px] overflow-clip p-[12px] rounded-[8px] top-[4px] w-[97.023px]" data-node-id="27:1288" data-name="Frame">
                    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-w-px not-italic overflow-clip relative text-[13px]" data-node-id="27:1289" data-name="Frame">
                      <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:1290">
                        Passi in corridoio
                      </p>
                      <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] w-full" data-node-id="27:1291">
                        · 4 s
                      </p>
                    </div>
                  </div>
                  <div className="absolute bg-[#22231f] border border-[#34362e] border-solid content-stretch flex h-[128px] items-center left-[656.65px] overflow-clip p-[12px] rounded-[8px] top-[4px] w-[65px]" data-node-id="27:1292" data-name="Frame">
                    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-w-px not-italic overflow-clip relative text-[13px]" data-node-id="27:1293" data-name="Frame">
                      <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] w-full" data-node-id="27:1294">
                        Motore che parte
                      </p>
                      <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] w-full" data-node-id="27:1295">
                        · 2 s
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#111211] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[20px] relative rounded-[16px] shrink-0 w-[356px]" data-node-id="27:1296" data-name="Selected sound panel">
              <div className="content-stretch flex flex-col gap-[16px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1297" data-name="Selected sound content">
                <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:1298" data-name="Frame">
                  <div className="bg-[#22231f] content-stretch flex items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:1299" data-name="Frame">
                    <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[62px]" data-node-id="27:1300">
                      Suggerito
                    </p>
                  </div>
                  <div className="content-stretch flex gap-[8px] items-center overflow-clip relative shrink-0" data-node-id="27:1301" data-name="Frame">
                    <div className="bg-[#22231f] content-stretch flex items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:1302" data-name="Frame">
                      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[50px]" data-node-id="27:1303">
                        Accetta
                      </p>
                    </div>
                    <div className="bg-[#22231f] content-stretch flex items-center overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:1304" data-name="Frame">
                      <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[74px]" etichetta="Scarta" />
                    </div>
                  </div>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start not-italic overflow-clip relative shrink-0 w-full" data-node-id="27:1306" data-name="Frame">
                  <p className="font-['Inter:Regular'] font-normal leading-[normal] relative shrink-0 text-[#aaa99e] text-[13px] w-[162px]" data-node-id="27:1307">
                    Suggerimento per Scena 1
                  </p>
                  <p className="font-['Inter:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[18px] w-[min-content]" data-node-id="27:1308">
                    Abbaio di un cane
                  </p>
                  <p className="font-['Inter:Regular'] font-normal leading-[1.5] min-w-full relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:1309">
                    Un suono leggero che accompagna l’atmosfera iniziale del film.
                  </p>
                </div>
                <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1310" data-name="Frame">
                  <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[132px]" data-node-id="27:1311">
                    Com’è questo suono?
                  </p>
                  <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[12px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:1312" data-name="Frame">
                    <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1313">
                      Un cane lontano, calmo, con un tono che accompagna la scena senza coprire il dialogo.
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1314" data-name="Frame">
                  <div className="content-stretch flex h-[44px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:1315" data-name="Frame">
                    <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[160px]" etichetta="Genera · circa 0,10 $" />
                  </div>
                  <FilmzyPulsanteTestoNormale className="bg-[rgba(0,0,0,0)] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[36px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[134px]" etichetta="Cambia servizio ⌄" />
                </div>
                <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1318" data-name="Frame">
                  <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Cambia" />
                  <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1320" data-name="Frame">
                    <div className="bg-[#22231f] content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip p-[10px] relative rounded-[10px]" data-node-id="27:1321" data-name="Frame">
                      <div className="content-stretch flex gap-[8px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:1322" data-name="Frame">
                        <div className="relative shrink-0 size-[14px]" data-node-id="27:1323" data-name="Frame">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFrame} />
                        </div>
                        <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1325">
                          Variante 1
                        </p>
                      </div>
                      <div className="content-stretch flex gap-[4px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:1326" data-name="Frame">
                        <div className="bg-[#f5b544] h-[8px] opacity-40 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:1327" data-name="Rectangle" />
                        <div className="bg-[#f5b544] h-[14px] opacity-40 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:1328" data-name="Rectangle" />
                        <div className="bg-[#f5b544] h-[10px] opacity-40 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:1329" data-name="Rectangle" />
                        <div className="bg-[#f5b544] h-[16px] opacity-40 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:1330" data-name="Rectangle" />
                        <div className="bg-[#f5b544] h-[12px] opacity-40 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:1331" data-name="Rectangle" />
                      </div>
                    </div>
                    <div className="bg-[#22231f] content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip p-[10px] relative rounded-[10px]" data-node-id="27:1332" data-name="Frame">
                      <div className="content-stretch flex gap-[8px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:1333" data-name="Frame">
                        <div className="relative shrink-0 size-[14px]" data-node-id="27:1334" data-name="Frame">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFrame} />
                        </div>
                        <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1336">
                          Variante 2
                        </p>
                      </div>
                      <div className="content-stretch flex gap-[4px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:1337" data-name="Frame">
                        <div className="bg-[#f5b544] h-[10px] opacity-40 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:1338" data-name="Rectangle" />
                        <div className="bg-[#f5b544] h-[18px] opacity-40 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:1339" data-name="Rectangle" />
                        <div className="bg-[#f5b544] h-[14px] opacity-40 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:1340" data-name="Rectangle" />
                        <div className="bg-[#f5b544] h-[22px] opacity-40 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:1341" data-name="Rectangle" />
                        <div className="bg-[#f5b544] h-[16px] opacity-40 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:1342" data-name="Rectangle" />
                      </div>
                    </div>
                    <div className="bg-[#22231f] content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip p-[10px] relative rounded-[10px]" data-node-id="27:1343" data-name="Frame">
                      <div className="content-stretch flex gap-[8px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:1344" data-name="Frame">
                        <div className="relative shrink-0 size-[14px]" data-node-id="27:1345" data-name="Frame">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFrame} />
                        </div>
                        <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold'] font-semibold leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[13px]" data-node-id="27:1347">
                          Variante 3
                        </p>
                      </div>
                      <div className="content-stretch flex gap-[4px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:1348" data-name="Frame">
                        <div className="bg-[#f5b544] h-[12px] opacity-40 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:1349" data-name="Rectangle" />
                        <div className="bg-[#f5b544] h-[16px] opacity-40 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:1350" data-name="Rectangle" />
                        <div className="bg-[#f5b544] h-[10px] opacity-40 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:1351" data-name="Rectangle" />
                        <div className="bg-[#f5b544] h-[14px] opacity-40 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:1352" data-name="Rectangle" />
                        <div className="bg-[#f5b544] h-[18px] opacity-40 relative rounded-[2px] shrink-0 w-[3px]" data-node-id="27:1353" data-name="Rectangle" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:1354" data-name="Frame">
                  <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] h-[40px] items-center justify-center min-w-px overflow-clip px-[20px] relative rounded-[12px]" data-node-id="27:1355" data-name="Frame">
                    <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[115px]" etichetta="Carica un file" />
                  </div>
                  <div className="bg-[#7a1e1e] content-stretch flex flex-[1_0_0] h-[40px] items-center justify-center min-w-px overflow-clip px-[20px] relative rounded-[12px]" data-node-id="27:1357" data-name="Frame">
                    <FilmzyPulsanteDistruttivoNormale className="bg-[#b83e38] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[78px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[8px] items-center overflow-clip relative shrink-0" data-node-id="27:1382" data-name="Return to scenes">
          <div className="relative shrink-0 size-[16px]" data-node-id="27:1383" data-name="arrow-left">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowLeft} />
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[101px]" data-node-id="27:1385">
            Torna alle scene
          </p>
        </div>
      </div>
      <div className="[word-break:break-word] bg-[#1a1b19] border-[#34362e] border-solid border-t content-stretch flex font-['Inter:Regular'] font-normal h-[56px] items-center justify-between leading-[normal] not-italic overflow-clip px-[48px] relative shrink-0 text-[13px] w-full" data-node-id="27:1386" data-name="Footer">
        <p className="relative shrink-0 text-[#aaa99e] w-[153px]" data-node-id="27:1387">
          Salvato sul tuo computer
        </p>
        <p className="relative shrink-0 text-[#b2b2a8] w-[160px]" data-node-id="27:1388">
          Impostazioni · Moodboard
        </p>
      </div>
    </div>
  );
}