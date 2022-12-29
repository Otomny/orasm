# ORASM

Outil de Rechargement Automatique de Serveur Minecraft

## Requirements

- Nodejs > 16.0
- NVM > 8.0

## Init

```shell
npm install
npm run build
```

## Usage

```shell
npm run start -- --config=D:\Otomny_V2\otomny_v2_git\orasm\config.json
```

## Event

Pour déclencher le reload, il faut envoyer des requête POST sur des endpoints

### Arreter le serveur

> localhost:6969/api/stopserver

### Tous les plugins ont été rebuild

> localhost:6969/api/startserver