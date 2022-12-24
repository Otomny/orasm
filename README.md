# ORASM

Outil de Rechargement Automatique de Serveur Minecraft

## Requirements

- Nodejs > 16.0
- NVM > 8.0

## Init

```shell
npm install
```

## Usage

```shell
npm run start
```

Spécifier un dossier ou se trouve le serveur

```shell
npm run start -d C:\Otomny\ServerTest
```

Spécifier le fichier de configuration des plugins à déplacer

```shell
npm run start -cf C:\Otomny\Conf\orasm.json
```

## Event

Pour déclencher le reload, il faut envoyer des requête POST sur des endpoints

### Arreter le serveur

> localhost:6969/api/stopserver

### Tous les plugins ont été rebuild

> localhost:6969/api/startserver