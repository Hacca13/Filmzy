const imgCircleCheck = "https://www.figma.com/api/mcp/asset/29e93cf9-b14a-49a1-b303-22912e72889a.svg";
const imgLoaderCircle = "https://www.figma.com/api/mcp/asset/d5cff654-125d-4b47-837a-88dee88bba33.svg";

export default function RiepilogoStati() {
  return (
    <div className="bg-[#111211] content-stretch flex flex-col gap-[32px] items-start p-[48px] relative size-full" data-node-id="27:73263" data-name="Riepilogo · Stati">
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73264" data-name="Introduction">
        <p className="font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[11px] w-full" data-node-id="27:73265">
          FILMZY · STATI DELL’INTERFACCIA
        </p>
        <p className="font-['Manrope:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#f5f1e8] text-[36px] w-full" data-node-id="27:73266">
          Riepilogo · Stati
        </p>
        <p className="font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:73267">
          Dalle ultime scelte alla sceneggiatura finale.
        </p>
      </div>
      <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73268" data-name="Stati separati">
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73269" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73270">
            Storia coerente
          </p>
          <div className="relative shrink-0 size-[40px]" data-node-id="27:74278" data-name="circle-check">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCircleCheck} />
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[25px] w-[min-content]" data-node-id="27:73272">
            Tutto torna: la storia è pronta
          </p>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:73273">
            Marco e Giulia, tre luoghi scelti e sei scene: la bozza rispetta tutte le tue scelte.
          </p>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73274" data-name="Azioni">
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73275" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[11px] whitespace-nowrap" data-node-id="27:73276">
                ✓ 2 personaggi
              </p>
            </div>
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73277" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[11px] whitespace-nowrap" data-node-id="27:73278">
                ✓ 3 luoghi
              </p>
            </div>
          </div>
          <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73279" data-name="Azioni">
            <div className="bg-[#f5b544] border border-[#f5b544] border-solid content-stretch flex h-[46px] items-center justify-center overflow-clip px-[18px] relative rounded-[12px] shrink-0" data-node-id="27:73280" data-name="Azione">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[14px] whitespace-nowrap" data-node-id="27:73281">
                Scrivi la sceneggiatura finale · circa 0,04 $
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[13px] whitespace-nowrap" data-node-id="27:73282">
              Cambia servizio ⌄
            </p>
          </div>
        </div>
        <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73283" data-name="Pannello">
          <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73284">
            Scrittura in corso
          </p>
          <div className="relative shrink-0 size-[36px]" data-node-id="27:74281" data-name="loader-circle">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLoaderCircle} />
          </div>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.55] min-w-full not-italic relative shrink-0 text-[#f5f1e8] text-[23px] w-[min-content]" data-node-id="27:73286">
            Stiamo scrivendo la sceneggiatura finale…
          </p>
          <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:73287">
            Mettiamo insieme la tua storia, i personaggi e i luoghi. Puoi restare qui: salviamo tutto sul tuo computer.
          </p>
          <div className="bg-[#34362e] content-stretch flex h-[4px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-node-id="27:73288" data-name="Avanzamento">
            <div className="absolute bg-[#f5b544] h-[4px] left-0 right-[42%] rounded-[4px] top-0" data-node-id="27:73289" data-name="Completato" />
          </div>
          <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold h-[36px] justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[12px] w-[44px]" data-node-id="27:73290">
            <p className="leading-[normal]">Annulla</p>
          </div>
        </div>
      </div>
      <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative rounded-[18px] shrink-0 w-full" data-node-id="27:73291" data-name="Pannello">
        <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] relative shrink-0 text-[#f5f1e8] text-[21px] w-full" data-node-id="27:73292">
          Quanti personaggi?
        </p>
        <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-full" data-node-id="27:73293">
          Una scelta facoltativa prima di definire la tua piccola troupe di protagonisti.
        </p>
        <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73294" data-name="Azioni">
          <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold'] font-semibold h-[46px] justify-center leading-[0] not-italic relative shrink-0 text-[#f5f1e8] text-[14px] w-[7px]" data-node-id="27:73295">
            <p className="leading-[normal]">1</p>
          </div>
          <div className="bg-[#f5b544] border border-[#f5b544] border-solid content-stretch flex h-[46px] items-center justify-center overflow-clip px-[18px] relative rounded-[12px] shrink-0" data-node-id="27:73296" data-name="Azione">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#201b12] text-[14px] whitespace-nowrap" data-node-id="27:73297">
              2
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[24px] items-start overflow-clip relative shrink-0 w-full" data-node-id="27:73298" data-name="Stati separati">
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73299" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73300">
              Marco
            </p>
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73301" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[11px] whitespace-nowrap" data-node-id="27:73302">
                Protagonista
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:73303">
              32 anni · Il centro della storia
            </p>
            <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73304" data-name="Azioni">
              <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73305" data-name="Indicatore">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[11px] whitespace-nowrap" data-node-id="27:73306">
                  Protagonista
                </p>
              </div>
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[11px] whitespace-nowrap" data-node-id="27:73307">
                Antagonista
              </p>
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[11px] whitespace-nowrap" data-node-id="27:73308">
                Alleato
              </p>
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[11px] whitespace-nowrap" data-node-id="27:73309">
                Mentore
              </p>
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[11px] whitespace-nowrap" data-node-id="27:73310">
                Comprimario
              </p>
            </div>
          </div>
          <div className="bg-[#1a1b19] border border-[#34362e] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip p-[24px] relative rounded-[18px]" data-node-id="27:73311" data-name="Pannello">
            <p className="[word-break:break-word] font-['Manrope:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#f5f1e8] text-[21px] w-[min-content]" data-node-id="27:73312">
              Giulia
            </p>
            <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73313" data-name="Indicatore">
              <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[11px] whitespace-nowrap" data-node-id="27:73314">
                Alleato
              </p>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] min-w-full not-italic relative shrink-0 text-[#aaa99e] text-[14px] w-[min-content]" data-node-id="27:73315">
              30 anni · L’amica che lo rimette in viaggio
            </p>
            <div className="content-center flex flex-wrap gap-[10px] items-center overflow-clip relative shrink-0 w-full" data-node-id="27:73316" data-name="Azioni">
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[11px] whitespace-nowrap" data-node-id="27:73317">
                Protagonista
              </p>
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[11px] whitespace-nowrap" data-node-id="27:73318">
                Antagonista
              </p>
              <div className="bg-[#352b19] content-stretch flex items-start overflow-clip px-[10px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="27:73319" data-name="Indicatore">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5b544] text-[11px] whitespace-nowrap" data-node-id="27:73320">
                  Alleato
                </p>
              </div>
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[11px] whitespace-nowrap" data-node-id="27:73321">
                Mentore
              </p>
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[#aaa99e] text-[11px] whitespace-nowrap" data-node-id="27:73322">
                Comprimario
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#34362e] h-px relative shrink-0 w-full" data-node-id="27:73323" data-name="Separatore" />
      <p className="[word-break:break-word] font-['Inter:Regular'] font-normal leading-[1.55] not-italic relative shrink-0 text-[#77796f] text-[12px] w-full" data-node-id="27:73324">
        Filmzy · App desktop gratuita · Salvato sul tuo computer
      </p>
    </div>
  );
}
