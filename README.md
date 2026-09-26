# Pokémon Tier List Maker

Um criador de tier list moderno, minimalista e flat para ranquear Pokémon de todas as gerações, incluindo formas regionais e mega evoluções.

![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)
![Vibecoded](https://img.shields.io/badge/Built%20with-Vibecoding%20%E2%9C%A8-e06c75?style=flat-square)

---

## ✨ Funcionalidades

- **Design Flat & Monocromático**: Visual limpo em tons de cinza escuro com cor de destaque em vermelho pastel (`#e06c75`), sem gradientes nem bordas pesadas.
- **Visualização Pura de PNG**: Itens sem cartões, sem molduras ou fundos cinzas — apenas o PNG transparente do Pokémon.
- **Drag & Drop Inteligente**:
  - Prévia de arraste proporcional (1.5x da linha) para não cobrir a tela.
  - Reordenação dinâmica dentro da própria linha da tier list com indicador visual de inserção.
  - Scroll automático suave ao arrastar cards longos.
- **Tooltips Individuais**: Identificação de número (#ID) e nome de cada Pokémon ao passar o mouse, posicionado acima de qualquer elemento da interface.
- **Gerenciamento de Níveis**:
  - Criar, editar cor/rótulo, mover para cima/baixo e limpar níveis.
  - Botão direito no Pokémon dentro da tier list para removê-lo instantaneamente.
- **Barra de Progresso Integrada**: Exibição completa da quantidade de Pokémon classificados vs. total existente no rank ativo.
- **Filtros Avançados**:
  - Por Geração (Gen 1 a 9).
  - Por Tipo (Fogo, Água, Planta, etc.) e Raridade (Comum, Lendário, Mítico, etc.).
  - Filtro por Formas Regionais (Alola, Galar, Hisui, Paldea) e alternadores dedicados para Mega Evoluções e Gigantamax (G-Max).
- **Estilos de Sprite**:
  - Artwork Oficial (HD)
  - 3D Renders (Pokémon HOME)
  - Pixel Sprites (Gen 5)
  - Sprites Animados (Showdown)
  - Modo Shiny (brilhante) com 1 clique.
- **Exportação & Backup**:
  - Exportação de imagem PNG em alta resolução.
  - Exportação e importação de backups em JSON.

---

## 🚀 Como Executar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) versão 18 ou superior
- [npm](https://www.npmjs.com/) ou [bun](https://bun.sh/)

### Passo a Passo

1. **Clone este repositório**:
   ```bash
   git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   cd SEU_REPOSITORIO
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000` no seu navegador.

4. **Gerar build de produção**:
   ```bash
   npm run build
   ```
   Os arquivos estáticos otimizados serão gerados na pasta `dist/`.

---

## 🌐 Publicação no GitHub Pages

Este repositório já inclui o arquivo `.github/workflows/deploy.yml` pronto para deploy contínuo via **GitHub Actions**.

1. Crie um repositório no GitHub e faça o push do código.
2. Acesse **Settings** > **Pages** no seu repositório.
3. Em **Build and deployment** > **Source**, selecione **GitHub Actions**.
4. Qualquer `git push` na branch `main` publicará o site automaticamente!

---

## 🤖 Vibecoding Disclaimer

> **Este projeto é 100% "vibecodado"** ⚡  
> Desenvolvido iterativamente através de especificações em linguagem natural e engenharia orientada por prompts com agentes de IA.  
> 
> Sinta-se totalmente livre para clonar, modificar, abrir PRs, remixar ou criar sua própria versão!

---

## ⚖️ Licença de Código (MIT)

Este software é disponibilizado sob a licença **MIT**. Você tem liberdade para usar, copiar, modificar, mesclar, publicar e distribuir o código sem restrições. Consulte o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

## 🎮 Isenção de Responsabilidade (Pokémon IP)

- **Pokémon** e todos os nomes, imagens, artes e marcas registradas relacionadas a Pokémon são de propriedade exclusiva da **Nintendo**, **Creatures Inc.** e **GAME FREAK inc.**
- Este é um projeto sem fins lucrativos, feito por fãs para a comunidade, de caráter educativo e sob as diretrizes de *Fair Use*.
- Os dados e assets de imagens são fornecidos pela comunidade aberta via [PokéAPI](https://pokeapi.co/) e repositórios públicos de sprites.
