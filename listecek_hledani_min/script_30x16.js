document.addEventListener("DOMContentLoaded", () => { // Javascript se spustí až se kompletně načte HTML dokument.
  // základní parametry
  const kontejner = document.querySelector(".kontejner"); // Oblast, ve které se hra nachází.
  let šířka = 30;
  let výška = 16;
  let množstvíMin = 99;
  let množstvíVlaječek = 0;
  let čtverce = []; // množina všech hracích políček(čtverců)
  let jeKonecHry = false;
  let shoda = 0; // proměnná pro zjištění výhry

  // parametry pro ukazatel počtu min
  let množstvíMinUkazatele = množstvíMin;
  const ukazatel = document.getElementById("ukazatel-počtu-min");

  // parametry pro časovač
  let celkovéSekundy = 0;
  const časovač = document.getElementById("časovač");
  let jeSpuštěnČasovač = false;

  let prvníKliknutí = false; // proměnná prvního kliknutí

  // V této funkci se tvoří hrací pole.
  function vytvářeníHracíhoPole() {
    const množinaMin = Array(množstvíMin).fill("mina"); // množina všech min
    const množinaBezpečnýchPolíček = Array(šířka * výška - množstvíMin).fill("bezpečí"); // množina všech bezpečných políček
    const sjednocenáMnožina = množinaMin.concat(množinaBezpečnýchPolíček); // sjednocení předchozích množin
    const zamíchanáMnožina = sjednocenáMnožina.sort(() => Math.random() - 0.5) // náhodné zamíchání prvků sjednocené množiny

    // Tato smyčka zaplní hrací pole jednotlivými čtverci.
    for (let i = 0; i < šířka * výška; i++) { // Smyčka se bude opakovat, dokud se nesplní daná podmínka i < šířka * výška.
      const čtverec = document.createElement("div"); // vytváření HTML elementů pro jednotlivé čtverce
      čtverec.setAttribute("id", i); // Každý čtverec má rozdílné identifikační číslo.  
      čtverec.classList.add(zamíchanáMnožina[i]); // Čtverce se rozliší na miny a bezpečná políčka podle sjednocené množiny.
      kontejner.appendChild(čtverec); // Čtverce se vloží do hracího pole.
      čtverce.push(čtverec); // Čtverce se vloží do množiny všech čtverců.

      čtverec.addEventListener("click", e => { // Na čtverce lze kliknout a po kliknutí levého tlačítka se spustí následující funkce.
        click(čtverec);
      });

      čtverec.oncontextmenu = e => { // Při kliknutí na čtverec pravým tlačítkem myši se spustí funckce vložitVlaječku().
        e.preventDefault(); // Při pravém kliknutí na čtverec se neobjeví kontext menu.
        vložitVlaječku(čtverec);
      }
    }

    čtverce[0].classList.add("první-čtverec"); // oprava závady
    
    kontejner.oncontextmenu = e => {
      e.preventDefault(); // Při pravém kliknutí na hrací pole se neobjeví kontext menu.
    }

    // Smyčka pro zjištění množství okolních min pro jednotlivé čtverce.
    for (let i = 0; i < čtverce.length; i++) {
      let celek = 0; // promměná pro počet okolních min
      const leváStrana = i % šířka === 0; // Pokud je čtverec na levé strané hracího pole je hodnota promměné true.
      const praváStrana = i % šířka === šířka - 1; // Pokud je čtverec na pravé strané hracího pole je hodnota promměné true.

      if (čtverce[i].classList.contains("bezpečí")) { // Pokud je čtverec bezpečné políčko, tak zjišťujeme, kolik má okolních min. 
        if (i > šířka - 1 && čtverce[i - šířka].classList.contains("mina")) { // sever
          celek++;
        }
        if (i > šířka - 1 && !praváStrana && čtverce[i + 1 - šířka].classList.contains("mina")) { // severovýchod
          celek++;
        }
        if (i < šířka * výška - 1 && !praváStrana && čtverce[i + 1].classList.contains("mina")) { // východ
          celek++;
        }
        if (i < šířka * výška - šířka && !praváStrana && čtverce[i + 1 + šířka].classList.contains("mina")) { // jihovýchod
          celek++;
        }
        if (i < šířka * výška - šířka && čtverce[i + šířka].classList.contains("mina")) { // jih
          celek++;
        }
        if (i < šířka * výška - šířka && !leváStrana && čtverce[i - 1 + šířka].classList.contains("mina")) { // jihozápad
          celek++;
        }
        if (i > 0 && !leváStrana && čtverce[i - 1].classList.contains("mina")) { // západ
          celek++;
        }
        if (i > šířka - 1 && !leváStrana && čtverce[i - 1 - šířka].classList.contains("mina")) { // severozápad
          celek++;
        }
        čtverce[i].setAttribute("data", celek); // Čtverci se přiřadí atribut, který určuje počet okolních min.
      }
    }
  }
  
  vytvářeníHracíhoPole(); // Funkci jednout vyvoláme, aby se vytvořilo hrací pole.
  let spouštěčČasovače = setInterval(aktualizaceČasovače, 1000); // spuštění časovače
  let ukazatelMin = setInterval(aktualizaceUkazatele, 10); // spuštění ukazatele min
  let jeVýhra = setInterval(výhra, 10); // spuštění funkce sledující zda nastala výhra

  // Tato funkce buď vlaječku přidá nebo odebere.
  function vložitVlaječku(čtverec) {
    if (jeKonecHry) { // Pokud skončila hra, tak funkce neproběhne.
      return;
    }
    if (!čtverec.classList.contains("ověřeno") && (množstvíVlaječek - 1 < množstvíMin)) { /* Pokud je čtverec již ověřen, 
      tak do něj nelze vkládat vlaječku. */
      if (!čtverec.classList.contains("vlaječka")) { // Pokud čtverec vlaječku nemá, tak ji do něj čtverce vložíme.
        čtverec.classList.add("vlaječka");
        množstvíVlaječek++; // zvětší se množství vlaječek
        množstvíMinUkazatele--; // zmenší se množství ukazatele min
      } else { // Pokud čtverec vlaječku má, tak ji odebereme.
        čtverec.classList.remove("vlaječka");
        množstvíVlaječek--; // zmenší se množství vlaječek
        množstvíMinUkazatele++; // zvětší se množství ukazatele min
      }
    }
    if (!čtverec.classList.contains("ověřeno") && (množstvíVlaječek - 1 === množstvíMin)) { // oprava závady
      if (čtverec.classList.contains("vlaječka")) {
        čtverec.classList.remove("vlaječka");
        množstvíVlaječek--;
        množstvíMinUkazatele++;
      }
    }
  }

  // Tato funkce určuje, co se stane, pokud se klikne na čtverec.
  function click(čtverec) {
    jeSpuštěnČasovač = true; // spustí se časovač
    let aktuálníId = čtverec.getAttribute("id");
    if (jeKonecHry) { // Pokud je konec hry, tak odcházíme z funkce.
      return;
    }
    if (čtverec.classList.contains("ověřeno") || čtverec.classList.contains("vlaječka")) { /* Pokud je čtverec už ověřen 
      nebo je označen vlaječkou, tak odcházíme z funkce. */
      return;
    }
    // První kliknutí nesmí být mina.
    if (čtverec.classList.contains("mina") && (prvníKliknutí === false)) {
      prvníKliknutí = true; // Tento blok kódu platí jen pro první kliknutí.
      čtverec.classList.remove("mina"); // odstanění miny
      čtverec.classList.add("bezpečí"); // nahrazení bezpečným políčkem

      for (let i = 0; i < čtverce.length; i++) { // Vložíme minu na jiné místo počínaje prvním čtvercem.
        if (čtverce[i].classList.contains("bezpečí")) { // Pokud je políčko bezpečné, tak do něj vložíme minu.
          if (čtverec.classList.contains("první-čtverec")) { /* Pokud klikneme na první čtverec a obsahuje minu, 
            tak přeskočíme jedno kolo smyčky. */
            čtverec.classList.remove("první-čtverec")
            continue;
          }
          čtverce[i].classList.remove("bezpečí"); // odstanění bezpečného políčka
          čtverce[i].classList.add("mina"); // nahrazení minou
          break; // konec smyčky
        }
      }

      čtverce[0].classList.remove("první-čtverec"); // odstanění třídy první-čtverec z estetických důvodů

      for (let i = 0; i < čtverce.length; i++) { // smyčka pro rekonfiguraci počtů okolních min
        let celek = 0; // promměná pro počet okolních min
        const leváStrana = i % šířka === 0; // Pokud je čtverec na levé strané hracího pole je hodnota promměné true.
        const praváStrana = i % šířka === šířka - 1; // Pokud je čtverec na pravé strané hracího pole je hodnota promměné true.
  
        if (čtverce[i].classList.contains("bezpečí")) { // opětné určení okolních min
          if (i > šířka - 1 && čtverce[i - šířka].classList.contains("mina")) { // sever
            celek++;
          }
          if (i > šířka - 1 && !praváStrana && čtverce[i + 1 - šířka].classList.contains("mina")) { // severovýchod
            celek++;
          }
          if (i < šířka * výška - 1 && !praváStrana && čtverce[i + 1].classList.contains("mina")) { // východ
            celek++;
          }
          if (i < šířka * výška - šířka && !praváStrana && čtverce[i + 1 + šířka].classList.contains("mina")) { // jihovýchod
            celek++;
          }
          if (i < šířka * výška - šířka && čtverce[i + šířka].classList.contains("mina")) { // jih
            celek++;
          }
          if (i < šířka * výška - šířka && !leváStrana && čtverce[i - 1 + šířka].classList.contains("mina")) { // jihozápad
            celek++;
          }
          if (i > 0 && !leváStrana && čtverce[i - 1].classList.contains("mina")) { // západ
            celek++;
          }
          if (i > šířka - 1 && !leváStrana && čtverce[i - 1 - šířka].classList.contains("mina")) { // severozápad
            celek++;
          }
          čtverce[i].setAttribute("data", celek); // opětné přiřazení počtu okolních min
        }
      }
    }
    if (čtverec.classList.contains("mina")) { // Pokud klikneme na čtverec, který obsahuje minu, tak končí hra.
      prohra(čtverec);
    } else {
      čtverce[0].classList.remove("první-čtverec");  // odstanění třídy první-čtverec z estetických důvodů
      prvníKliknutí = true;
      let početOkolníchMin = čtverec.getAttribute("data");
      if (početOkolníchMin != 0) { // Pokud klikneme na bezpečné políčko, tak se v něm zobrazí počet okolních min.
        čtverec.classList.add("ověřeno"); // čtverec je ověřen
        čtverec.innerHTML = početOkolníchMin;
        return;
      }
      ověřitČtverec(aktuálníId); /* Pokud okolo sebe nemá čtverec žádné miny, 
      tak je automaticky ověřen a je automaticky kliknuto na okolní čtverce.*/
    }
    čtverec.classList.add("ověřeno"); // čtverec je ověřen
  }

  function ověřitČtverec(aktuálníId) { /* Pokud okolo sebe nemá čtverec žádné miny, 
    tak je automaticky ověřen a postupně se ověří také okolní čtverce.*/
    const leváStrana = aktuálníId % šířka === 0; // Pokud je čtverec na levé strané hracího pole je hodnota promměné true.
    const praváStrana = aktuálníId % šířka === šířka - 1; // Pokud je čtverec na levé strané hracího pole je hodnota promměné true.

    setTimeout(() => {
      if (aktuálníId > šířka - 1) {
        const novéId = čtverce[parseInt(aktuálníId) - šířka].getAttribute("id"); //sever
        const novýČtverec = document.getElementById(novéId);
        click(novýČtverec);
      }
      if (aktuálníId > šířka - 1 && !praváStrana) {
        const novéId = čtverce[parseInt(aktuálníId) + 1 - šířka].getAttribute("id"); //severovýchod
        const novýČtverec = document.getElementById(novéId);
        click(novýČtverec);
      }
      if (aktuálníId < šířka * výška - 1 && !praváStrana) {
        const novéId = čtverce[parseInt(aktuálníId) + 1].getAttribute("id"); //východ
        const novýČtverec = document.getElementById(novéId);
        click(novýČtverec);
      }
      if (aktuálníId < šířka * výška - šířka && !praváStrana) {
        const novéId = čtverce[parseInt(aktuálníId) + 1 + šířka].getAttribute("id"); //jihovýchod
        const novýČtverec = document.getElementById(novéId);
        click(novýČtverec);
      }
      if (aktuálníId < šířka * výška - šířka) {
        const novéId = čtverce[parseInt(aktuálníId) + šířka].getAttribute("id"); //jih
        const novýČtverec = document.getElementById(novéId);
        click(novýČtverec);
      }
      if (aktuálníId < šířka * výška - šířka && !leváStrana) {
        const novéId = čtverce[parseInt(aktuálníId) - 1 + šířka].getAttribute("id"); //jihozápad
        const novýČtverec = document.getElementById(novéId);
        click(novýČtverec);
      }
      if (aktuálníId > 0 && !leváStrana) {
        const novéId = čtverce[parseInt(aktuálníId) - 1].getAttribute("id"); //západ
        const novýČtverec = document.getElementById(novéId);
        click(novýČtverec);
      }
      if (aktuálníId > šířka - 1 && !leváStrana) {
        const novéId = čtverce[parseInt(aktuálníId) - 1 - šířka].getAttribute("id"); //severozápad
        const novýČtverec = document.getElementById(novéId);
        click(novýČtverec);
      }
    }, 10)
  }

  // Tato funkce popisuje, co se stane pokud hra zkončí výbuchem miny.
  function prohra(čtverec) {
    alert("Konec hry"); // Objeví se upozornění s textem "Konec hry".
    jeKonecHry = true;
    clearInterval(spouštěčČasovače); // Zastaví se časovač.
    množstvíMinUkazatele = "RIP"; // V ukazateli počtu min se ukáže následující text.
    čtverec.classList.add("zašlápnutá-mina"); // přiřazení třídy zašlápnutá-mina
    čtverce.forEach(čtverec => { // Každý čtverec, který obsahuje minu je automaticky ověřen. Miny jsou viditelné.
      if (čtverec.classList.contains("mina")) {
        čtverec.classList.add("viditelná-mina");
        čtverec.classList.add("ověřeno");
      }
      if (čtverec.classList.contains("bezpečí")) { // Každý bezpečný čtverec je automaticky ověřen.
        if (čtverec.classList.contains("bezpečí") && čtverec.classList.contains("vlaječka")) {
          čtverec.classList.remove("vlaječka"); // Pokud je ve čtverci chybně vložená vlaječka, tak je automaticky odstraněna.
        }
        let data = čtverec.getAttribute("data"); // Ve čtverci se zobrazí počet okolních min.
        čtverec.classList.add("ověřeno");
        čtverec.innerHTML = data;
        clearInterval(jeVýhra); // Kód už nezjišťuje pokud je výhra.
      }
    });
    setTimeout(() => clearInterval(ukazatelMin), 100); // Zastaví se aktualizace ukazatele počtu min.
  }

  function výhra() {
    shoda = 0; // proměnná pro zjištění výhry
    for (let i = 0; i < čtverce.length; i++) { /* Tato smyčka zjišťuje, jestli jsou všechna bezpečná políčka ověřena. */
      if (čtverce[i].classList.contains("bezpečí") && čtverce[i].classList.contains("ověřeno")) {
        shoda++; // Pokud je políčko ověřeno, tak se hodnota proměnné shoda zvětší o 1.
      }
      if (čtverce.length - množstvíMin === shoda) { /* Když jsou všechna políčka ověřena, 
        tak jsou všechny miny automaticky označeny vlaječkou. */
        čtverce.forEach(čtverec => {
          if (čtverec.classList.contains("mina")) {
            if (!čtverec.classList.contains("vlaječka")) {
              čtverec.classList.add("vlaječka");
            }
          }
        });
        alert("Výborně"); // Objeví se upozornění s textem "Výborně".
        množstvíMinUkazatele = 0; // Na ukazateli počtu min se zobrazí číslo 0.
        jeKonecHry = true; // Nastane konec hry.
        clearInterval(spouštěčČasovače); // Zastaví se časovač.
        clearInterval(jeVýhra); // Kód už nezjišťuje pokud je výhra, jelikož výhra již nastala.
        setTimeout(() => clearInterval(ukazatelMin), 100); // Po 100 milisekundách se zastaví ukazatel počtu min.
      }
    }
  }

  function aktualizaceČasovače() { // Tato funkce aktualizuje časovač.
    if (jeSpuštěnČasovač === true) { // Po prvním kliknutí se spustí časovač.
      celkovéSekundy++; // Každou sekudnu se následující proměnná zvětší o 1. 
      let minuty = Math.floor(celkovéSekundy / 60); // Z celkových sekund vypočítáme počet minut.
      let sekundy = celkovéSekundy - minuty * 60; // Z celkových sekund vypočítáme počet sekund.
      if (minuty < 10) { // Pokud je minut méně ndž 10, tak se před ně přidá 0.
        minuty = "0" + minuty; 
      }
      if (sekundy < 10) { // Pokud je sekund méně ndž 10, tak se před ně přidá 0.
        sekundy = "0" + sekundy;
      }
      if (minuty > 59) { // Pokud je hra delší na 1 hodina, tak se časovač vynuluje.
        celkovéSekundy = 0;
        alert("Časovač přesáhl 1 hodinu a vynuloval se.")
      }
      časovač.innerHTML = minuty + ":" + sekundy; // Každou sekundu se časovač aktualizuje.
    }
  }

  function aktualizaceUkazatele() { // V ukazateli počtu min se zobrazuje počet zbývajících neoznačených min.
    ukazatel.innerHTML = množstvíMinUkazatele;
  }

})