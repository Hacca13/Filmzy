const imgX = "https://www.figma.com/api/mcp/asset/401526ed-a331-44ec-8082-d6c0ffd98f87.svg";
const imgCheck = "https://www.figma.com/api/mcp/asset/b3725b4d-4119-41af-a971-46b655aad7ae.svg";
const imgCheck1 = "https://www.figma.com/api/mcp/asset/614058a2-6b8b-4a50-a03c-881ab42715a3.svg";
const imgPunteggio = "https://www.figma.com/api/mcp/asset/9cc9ba86-8fe0-4d76-adc6-b1bf6742ee65.svg";
const imgPunteggio1 = "https://www.figma.com/api/mcp/asset/6309fc85-1b83-4c6c-937c-c2c24d4026c0.svg";
const imgConfermaElimina = "https://www.figma.com/api/mcp/asset/40ab2357-769c-49d5-aeab-eac7a600a575.png";
const imgFormaDonda = "https://www.figma.com/api/mcp/asset/23a82431-1962-4884-a637-7e07c0206020.svg";
const imgFormaDonda1 = "https://www.figma.com/api/mcp/asset/ac3842ac-36d0-4231-a05c-71ffc817d79f.svg";
const imgVolumeX = "https://www.figma.com/api/mcp/asset/debbde43-4bb4-47ce-8a86-904cc0cd3155.svg";
const imgVolumeX1 = "https://www.figma.com/api/mcp/asset/68db302d-9b08-4133-a904-cef6a6142fdf.svg";
const imgCircleCheck = "https://www.figma.com/api/mcp/asset/3a623043-1db9-43e0-9f2e-a7ce15f83ad4.svg";

function FilmzySelettoreServizioSuono({ className }: { className?: string }) {
  return (
    <div className={className || "bg-[#22231f] border border-[#77796f] border-solid content-stretch flex flex-col gap-[20px] items-start overflow-clip p-[24px] relative rounded-[18px] w-[520px]"} data-node-id="49:3401" data-name="Filmzy/Selettore servizio/Suono">
      <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="49:3402" data-name="Titolo del popover">
        <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[20px] whitespace-nowrap" data-node-id="49:3403">
          Cambia servizio
        </p>
        <div className="relative shrink-0 size-[18px]" data-node-id="49:3404" data-name="x">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgX} />
        </div>
      </div>
      <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[14px] whitespace-nowrap" data-node-id="49:3406">
        Fornitore predefinito: ElevenLabs
      </p>
      <div className="content-stretch flex gap-[10px] items-start overflow-clip relative shrink-0" data-node-id="49:3407" data-name="Fornitori disponibili">
        <div className="bg-[#352b19] content-stretch flex gap-[8px] items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0" data-node-id="49:3408" data-name="Chip">
          <div className="relative shrink-0 size-[16px]" data-node-id="49:3409" data-name="check">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3411">
            ElevenLabs
          </p>
        </div>
        <div className="bg-[#22231f] content-stretch flex items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0" data-node-id="49:3412" data-name="Chip">
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="49:3413">
            Stability AI
          </p>
        </div>
      </div>
      <div className="bg-[#352b19] border border-[#f5b544] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[20px] relative rounded-[12px] shrink-0 w-full" data-node-id="49:3414" data-name="Servizio">
        <div className="content-stretch flex gap-[12px] items-center overflow-clip relative shrink-0 w-full" data-node-id="49:3415" data-name="Identità e selezione">
          <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px overflow-clip relative" data-node-id="49:3416" data-name="Nome e costo">
            <div className="content-stretch flex items-center overflow-clip relative shrink-0" data-node-id="49:3417" data-name="Nome del servizio">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[16px] whitespace-nowrap" data-node-id="49:3418">
                ElevenLabs · Sound Effects
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:3421">
              circa 0,10 $
            </p>
          </div>
          <div className="bg-[#352b19] content-stretch flex items-center overflow-clip px-[12px] py-[8px] relative rounded-[100px] shrink-0" data-node-id="49:3422" data-name="Chip">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] whitespace-nowrap" data-node-id="49:3423">
              Predefinito
            </p>
          </div>
          <div className="bg-[#f5b544] border border-[#f5b544] border-solid content-stretch flex items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[24px]" data-node-id="49:3424" data-name="Selezione">
            <div className="relative shrink-0 size-[15px]" data-node-id="49:3425" data-name="check">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck1} />
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3427" data-name="Voto delle prove">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:3428">
            Voto delle prove
          </p>
          <div className="h-[6px] relative shrink-0 w-[50px]" data-node-id="49:3429" data-name="Punteggio">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPunteggio} />
          </div>
        </div>
      </div>
      <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[20px] relative rounded-[12px] shrink-0 w-full" data-node-id="49:3436" data-name="Servizio">
        <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-full" data-node-id="49:3437" data-name="Identità e selezione">
          <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px overflow-clip relative" data-node-id="49:3438" data-name="Nome e costo">
            <div className="content-stretch flex items-center overflow-clip relative shrink-0" data-node-id="49:3439" data-name="Nome del servizio">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[16px] whitespace-nowrap" data-node-id="49:3440">
                Stability AI · Stable Audio
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:3443">
              circa 0,15 $
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-node-id="49:3445" data-name="Voto delle prove">
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="49:3446">
            Voto delle prove
          </p>
          <div className="h-[6px] relative shrink-0 w-[50px]" data-node-id="49:3447" data-name="Punteggio">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPunteggio1} />
          </div>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.5] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="49:3472">
        Prezzi stimati in dollari. La spesa effettiva dipende dalla durata e dal servizio scelto.
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

type FilmzyDialogoConfermaDistruttivaProps = {
  className?: string;
  descrizione?: string;
  titolo?: string;
};

function FilmzyDialogoConfermaDistruttiva({ className, descrizione = "Questa azione richiede una conferma prima di continuare.", titolo = "Eliminare questo elemento?" }: FilmzyDialogoConfermaDistruttivaProps) {
  return (
    <div className={className || "bg-[#1a1b19] border border-[#474a42] border-solid content-stretch flex flex-col gap-[18px] items-start overflow-clip p-[24px] relative rounded-[18px] w-[560px]"} data-node-id="51:1376" data-name="Filmzy/Dialogo/Conferma distruttiva">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[22px] w-[min-content]" data-node-id="51:1369">
        {titolo}
      </p>
      <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[#b2b2a8] text-[14px] w-[min-content]" data-node-id="51:1370">
        {descrizione}
      </p>
      <div className="content-stretch flex gap-[12px] items-start overflow-clip relative shrink-0" data-node-id="51:1371" data-name="Azioni di conferma">
        <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[42px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[84px]" etichetta="Annulla" />
        <FilmzyPulsanteDistruttivoNormale className="bg-[#b83e38] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[42px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[84px]" />
      </div>
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

export default function SuonoEdEsportazioneStati() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col gap-[32px] items-start p-[48px] relative size-full" data-node-id="27:73662" data-name="Suono ed esportazione · Stati">
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73663" data-name="Introduction">
        <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:73664">
          FILMZY · STATI DELL’INTERFACCIA
        </p>
        <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:73665">
          Suono ed esportazione · Stati
        </p>
        <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:73666">
          Effetti e musica nelle loro tracce, alternative da ascoltare e un’esportazione tutta locale.
        </p>
      </div>
      <div className="[word-break:break-word] bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73667" data-name="Pannello">
        <p className="font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:73668">
          Effetti · Traccia vuota
        </p>
        <div className="bg-[#22231f] border border-[#34362e] border-dashed content-stretch flex h-[100px] items-center justify-between not-italic overflow-clip p-[24px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:73669" data-name="Traccia effetti">
          <p className="font-['Inter:Regular'] font-normal leading-[normal] relative shrink-0 text-[#aaa99e] text-[16px] whitespace-nowrap" data-node-id="27:73670">
            Nessun effetto: aggiungi il primo
          </p>
          <div className="flex flex-col font-['Inter:Semi_Bold'] font-semibold h-[46px] justify-center leading-[0] relative shrink-0 text-[#f5f1e8] text-[14px] w-[140px]" data-node-id="27:73671">
            <p className="leading-[normal]">+ Aggiungi un suono</p>
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73672" data-name="Stati separati">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73673" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73674">
            Suono in arrivo
          </p>
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73675" data-name="Indicatore">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[99px]" data-node-id="27:73676">
              ◌ In lavorazione
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[20px] w-[min-content]" data-node-id="27:73677">
            Un treno si allontana nella notte
          </p>
          <div className="h-[48px] relative shrink-0 w-full" data-node-id="27:73678" data-name="Forma d’onda">
            <div className="absolute inset-[-3.13%_-0.25%]">
              <img alt="" className="block max-w-none size-full" src={imgFormaDonda} />
            </div>
          </div>
          <div className="bg-[#34362e] content-stretch flex h-[4px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:73679" data-name="Avanzamento">
            <div className="absolute bg-[#f5b544] h-[4px] left-0 right-[38%] rounded-[4px] top-0" data-node-id="27:73680" data-name="Completato" />
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:73681">
            Stiamo preparando il tuo suono…
          </p>
          <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Annulla" />
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73683" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73684">
            Generazione non riuscita
          </p>
          <div className="bg-[#302d1a] content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:73685" data-name="Avviso">
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#ffe34d] text-[14px] whitespace-pre-wrap" data-node-id="27:73686">{`⚠  Questo suono non si può generare così, prova a descriverlo in un altro modo`}</p>
          </div>
          <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold h-[46px] justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[150px]" data-node-id="27:73687">
            <p className="leading-[normal]">Cambia la descrizione</p>
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73688" data-name="Azioni">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Riprova" />
            <FilmzyPulsanteTestoNormale className="bg-[rgba(0,0,0,0)] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[36px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[134px]" etichetta="Cambia servizio ⌄" />
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73691" data-name="Stati separati">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73692" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73693">
            Modifica il suono
          </p>
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73694" data-name="Indicatore">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[98px]" data-node-id="27:73695">
              Scena 1 · Effetti
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[23px] w-[min-content]" data-node-id="27:73696">
            Un treno nella notte
          </p>
          <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:73697" data-name="Campo">
            <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full" data-node-id="27:73698">
              <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Com’è questo suono?</p>
              <p className="leading-[1.65] text-[14px]">Un treno lontano che riparte piano, metallo sui binari e un’eco morbida sotto la pensilina.</p>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73699" data-name="Generazione del suono">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[160px]" etichetta="Genera · circa 0,10 $" />
            <FilmzyPulsanteTestoNormale className="bg-[rgba(0,0,0,0)] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[36px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[134px]" etichetta="Cambia servizio ⌄" />
          </div>
          <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:73703" data-name="Separatore" />
          <div className="content-stretch flex flex-col gap-[16px] items-start overflow-clip pt-[18px] relative shrink-0 w-full" data-node-id="27:73704" data-name="Cambia il suono">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Cambia" />
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:73706">
              Scegli una delle alternative già generate.
            </p>
            <div className="h-[48px] relative shrink-0 w-full" data-node-id="27:73707" data-name="Forma d’onda">
              <div className="absolute inset-[-3.13%_-0.25%]">
                <img alt="" className="block max-w-none size-full" src={imgFormaDonda} />
              </div>
            </div>
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73708" data-name="Azioni">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[115px]" etichetta="Carica un file" />
            <FilmzyPulsanteDistruttivoNormale className="bg-[#b83e38] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[78px]" />
          </div>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73711" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:73712">
            Tre varianti da ascoltare
          </p>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73713" data-name="Pannello">
            <div className="[word-break:break-word] content-center flex flex-wrap gap-[10px] items-center not-italic overflow-clip relative shrink-0 text-[13px] w-full" data-node-id="27:73714" data-name="Azioni">
              <div className="flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] relative shrink-0 text-[#f5f1e8] w-[12px]" data-node-id="27:73715">
                <p className="leading-[normal]">▶</p>
              </div>
              <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[#aaa99e] w-[62px]" data-node-id="27:73716">
                Variante 1
              </p>
              <p className="flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px relative text-[#f5f1e8]" data-node-id="27:73717">
                Più lontano
              </p>
            </div>
            <div className="h-[48px] relative shrink-0 w-full" data-node-id="27:73718" data-name="Forma d’onda">
              <div className="absolute inset-[-3.13%_-0.27%]">
                <img alt="" className="block max-w-none size-full" src={imgFormaDonda1} />
              </div>
            </div>
            <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:73719" data-name="Ascolto e scelta">
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[85px]" data-node-id="27:73720">
                00:00 / 00:06
              </p>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Scegli" />
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73723" data-name="Pannello">
            <div className="[word-break:break-word] content-center flex flex-wrap gap-[10px] items-center not-italic overflow-clip relative shrink-0 text-[13px] w-full" data-node-id="27:73724" data-name="Azioni">
              <div className="flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] relative shrink-0 text-[#f5f1e8] w-[12px]" data-node-id="27:73725">
                <p className="leading-[normal]">▶</p>
              </div>
              <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[#aaa99e] w-[64px]" data-node-id="27:73726">
                Variante 2
              </p>
              <p className="flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px relative text-[#f5f1e8]" data-node-id="27:73727">
                Più metallico
              </p>
            </div>
            <div className="h-[48px] relative shrink-0 w-full" data-node-id="27:73728" data-name="Forma d’onda">
              <div className="absolute inset-[-3.13%_-0.27%]">
                <img alt="" className="block max-w-none size-full" src={imgFormaDonda1} />
              </div>
            </div>
            <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:73729" data-name="Ascolto e scelta">
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[85px]" data-node-id="27:73730">
                00:00 / 00:06
              </p>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Scegli" />
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73732" data-name="Pannello">
            <div className="[word-break:break-word] content-center flex flex-wrap gap-[10px] items-center not-italic overflow-clip relative shrink-0 text-[13px] w-full" data-node-id="27:73733" data-name="Azioni">
              <div className="flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] relative shrink-0 text-[#f5f1e8] w-[12px]" data-node-id="27:73734">
                <p className="leading-[normal]">▶</p>
              </div>
              <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[#aaa99e] w-[64px]" data-node-id="27:73735">
                Variante 3
              </p>
              <p className="flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px relative text-[#f5f1e8]" data-node-id="27:73736">
                Più morbido
              </p>
            </div>
            <div className="h-[48px] relative shrink-0 w-full" data-node-id="27:73737" data-name="Forma d’onda">
              <div className="absolute inset-[-3.13%_-0.27%]">
                <img alt="" className="block max-w-none size-full" src={imgFormaDonda1} />
              </div>
            </div>
            <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:73738" data-name="Ascolto e scelta">
              <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[85px]" data-node-id="27:73739">
                00:00 / 00:06
              </p>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Scegli" />
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73741" data-name="Stati separati">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73742" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73743">
            Suoni proposti
          </p>
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73744" data-name="Indicatore">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[62px]" data-node-id="27:73745">
              Suggerito
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73746">
            Passi nella cabina di proiezione
          </p>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:73747">
            Scena 4 · Un pavimento di legno, pochi passi attenti.
          </p>
          <div className="h-[48px] relative shrink-0 w-full" data-node-id="27:73748" data-name="Forma d’onda">
            <div className="absolute inset-[-3.13%_-0.25%]">
              <img alt="" className="block max-w-none size-full" src={imgFormaDonda} />
            </div>
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73749" data-name="Azioni">
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[59px]" data-node-id="27:73750">
              <p className="leading-[normal]">▶ Ascolta</p>
            </div>
            <div className="bg-[#f5b544] border border-[#f5b544] border-solid content-stretch flex h-[46px] items-center justify-center overflow-clip px-[18px] relative rounded-[12px] shrink-0" data-node-id="27:73751" data-name="Azione">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[14px] whitespace-nowrap" data-node-id="27:73752">
                Accetta
              </p>
            </div>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[74px]" etichetta="Scarta" />
          </div>
          <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:73754" data-name="Separatore" />
          <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[101px]" data-node-id="27:73755">
            Musica · Traccia
          </p>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:73756">
            Un tema lieve di pianoforte accompagna il ricordo.
          </p>
          <div className="h-[48px] relative shrink-0 w-full" data-node-id="27:73757" data-name="Forma d’onda">
            <div className="absolute inset-[-3.13%_-0.25%]">
              <img alt="" className="block max-w-none size-full" src={imgFormaDonda} />
            </div>
          </div>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73758" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:73759">
            Carica un file audio
          </p>
          <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:73760" data-name="Campo">
            <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full" data-node-id="27:73761">
              <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">File</p>
              <p className="leading-[1.65] text-[14px]">treno-notturno.wav · 6 secondi</p>
            </div>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:73762">
            Il file resta sul tuo computer e non viene inviato a nessun servizio AI. I diritti sul file sono tuoi.
          </p>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73763" data-name="Azioni">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[73px]" etichetta="Carica" />
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Annulla" />
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73767" data-name="Stati separati">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73768" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:73769">
            Audio originale · Spento
          </p>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73770" data-name="Azioni">
            <div className="relative shrink-0 size-[20px]" data-node-id="27:74302" data-name="volume-x">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVolumeX} />
            </div>
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[42px]" data-node-id="27:73772">
              <p className="leading-[normal]">Spento</p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[62px]" data-node-id="27:73773">
              Clip video
            </p>
          </div>
          <div className="content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:73774" data-name="Avviso">
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:73775">
              Audio originale spento
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:73776">
            Il video rimane nella traccia. L’audio originale non si sente.
          </p>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73777" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:73778">
            Audio originale · Non disponibile
          </p>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73779" data-name="Azioni">
            <div className="relative shrink-0 size-[20px]" data-node-id="27:74305" data-name="volume-x">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVolumeX1} />
            </div>
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic opacity-40 relative shrink-0 text-[#f5f1e8] text-[13px] w-[88px]" data-node-id="27:73781">
              <p className="leading-[normal]">Audio originale</p>
            </div>
          </div>
          <div className="content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:73782" data-name="Avviso">
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:73783">
              Questa clip è stata generata senza audio
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:73784">
            Puoi aggiungere un suono nella traccia Effetti o una musica nella sua traccia.
          </p>
        </div>
      </div>
      <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73785" data-name="Pannello">
        <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73786">
          Esportazione completata
        </p>
        <div className="relative shrink-0 size-[40px]" data-node-id="27:74299" data-name="circle-check">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCircleCheck} />
        </div>
        <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[25px] w-[min-content]" data-node-id="27:73788">
          Il tuo film è pronto da guardare.
        </p>
        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:73789">
          Salvato in Documenti/Filmzy/…
        </p>
        <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:73790" data-name="Campo">
          <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full" data-node-id="27:73791">
            <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Percorso · sola lettura</p>
            <p className="leading-[1.65] text-[14px]">Documenti/Filmzy/Film/L’ultima corsa/Esportazioni/L’ultima corsa.mp4</p>
          </div>
        </div>
        <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73792" data-name="Azioni">
          <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[123px]" etichetta="Apri la cartella" />
          <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold h-[46px] justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[83px]" data-node-id="27:73795">
            <p className="leading-[normal]">Torna al film</p>
          </div>
        </div>
      </div>
      <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:73796" data-name="Separatore" />
      <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-[min-content]" data-node-id="27:73797">
        Filmzy · App desktop gratuita · Salvato sul tuo computer
      </p>
      <div className="h-[720px] overflow-clip relative rounded-[18px] shrink-0 w-full" data-node-id="51:1385" data-name="Conferma · Elimina">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[18px] size-full" src={imgConfermaElimina} />
        <div className="absolute bg-[rgba(0,0,0,0.72)] h-[720px] left-0 top-0 w-[1344px]" data-node-id="51:1386" data-name="Rectangle" />
        <FilmzyDialogoConfermaDistruttiva className="absolute bg-[#1a1b19] border border-[#474a42] border-solid content-stretch flex flex-col gap-[18px] items-start left-[392px] overflow-clip p-[24px] rounded-[18px] top-[274px] w-[560px]" descrizione="Il suono verrà rimosso dal film. Le altre tracce non cambiano." titolo="Eliminare questo suono?" />
      </div>
      <FilmzySelettoreServizioSuono className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex flex-col gap-[20px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-[520px]" />
    </div>
  );
}