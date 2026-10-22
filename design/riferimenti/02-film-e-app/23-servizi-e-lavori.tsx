const imgConfermaDelTettoFinestraSovrapposta = "https://www.figma.com/api/mcp/asset/59576df1-be1d-415b-882e-e8305c621243.png";
const imgCursore = "https://www.figma.com/api/mcp/asset/51302d8c-aacf-429e-a616-4934a7d45f31.svg";
const imgCursore1 = "https://www.figma.com/api/mcp/asset/9c40b125-f55b-4a01-b281-55b96358fe87.svg";

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

export default function ServiziELavori() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col gap-[32px] items-start p-[48px] relative size-full" data-node-id="27:73457" data-name="Servizi e lavori">
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73458" data-name="Introduction">
        <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-full" data-node-id="27:73459">
          FILMZY · STATI DELL’INTERFACCIA
        </p>
        <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:73460">
          Servizi e lavori
        </p>
        <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:73461">
          Scelte esplicite, costi leggibili e lavori che puoi sempre tenere d’occhio.
        </p>
      </div>
      <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73462" data-name="Stati separati">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73463" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73464">
            Lavori · Menu aperto
          </p>
          <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[110px]" data-node-id="27:73465">
            ◌ 2 lavori in corso
          </p>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73466" data-name="Pannello">
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73467" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[51px]" data-node-id="27:73468">
                In corso
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:73469">
              Inquadratura 3 · video
            </p>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:73470">
              fal.ai · Kling · Standard · Stima 0,42 $
            </p>
            <div className="bg-[#34362e] content-stretch flex h-[4px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:73471" data-name="Avanzamento">
              <div className="absolute bg-[#f5b544] h-[4px] left-0 right-[36%] rounded-[4px] top-0" data-node-id="27:73472" data-name="Completato" />
            </div>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Annulla" />
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73474" data-name="Pannello">
            <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[54px]" data-node-id="27:73475">
              In attesa
            </p>
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[min-content]" data-node-id="27:73476">
              Scheda di Anna · immagine
            </p>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:73477">
              OpenAI · GPT Image 1 · Stima 0,05 $
            </p>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Annulla" />
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:73479">
            I lavori continuano anche se chiudi l’app: riprendono alla riapertura.
          </p>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73480" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:73481">
            Nessun lavoro in corso
          </p>
          <div className="bg-[#22231f] content-stretch flex gap-[12px] items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:73482" data-name="Barra del film a riposo">
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73483" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[127px]" data-node-id="27:73484">
                Questo film: 12,40 $
              </p>
            </div>
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[75px]" data-node-id="27:73485">
              <p className="leading-[normal]">Impostazioni</p>
            </div>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:73486">
            Tutto pronto per la prossima ripresa.
          </p>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73487" data-name="Azioni">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[163px]" etichetta="Genera · circa 0,42 $" />
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
          </div>
          <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:73491" data-name="Separatore" />
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:73492">
            La barra a riposo mostra solo le informazioni del film.
          </p>
        </div>
      </div>
      <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73493" data-name="Stati separati">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73494" data-name="Pannello">
          <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73496" data-name="Azioni">
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73497" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[101px]" data-node-id="27:73498">
                fal.ai · Collegato
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[128px]" data-node-id="27:73499">
              Replicate · Collegato
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:73500">
            Fornitore predefinito: fal.ai
          </p>
          <div className="bg-[#22231f] border border-[#34362e] border-solid content-stretch flex flex-col gap-[10px] items-start overflow-clip p-[18px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:73501" data-name="Modello disponibile">
            <div className="[word-break:break-word] content-stretch flex items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 text-[13px] w-full" data-node-id="27:73502" data-name="Nome e prezzo">
              <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] w-[100px]" data-node-id="27:73503">
                Kling · Standard
              </p>
              <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#f5b544] w-[71px]" data-node-id="27:73504">
                circa 1,20 $
              </p>
            </div>
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73505" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[70px]" data-node-id="27:73506">
                Predefinito
              </p>
            </div>
            <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular'] font-normal items-start justify-between leading-[normal] not-italic overflow-clip relative shrink-0 text-[13px] w-full" data-node-id="27:73507" data-name="Voto delle prove">
              <p className="relative shrink-0 text-[#aaa99e] w-[100px]" data-node-id="27:73508">
                Voto delle prove
              </p>
              <p className="relative shrink-0 text-[#f5b544] w-[60px]" data-node-id="27:73509">
                ●●●●○
              </p>
            </div>
          </div>
          <div className="[word-break:break-word] bg-[#352b19] border border-[#f5b544] border-solid content-stretch flex flex-col gap-[10px] items-start leading-[normal] not-italic overflow-clip p-[18px] relative rounded-[12px] shrink-0 text-[13px] w-full" data-node-id="27:73510" data-name="Modello disponibile">
            <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:73511" data-name="Nome e prezzo">
              <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] w-[131px]" data-node-id="27:73512">
                ✓ Seedance · Veloce
              </p>
              <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#f5b544] w-[73px]" data-node-id="27:73513">
                circa 0,90 $
              </p>
            </div>
            <div className="content-stretch flex font-['Inter:Regular'] font-normal items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="27:73514" data-name="Voto delle prove">
              <p className="relative shrink-0 text-[#aaa99e] w-[100px]" data-node-id="27:73515">
                Voto delle prove
              </p>
              <p className="relative shrink-0 text-[#f5b544] w-[60px]" data-node-id="27:73516">
                ●●●●○
              </p>
            </div>
          </div>
          <div className="[word-break:break-word] bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start leading-[1.55] not-italic overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73517" data-name="Pannello">
            <p className="font-['Inter:Semi_Bold'] font-semibold relative shrink-0 text-[#f5f1e8] text-[14px] w-full" data-node-id="27:73518">
              Veo 3 · Con audio
            </p>
            <p className="font-['Inter:Regular'] font-normal relative shrink-0 text-[#aaa99e] text-[13px] w-full" data-node-id="27:73519">
              Non ancora provato
            </p>
          </div>
          <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[163px]" etichetta="Genera · circa 0,90 $" />
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:73522">
            Nessun cambio automatico di servizio se qualcosa va storto.
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[24px] items-start min-w-px overflow-clip relative" data-node-id="27:73523" data-name="Altre combinazioni">
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73524" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73525">
              Audio sempre incluso
            </p>
            <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[36px]" data-node-id="27:73526">
              Veo 3
            </p>
            <div className="content-stretch flex gap-[20px] items-center opacity-50 overflow-clip relative shrink-0 w-full" data-node-id="27:73527" data-name="Interruttore">
              <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:73528">
                <span className="font-['Inter:Semi_Bold'] font-semibold leading-[1.55] text-[14px]">Genera anche l’audio</span>
                <span className="leading-[1.55] text-[#aaa99e] text-[11px]">{` · Attivo`}</span>
              </p>
              <div className="h-[24px] relative shrink-0 w-[40px]" data-node-id="27:73529" data-name="Cursore">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCursore} />
              </div>
            </div>
            <div className="content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:73531" data-name="Avviso">
              <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:73532">
                Questo servizio genera sempre l’audio
              </p>
            </div>
            <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73533" data-name="Azioni">
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[160px]" etichetta="Genera · circa 1,20 $" />
              <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73537" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73538">
              Nessuna combinazione disponibile
            </p>
            <div className="content-stretch flex items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="27:73539" data-name="Avviso">
              <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[1.55] min-w-px not-italic relative text-[#f5f1e8] text-[14px]" data-node-id="27:73540">
                Nessun servizio disponibile per questa combinazione: prova a usare l’immagine come ispirazione
              </p>
            </div>
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[135px]" etichetta="Gestisci i servizi" />
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[13px] w-[124px]" data-node-id="27:73542">
              <p className="leading-[normal]">Usa come ispirazione</p>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73543" data-name="Stati separati">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73544" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73545">
            Cambia servizio · Audio spento
          </p>
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73546" data-name="Indicatore">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[100px]" data-node-id="27:73547">
              Kling · Standard
            </p>
          </div>
          <div className="content-stretch flex gap-[20px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73548" data-name="Interruttore">
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:73549">
              <span className="font-['Inter:Semi_Bold'] font-semibold leading-[1.55] text-[14px]">Genera anche l’audio</span>
              <span className="leading-[1.55] text-[#aaa99e] text-[11px]">{` · Spento`}</span>
            </p>
            <div className="h-[24px] relative shrink-0 w-[40px]" data-node-id="27:73550" data-name="Cursore">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCursore1} />
            </div>
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73552" data-name="Azioni">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[163px]" etichetta="Genera · circa 0,42 $" />
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:73556">
            Costa di più su alcuni servizi e la voce cambia da una clip all’altra. Puoi sempre spegnerlo nel montaggio.
          </p>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73557" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73558">
            Cambia servizio · Audio attivo
          </p>
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73559" data-name="Indicatore">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[100px]" data-node-id="27:73560">
              Kling · Standard
            </p>
          </div>
          <div className="content-stretch flex gap-[20px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73561" data-name="Interruttore">
            <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular'] font-normal leading-[0] min-w-px not-italic relative text-[#f5f1e8] text-[0px]" data-node-id="27:73562">
              <span className="font-['Inter:Semi_Bold'] font-semibold leading-[1.55] text-[14px]">Genera anche l’audio</span>
              <span className="leading-[1.55] text-[#aaa99e] text-[11px]">{` · Attivo`}</span>
            </p>
            <div className="h-[24px] relative shrink-0 w-[40px]" data-node-id="27:73563" data-name="Cursore">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCursore} />
            </div>
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73565" data-name="Azioni">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[163px]" etichetta="Genera · circa 0,56 $" />
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[143px]" etichetta="Cambia servizio ⌄" />
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:73569">
            Stessa ripresa, con l’audio incluso nella generazione.
          </p>
        </div>
      </div>
      <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73570" data-name="Stati separati">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73571" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73572">
            Nessun limite impostato
          </p>
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73573" data-name="Indicatore">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[127px]" data-node-id="27:73574">
              Questo film: 12,40 $
            </p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:73575">
            Nessun tetto di spesa per questo film.
          </p>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73576" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73577">
            Limite impostato dall’utente
          </p>
          <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73578" data-name="Indicatore">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[13px] w-[173px]" data-node-id="27:73579">
              Questo film: 12,40 $ di 50 $
            </p>
          </div>
          <div className="bg-[#34362e] content-stretch flex h-[4px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:73580" data-name="Avanzamento">
            <div className="absolute bg-[#f5b544] h-[4px] left-0 right-[75.2%] rounded-[4px] top-0" data-node-id="27:73581" data-name="Completato" />
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[min-content]" data-node-id="27:73582">
            Il tetto è stato scelto da te.
          </p>
        </div>
      </div>
      <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:73593" data-name="Separatore" />
      <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#b2b2a8] text-[13px] w-full" data-node-id="27:73594">
        Filmzy · App desktop gratuita · Salvato sul tuo computer
      </p>
      <div className="h-[720px] overflow-clip relative rounded-[18px] shrink-0 w-full" data-node-id="51:1361" data-name="Conferma del tetto · Finestra sovrapposta">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[18px] size-full" src={imgConfermaDelTettoFinestraSovrapposta} />
        <div className="absolute bg-[rgba(0,0,0,0.72)] h-[720px] left-0 top-0 w-[1344px]" data-node-id="51:1362" data-name="Rectangle" />
        <div className="absolute bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start left-[392px] overflow-clip p-[24px] rounded-[18px] top-[210.5px] w-[560px]" data-node-id="27:73583" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73584">
            Conferma · Limite scelto dall’utente
          </p>
          <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] w-[207px]" data-node-id="27:73585">
            Solo quando hai attivato un limite
          </p>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[24px] w-[min-content]" data-node-id="27:73586">
            Questa generazione costa circa 3,40 $. Il film è a 41 $ su 50 $. Vuoi continuare?
          </p>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:73587">
            Dopo questa generazione, la spesa stimata sarà 44,40 $.
          </p>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73588" data-name="Azioni">
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[90px]" etichetta="Continua" />
            <FilmzyPulsanteSecondarioNormale className="bg-[#22231f] border border-[#77796f] border-solid content-stretch flex h-[40px] items-center justify-center overflow-clip px-[20px] relative rounded-[12px] shrink-0 w-[80px]" etichetta="Annulla" />
            <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold h-[46px] justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[99px]" data-node-id="27:73592">
              <p className="leading-[normal]">Cambia il tetto</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}