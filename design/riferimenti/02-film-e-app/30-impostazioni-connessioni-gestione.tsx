const imgConfermaRimuovi = "https://www.figma.com/api/mcp/asset/4e3b6eb2-a045-47f6-a8fc-2ac82c912e02.png";

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

type FilmzyCampoApplicazioneNormaleProps = {
  className?: string;
  aiuto?: string;
  etichetta?: string;
  valore?: string;
};

function FilmzyCampoApplicazioneNormale({ className, aiuto = "La chiave resta sul tuo computer.", etichetta = "Chiave personale", valore = "••••••••••••1a2b" }: FilmzyCampoApplicazioneNormaleProps) {
  return (
    <div className={className || "content-stretch flex flex-col gap-[10px] h-[3703px] items-start overflow-clip relative w-[500px]"} data-node-id="54:1409" data-name="Filmzy/Campo applicazione/Normale">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] whitespace-nowrap" data-node-id="54:1411">
        {etichetta}
      </p>
      <div className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[48px] items-center overflow-clip px-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="54:1412" data-name="Inserimento">
        <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[normal] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="54:1413">
          {valore}
        </p>
      </div>
      <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.5] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="54:1414">
        {aiuto}
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

export default function ConnessioniGestione() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col gap-[32px] items-start p-[48px] relative size-full" data-node-id="27:73799" data-name="Connessioni · Gestione">
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73800" data-name="Introduction">
        <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:73801">
          FILMZY · STATI DELL’INTERFACCIA
        </p>
        <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:73802">
          Connessioni · Gestione
        </p>
        <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:73803">
          Dettagli del fornitore e aggiunta guidata in tre passi. Le chiavi non vengono mai mostrate di nuovo.
        </p>
      </div>
      <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73804" data-name="Stati separati">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73805" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73806">
            fal.ai · Chiave
          </p>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73807" data-name="Azioni">
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[43px]" data-node-id="27:73808">
              <p className="leading-[normal]">Servizi</p>
            </div>
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73809" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[44px]" data-node-id="27:73810">
                Chiave
              </p>
            </div>
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[57px]" data-node-id="27:73811">
              <p className="leading-[normal]">Chi lo usa</p>
            </div>
          </div>
          <FilmzyCampoApplicazioneNormale className="content-stretch flex flex-col gap-[10px] h-px items-start overflow-clip relative shrink-0 w-full" />
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73814" data-name="Indicatore">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[244px]" data-node-id="27:73815">
              ✓ Collegato · Verificato oggi alle 09:42
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:73816">
            Per sicurezza non mostriamo più la chiave completa. Se serve, puoi sostituirla.
          </p>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73817" data-name="Azioni">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[99px]" etichetta="Sostituisci" />
            <FilmzyPulsanteDistruttivoNormale className="bg-[#b83e38] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[82px]" etichetta="Rimuovi" />
          </div>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73820" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:73821">
            fal.ai · Chi lo usa
          </p>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73822" data-name="Azioni">
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[43px]" data-node-id="27:73823">
              <p className="leading-[normal]">Servizi</p>
            </div>
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[40px]" data-node-id="27:73824">
              <p className="leading-[normal]">Chiave</p>
            </div>
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73825" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[62px]" data-node-id="27:73826">
                Chi lo usa
              </p>
            </div>
          </div>
          <div className="[word-break:break-word] bg-[#22231f] content-stretch flex gap-[16px] items-start not-italic overflow-clip p-[14px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:73827" data-name="Ruolo collegato">
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[1.55] min-w-px overflow-clip relative" data-node-id="27:73828" data-name="Assegnazione">
              <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:73829">
                Storyboard
              </p>
              <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:73830">
                FLUX.1 Kontext
              </p>
            </div>
            <div className="flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] relative shrink-0 text-[#f5f1e8] text-[13px] w-[57px]" data-node-id="27:73831">
              <p className="leading-[normal]">Apri ruolo</p>
            </div>
          </div>
          <div className="[word-break:break-word] bg-[#22231f] content-stretch flex gap-[16px] items-start not-italic overflow-clip p-[14px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:73832" data-name="Ruolo collegato">
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[1.55] min-w-px overflow-clip relative" data-node-id="27:73833" data-name="Assegnazione">
              <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:73834">
                Operatore di ripresa
              </p>
              <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:73835">
                Kling · Standard
              </p>
            </div>
            <div className="flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] relative shrink-0 text-[#f5f1e8] text-[13px] w-[57px]" data-node-id="27:73836">
              <p className="leading-[normal]">Apri ruolo</p>
            </div>
          </div>
          <div className="[word-break:break-word] bg-[#22231f] content-stretch flex gap-[16px] items-start not-italic overflow-clip p-[14px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:73837" data-name="Ruolo collegato">
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[1.55] min-w-px overflow-clip relative" data-node-id="27:73838" data-name="Assegnazione">
              <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:73839">
                Scenografo
              </p>
              <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:73840">
                FLUX.1 Kontext
              </p>
            </div>
            <div className="flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] relative shrink-0 text-[#f5f1e8] text-[13px] w-[57px]" data-node-id="27:73841">
              <p className="leading-[normal]">Apri ruolo</p>
            </div>
          </div>
          <div className="[word-break:break-word] bg-[#22231f] content-stretch flex gap-[16px] items-start not-italic overflow-clip p-[14px] relative rounded-[10px] shrink-0 w-full" data-node-id="27:73842" data-name="Ruolo collegato">
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[1.55] min-w-px overflow-clip relative" data-node-id="27:73843" data-name="Assegnazione">
              <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:73844">
                Ritocco
              </p>
              <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:73845">
                FLUX.1 Kontext
              </p>
            </div>
            <div className="flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] relative shrink-0 text-[#f5f1e8] text-[13px] w-[57px]" data-node-id="27:73846">
              <p className="leading-[normal]">Apri ruolo</p>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73847" data-name="Stati separati">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73848" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:73849">
            Aggiungi un fornitore · Video
          </p>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73850" data-name="Azioni">
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73851" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[61px]" data-node-id="27:73852">
                1 Servizio
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[54px]" data-node-id="27:73853">
              2 Chiave
            </p>
            <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[55px]" data-node-id="27:73854">
              3 Servizi
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[22px] w-full" data-node-id="27:73855">
            Scegli un servizio video
          </p>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:73856">
            Qui trovi solo i fornitori adatti al gruppo Video.
          </p>
          <div className="bg-[#22231f] content-stretch flex gap-[16px] items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:73857" data-name="Fornitore video">
            <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start leading-[1.55] min-w-px not-italic overflow-clip relative" data-node-id="27:73858" data-name="Fornitore">
              <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:73859">
                fal.ai
              </p>
              <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:73860">
                Come ottengo la chiave? ↗
              </p>
            </div>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[87px]" etichetta="✓ Scelto" />
          </div>
          <div className="bg-[#22231f] content-stretch flex gap-[16px] items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:73863" data-name="Fornitore video">
            <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start leading-[1.55] min-w-px not-italic overflow-clip relative" data-node-id="27:73864" data-name="Fornitore">
              <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:73865">
                Replicate
              </p>
              <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:73866">
                Come ottengo la chiave? ↗
              </p>
            </div>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Scegli" />
          </div>
          <div className="bg-[#22231f] content-stretch flex gap-[16px] items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:73868" data-name="Fornitore video">
            <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start leading-[1.55] min-w-px not-italic overflow-clip relative" data-node-id="27:73869" data-name="Fornitore">
              <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:73870">
                Runway
              </p>
              <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:73871">
                Come ottengo la chiave? ↗
              </p>
            </div>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[72px]" etichetta="Scegli" />
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73873" data-name="Azioni">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Annulla" />
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[90px]" etichetta="Continua" />
          </div>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73877" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73878">
            Aggiungi un fornitore · Chiave valida
          </p>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73879" data-name="Azioni">
            <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[60px]" data-node-id="27:73880">
              1 Servizio
            </p>
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73881" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[55px]" data-node-id="27:73882">
                2 Chiave
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[55px]" data-node-id="27:73883">
              3 Servizi
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[22px] w-[min-content]" data-node-id="27:73884">
            Collega fal.ai
          </p>
          <FilmzyCampoApplicazioneNormale className="content-stretch flex flex-col gap-[10px] h-px items-start overflow-clip relative shrink-0 w-full" />
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[min-content]" data-node-id="27:73887">
            Come ottengo la chiave? ↗
          </p>
          <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[166px]" etichetta="Prova la connessione" />
          <div className="content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:73889" data-name="Avviso">
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:73890">
              ✓ Funziona
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:73891">
            La chiave è salvata sul tuo computer e non sarà più mostrata.
          </p>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73892" data-name="Azioni">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[81px]" />
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[90px]" etichetta="Continua" />
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73896" data-name="Stati separati">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73897" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:73898">
            Aggiungi un fornitore · Servizi
          </p>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73899" data-name="Azioni">
            <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[60px]" data-node-id="27:73900">
              1 Servizio
            </p>
            <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[54px]" data-node-id="27:73901">
              2 Chiave
            </p>
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73902" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[55px]" data-node-id="27:73903">
                3 Servizi
              </p>
            </div>
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[22px] w-full" data-node-id="27:73904">
            I servizi di fal.ai
          </p>
          <div className="[word-break:break-word] bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start leading-[1.55] not-italic overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73905" data-name="Pannello">
            <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:73906">
              ☑ Kling · Standard
            </p>
            <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:73907">
              Video · circa 0,42 $ / 6 s
            </p>
          </div>
          <div className="[word-break:break-word] bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start leading-[1.55] not-italic overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73908" data-name="Pannello">
            <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:73909">
              ☑ Seedance · Veloce
            </p>
            <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:73910">
              Video · circa 0,90 $ / clip
            </p>
          </div>
          <div className="[word-break:break-word] bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start leading-[1.55] not-italic overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73911" data-name="Pannello">
            <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:73912">
              ☐ Veo 3
            </p>
            <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:73913">
              Video e audio · circa 1,20 $ / clip
            </p>
          </div>
          <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:73914" data-name="Campo">
            <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:73915">
              <p className="leading-[1.65] mb-0">Servizio predefinito</p>
              <p className="leading-[1.65]">Kling · Standard ⌄</p>
            </div>
          </div>
          <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:73916" data-name="Campo">
            <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full whitespace-pre-wrap" data-node-id="27:73917">
              <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Limite di spesa mensile (facoltativo)</p>
              <p className="leading-[1.65] mb-0 text-[14px]">{` `}</p>
              <p className="leading-[1.65] text-[#aaa99e] text-[11px]">Importo in $ · lascia vuoto per nessun limite</p>
            </div>
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73918" data-name="Azioni">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[81px]" />
            <div className="bg-[#f5b544] border border-[#f5b544] border-solid content-stretch flex h-[46px] items-center justify-center overflow-clip px-[18px] relative rounded-[12px] shrink-0" data-node-id="27:73920" data-name="Azione">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[14px] whitespace-nowrap" data-node-id="27:73921">
                Collega il fornitore
              </p>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[24px] items-start min-w-px overflow-clip relative" data-node-id="27:73922" data-name="Altri esiti della connessione">
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73923" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73924">
              Chiave · Non valida
            </p>
            <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[116px]" data-node-id="27:73925">
              Passo 2 di 3 · fal.ai
            </p>
            <FilmzyCampoApplicazioneNormale className="content-stretch flex flex-col gap-[10px] h-px items-start overflow-clip relative shrink-0 w-full" />
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[166px]" etichetta="Prova la connessione" />
            <div className="bg-[#302d1a] content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:73929" data-name="Avviso">
              <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#ffe34d] text-[14px] whitespace-pre-wrap" data-node-id="27:73930">{`⚠  Chiave non valida`}</p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:73931">
              Controlla di averla copiata tutta, poi riprova.
            </p>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[90px]" etichetta="Continua" />
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73933" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73934">
              Lettura immagini · Connessione riutilizzata
            </p>
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73935" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[118px]" data-node-id="27:73936">
                OpenAI · Collegato
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[20px] w-[min-content]" data-node-id="27:73937">
              La chiave c’è già.
            </p>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:73938">
              Usiamo la connessione OpenAI del Testo. Non serve inserire una nuova chiave per leggere le immagini.
            </p>
            <div className="bg-[#f5b544] border border-[#f5b544] border-solid content-stretch flex h-[46px] items-center justify-center overflow-clip px-[18px] relative rounded-[12px] shrink-0" data-node-id="27:73939" data-name="Azione">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[14px] whitespace-nowrap" data-node-id="27:73940">
                Scegli i servizi
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:73941" data-name="Separatore" />
      <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:73942">
        Filmzy · App desktop gratuita · Salvato sul tuo computer
      </p>
      <div className="h-[720px] overflow-clip relative rounded-[18px] shrink-0 w-full" data-node-id="51:1395" data-name="Conferma · Rimuovi">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[18px] size-full" src={imgConfermaRimuovi} />
        <div className="absolute bg-[rgba(0,0,0,0.72)] h-[720px] left-0 top-0 w-[1344px]" data-node-id="51:1396" data-name="Rectangle" />
        <div className="absolute bg-[#1a1b19] border border-[#474a42] border-solid content-stretch flex flex-col gap-[18px] items-start left-[392px] overflow-clip p-[24px] rounded-[18px] top-[274px] w-[560px]" data-node-id="51:1387" data-name="Filmzy/Dialogo/Conferma distruttiva">
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[22px] w-[min-content]" data-node-id="I51:1387;51:1369">
            Rimuovere la chiave?
          </p>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[#b2b2a8] text-[14px] w-[min-content]" data-node-id="I51:1387;51:1370">
            Il fornitore non sarà più disponibile finché non colleghi una nuova chiave.
          </p>
          <div className="content-stretch flex gap-[12px] items-start overflow-clip relative shrink-0" data-node-id="I51:1387;51:1371" data-name="Azioni di conferma">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[42px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[84px]" etichetta="Annulla" />
            <div className="bg-[#b83e38] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[42px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[84px]" data-node-id="I51:1387;51:1374" data-name="Filmzy/Pulsante/Distruttivo/Normale">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="I51:1387;51:1374;49:2345">
                Rimuovi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}