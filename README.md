# Palavras Cruzadas Médico

Aplicativo de palavras cruzadas com foco em disciplinas médicas, com versão web estática (publicável no GitHub Pages) e um esqueleto de projeto Android (WIP) para empacotar a experiência em um app nativo.

## Visão Geral

- **Disciplinas:** Anatomia, Fisiologia, Microbiologia, Farmacologia, Patologia, Bioquímica.
- **Modos:** Clássico, Cronometrado, Desafio diário (sementeado por data).
- **Banco de termos:** Definido em `web/data.js`, segmentado por disciplina e dificuldade.
- **Engine:** Geração simples de grade e renderização em Canvas (`web/engine.js`).
- **UI/UX:** Interface responsiva, tema claro/escuro, lista de pistas, revisão pós-jogo, estatísticas locais.

## Estrutura do Projeto

- `web/`
  - `index.html`: Shell da aplicação web.
  - `styles.css`: Estilos e temas.
  - `engine.js`: Engine do tabuleiro (grade, numeração, render, hit test).
  - `app.js`: Lógica de jogo, estados, interações de UI, modos e estatísticas.
  - `data.js`: Banco de termos por disciplina e dificuldade.
- `android/` (WIP)
  - Projeto Gradle básico para, futuramente, empacotar a versão web em um WebView.

## Requisitos

- Qualquer navegador moderno.
- Para desenvolvimento local, um servidor estático simples:
  - Opção Python 3: `python3 -m http.server`
  - Opção Node (facultativo): `npx serve`

## Rodando Localmente (Web)

1. Entre na pasta web:  
   `cd web`
2. Suba um servidor estático (escolha uma opção):
   - Python 3: `python3 -m http.server 8000`
   - Node (via npx): `npx serve -p 8000 .`
3. Acesse `http://localhost:8000` no navegador.

Observação: abrir o `index.html` diretamente (file://) pode funcionar, mas um servidor evita problemas de CORS e garante comportamento consistente.

## Desenvolvimento

- **Editar termos:** adicione/edite entradas em `web/data.js`. Cada item segue `{ answer: "TERMO", clue: "definição", source?: "url" }`.
- **Ajustar grade/engine:** parâmetros (linhas/colunas/tamanho de célula) e utilidades em `web/engine.js`.
- **Comportamento e modos:** lógica de jogo, seleção, verificações e temporizador em `web/app.js`.
- **Estilos/tema:** altere variáveis CSS e componentes em `web/styles.css`.
- **Acessibilidade:** elementos têm rótulos ARIA; mantenha-os ao evoluir a UI.
- **Dica:** use DevTools do navegador, e recarregue a página para ver mudanças. Não há bundler; tudo é JS/CSS/HTML puro.

## Deploy (GitHub Pages — publicando a partir de uma branch)

Você pode publicar a versão web como uma página estática usando GitHub Pages, configurado para publicar a partir de uma branch (ex.: `gh-pages`). O conteúdo publicado deve ser o que está dentro de `web/` na raiz da branch escolhida.

### 1) Preparar o repositório remoto

- Crie o repositório no GitHub e faça push do código (branch principal).

### 2) Primeira publicação com git subtree (simples)

Execute a partir da branch principal:

```
# Cria/atualiza a branch gh-pages com o conteúdo de web/
git subtree push --prefix web origin gh-pages
```

Isso cria (ou atualiza) a branch `gh-pages` contendo somente os arquivos de `web/` na raiz.

Para atualizações subsequentes (quando o comando acima não sobrescrever corretamente), use:

```
# Gera um split do histórico de web/ em uma branch temporária
git subtree split --prefix web -b gh-pages
# Força o push para a branch remota gh-pages
git push origin gh-pages:gh-pages --force
# Limpeza local da branch temporária
git branch -D gh-pages
```

### 3) Configurar GitHub Pages

- No GitHub, acesse: Settings → Pages.
- Em "Source", selecione "Deploy from a branch".
- Em "Branch", selecione `gh-pages` e o diretório `/ (root)`.
- Salve. Aguarde 1–2 minutos até o build terminar.

A URL ficará no formato: `https://<seu-usuario>.github.io/<nome-do-repo>/`.

### Alternativa: git worktree (fluxo limpo)

```
# Do diretório raiz do repo, adiciona uma worktree para a branch gh-pages
rm -rf ../_site && git worktree add -B gh-pages ../_site gh-pages
# Copia o conteúdo de web/ para a worktree (use rsync no Linux/Mac)
rsync -av --delete web/ ../_site/
cd ../_site
git add .
git commit -m "Deploy site"
git push origin gh-pages
```

Mantenha a configuração de Pages apontando para `gh-pages` (root).

### Script de deploy (automatizado)

Há um script que publica o conteúdo de `web/` para a branch desejada usando `git subtree`:

- Executar: `./scripts/deploy-web.sh`
- Opções:
  - `-b, --branch <name>`: branch de destino (padrão: `gh-pages`)
  - `-r, --remote <name>`: remoto (padrão: `origin`)
  - `-p, --prefix <dir>`: diretório a publicar (padrão: `web`)
  - `--no-force`: não usa `--force` no push
  - `--allow-dirty`: permite rodar com mudanças não commitadas

Exemplos:

```
# Publica web/ em origin/gh-pages (force)
./scripts/deploy-web.sh

# Publica web/ em origin/pages sem force
./scripts/deploy-web.sh -b pages --no-force
```

## Roadmap

- Empacotar a versão web em um app Android (WebView) dentro de `android/`.
- Expandir banco de termos e modos de jogo.

## Licença

Defina a licença que preferir para o projeto (ex.: MIT). Se desejar, adicione um arquivo `LICENSE` na raiz.
