wymagania co do dockera

aplikacja powinna zawierac wszystko do debugowania, czyli api, postgres i pgAdmin

- powinna miec fresh start, - czyli przygotowuje wszystko od zera do gotowej pracy nad projektem
- powinna miec fresh e2e - czyli oddzielna baze danych na ktorej wykonaja sie wszystkie testy e2e
- przy testach e2e, baza danych powinna byc resetowany za kazdym wruchomieniem tesetow

fresh - start

"setupFilesAfterEnv": [
"./test/setupTests.e2e.ts"
],
