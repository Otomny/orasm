# ORASM

Outil de Rechargement Automatique de Serveur Minecraft

Il faut déja le dossier serveur créer, l'EULA accepté, les repos git cloné etc...
Ensuite, pour intégrer l'outil dans l'IDE, il suffit de setup des tâches de compilation et ajouter un envoie de requête HTTP
au début pour stopper le serveur et à la fin pour redémarrer le serveur

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

```shell
# Windows:
Invoke-WebRequest -Uri http://localhost:6969/api/stopserver -Method POST
# Linux:
curl http://localhost:6969/api/stopserver -X POST
```

### Redémarrer le serveur (supprime les anciens plugins et copie les nouveaux)

```shell
# Windows:
Invoke-WebRequest -Uri http://localhost:6969/api/startserver -Method POST
# Linux:
curl http://localhost:6969/api/startserver -X POST
```
