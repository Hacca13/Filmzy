const imgPubblicaFinestraDiConferma = "https://www.figma.com/api/mcp/asset/fde3fd81-ee0b-49a4-90a7-43b30d482407.png";

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

export default function AvanzateProvaPubblicazioneEStorico() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col gap-[32px] items-start p-[48px] relative size-full" data-node-id="27:74050" data-name="Avanzate · Prova, pubblicazione e storico">
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:74051" data-name="Introduction">
        <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:74052">
          FILMZY · STATI DELL’INTERFACCIA
        </p>
        <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:74053">
          Avanzate · Prova, pubblicazione e storico
        </p>
        <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:74054">
          Bozza → Prova → Pubblica → Storico. La configurazione attiva resta separata fino alla pubblicazione.
        </p>
      </div>
      <div className="content-stretch flex items-start overflow-clip relative shrink-0 w-full" data-node-id="27:74055" data-name="Stati separati">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:74056" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:74057">
            Prova · Risultato
          </p>
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:74058" data-name="Indicatore">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[141px]" data-node-id="27:74059">
              Bozza · Sceneggiatore
            </p>
          </div>
          <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:74060" data-name="Campo">
            <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full" data-node-id="27:74061">
              <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Esempio fisso</p>
              <p className="leading-[1.65] text-[14px]">Marco trova una vecchia bobina nella stazione di notte.</p>
            </div>
          </div>
          <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:74062" data-name="Campo">
            <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full" data-node-id="27:74063">
              <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Risultato</p>
              <p className="leading-[1.65] text-[14px]">Il treno scompare. Marco legge il nome di suo padre sulla bobina e prende la strada del cinema.</p>
            </div>
          </div>
          <div className="[word-break:break-word] content-center flex flex-wrap font-['Inter:Medium'] font-medium gap-[10px] items-center leading-[normal] not-italic overflow-clip relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:74064" data-name="Azioni">
            <p className="relative shrink-0 w-[93px]" data-node-id="27:74065">
              Costo: 0,004 $
            </p>
            <p className="relative shrink-0 w-[118px]" data-node-id="27:74066">
              Durata: 2,1 secondi
            </p>
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:74067" data-name="Azioni">
            <div className="bg-[#f5b544] border border-[#f5b544] border-solid content-stretch flex h-[46px] items-center justify-center overflow-clip px-[18px] relative rounded-[12px] shrink-0" data-node-id="27:74068" data-name="Azione">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[14px] whitespace-nowrap" data-node-id="27:74069">
                Ripeti la prova · circa 0,004 $
              </p>
            </div>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:74081" data-name="Stati separati">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:74082" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:74083">
            Pubblicazione riuscita
          </p>
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:74084" data-name="Indicatore">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[130px]" data-node-id="27:74085">
              ✓ Versione 8 · Attiva
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[24px] w-[min-content]" data-node-id="27:74086">
            Pubblicata: vale da adesso, anche per i lavori già in corso
          </p>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:74087">
            22 ottobre 2026, 10:15
          </p>
          <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold h-[46px] justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[95px]" data-node-id="27:74088">
            <p className="leading-[normal]">Apri lo storico</p>
          </div>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:74089" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:74090">
            Pubblicazione non riuscita
          </p>
          <div className="bg-[#302d1a] content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:74091" data-name="Avviso">
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#ffe34d] text-[14px] whitespace-pre-wrap" data-node-id="27:74092">{`⚠  Non pubblicato: resta attiva la configurazione di prima`}</p>
          </div>
          <div className="[word-break:break-word] bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start not-italic overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:74093" data-name="Pannello">
            <p className="font-['Inter:Regular'] font-normal leading-[1.55] min-w-full relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:74094">
              Il ruolo «Storyboard» usa un servizio che non esiste più
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.55] min-w-full relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:74095">
              Ruoli → Storyboard → Fornitore
            </p>
            <div className="flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] relative shrink-0 text-[#f5f1e8] text-[13px] w-[134px]" data-node-id="27:74096">
              <p className="leading-[normal]">Correggi → Storyboard</p>
            </div>
          </div>
          <div className="[word-break:break-word] bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start not-italic overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:74097" data-name="Pannello">
            <p className="font-['Inter:Regular'] font-normal leading-[1.55] min-w-full relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:74098">
              Il modello «Kling · Standard» non ha un prezzo per uso
            </p>
            <p className="font-['Inter:Regular'] font-normal leading-[1.55] min-w-full relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:74099">
              Modelli → Kling · Standard → Prezzo
            </p>
            <div className="flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] relative shrink-0 text-[#f5f1e8] text-[13px] w-[109px]" data-node-id="27:74100">
              <p className="leading-[normal]">Correggi → Prezzo</p>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:74101" data-name="Stati separati">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:74102" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:74103">
            Storico · Dalla più recente
          </p>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:74104" data-name="Pannello">
            <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:74105" data-name="Azioni">
              <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:74106" data-name="Indicatore">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[68px]" data-node-id="27:74107">
                  Versione 8
                </p>
              </div>
              <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:74108" data-name="Indicatore">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[37px]" data-node-id="27:74109">
                  Attiva
                </p>
              </div>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:74110">
              22 ottobre 2026, 10:15
            </p>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:74111">
              Servizi video aggiornati
            </p>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:74112" data-name="Pannello">
            <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:74113" data-name="Azioni">
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[66px]" data-node-id="27:74114">
                Versione 7
              </p>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[92px]" etichetta="Ripristina" />
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:74116">
              20 ottobre 2026, 15:20
            </p>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:74117">
              Ritmo più lento nei preset
            </p>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:74118" data-name="Pannello">
            <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:74119" data-name="Azioni">
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[67px]" data-node-id="27:74120">
                Versione 6
              </p>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[92px]" etichetta="Ripristina" />
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:74122">
              18 ottobre 2026, 11:06
            </p>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:74123">
              Istruzioni dello Storyboard
            </p>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:74124" data-name="Pannello">
            <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:74125" data-name="Azioni">
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[66px]" data-node-id="27:74126">
                Versione 5
              </p>
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[92px]" etichetta="Ripristina" />
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:74128">
              15 ottobre 2026, 09:30
            </p>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:74129">
              Configurazione iniziale
            </p>
          </div>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative" data-node-id="27:74130" data-name="Ripristino senza cancellazioni">
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:74141" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:74142">
              Ripristino completato
            </p>
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:74143" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[130px]" data-node-id="27:74144">
                ✓ Versione 9 · Attiva
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:74145">
              22 ottobre 2026, 10:24
            </p>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:74146">
              Ripristino della versione 6
            </p>
            <div className="content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:74147" data-name="Avviso">
              <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:74148">
                Lo storico conserva tutte le versioni, comprese la 7 e la 8.
              </p>
            </div>
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[130px]" data-node-id="27:74149">
              <p className="leading-[normal]">Vedi tutte le 9 versioni</p>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:74150" data-name="Stati separati">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:74151" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:74152">
            Bozza · Funzioni e limiti
          </p>
          <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:74153" data-name="Tabella modificabile">
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[2] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full whitespace-pre-wrap" data-node-id="27:74154">{`Funzione　 ·　 Valore modificabile`}</p>
            <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:74155" data-name="Riga modificabile">
              <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:74156">{`Immagini per ripresa　 ·　 2 · iniziale e finale ✎`}</p>
            </div>
            <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:74157" data-name="Riga modificabile">
              <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:74158">{`Durata massima · Kling　 ·　 10 secondi ✎`}</p>
            </div>
            <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:74159" data-name="Riga modificabile">
              <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:74160">{`Audio · Veo 3　 ·　 Sempre incluso ✎`}</p>
            </div>
            <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:74161" data-name="Riga modificabile">
              <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:74162">{`Ritocco　 ·　 Area dipinta ✎`}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:74163" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:74164">
            Bozza · Preset
          </p>
          <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:74165" data-name="Tabella modificabile">
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[2] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-full whitespace-pre-wrap" data-node-id="27:74166">{`Categoria　 ·　 Esempio modificabile`}</p>
            <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:74167" data-name="Riga modificabile">
              <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:74168">{`Stili e generi　 ·　 Realistico · Drammatico ✎`}</p>
            </div>
            <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:74169" data-name="Riga modificabile">
              <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:74170">{`Toni e fotografia　 ·　 Emozionante · Classica ✎`}</p>
            </div>
            <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:74171" data-name="Riga modificabile">
              <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:74172">{`Tag personaggi　 ·　 Alleato · Mentore ✎`}</p>
            </div>
            <div className="bg-[#22231f] content-stretch flex items-start overflow-clip p-[14px] relative rounded-[8px] shrink-0 w-full" data-node-id="27:74173" data-name="Riga modificabile">
              <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.6] min-w-px not-italic relative text-[#f5f1e8] text-[13px] whitespace-pre-wrap" data-node-id="27:74174">{`Movimenti macchina　 ·　 Panoramica · Avvicinati ✎`}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:74175" data-name="Pannello">
        <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:74176">
          La tua configurazione
        </p>
        <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:74177" data-name="Azioni">
          <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[232px]" etichetta="Riparti dai valori del programma" />
          <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[107px]" etichetta="Salva su file" />
        </div>
        <div className="bg-[#302d1a] content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:74180" data-name="Avviso">
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#ffe34d] text-[14px] whitespace-pre-wrap" data-node-id="27:74181">{`⚠  I commenti dei file originali non vengono conservati.`}</p>
        </div>
      </div>
      <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:74182" data-name="Separatore" />
      <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:74183">
        Filmzy · App desktop gratuita · Salvato sul tuo computer
      </p>
      <div className="h-[720px] overflow-clip relative rounded-[18px] shrink-0 w-full" data-node-id="51:1363" data-name="Pubblica · Finestra di conferma">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[18px] size-full" src={imgPubblicaFinestraDiConferma} />
        <div className="absolute bg-[rgba(0,0,0,0.72)] h-[720px] left-0 top-0 w-[1344px]" data-node-id="51:1364" data-name="Rectangle" />
        <div className="absolute bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start left-[392px] overflow-clip p-[24px] rounded-[18px] top-[187px] w-[560px]" data-node-id="27:74071" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:74072">
            Pubblica la configurazione
          </p>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[22px] w-full" data-node-id="27:74073">
            Tutto pronto per pubblicare?
          </p>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:74074">
            La bozza sostituirà la configurazione attiva. Conserviamo la versione precedente nello storico.
          </p>
          <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:74075" data-name="Campo">
            <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full whitespace-pre-wrap" data-node-id="27:74076">
              <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Perché questa modifica?</p>
              <p className="leading-[1.65] mb-0 text-[14px]">{` `}</p>
              <p className="leading-[1.65] text-[#aaa99e] text-[11px]">Facoltativo · una nota per ritrovarti nello storico</p>
            </div>
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:74077" data-name="Azioni">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[87px]" etichetta="Pubblica" />
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Annulla" />
          </div>
        </div>
      </div>
      <div className="h-[720px] overflow-clip relative rounded-[18px] shrink-0 w-full" data-node-id="51:1365" data-name="Ripristina · Finestra di conferma">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[18px] size-full" src={imgPubblicaFinestraDiConferma} />
        <div className="absolute bg-[rgba(0,0,0,0.72)] h-[720px] left-0 top-0 w-[1344px]" data-node-id="51:1366" data-name="Rectangle" />
        <div className="absolute bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start left-[392px] overflow-clip p-[24px] rounded-[18px] top-[192px] w-[560px]" data-node-id="27:74131" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:74132">
            Ripristina la versione 6
          </p>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] not-italic relative shrink-0 text-[#f5f1e8] text-[22px] w-full" data-node-id="27:74133">
            Creiamo una nuova versione.
          </p>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:74134">
            La versione 6 sarà copiata in una nuova versione 9 e diventerà attiva. Le versioni 7 e 8 resteranno nello storico.
          </p>
          <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col items-start overflow-clip p-[14px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:74135" data-name="Campo">
            <div className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[0px] w-full" data-node-id="27:74136">
              <p className="leading-[1.65] mb-0 text-[#aaa99e] text-[11px]">Nota della nuova versione</p>
              <p className="leading-[1.65] text-[14px]">Ripristino della versione 6</p>
            </div>
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:74137" data-name="Azioni">
            <div className="content-stretch flex h-[46px] items-center justify-center overflow-clip px-[18px] relative rounded-[12px] shrink-0" data-node-id="27:74138" data-name="Azione">
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[199px]" etichetta="Ripristina come versione 9" />
            </div>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Annulla" />
          </div>
        </div>
      </div>
      <div className="h-[720px] overflow-clip relative rounded-[18px] shrink-0 w-full" data-node-id="51:1405" data-name="Conferma · Butta via le modifiche">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[18px] size-full" src={imgPubblicaFinestraDiConferma} />
        <div className="absolute bg-[rgba(0,0,0,0.72)] h-[720px] left-0 top-0 w-[1344px]" data-node-id="51:1406" data-name="Rectangle" />
        <div className="absolute bg-[#1a1b19] border border-[#474a42] border-solid content-stretch flex flex-col gap-[18px] items-start left-[392px] overflow-clip p-[24px] rounded-[18px] top-[265.5px] w-[560px]" data-node-id="51:1397" data-name="Filmzy/Dialogo/Conferma distruttiva">
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[22px] w-[min-content]" data-node-id="I51:1397;51:1369">
            Buttare via le modifiche?
          </p>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[#b2b2a8] text-[14px] w-[min-content]" data-node-id="I51:1397;51:1370">
            Le modifiche non pubblicate verranno eliminate. Resta attiva la configurazione di prima.
          </p>
          <div className="content-stretch flex gap-[12px] items-start overflow-clip relative shrink-0" data-node-id="I51:1397;51:1371" data-name="Azioni di conferma">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[42px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[84px]" etichetta="Annulla" />
            <div className="bg-[#b83e38] border border-[rgba(0,0,0,0)] border-solid content-stretch flex h-[42px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[84px]" data-node-id="I51:1397;51:1374" data-name="Filmzy/Pulsante/Distruttivo/Normale">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] whitespace-nowrap" data-node-id="I51:1397;51:1374;49:2345">
                Butta via le modifiche
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}