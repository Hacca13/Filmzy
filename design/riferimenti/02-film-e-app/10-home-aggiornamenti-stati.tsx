const imgContestoHomeOscurato = "https://www.figma.com/api/mcp/asset/cae424e1-9a6a-418e-970f-8862fc319523.png";

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

export default function AggiornamentiStati() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col gap-[32px] items-start p-[48px] relative size-full" data-node-id="27:74185" data-name="Aggiornamenti · Stati">
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:74186" data-name="Introduction">
        <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:74187">
          FILMZY · STATI DELL’INTERFACCIA
        </p>
        <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:74188">
          Aggiornamenti · Stati
        </p>
        <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:74189">
          Avvisi discreti, un download chiaro e nessuna sorpresa per i tuoi film.
        </p>
      </div>
      <div className="border border-[#34362e] border-solid content-stretch flex flex-col h-[760px] items-start overflow-clip relative rounded-[18px] shrink-0 w-full" data-node-id="31:36" data-name="Contesto home oscurato">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[18px] size-full" src={imgContestoHomeOscurato} />
        <div className="absolute bg-[rgba(0,0,0,0.64)] h-[760px] left-[-1px] top-[-1px] w-[1344px]" data-node-id="49:5290" data-name="Sfondo oscurato" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#1a1b19] border border-[#34362e] border-solid content-stretch drop-shadow-[0px_18px_20px_rgba(0,0,0,0.4)] flex flex-col gap-[16px] items-start left-1/2 p-[24px] rounded-[18px] top-1/2 w-[560px]" data-node-id="31:53" data-name="Modale aggiornamento">
          <div className="bg-[#352b19] content-stretch flex items-start px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="31:54" data-name="Indicatore">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[118px]" data-node-id="31:55">
              AGGIORNAMENTO
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[22px] w-[min-content]" data-node-id="31:57">{`C'è una versione nuova di Filmzy: 0.4.0`}</p>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[18px] w-[min-content]" data-node-id="31:58">
            Cosa cambia
          </p>
          <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="31:59">
            <p className="leading-[1.55] mb-0">• Moodboard per ogni scena</p>
            <p className="leading-[1.55] mb-0">• Scelta delle immagini iniziali e finali</p>
            <p className="leading-[1.55]">• Spese più chiare per ogni servizio</p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5b544] text-[14px] w-[min-content]" data-node-id="31:60">
            Tutte le novità ↗
          </p>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="31:61" data-name="Azioni">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[113px]" etichetta="Aggiorna ora" />
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[166px]" etichetta="Ricordamelo più tardi" />
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[168px]" etichetta="Salta questa versione" />
          </div>
          <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="31:68">
            <p className="leading-[1.55] mb-0">Ricordamelo più tardi: te lo ripropongo al prossimo avvio.</p>
            <p className="leading-[1.55]">Salta questa versione: non te lo ripropongo finché non ne esce una più nuova.</p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="31:69">
            I tuoi film restano dove sono.
          </p>
        </div>
      </div>
      <div className="content-stretch flex items-start overflow-clip relative shrink-0 w-full" data-node-id="27:74190" data-name="Stati separati">
        <div className="[word-break:break-word] bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:74204" data-name="Pannello">
          <p className="font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:74205">
            Ricordamelo più tardi · Prossimo avvio
          </p>
          <p className="font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[171px]" data-node-id="27:74206">
            Versione 0.4.0 · Ricordamelo più tardi
          </p>
          <p className="font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[22px] w-[min-content]" data-node-id="27:74207">
            Va bene, te lo ricordo al prossimo avvio.
          </p>
          <p className="font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:74208">
            Alla prossima apertura di Filmzy, ti ricorderò che la versione 0.4.0 è disponibile.
          </p>
          <p className="font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:74209">
            Salta questa versione: non te lo ripropongo finché non ne esce una più nuova.
          </p>
        </div>
      </div>
      <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:74211" data-name="Stati separati">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:74212" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:74213">
            Download in corso
          </p>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[24px] w-[min-content]" data-node-id="27:74214">
            Sto scaricando la versione nuova…
          </p>
          <div className="bg-[#34362e] content-stretch flex h-[4px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:74215" data-name="Avanzamento">
            <div className="absolute bg-[#f5b544] h-[4px] left-0 right-[37%] rounded-[4px] top-0" data-node-id="27:74216" data-name="Completato" />
          </div>
          <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 text-[13px] w-full" data-node-id="27:74217" data-name="Avanzamento del download">
            <p className="relative shrink-0 text-[#f5b544] w-[27px]" data-node-id="27:74218">
              63%
            </p>
            <p className="relative shrink-0 text-[#aaa99e] w-[98px]" data-node-id="27:74219">
              48 MB di 76 MB
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:74220">
            Puoi continuare a lavorare. Ti avvisiamo appena è pronta.
          </p>
          <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[113px]" data-node-id="27:74221">
            <p className="leading-[normal]">Annulla il download</p>
          </div>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:74222" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:74223">
            Aggiornamento pronto
          </p>
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:74224" data-name="Indicatore">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[153px]" data-node-id="27:74225">
              ✓ Download completato
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[24px] w-[min-content]" data-node-id="27:74226">
            Pronto: l’app si chiude e si riapre aggiornata
          </p>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:74227">
            I tuoi film restano dove sono.
          </p>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:74228" data-name="Azioni">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Chiudi e aggiorna" />
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold h-[46px] justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[56px]" data-node-id="27:74231">
              <p className="leading-[normal]">Più tardi</p>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:74232" data-name="Stati separati">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:74233" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:74234">
            Impostazioni · Nessuna novità
          </p>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[22px] w-[min-content]" data-node-id="27:74235">
            Filmzy 0.3.2
          </p>
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:74236" data-name="Indicatore">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[106px]" data-node-id="27:74237">
              ✓ Filmzy è aggiornato
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:74238">
            Ultimo controllo oggi alle 09:42
          </p>
          <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[139px]" etichetta="Controlla adesso" />
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:74240" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:74241">
            Impostazioni · Nuova versione
          </p>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[22px] w-full" data-node-id="27:74242">
            C’è la versione 0.4.0
          </p>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:74243">
            Disponibile per il tuo computer.
          </p>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:74244" data-name="Azioni">
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold h-[46px] justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[88px]" data-node-id="27:74245">
              <p className="leading-[normal]">Cosa cambia</p>
            </div>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[113px]" etichetta="Aggiorna ora" />
          </div>
        </div>
      </div>
      <div className="content-stretch flex items-start overflow-clip relative shrink-0 w-full" data-node-id="27:74248" data-name="Stati separati">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:74249" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:74250">
            Impostazioni · Controllo non riuscito
          </p>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[23px] w-full" data-node-id="27:74251">
            Non riesco a controllare: guarda tu
          </p>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:74252">
            Puoi aprire la pagina delle versioni su GitHub o riprovare più tardi.
          </p>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:74253" data-name="Azioni">
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold h-[46px] justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[84px]" data-node-id="27:74254">
              <p className="leading-[normal]">Guarda tu ↗</p>
            </div>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Riprova" />
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:74256">
            Per controllare, l’app chiede a GitHub se c’è una versione nuova: non parte nessun tuo dato.
          </p>
        </div>
      </div>
      <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:74269" data-name="Separatore" />
      <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:74270">
        Filmzy · App desktop gratuita · Salvato sul tuo computer
      </p>
    </div>
  );
}