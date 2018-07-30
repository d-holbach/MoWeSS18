# MoWeSS18

## Anforderungen

* node
* npm oder yarn
* couchDB

## Installation

### 1. Dependencies 
Die Installation der _Dependencies_ erfolgt über 
```
$ npm install 
```
oder über
```
$ yarn
```

### 2. Environment Datei
Anschließend muss der __Port__ des Node Servers, sowie die __IP__ und der __Port__ des CouchDB Servers in einer `.env` Datei gespeichert werden. Hierzu befindet sich im Verzeichnis eine `.env-example` Datei, welche die benötigten Variablen enthält. Diese kann kopiert und in `.env` umbenannt werden. Sie enthält bereits den Standart-__Port__ des Servers, sowie `localhost` als CouchDB Server und den CouchDB Standart-__Port__. Zur Anfrage an die __OMDbAPI__ wird ein Token benötigt. Dieser kann unter [OMDbAPI](http://www.omdbapi.com/) erstellt werden und muss anschließend ebenfalls in der `.env` Datei eigetragen werden.

## Benutzung

```
$ npm start 
```