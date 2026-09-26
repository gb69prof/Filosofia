from pathlib import Path
from html import escape
import textwrap
# Each edge is an explicitly named conceptual relation, never an unlabelled causal arrow.
MAPS={
'problema':('Apparenza e realtà', [['Esperienza del mondo'],['Fenomeno','Cosa in sé'],['Conoscenza condizionata','Ricerca del significato']],[(0,1,'si presenta come'),(0,2,'pone il problema della'),(1,3,'dipende dalle forme'),(2,4,'non è un oggetto nascosto')]),
'rappresentazione':('Mondo come rappresentazione', [['Rappresentazione'],['Soggetto conoscente','Oggetto conosciuto'],['Spazio e tempo','Causalità'],['Individui e successione','Mutamenti collegati']],[(0,1,'presuppone'),(0,2,'presuppone'),(2,3,'appare entro'),(2,4,'è ordinato dalla'),(3,5,'rendono distinguibili'),(4,6,'spiega nel fenomeno')]),
'corpo':('Il corpo: una realtà, due accessi', [['Il proprio corpo'],['Osservato dall’esterno','Vissuto dall’interno'],['Rappresentazione','Volere immediato'],['Chiave interpretativa della natura']],[(0,1,'è conosciuto come'),(0,2,'è conosciuto come'),(1,3,'offre'),(2,4,'rivela'),(3,5,'due aspetti di una realtà'),(4,5,'esteso per analogia')]),
'volonta':('Volontà: essenza e manifestazioni', [['Volontà impersonale'],['Oltre spazio e tempo','Cieca e senza fine ultimo'],['Molteplicità fenomenica','Tendere incessante'],['Natura e vita individuale']],[(0,1,'non è individuata'),(0,2,'non progetta'),(1,3,'si manifesta nella'),(2,4,'si esprime come'),(3,5,'comprende'),(4,5,'attraversa')]),
'individuazione':('Dall’individuazione al conflitto', [['Unica Volontà'],['Spazio e tempo','Impulso ad affermarsi'],['Individui distinti','Interessi concorrenti'],['Conflitto fra manifestazioni']],[(0,1,'appare attraverso'),(0,2,'si esprime come'),(1,3,'individuano'),(2,4,'assume la forma di'),(3,5,'si contrappongono'),(4,5,'alimentano')]),
'desiderio':('Desiderio, dolore e noia', [['Desiderio e mancanza'],['Sofferenza della tensione','Soddisfazione particolare'],['Sollievo temporaneo','Noia: vuoto di scopi'],['Nuovo desiderio']],[(0,1,'comportano'),(0,2,'cercano'),(2,3,'offre'),(3,4,'può lasciare posto a'),(3,5,'non impedisce'),(4,5,'può sollecitare'),(5,0,'riapre il ciclo')]),
'pessimismo':('I livelli della sofferenza', [['Volere senza compimento'],['Esperienza individuale','Conflitto nella natura'],['Dolore, perdita e noia','Nessuna garanzia provvidenziale'],['Pessimismo metafisico']],[(0,1,'si manifesta nella'),(0,2,'si manifesta nel'),(1,3,'comprende'),(2,4,'non conduce a un premio'),(3,5,'riceve una spiegazione'),(4,5,'esclude una giustificazione')]),
'arte':('La tregua della contemplazione', [['Contemplazione estetica'],['Soggetto senza interesse','Conoscenza delle Idee'],['Tregua dal desiderio','Musica: caso distinto'],['Liberazione temporanea']],[(0,1,'trasforma l’attenzione'),(0,2,'coglie nelle arti'),(1,3,'rende possibile'),(2,4,'non esaurisce la'),(3,5,'costituisce'),(4,5,'esprime la Volontà senza fini personali')]),
'compassione':('Il dolore dell’altro conta', [['Compassione'],['Superamento dell’egoismo','Dolore altrui come motivo'],['Giustizia: non nuocere','Carità: aiutare'],['Unità oltre l’individuazione']],[(0,1,'comporta'),(0,2,'riconosce'),(1,3,'si traduce nella'),(2,4,'si traduce nella'),(3,5,'esprime sul piano morale'),(4,5,'esprime sul piano morale')]),
'ascesi':('Negare il volere: le distinzioni', [['Conoscenza del dolore universale'],['Quietivo del volere','Suicidio: rifiuto di una vita'],['Ascesi e distacco','Persistenza del volere'],['Negazione dell’affermazione']],[(0,1,'può diventare'),(1,2,'si distingue da'),(1,3,'si manifesta come'),(2,4,'secondo Schopenhauer lascia'),(3,5,'tende alla')]),
'conclusione':('Schopenhauer: il sistema', [['Una realtà, due aspetti'],['Rappresentazione','Volontà'],['Conflitto, desiderio e sofferenza'],['Arte: tregua','Compassione: cura','Ascesi: negazione']],[(0,1,'conosciuta come'),(0,2,'interpretata come'),(1,3,'individua gli esseri'),(2,3,'spiega il tendere'),(3,4,'sospensione estetica'),(3,5,'risposta non egoistica'),(3,6,'distacco radicale')]),
'mondo-uomo':('Un mondo non fatto per noi', [['Crisi dell’antropocentrismo'],['Foscolo','Schopenhauer','Leopardi'],['Materia che si trasforma','Volontà impersonale','Natura indifferente'],['Problema comune, fondamenti diversi']],[(0,1,'interrogata da'),(0,2,'interrogata da'),(0,3,'interrogata da'),(1,4,'pensa la finitezza nella'),(2,5,'individua come fondamento'),(3,6,'rappresenta come'),(4,7,'non coincide con gli altri'),(5,7,'non è materialismo'),(6,7,'non è la cosa in sé')]),
'motore-uomo':('Le forme del desiderare', [['Che cosa muove l’uomo?'],['Foscolo','Schopenhauer','Leopardi'],['Passioni e illusioni','Manifestazioni del volere','Desiderio illimitato di piacere'],['Verga: bisogno e ascesa — futuro']],[(0,1,'domanda rivolta a'),(0,2,'domanda rivolta a'),(0,3,'domanda rivolta a'),(1,4,'valorizza'),(2,5,'interpreta gli atti come'),(3,6,'analizza'),(5,7,'analogia da verificare, non influenza')]),
'sofferenza':('Spiegare il dolore senza confondere', [['Sofferenza umana'],['Foscolo','Schopenhauer','Leopardi'],['Perdita e finitezza','Mancanza e volere','Piaceri finiti e vulnerabilità'],['Verga: vincoli sociali — futuro']],[(0,1,'interroga'),(0,2,'interroga'),(0,3,'interroga'),(1,4,'dà forma a'),(2,5,'spiega attraverso'),(3,6,'indaga'),(5,7,'confronto fra livelli diversi')]),
'salvezza':('Vie di liberazione e risposte umane', [['Come vivere senza garanzia?'],['Foscolo','Schopenhauer','Leopardi'],['Memoria, affetti, poesia','Arte, compassione, ascesi','Conoscenza e social catena'],['Significato umano','Distacco dal volere','Solidarietà fra finiti']],[(0,1,'risponde'),(0,2,'risponde'),(0,3,'risponde'),(1,4,'costruisce'),(2,5,'distingue'),(3,6,'connette'),(4,7,'produce'),(5,8,'approfondisce'),(6,9,'rende possibile')]),
'confronto-finale':('Filosofia e letteratura: differenze', [['Un mondo senza garanzia di felicità'],['Foscolo','Schopenhauer','Leopardi','Verga — sviluppo futuro'],['Significati e memoria','Tregua, cura, negazione','Vero e solidarietà','Bisogno, roba, conflitto sociale']],[(0,1,'problema comune'),(0,2,'problema comune'),(0,3,'problema comune'),(0,4,'analogia da verificare'),(1,5,'costruisce'),(2,6,'distingue'),(3,7,'connette'),(4,8,'temi per la lettura')])
}

def svg_map(slug,title,layers,edges):
 W=1500 if max(map(len,layers))>3 else 1020; H=150+len(layers)*205; coords={}; nodes=[]; i=0
 for row,layer in enumerate(layers):
  for col,label in enumerate(layer):
   x=W*(col+1)/(len(layer)+1); y=125+row*205; coords[i]=(x,y); nodes.append((i,x,y,label)); i+=1
 out=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-labelledby="t d"><title id="t">{escape(title)}</title><desc id="d">Mappa con relazioni etichettate. La versione testuale completa è disponibile sotto l’immagine nella lezione.</desc><defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#6b6152"/></marker></defs><rect width="100%" height="100%" fill="#f8f4ec"/><text x="35" y="43" fill="#264942" font-size="26" font-family="Georgia,serif">{escape(title)}</text>']
 for a,b,label in edges:
  x1,y1=coords[a];x2,y2=coords[b]
  if y1==y2:
   sx=x1+126;ex=x2-126; sy=ey=y1; mx=(sx+ex)/2;my=y1-88; path=f'M{sx} {sy}L{ex} {ey}'
  elif y2<y1:
   sx=x1-125; sy=y1; ex=x2-125;ey=y2;mx=70;my=(y1+y2)/2;path=f'M{sx} {sy}H65V{ey}H{ex}'
  else:
   sx=x1;sy=y1+42;ex=x2;ey=y2-42;t=.2 if sum(1 for _,target,_ in edges if target==b)>1 else .8;mx=x1*(1-t)+x2*t;my=y1+100 if t==.2 else y2-95;path=f'M{sx} {sy}L{ex} {ey}'
  out.append(f'<path d="{path}" fill="none" stroke="#6b6152" stroke-width="2" marker-end="url(#a)"/>')
  for j,line in enumerate(textwrap.wrap(label,18)):
   yy=my+j*20; width=len(line)*9+12
   out.append(f'<rect x="{mx-width/2}" y="{yy-15}" width="{width}" height="20" fill="#f8f4ec"/><text x="{mx}" y="{yy}" text-anchor="middle" fill="#584c3d" font-size="17" font-family="Arial,sans-serif">{escape(line)}</text>')
 for n,x,y,label in nodes:
  future='futuro' in label; dark=n==0
  out.append(f'<rect x="{x-126}" y="{y-42}" width="252" height="84" rx="9" fill="{"#264942" if dark else "#fffdf8"}" stroke="#74827a" stroke-width="2" {"stroke-dasharray=\"7 4\"" if future else ""}/>')
  lines=textwrap.wrap(label,20)
  for j,line in enumerate(lines): out.append(f'<text x="{x}" y="{y-(len(lines)-1)*12+j*24+6}" text-anchor="middle" fill="{"#ffffff" if dark else "#243630"}" font-family="Arial,sans-serif" font-size="21">{escape(line)}</text>')
 out.append(f'<text x="35" y="{H-25}" font-size="16" font-family="Arial,sans-serif" fill="#584c3d">gbprof · Schopenhauer · Frecce = relazioni dichiarate, non sempre cause</text></svg>')
 return ''.join(out)

def make_maps(root):
 for slug,(title,layers,edges) in MAPS.items(): (root/'assets'/f'mappa-{slug}.svg').write_text(svg_map(slug,title,layers,edges))

def map_text(slug):
 title,layers,edges=MAPS[slug]; labels=sum(layers,[])
 return '<ul>'+''.join(f'<li>{escape(labels[a])} <em>{escape(rel)}</em> {escape(labels[b])}.</li>' for a,b,rel in edges)+'</ul>'
