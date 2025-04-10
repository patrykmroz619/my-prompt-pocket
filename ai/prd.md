# Dokument wymagań produktu (PRD) - MyPromptPocket

## 1. Przegląd produktu

MyPromptPocket to aplikacja webowa do zarządzania prywatną biblioteką promptów używanych w komunikacji z modelami sztucznej inteligencji. Aplikacja pozwala użytkownikom na tworzenie, edytowanie, parametryzowanie i organizowanie promptów w efektywny sposób.

Głównym celem produktu jest zapewnienie użytkownikom wygodnego narzędzia do przechowywania i zarządzania własnymi promptami, które mogą być wykorzystywane w różnych kontekstach pracy z modelami językowymi AI.

Aplikacja w wersji MVP będzie dostępna jako rozwiązanie webowe z responsywnym interfejsem, z planami rozwoju w kierunku aplikacji desktopowej w przyszłości.

Docelowi użytkownicy: osoby korzystające z modeli LLM (Large Language Models) w swojej codziennej pracy, w tym profesjonaliści z różnych branż, badacze i naukowcy, twórcy treści, programiści i inżynierowie sztucznej inteligencji oraz entuzjaści AI.

Podstawowe funkcje:

- Tworzenie i zarządzanie biblioteką promptów
- Parametryzacja promptów za pomocą składni {{ parametr }}
- Kategoryzacja promptów za pomocą systemu tagów
- Wyszukiwanie promptów po nazwie
- Wypełnianie wartości parametrów przed kopiowaniem promptów do schowka
- Ulepszanie promptów przy wsparciu AI
- Uwierzytelnianie użytkowników za pomocą email/hasło oraz logowania przez Google

## 2. Problem użytkownika

Użytkownicy modeli AI często tworzą i wielokrotnie wykorzystują te same lub podobne prompty. Jednak obecnie większość użytkowników nie posiada dedykowanego narzędzia do organizowania i zarządzania tymi promptami, co prowadzi do następujących problemów:

1. Tracenie czasu na ponowne tworzenie podobnych promptów
2. Niespójność w jakości i strukturze promptów używanych do podobnych zadań
3. Trudność w odnalezieniu wcześniej stworzonych, efektywnych promptów
4. Brak możliwości łatwej parametryzacji i ponownego wykorzystania promptów w różnych kontekstach
5. Nieefektywne przechowywanie promptów w różnych miejscach (pliki tekstowe, notatki, dokumenty)

MyPromptPocket rozwiązuje te problemy poprzez dostarczenie scentralizowanej, prywatnej biblioteki promptów z funkcjami parametryzacji, kategoryzacji i szybkiego wyszukiwania.

## 3. Wymagania funkcjonalne

### Zarządzanie promptami

- Tworzenie nowych promptów z polami: nazwa, opis, treść, parametry
- Edycja istniejących promptów
- Usuwanie promptów
- Wyświetlanie szczegółów promptu
- Kopiowanie promptu do schowka

### Parametryzacja

- Definiowanie parametrów w treści promptu za pomocą składni {{ parametr }}
- Automatyczne wykrywanie parametrów w treści promptu
- Wypełnianie wartości parametrów przed kopiowaniem promptu
- Walidacja wprowadzanych wartości parametrów

### Organizacja i wyszukiwanie

- Kategoryzacja promptów za pomocą tagów (system płaski, bez hierarchii)
- Wyszukiwanie promptów po nazwie
- Filtrowanie promptów po tagach

### Wsparcie AI

- Generowanie sugestii ulepszeń istniejących promptów
- Pomoc w tworzeniu nowych promptów

### Uwierzytelnianie i bezpieczeństwo

- Rejestracja i logowanie przez email/hasło
- Integracja z logowaniem przez Google

### Interfejs użytkownika

- Responsywny design (RWD)
- Intuicyjny edytor promptów z podświetlaniem składni
- System powiadomień o udanym skopiowaniu promptu do schowka

## 4. Granice produktu

### Co jest w zakresie

- Webowa aplikacja do zarządzania promptami
- Prywatna biblioteka promptów dla zalogowanych użytkowników
- Parametryzacja promptów za pomocą {{ parametr }}
- Podstawowe funkcje edycji i organizacji promptów
- Interfejs w języku angielskim

### Co jest poza zakresem

- Wersja desktopowa (planowana w przyszłości)
- Wersjonowanie promptów
- Archiwizacja promptów
- Współdzielenie promptów między użytkownikami
- Wielojęzyczny interfejs użytkownika
- Hierarchiczna struktura kategorii/folderów

## 5. Historyjki użytkowników

### US-001: Rejestracja użytkownika

**Tytuł**: Rejestracja nowego konta
**Opis**: Jako nowy użytkownik, chcę utworzyć konto w aplikacji, aby móc korzystać z moich prywatnych promptów.

**Kryteria akceptacji**:

- Użytkownik może wypełnić formularz rejestracji z polami: adres email, hasło, powtórz hasło
- System waliduje poprawność adresu email
- System wymaga hasła o odpowiedniej sile (min. 8 znaków, zawierające wielkie i małe litery, cyfry)
- Po pomyślnej rejestracji, użytkownik otrzymuje komunikat potwierdzający
- Użytkownik może zalogować się na nowo utworzone konto

### US-002: Logowanie przez email/hasło

**Tytuł**: Logowanie za pomocą danych uwierzytelniających
**Opis**: Jako zarejestrowany użytkownik, chcę zalogować się do systemu za pomocą mojego emaila i hasła, aby uzyskać dostęp do moich promptów.

**Kryteria akceptacji**:

- Użytkownik może wprowadzić adres email i hasło na stronie logowania
- System weryfikuje poprawność danych
- Po poprawnym logowaniu, użytkownik jest przekierowany do strony głównej aplikacji
- W przypadku błędnych danych, system wyświetla odpowiedni komunikat

### US-003: Logowanie przez Google

**Tytuł**: Logowanie za pomocą konta Google
**Opis**: Jako użytkownik, chcę zalogować się do aplikacji za pomocą mojego konta Google, aby nie musieć pamiętać dodatkowych danych logowania.

**Kryteria akceptacji**:

- Na stronie logowania dostępny jest przycisk "Zaloguj się przez Google"
- Po kliknięciu przycisku, użytkownik jest przekierowany do strony logowania Google
- Po pomyślnym uwierzytelnieniu w Google, użytkownik jest automatycznie zalogowany do aplikacji
- Jeśli to pierwszy login przez Google, system tworzy nowe konto powiązane z kontem Google

### US-004: Wylogowanie

**Tytuł**: Wylogowanie z aplikacji
**Opis**: Jako zalogowany użytkownik, chcę wylogować się z aplikacji, aby zabezpieczyć moje dane.

**Kryteria akceptacji**:

- W interfejsie dostępna jest opcja wylogowania
- Po wybraniu opcji wylogowania, sesja użytkownika jest zamykana
- Użytkownik jest przekierowany do strony logowania
- Ponowny dostęp do danych wymaga zalogowania

### US-005: Dodawanie nowego promptu

**Tytuł**: Tworzenie nowego promptu
**Opis**: Jako użytkownik, chcę dodać nowy prompt do mojej biblioteki, aby móc go później wykorzystać.

**Kryteria akceptacji**:

- Dostępny jest formularz dodawania nowego promptu
- Użytkownik może wprowadzić nazwę, opis i treść promptu
- System automatycznie wykrywa parametry w składni {{ parametr }}
- Użytkownik może dodać tagi do promptu
- Po zapisaniu, prompt jest widoczny w bibliotece użytkownika

### US-006: Edycja promptu

**Tytuł**: Modyfikacja istniejącego promptu
**Opis**: Jako użytkownik, chcę edytować istniejące prompty, aby dostosować je do zmieniających się potrzeb.

**Kryteria akceptacji**:

- Użytkownik może wybrać prompt do edycji
- System wyświetla formularz z aktualnymi danymi promptu
- Użytkownik może modyfikować wszystkie pola promptu
- System dynamicznie aktualizuje listę wykrytych parametrów podczas edycji
- Po zapisaniu zmian, prompt jest aktualizowany w bibliotece

### US-007: Usuwanie promptu

**Tytuł**: Usuwanie promptu z biblioteki
**Opis**: Jako użytkownik, chcę usunąć niepotrzebne prompty, aby utrzymać porządek w mojej bibliotece.

**Kryteria akceptacji**:

- Użytkownik może wybrać opcję usunięcia promptu
- System wyświetla komunikat z prośbą o potwierdzenie
- Po potwierdzeniu, prompt jest trwale usuwany z biblioteki
- System wyświetla potwierdzenie pomyślnego usunięcia

### US-008: Przeglądanie szczegółów promptu

**Tytuł**: Wyświetlanie szczegółów promptu
**Opis**: Jako użytkownik, chcę zobaczyć szczegóły wybranego promptu, aby zapoznać się z jego zawartością i parametrami.

**Kryteria akceptacji**:

- Użytkownik może wybrać prompt z listy
- System wyświetla szczegóły promptu: nazwę, opis, treść, parametry i tagi
- Parametry są wyróżnione w treści promptu
- Interfejs pokazuje datę utworzenia promptu

### US-009: Parametryzacja promptu

**Tytuł**: Tworzenie promptu z parametrami
**Opis**: Jako użytkownik, chcę zdefiniować parametry w moim prompcie, aby móc go dostosować do różnych kontekstów.

**Kryteria akceptacji**:

- Użytkownik może wpisać parametry w treści promptu używając składni {{ parametr }}
- System automatycznie wykrywa i wyróżnia parametry podczas edycji
- Parametry są wizualnie wyróżnione innym kolorem
- System nie pozwala na tworzenie duplikatów nazw parametrów

### US-010: Wypełnianie parametrów i kopiowanie do schowka

**Tytuł**: Wypełnianie parametrów i kopiowanie promptu
**Opis**: Jako użytkownik, chcę wypełnić wartości parametrów i skopiować gotowy prompt do schowka, aby móc go wkleić do modelu LLM.

**Kryteria akceptacji**:

- Po wybraniu promptu do użycia, system wyświetla formularz z polami dla wszystkich wykrytych parametrów
- Użytkownik może wprowadzić wartości dla każdego parametru
- System waliduje wprowadzone wartości
- Po wypełnieniu parametrów, użytkownik może podejrzeć prompt z podstawionymi wartościami
- Dostępny jest przycisk "Kopiuj do schowka"
- Po kliknięciu przycisku, prompt z podstawionymi parametrami jest kopiowany do schowka systemowego
- System wyświetla komunikat o pomyślnym skopiowaniu
- Użytkownik może wkleić skopiowany tekst w dowolnym miejscu

### US-011: Kategoryzacja promptów za pomocą tagów

**Tytuł**: Dodawanie tagów do promptów
**Opis**: Jako użytkownik, chcę organizować moje prompty za pomocą tagów, aby łatwiej je odnajdywać.

**Kryteria akceptacji**:

- Podczas tworzenia lub edycji promptu użytkownik może dodawać tagi
- System sugeruje istniejące tagi używane wcześniej przez użytkownika
- Użytkownik może dodawać wiele tagów do jednego promptu
- Tagi są widoczne na liście promptów oraz w szczegółach promptu

### US-012: Wyszukiwanie promptów

**Tytuł**: Wyszukiwanie promptów po nazwie
**Opis**: Jako użytkownik, chcę szybko znaleźć prompt po jego nazwie, aby zaoszczędzić czas.

**Kryteria akceptacji**:

- Dostępne jest pole wyszukiwania
- System wyszukuje prompty zawierające wprowadzoną frazę w nazwie
- Wyniki wyszukiwania są aktualizowane na bieżąco podczas pisania
- Jeśli nie znaleziono żadnych wyników, system wyświetla odpowiedni komunikat

### US-013: Filtrowanie promptów po tagach

**Tytuł**: Filtrowanie biblioteki promptów po tagach
**Opis**: Jako użytkownik, chcę filtrować moje prompty po tagach, aby szybko znaleźć prompty z określonej kategorii.

**Kryteria akceptacji**:

- Interfejs wyświetla listę wszystkich używanych tagów
- Użytkownik może wybrać jeden lub więcej tagów do filtrowania
- System wyświetla tylko prompty pasujące do wybranych tagów
- Użytkownik może łatwo usunąć wybrane filtry

### US-014: Ulepszanie promptu z pomocą AI

**Tytuł**: Uzyskiwanie sugestii ulepszeń od AI
**Opis**: Jako użytkownik, chcę poprosić AI o ulepszenie mojego promptu, aby był bardziej skuteczny.

**Kryteria akceptacji**:

- Podczas tworzenia lub edycji promptu dostępna jest opcja "Uzyskaj sugestie AI"
- Po wybraniu opcji, system generuje sugestie ulepszeń dla danego promptu
- Użytkownik może przejrzeć sugestie i wybrać, które z nich chce zastosować
- Użytkownik może edytować sugestie przed ich zastosowaniem
- Po zastosowaniu sugestii, prompt jest aktualizowany

### US-016: Podgląd biblioteki promptów

**Tytuł**: Przeglądanie listy promptów
**Opis**: Jako użytkownik, chcę widzieć listę wszystkich moich promptów, aby mieć przegląd mojej kolekcji.

**Kryteria akceptacji**:

- Po zalogowaniu, użytkownik widzi listę wszystkich swoich promptów
- Lista zawiera podstawowe informacje o każdym prompcie (nazwa, fragment opisu, tagi)
- Lista jest podzielona na strony, jeśli liczba promptów jest duża

### US-017: Responsywny interfejs

**Tytuł**: Korzystanie z aplikacji na różnych urządzeniach
**Opis**: Jako użytkownik, chcę korzystać z aplikacji zarówno na komputerze jak i urządzeniach mobilnych, aby mieć dostęp do moich promptów niezależnie od używanego sprzętu.

**Kryteria akceptacji**:

- Interfejs aplikacji dostosowuje się do różnych rozmiarów ekranów
- Wszystkie funkcje są dostępne zarówno na urządzeniach mobilnych jak i desktopowych
- Elementy interfejsu są wygodne w obsłudze na ekranach dotykowych
- Tekst jest czytelny na małych ekranach

## 6. Metryki sukcesu

### Kryteria oceny MVP

- Użyteczność w prywatnym zastosowaniu (główne kryterium)
- Łatwość tworzenia i parametryzacji promptów
- Szybkość wyszukiwania i kopiowania promptów do schowka
- Efektywność sugestii AI do ulepszania promptów
