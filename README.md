Node.js Websocket Server demo
===================

***Ukážková real-time webová aplikácia pre bakalársku prácu s témou Real-time webové aplikácie. Aplikácia znázorňuje vytvorenie Node.js WebSocket servera v súlade s RFC 6455 bez použitia knižnice.***
	
Jedná sa o veľmi zjednodušenú ukážku, znázorňujúcu odchytenie upgrade eventu v Node.js, priebeh handshakingu klienta so serverom, prijatie dát od klienta a odoslanie dát klientovi.

Dôvodom vzniku tejto aplikácie je poukázanie na komplikovanú obsluhu WebSocket spojenia a prenosu, preto je v aplikácii odporúčané použiť knižnicu riešiacu tieto problémy.
	
*Pozn. Dĺžka odosielaných dát zo serveru je obmedzená na 125 znakov.*
	
***Aplikácia bola testovaná iba v prehliadači Chrome 18, v ostatných verziách a prehliadačoch nemusí fungovať korektne alebo vôbec!***