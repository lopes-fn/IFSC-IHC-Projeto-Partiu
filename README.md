# Travel Website Prototype - Testes

Este projeto é um protótipo de site de viagens criado a partir do Figma.

Projeto original:
https://www.figma.com/design/LIrBHCpyyctahuBfwUEY28/Travel-Website-Prototype---Testes

## Como executar o projeto

Instale as dependências:

```bash
npm i
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Executar apenas neste computador

Use este comando para iniciar o servidor em `127.0.0.1`:

```bash
npm run dev:local
```

## Executar na rede local

Use este comando para iniciar o servidor em `0.0.0.0:5180`:

```bash
npm run dev:network
```

Outros computadores na mesma rede podem acessar o site por:

```text
http://SEU_IP_LOCAL:5180/
```

Se o site não abrir em outro computador, libere a porta `5180` no Firewall do Windows.

## Deploy no GitHub Pages

Este projeto está configurado para publicar o build de produção da pasta `dist/` usando GitHub Actions.

Para publicar:

1. Envie o projeto para um repositório no GitHub.
2. No GitHub, abra `Settings` > `Pages`.
3. Em `Build and deployment` > `Source`, selecione `GitHub Actions`.
4. Faça push para a branch `main` ou execute o workflow manualmente.

O workflow define automaticamente o caminho `base` do Vite usando o nome do repositório.

Site publicado:
https://lopes-fn.github.io/IFSC-IHC-Projeto-Partiu/
